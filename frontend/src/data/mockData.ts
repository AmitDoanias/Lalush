import type {
  Supplier, Product, ProductPriceHistory,
  Invoice, InvoiceItem,
  FixedExpense, Revenue,
  Alert, DashboardSummary,
  MonthlyData, CategoryExpense,
} from '../types';

// ─── Suppliers ───────────────────────────────────────────────────────────────

export const mockSuppliers: Supplier[] = [
  { id: 1, name: 'טרי מהחווה', contact_info: 'farm@fresh.co.il', phone: '054-1234567', payment_terms: 'שוטף 30', category: 'ירקות ופירות', active: true },
  { id: 2, name: 'גורמה בשרים', contact_info: 'gourmet@meats.co.il', phone: '052-9876543', payment_terms: 'שוטף 45', category: 'בשר ועוף', active: true },
  { id: 3, name: 'ים התיכון דגים', contact_info: 'info@medfish.co.il', phone: '053-4567890', payment_terms: 'מזומן', category: 'דגים ופירות ים', active: true },
  { id: 4, name: 'מחלבת הגליל', contact_info: 'galil@dairy.co.il', phone: '058-3456789', payment_terms: 'שוטף 30', category: 'חלב וגבינות', active: true },
  { id: 5, name: 'שמן זית פרמיום', contact_info: 'olive@premium.co.il', phone: '054-7654321', payment_terms: 'שוטף 60', category: 'שמנים ותבלינים', active: true },
];

// ─── Products ────────────────────────────────────────────────────────────────

export const mockProducts: Product[] = [
  { id: 1, name: 'עגבניות', unit: 'kg', category: 'ירקות', current_price: 4.5 },
  { id: 2, name: 'פילה בקר', unit: 'kg', category: 'בשר', current_price: 89 },
  { id: 3, name: 'סלמון טרי', unit: 'kg', category: 'דגים', current_price: 72 },
  { id: 4, name: 'גבינת ריקוטה', unit: 'kg', category: 'חלב', current_price: 28 },
  { id: 5, name: 'שמן זית כתית', unit: 'liter', category: 'שמנים', current_price: 35 },
  { id: 6, name: 'קמח', unit: 'kg', category: 'יבשים', current_price: 3.2 },
  { id: 7, name: 'עוף שלם', unit: 'kg', category: 'בשר', current_price: 32 },
  { id: 8, name: 'מלפפון', unit: 'kg', category: 'ירקות', current_price: 3.8 },
  { id: 9, name: 'גבינת בולגרית', unit: 'kg', category: 'חלב', current_price: 42 },
  { id: 10, name: 'בס ים', unit: 'kg', category: 'דגים', current_price: 95 },
];

// ─── Price History ────────────────────────────────────────────────────────────

export const mockPriceHistory: ProductPriceHistory[] = [
  { id: 1, product_id: 2, product_name: 'פילה בקר', supplier_id: 2, supplier_name: 'גורמה בשרים', price: 85, effective_date: '2026-01-15' },
  { id: 2, product_id: 2, product_name: 'פילה בקר', supplier_id: 2, supplier_name: 'גורמה בשרים', price: 87, effective_date: '2026-02-10' },
  { id: 3, product_id: 2, product_name: 'פילה בקר', supplier_id: 2, supplier_name: 'גורמה בשרים', price: 89, effective_date: '2026-03-05' },
  { id: 4, product_id: 2, product_name: 'פילה בקר', supplier_id: 2, supplier_name: 'גורמה בשרים', price: 96, effective_date: '2026-04-01' },
  { id: 5, product_id: 3, product_name: 'סלמון טרי', supplier_id: 3, supplier_name: 'ים התיכון דגים', price: 68, effective_date: '2026-01-20' },
  { id: 6, product_id: 3, product_name: 'סלמון טרי', supplier_id: 3, supplier_name: 'ים התיכון דגים', price: 70, effective_date: '2026-02-18' },
  { id: 7, product_id: 3, product_name: 'סלמון טרי', supplier_id: 3, supplier_name: 'ים התיכון דגים', price: 72, effective_date: '2026-03-12' },
  { id: 8, product_id: 1, product_name: 'עגבניות', supplier_id: 1, supplier_name: 'טרי מהחווה', price: 3.9, effective_date: '2026-02-01' },
  { id: 9, product_id: 1, product_name: 'עגבניות', supplier_id: 1, supplier_name: 'טרי מהחווה', price: 4.2, effective_date: '2026-03-15' },
  { id: 10, product_id: 1, product_name: 'עגבניות', supplier_id: 1, supplier_name: 'טרי מהחווה', price: 4.5, effective_date: '2026-04-02' },
];

