// ─── Core Entities ───────────────────────────────────────────────────────────

export interface Supplier {
  id: number;
  name: string;
  contact_info: string;
  phone: string;
  payment_terms: string;
  category: string;
  active: boolean;
}

export interface Product {
  id: number;
  name: string;
  unit: 'kg' | 'liter' | 'unit' | 'gram' | 'pack';
  category: ProductCategory;
  current_price: number;
  supplier_id?: number;
}

export type ProductCategory =
  | 'בשר'
  | 'ירקות'
  | 'חלב'
  | 'דגים'
  | 'יבשים'
  | 'שמנים'
  | 'אחר';

export interface ProductPriceHistory {
  id: number;
  product_id: number;
  product_name: string;
  supplier_id: number;
  supplier_name: string;
  price: number;
  effective_date: string;
}

// ─── Invoice ─────────────────────────────────────────────────────────────────

export interface Invoice {
  id: number;
  supplier_id: number;
  supplier_name: string;
  order_id?: number;
  invoice_number: string;
  invoice_date: string;
  subtotal: number;
  vat_amount: number;
  total_with_vat: number;
  image_url?: string;
  ocr_raw_response?: Record<string, unknown>;
  entry_method: 'ocr' | 'manual';
  has_alerts: boolean;
  notes?: string;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  product_id: number;
  product_name: string;
  unit: string;
  quantity_ordered: number;
  quantity_received: number;
  unit_price: number;
  expected_price?: number;
  discrepancy: number;            // received - ordered
  price_change_pct?: number;      // % change vs avg
  total: number;
}

// ─── Expenses & Revenue ───────────────────────────────────────────────────────

export type ExpenseFrequency = 'monthly' | 'yearly' | 'one_time';

export interface FixedExpense {
  id: number;
  name: string;
  category: string;
  amount: number;
  frequency: ExpenseFrequency;
  effective_date: string;
  active: boolean;
}

export interface Revenue {
  id: number;
  period_month: number;
  period_year: number;
  amount: number;
  notes?: string;
}

// ─── Alerts ──────────────────────────────────────────────────────────────────

export type AlertType = 'price_change' | 'ratio_alert' | 'shortage';

export interface Alert {
  id: number;
  type: AlertType;
  related_product_id?: number;
  related_product_name?: string;
  related_invoice_id?: number;
  supplier_name?: string;
  message: string;
  created_at: string;
  resolved: boolean;
  severity: 'high' | 'medium' | 'low';
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardSummary {
  current_month: {
    revenue: number;
    food_cost: number;
    food_cost_pct: number;
    fixed_expenses: number;
    total_expenses: number;
    gross_profit: number;
    vat_payable: number;
    net_profit: number;
  };
  monthly_trend: MonthlyData[];
  expense_breakdown: CategoryExpense[];
  active_alerts: Alert[];
}

export interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  food_cost: number;
  profit: number;
}

export interface CategoryExpense {
  category: string;
  amount: number;
  pct: number;
  color: string;
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export interface PnLReport {
  period: string;
  revenue: number;
  food_cost: number;
  fixed_expenses: number;
  total_expenses: number;
  gross_profit: number;
  gross_margin: number;
  vat_collected: number;
  vat_paid: number;
  vat_payable: number;
  taxable_income: number;
  income_tax: number;
  net_profit: number;
  net_margin: number;
}

export interface FoodCostReport {
  period: string;
  revenue: number;
  total_food_cost: number;
  food_cost_pct: number;
  by_category: { category: string; amount: number; pct: number }[];
}

// ─── OCR ─────────────────────────────────────────────────────────────────────

export interface OcrExtractedItem {
  name: string;
  qty: number;
  unit: string;
  unit_price: number;
  total: number;
  matched_product_id?: number;
}

export interface OcrResult {
  supplier: string;
  invoice_number: string;
  date: string;
  subtotal: number;
  vat: number;
  total: number;
  items: OcrExtractedItem[];
  confidence: number;
}
