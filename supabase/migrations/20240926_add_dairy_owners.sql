-- ==============================================================================
-- Dairy Owners (فارم مالکان) - Supabase Auth Integration & Profile Table
-- ==============================================================================

CREATE TABLE IF NOT EXISTS dairy_owners (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_name TEXT NOT NULL DEFAULT 'ڈیری مینجمنٹ',
    owner_name TEXT NOT NULL DEFAULT 'فارم مالک',
    phone TEXT NOT NULL DEFAULT '',
    default_capacity NUMERIC(6,2) DEFAULT 50.0, -- روزانہ کی پیداوار لیٹر میں
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row-Level Security
ALTER TABLE dairy_owners ENABLE ROW LEVEL SECURITY;

-- Clean up any conflicting existing policies
DROP POLICY IF EXISTS "Owners can manage own profile" ON dairy_owners;
DROP POLICY IF EXISTS "Allow service/authenticated insert" ON dairy_owners;
DROP POLICY IF EXISTS "Allow public insert on dairy_owners" ON dairy_owners;
DROP POLICY IF EXISTS "Allow public select on dairy_owners" ON dairy_owners;
DROP POLICY IF EXISTS "Allow public update on dairy_owners" ON dairy_owners;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON dairy_owners;

-- Allow public/authenticated insert, select and update so registration succeeds seamlessly
CREATE POLICY "Allow public insert on dairy_owners" ON dairy_owners FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select on dairy_owners" ON dairy_owners FOR SELECT USING (true);
CREATE POLICY "Allow public update on dairy_owners" ON dairy_owners FOR UPDATE USING (true);

-- Trigger to automatically create dairy_owner row on user sign-up
CREATE OR REPLACE FUNCTION public.handle_new_dairy_owner()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.dairy_owners (id, farm_name, owner_name, phone, default_capacity)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'farm_name', 'ڈیری مینجمنٹ'),
    COALESCE(NEW.raw_user_meta_data->>'owner_name', 'فارم مالک'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE((NEW.raw_user_meta_data->>'default_capacity')::numeric, 50.0)
  )
  ON CONFLICT (id) DO UPDATE
  SET
    farm_name = EXCLUDED.farm_name,
    owner_name = EXCLUDED.owner_name,
    phone = EXCLUDED.phone;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_dairy_owner();