// ─── Invoices ─────────────────────────────────────────────────────────────────

export const mockInvoices: Invoice[] = [
  {
    id: '1',
    supplier_id: '2',
    supplier_name: 'גורמה בשרים',
    invoice_number: 'INV-2026-0412',
    invoice_date: '2026-04-12',
    subtotal: 1820,
    vat_amount: 309.4,
    total_with_vat: 2129.4,
    image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
    entry_method: 'ocr',
    has_alerts: true,
    notes: 'מחיר פילה בקר עלה ב-7.9% לעומת הממוצע',
  },
  {
    id: '2',
    supplier_id: '3',
    supplier_name: 'ים התיכון דגים',
    invoice_number: 'INV-2026-0411',
    invoice_date: '2026-04-11',
    subtotal: 1260,
    vat_amount: 214.2,
    total_with_vat: 1474.2,
    image_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400',
    entry_method: 'ocr',
    has_alerts: false,
  },
  {
    id: '3',
    supplier_id: '1',
    supplier_name: 'טרי מהחווה',
    invoice_number: 'INV-2026-0410',
    invoice_date: '2026-04-10',
    subtotal: 640,
    vat_amount: 108.8,
    total_with_vat: 748.8,
    entry_method: 'manual',
    has_alerts: true,
    notes: 'חוסר: מלפפון — הוזמן 20 ק"ג, התקבל 14 ק"ג',
  },
  {
    id: '4',
    supplier_id: '4',
    supplier_name: 'מחלבת הגליל',
    invoice_number: 'INV-2026-0408',
    invoice_date: '2026-04-08',
    subtotal: 980,
    vat_amount: 166.6,
    total_with_vat: 1146.6,
    image_url: 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400',
    entry_method: 'ocr',
    has_alerts: false,
  },
  {
    id: '5',
    supplier_id: '5',
    supplier_name: 'שמן זית פרמיום',
    invoice_number: 'INV-2026-0405',
    invoice_date: '2026-04-05',
    subtotal: 420,
    vat_amount: 71.4,
    total_with_vat: 491.4,
    entry_method: 'manual',
    has_alerts: false,
  },
  {
    id: '6',
    supplier_id: '2',
    supplier_name: 'גורמה בשרים',
    invoice_number: 'INV-2026-0401',
    invoice_date: '2026-04-01',
    subtotal: 2100,
    vat_amount: 357,
    total_with_vat: 2457,
    image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
    entry_method: 'ocr',
    has_alerts: false,
  },
];

// ─── Invoice Items ────────────────────────────────────────────────────────────

export const mockInvoiceItems: Record<string | number, InvoiceItem[]> = {
  1: [
    { id: 1, invoice_id: 1, product_id: 2, product_name: 'פילה בקר', unit: 'kg', quantity_ordered: 15, quantity_received: 15, unit_price: 96, expected_price: 89, discrepancy: 0, price_change_pct: 7.9, total: 1440 },
    { id: 2, invoice_id: 1, product_id: 7, product_name: 'עוף שלם', unit: 'kg', quantity_ordered: 20, quantity_received: 20, unit_price: 32, expected_price: 32, discrepancy: 0, price_change_pct: 0, total: 640 },
    { id: 3, invoice_id: 1, product_id: 6, product_name: 'שמן קנולה', unit: 'liter', quantity_ordered: 5, quantity_received: 5, unit_price: 14, expected_price: 14, discrepancy: 0, price_change_pct: 0, total: 70 },
  ],
  2: [
    { id: 4, invoice_id: 2, product_id: 3, product_name: 'סלמון טרי', unit: 'kg', quantity_ordered: 12, quantity_received: 12, unit_price: 72, expected_price: 72, discrepancy: 0, price_change_pct: 0, total: 864 },
    { id: 5, invoice_id: 2, product_id: 10, product_name: 'בס ים', unit: 'kg', quantity_ordered: 4, quantity_received: 4, unit_price: 95, expected_price: 95, discrepancy: 0, price_change_pct: 0, total: 380 },
    { id: 6, invoice_id: 2, product_id: 8, product_name: 'קלמארי', unit: 'kg', quantity_ordered: 2, quantity_received: 2, unit_price: 58, expected_price: 58, discrepancy: 0, price_change_pct: 0, total: 116 },
  ],
  3: [
    { id: 7, invoice_id: 3, product_id: 1, product_name: 'עגבניות', unit: 'kg', quantity_ordered: 30, quantity_received: 30, unit_price: 4.5, expected_price: 4.5, discrepancy: 0, price_change_pct: 0, total: 135 },
    { id: 8, invoice_id: 3, product_id: 8, product_name: 'מלפפון', unit: 'kg', quantity_ordered: 20, quantity_received: 14, unit_price: 3.8, expected_price: 3.8, discrepancy: -6, price_change_pct: 0, total: 76 },
    { id: 9, invoice_id: 3, product_id: 6, product_name: 'בצל', unit: 'kg', quantity_ordered: 25, quantity_received: 25, unit_price: 3.2, expected_price: 3.2, discrepancy: 0, price_change_pct: 0, total: 80 },
    { id: 10, invoice_id: 3, product_id: 1, product_name: 'פלפל', unit: 'kg', quantity_ordered: 15, quantity_received: 15, unit_price: 7, expected_price: 7, discrepancy: 0, price_change_pct: 0, total: 105 },
  ],
};

