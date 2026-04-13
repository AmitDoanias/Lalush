import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const INVOICE_PROMPT = `אתה מערכת OCR מדויקת לחשבוניות ישראליות.
נתח את תמונת החשבונית והחזר JSON בלבד (ללא טקסט נוסף) עם המבנה הבא:

{
  "supplier_name": "שם הספק",
  "invoice_number": "מספר חשבונית",
  "invoice_date": "YYYY-MM-DD",
  "items": [
    {
      "product_name": "שם המוצר",
      "unit": "יחידת מידה (ק\"ג / ליטר / יח' / גרם / מארז)",
      "quantity": 0.0,
      "unit_price": 0.00,
      "total": 0.00
    }
  ],
  "subtotal": 0.00,
  "vat_amount": 0.00,
  "total_with_vat": 0.00
}

חוקים:
- מע"מ בישראל הוא 18% — אם לא מופיע בחשבונית, חשב אותו
- כל מחירים בשקלים (ללא סימן ₪)
- תאריך בפורמט YYYY-MM-DD בלבד
- אם שדה לא ברור — השאר מחרוזת ריקה או 0
- החזר JSON תקין בלבד, ללא markdown ולא \`\`\``

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY secret is not set')
    }

    const { image_base64, mime_type } = await req.json()

    if (!image_base64 || !mime_type) {
      return new Response(
        JSON.stringify({ error: 'Missing image_base64 or mime_type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const geminiRes = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: INVOICE_PROMPT },
              {
                inline_data: {
                  mime_type,
                  data: image_base64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
        },
      }),
    })

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      throw new Error(`Gemini API error: ${geminiRes.status} — ${errText}`)
    }

    const geminiData = await geminiRes.json()
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    let parsed
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      throw new Error(`Failed to parse Gemini response as JSON: ${cleaned}`)
    }

    return new Response(JSON.stringify({ data: parsed, raw: rawText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('scan-invoice error:', err)
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
