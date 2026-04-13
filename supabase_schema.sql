-- ===========================
-- Lalush — Database Schema
-- הרץ את הקובץ הזה ב-Supabase SQL Editor
-- ===========================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Suppliers
create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_info text,
  phone text,
  payment_terms text,
  category text,
  active boolean default true,
  created_at timestamptz default now()
);

-- Products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  unit text not null default 'unit',
  category text,
  current_price numeric(10,2),
  supplier_id uuid references suppliers(id),
  created_at timestamptz default now()
);

-- Invoices
create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references suppliers(id),
  supplier_name text not null,
  order_id text,
  invoice_number text,
  invoice_date date not null,
  subtotal numeric(10,2) not null default 0,
  vat_amount numeric(10,2) not null default 0,
  total_with_vat numeric(10,2) not null default 0,
  image_url text,
  ocr_raw_response jsonb,
  entry_method text not null default 'manual' check (entry_method in ('ocr', 'manual')),
  has_alerts boolean default false,
  notes text,
  created_at timestamptz default now()
);

-- Invoice Items
create table if not exists invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references invoices(id) on delete cascade,
  product_id uuid references products(id),
  product_name text not null,
  unit text,
  quantity_ordered numeric(10,3),
  quantity_received numeric(10,3),
  unit_price numeric(10,2) not null,
  expected_price numeric(10,2),
  price_change_pct numeric(5,2),
  total numeric(10,2),
  created_at timestamptz default now()
);

-- Fixed Expenses
create table if not exists fixed_expenses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  amount numeric(10,2) not null,
  frequency text default 'monthly' check (frequency in ('monthly', 'yearly', 'one_time')),
  effective_date date,
  active boolean default true,
  created_at timestamptz default now()
);

-- Alerts
create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('price_change', 'ratio_alert', 'shortage')),
  related_product_id uuid references products(id),
  related_product_name text,
  related_invoice_id uuid references invoices(id),
  supplier_name text,
  message text not null,
  severity text default 'medium' check (severity in ('high', 'medium', 'low')),
  resolved boolean default false,
  created_at timestamptz default now()
);

-- ===========================
-- Row Level Security (basic — allow all for now)
-- ===========================
alter table suppliers enable row level security;
alter table products enable row level security;
alter table invoices enable row level security;
alter table invoice_items enable row level security;
alter table fixed_expenses enable row level security;
alter table alerts enable row level security;

create policy "Allow all" on suppliers for all using (true) with check (true);
create policy "Allow all" on products for all using (true) with check (true);
create policy "Allow all" on invoices for all using (true) with check (true);
create policy "Allow all" on invoice_items for all using (true) with check (true);
create policy "Allow all" on fixed_expenses for all using (true) with check (true);
create policy "Allow all" on alerts for all using (true) with check (true);