// ─── Fixed Expenses ───────────────────────────────────────────────────────────

export const mockFixedExpenses: FixedExpense[] = [
  { id: 1, name: 'שכירות', category: 'נדלן', amount: 18000, frequency: 'monthly', effective_date: '2025-01-01', active: true },
  { id: 2, name: 'חשמל', category: 'תשתיות', amount: 3200, frequency: 'monthly', effective_date: '2025-01-01', active: true },
  { id: 3, name: 'מים', category: 'תשתיות', amount: 850, frequency: 'monthly', effective_date: '2025-01-01', active: true },
  { id: 4, name: 'גז', category: 'תשתיות', amount: 1400, frequency: 'monthly', effective_date: '2025-01-01', active: true },
  { id: 5, name: 'משכורות (3 עובדים)', category: 'כוח אדם', amount: 28000, frequency: 'monthly', effective_date: '2025-01-01', active: true },
  { id: 6, name: 'ביטוח עסק', category: 'ביטוח', amount: 1200, frequency: 'monthly', effective_date: '2025-01-01', active: true },
  { id: 7, name: 'תחזוקה ותיקונים', category: 'תחזוקה', amount: 600, frequency: 'monthly', effective_date: '2025-03-01', active: true },
  { id: 8, name: 'שיווק ופרסום', category: 'שיווק', amount: 2000, frequency: 'monthly', effective_date: '2025-01-01', active: true },
  { id: 9, name: 'רישיון עסק (שנתי)', category: 'רגולציה', amount: 3600, frequency: 'yearly', effective_date: '2025-01-01', active: true },
  { id: 10, name: 'תוכנה וניהול', category: 'טכנולוגיה', amount: 400, frequency: 'monthly', effective_date: '2025-06-01', active: true },
];

// ─── Revenue ──────────────────────────────────────────────────────────────────

export const mockRevenue: Revenue[] = [
  { id: 1, period_month: 5, period_year: 2025, amount: 142000 },
  { id: 2, period_month: 6, period_year: 2025, amount: 138000 },
  { id: 3, period_month: 7, period_year: 2025, amount: 155000 },
  { id: 4, period_month: 8, period_year: 2025, amount: 168000 },
  { id: 5, period_month: 9, period_year: 2025, amount: 161000 },
  { id: 6, period_month: 10, period_year: 2025, amount: 175000 },
  { id: 7, period_month: 11, period_year: 2025, amount: 192000 },
  { id: 8, period_month: 12, period_year: 2025, amount: 210000 },
  { id: 9, period_month: 1, period_year: 2026, amount: 148000 },
  { id: 10, period_month: 2, period_year: 2026, amount: 152000 },
  { id: 11, period_month: 3, period_year: 2026, amount: 163000 },
  { id: 12, period_month: 4, period_year: 2026, amount: 71000 },  // partial
];

// ─── Alerts ───────────────────────────────────────────────────────────────────

