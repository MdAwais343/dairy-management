-- ==============================================================================
-- Dairy Management (ڈیری مینجمنٹ) - Complete Database Schema & Migration
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Customers Table (گاہکوں کی تفصیل)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    default_liters NUMERIC(4,2) DEFAULT 2.0,
    price_per_liter NUMERIC(6,2) DEFAULT 240.0,
    customer_type TEXT CHECK (customer_type IN ('spot', 'khata')) DEFAULT 'khata',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Daily Pickups Table (روزانہ دودھ کی نکاسی / ٹیک اوے)
CREATE TABLE IF NOT EXISTS daily_pickups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    pickup_date DATE NOT NULL DEFAULT CURRENT_DATE,
    liters NUMERIC(4,2) NOT NULL,
    rate NUMERIC(6,2) NOT NULL,
    total_amount NUMERIC(10,2) GENERATED ALWAYS AS (liters * rate) STORED,
    payment_status TEXT CHECK (payment_status IN ('paid', 'unpaid')) DEFAULT 'unpaid',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(customer_id, pickup_date)
);

-- 3. Payments / Ledger Clearances (ادائیگیاں و کھاتہ کلیئرنس)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_mode TEXT DEFAULT 'نقد', -- نقد, جاز کیش, ایزی پیسہ, بینک
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Farm Settings / Daily Stock Table (ڈیری روزانہ گنجائش و سیٹنگز)
CREATE TABLE IF NOT EXISTS dairy_settings (
    id TEXT PRIMARY KEY DEFAULT 'current_farm',
    farm_name TEXT NOT NULL DEFAULT 'ڈیری مینجمنٹ',
    default_capacity NUMERIC(6,2) DEFAULT 60.0,
    current_rate NUMERIC(6,2) DEFAULT 240.0,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Customer Ledger Calculation View (ماہانہ کسٹمر کھاتہ ویو)
CREATE OR REPLACE VIEW v_customer_ledger AS
SELECT 
    c.id AS customer_id,
    c.name,
    c.phone,
    c.customer_type,
    c.default_liters,
    c.price_per_liter,
    COALESCE(SUM(CASE 
        WHEN DATE_TRUNC('month', dp.pickup_date) = DATE_TRUNC('month', CURRENT_DATE) 
        THEN dp.liters ELSE 0 END), 0) AS current_month_liters,
    COALESCE(SUM(CASE 
        WHEN DATE_TRUNC('month', dp.pickup_date) = DATE_TRUNC('month', CURRENT_DATE) 
        THEN dp.total_amount ELSE 0 END), 0) AS current_month_bill,
    (COALESCE(SUM(dp.total_amount), 0) - COALESCE(p.total_paid, 0)) AS balance_due
FROM customers c
LEFT JOIN daily_pickups dp ON c.id = dp.customer_id
LEFT JOIN (
    SELECT customer_id, SUM(amount) AS total_paid
    FROM payments
    GROUP BY customer_id
) p ON c.id = p.customer_id
WHERE c.is_active = TRUE
GROUP BY c.id, c.name, c.phone, c.customer_type, c.default_liters, c.price_per_liter, p.total_paid;

-- ==============================================================================
-- Row-Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_pickups ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE dairy_settings ENABLE ROW LEVEL SECURITY;

-- Allow public/anon access for admin single-tenant farm mobile app
CREATE POLICY "Allow anon read/write on customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write on daily_pickups" ON daily_pickups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write on payments" ON payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write on dairy_settings" ON dairy_settings FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- Sample Realistic Pakistani Seed Data for Testing & Immediate Use
-- ==============================================================================
INSERT INTO dairy_settings (id, farm_name, default_capacity, current_rate)
VALUES ('current_farm', 'ڈیری مینجمنٹ', 65.0, 240.0)
ON CONFLICT (id) DO UPDATE SET updated_at = now();

INSERT INTO customers (id, name, phone, default_liters, price_per_liter, customer_type) VALUES
('a1000000-0000-0000-0000-000000000001', 'چوہدری طارق گجر', '03001234567', 3.0, 240.0, 'khata'),
('a1000000-0000-0000-0000-000000000002', 'حاجی اسلم صاحب', '03017654321', 2.0, 240.0, 'khata'),
('a1000000-0000-0000-0000-000000000003', 'میاں بلال صاحب', '03219876543', 2.5, 240.0, 'khata'),
('a1000000-0000-0000-0000-000000000004', 'ملک رشید اعوان', '03335551234', 1.5, 240.0, 'spot'),
('a1000000-0000-0000-0000-000000000005', 'شیخ ندیم کریانہ سٹور', '03024449876', 5.0, 235.0, 'khata'),
('a1000000-0000-0000-0000-000000000006', 'ماسٹر اکرم صاحب', '03456667788', 2.0, 240.0, 'khata'),
('a1000000-0000-0000-0000-000000000007', 'رانا زاہد حسین', '03123334455', 1.0, 240.0, 'spot'),
('a1000000-0000-0000-0000-000000000008', 'ڈاکٹر رضوان احمد', '03038889900', 3.0, 240.0, 'khata')
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Payments
INSERT INTO payments (customer_id, amount, payment_date, payment_mode, notes) VALUES
('a1000000-0000-0000-0000-000000000001', 5000.0, CURRENT_DATE - INTERVAL '10 days', 'نقد', 'پہلی قسط وصولی'),
('a1000000-0000-0000-0000-000000000002', 3000.0, CURRENT_DATE - INTERVAL '8 days', 'جاز کیش', 'جاز کیش رسید #9823'),
('a1000000-0000-0000-0000-000000000003', 4000.0, CURRENT_DATE - INTERVAL '5 days', 'ایزی پیسہ', 'ماہانہ کھاتہ ادائیگی')
ON CONFLICT DO NOTHING;
