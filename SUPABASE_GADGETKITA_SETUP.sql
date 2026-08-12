-- ============================================================
-- GadgetKita — SQL Setup Lengkap
-- Supabase: https://ymrwiczatpedhkxfnfyn.supabase.co
-- Jalankan satu per satu di SQL Editor (sesuai urutan)
-- ============================================================

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  avatar TEXT,
  address JSONB DEFAULT '{}'::jsonb,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Uncomment dan jalankan setelah membuat user admin@gadgetkita.com di dashboard:
-- UPDATE profiles SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@gadgetkita.com');
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, created_at)
  VALUES (new.id, COALESCE(new.raw_user_meta_data ->> 'full_name', new.email), NOW());
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Insert profile on signup" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================
-- 2. CARTS & WISHLISTS
CREATE TABLE IF NOT EXISTS carts (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own cart access" ON carts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS wishlists (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own wishlist access" ON wishlists FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 3. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'belum_dibayar',
  payment_status TEXT,
  total NUMERIC NOT NULL DEFAULT 0,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  customer_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read own orders" ON orders FOR SELECT USING (
  auth.uid() = user_id
  OR (auth.jwt() ->> 'email') LIKE '%@admin%'
  OR (auth.jwt() ->> 'email') LIKE '%@gadgetkita%'
);
CREATE POLICY "Insert order" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Update order own or admin" ON orders FOR UPDATE USING (
  auth.uid() = user_id
  OR (auth.jwt() ->> 'email') LIKE '%@admin%'
  OR (auth.jwt() ->> 'email') LIKE '%@gadgetkita%'
);

-- ============================================================
-- 4. PRODUCTS (field aksesoris gadget)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  old_price NUMERIC,
  category TEXT,
  weight TEXT,
  in_stock BOOLEAN DEFAULT true,
  content_volume TEXT,
  is_new BOOLEAN DEFAULT false,
  short_desc TEXT,
  description TEXT,
  images TEXT[] DEFAULT '{}'::text[],
  external_link TEXT,
  sold INTEGER DEFAULT 0 NOT NULL,
  compatibility TEXT,
  connector TEXT,
  material TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read products publicly" ON products FOR SELECT USING (true);
CREATE POLICY "Admin insert products" ON products FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin update products" ON products FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin delete products" ON products FOR DELETE TO authenticated USING (true);

-- ============================================================
-- 5. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  color TEXT DEFAULT '',
  text_color TEXT DEFAULT '#ffffff'
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read categories publicly" ON categories FOR SELECT USING (true);
CREATE POLICY "Admin manage categories" ON categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 6. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'bank',
  name TEXT NOT NULL,
  account TEXT NOT NULL,
  account_name TEXT,
  logo TEXT DEFAULT '',
  qr TEXT DEFAULT ''
);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read payments publicly" ON payments FOR SELECT USING (true);
CREATE POLICY "Admin manage payments" ON payments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 7. VOUCHERS
CREATE TABLE IF NOT EXISTS vouchers (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'persentase',
  value NUMERIC NOT NULL DEFAULT 0,
  min_order NUMERIC,
  max_discount NUMERIC,
  expiry_date DATE,
  usage_limit INTEGER,
  used INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read vouchers publicly" ON vouchers FOR SELECT USING (true);
CREATE POLICY "Admin manage vouchers" ON vouchers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 8. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  read_by TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own notifications read" ON notifications FOR SELECT USING (
  user_id = auth.uid()::text OR user_id = 'ALL'
);
CREATE POLICY "Own notifications mark read" ON notifications FOR UPDATE USING (
  user_id = auth.uid()::text OR user_id = 'ALL'
);
CREATE POLICY "Authenticated insert notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================
-- 9. CHATS
CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  messages JSONB NOT NULL DEFAULT '[]'::jsonb
);
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own chats" ON chats FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin read all chats" ON chats FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin update chats" ON chats FOR UPDATE TO authenticated USING (true);

-- ============================================================
-- 10. SITE_SETTINGS
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL DEFAULT '{}'::jsonb
);
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read site_settings publicly" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admin update site_settings" ON site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO site_settings (id, data)
VALUES (1, '{"shopName":"GadgetKita"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 11. STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public)
VALUES ('public', 'public', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read" ON storage.objects FOR SELECT USING (bucket_id = 'public');
CREATE POLICY "Auth upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'public');
CREATE POLICY "Own avatar folder" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'public' AND (storage.foldername(name))[1] = 'avatars' AND name LIKE (auth.uid() || '%'))
  WITH CHECK (bucket_id = 'public' AND (storage.foldername(name))[1] = 'avatars' AND name LIKE (auth.uid() || '%'));


-- ============================================================
-- SELESAI. Jalankan file SUPABASE_GADGETKITA_CRON.sql secara TERPISAH
-- untuk setup auto-cancel pesanan > 24 jam.