export const mockAlerts: Alert[] = [
  {
    id: 1,
    type: 'price_change',
    related_product_id: 2,
    related_product_name: 'פילה בקר',
    related_invoice_id: 1,
    supplier_name: 'גורמה בשרים',
    message: 'פילה בקר — מחיר רגיל: 87.00₪, חויב: 96.00₪ (+7.9%)',
    created_at: '2026-04-12T09:30:00',
    resolved: false,
    severity: 'high',
  },
  {
    id: 2,
    type: 'shortage',
    related_product_id: 8,
    related_product_name: 'מלפפון',
    related_invoice_id: 3,
    supplier_name: 'טרי מהחווה',
    message: 'מלפפון — הוזמן 20 ק"ג, התקבל 14 ק"ג (חוסר של 6 ק"ג)',
    created_at: '2026-04-10T11:15:00',
    resolved: false,
    severity: 'medium',
  },
  {
    id: 3,
    type: 'ratio_alert',
    supplier_name: undefined,
    message: 'הוצאות בשר עלו מ-18% ל-23% מהמחזור החודשי',
    created_at: '2026-04-08T08:00:00',
    resolved: false,
    severity: 'medium',
  },
  {
    id: 4,
    type: 'price_change',
    related_product_id: 1,
    related_product_name: 'עגבניות',
    related_invoice_id: 3,
    supplier_name: 'טרי מהחווה',
    message: 'עגבניות — מחיר רגיל: 4.05₪, חויב: 4.50₪ (+11.1%)',
    created_at: '2026-04-10T11:15:00',
    resolved: true,
    severity: 'low',
  },
];

// ─── Monthly Trend (Dashboard) ───────────────────────────────────────────────

export const mockMonthlyTrend: MonthlyData[] = [
  { month: 'מאי \'25', revenue: 142000, expenses: 108000, food_cost: 52000, profit: 34000 },
  { month: 'יונ \'25', revenue: 138000, expenses: 105000, food_cost: 50000, profit: 33000 },
  { month: 'יול \'25', revenue: 155000, expenses: 114000, food_cost: 56000, profit: 41000 },
  { month: 'אוג \'25', revenue: 168000, expenses: 122000, food_cost: 62000, profit: 46000 },
  { month: 'ספט \'25', revenue: 161000, expenses: 118000, food_cost: 59000, profit: 43000 },
  { month: 'אוק \'25', revenue: 175000, expenses: 128000, food_cost: 65000, profit: 47000 },
  { month: 'נוב \'25', revenue: 192000, expenses: 138000, food_cost: 72000, profit: 54000 },
  { month: 'דצמ \'25', revenue: 210000, expenses: 148000, food_cost: 79000, profit: 62000 },
  { month: 'ינו \'26', revenue: 148000, expenses: 112000, food_cost: 53000, profit: 36000 },
  { month: 'פבר \'26', revenue: 152000, expenses: 115000, food_cost: 56000, profit: 37000 },
  { month: 'מרס \'26', revenue: 163000, expenses: 120000, food_cost: 60000, profit: 43000 },
  { month: 'אפר \'26', revenue: 71000, expenses: 52000, food_cost: 27000, profit: 19000 },
];

// ─── Expense Breakdown (Dashboard) ───────────────────────────────────────────

export const mockExpenseBreakdown: CategoryExpense[] = [
  { category: 'בשר ועוף', amount: 32400, pct: 27, color: '#C9A84C' },
  { category: 'כוח אדם', amount: 28000, pct: 23.3, color: '#0F2040' },
  { category: 'שכירות', amount: 18000, pct: 15, color: '#4B7BE5' },
  { category: 'דגים', amount: 12600, pct: 10.5, color: '#10B981' },
  { category: 'ירקות', amount: 7200, pct: 6, color: '#8B5CF6' },
  { category: 'חלב', amount: 5800, pct: 4.8, color: '#F59E0B' },
  { category: 'תשתיות', amount: 5450, pct: 4.5, color: '#EC4899' },
  { category: 'אחר', amount: 10950, pct: 9.1, color: '#94A3B8' },
];

// ─── Dashboard Summary ────────────────────────────────────────────────────────

export const mockDashboardSummary: DashboardSummary = {
  current_month: {
    revenue: 163000,
    food_cost: 60000,
    food_cost_pct: 36.8,
    fixed_expenses: 55650,
    total_expenses: 115650,
    gross_profit: 47350,
    vat_payable: 4930,
    net_profit: 36000,
  },
  monthly_trend: mockMonthlyTrend,
  expense_breakdown: mockExpenseBreakdown,
  active_alerts: mockAlerts.filter(a => !a.resolved),
};
