# 🔧 Supabase Setup — Kakao Kita Shop

File ini berisi SQL lengkap untuk membuat tabel, storage bucket, trigger, dan RLS policies yang dibutuhkan aplikasi Kakao Kita Shop.

Cara pakai:
1. Buka [Supabase Dashboard](https://supabase.com/dashboard) → pilih project Kakao Kita Shop
2. Klik menu **SQL Editor** (ikon </>)
3. Paste blok SQL satu per satu, lalu klik **Run**
4. Jalankan sesuai urutan nomor

---

## 1. TABEL `profiles` (Data pengguna)
Kolom yang sering error: `avatar` — wajib ada sebelum upload foto profil.

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  avatar TEXT,
  address JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Trigger: buat row profiles OTOMATIS saat user baru signup
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

-- RLS Policies profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Insert profile on signup" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

---

## 2. TABEL `carts` & `wishlists` (Cloud sync per user)
```sql
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
```

---

## 3. TABEL `orders` (Pesanan)
```sql
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
  auth.uid() = user_id OR (auth.jwt() ->> 'email') LIKE '%@admin%' OR (auth.jwt() ->> 'email') LIKE '%@kakaokita%'
);
CREATE POLICY "Insert order auth or anon" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Update order own or admin" ON orders FOR UPDATE USING (
  auth.uid() = user_id OR (auth.jwt() ->> 'email') LIKE '%@admin%' OR (auth.jwt() ->> 'email') LIKE '%@kakaokita%'
);
```

---

## 4. TABEL `products` (Katalog produk)
```sql
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  old_price NUMERIC,
  rating NUMERIC DEFAULT 0,
  reviews INTEGER DEFAULT 0,
  category TEXT,
  weight TEXT,
  in_stock BOOLEAN DEFAULT true,
  content_volume TEXT,
  is_new BOOLEAN DEFAULT false,
  short_desc TEXT,
  description TEXT,
  images TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read products publicly" ON products FOR SELECT USING (true);
```

---

## 5. TABEL `categories`
```sql
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
```

---

## 6. TABEL `payments` (Metode pembayaran)
```sql
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
```

---

## 7. TABEL `vouchers`
```sql
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
```

---

## 8. TABEL `notifications` (Notifikasi broadcast & per user)
⚠️ **CATATAN TYPE CAST**: `user_id` adalah `TEXT` (bukan UUID) karena bisa bernilai `'ALL'` untuk broadcast. Jangan lupa cast `auth.uid()::text` di policy.

```sql
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL, -- 'ALL' = broadcast, atau UUID user dalam bentuk text
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  read_by TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Own notifications read" ON notifications;
DROP POLICY IF EXISTS "Own notifications mark read" ON notifications;

CREATE POLICY "Own notifications read" ON notifications FOR SELECT USING (
  user_id = auth.uid()::text OR user_id = 'ALL'
);
CREATE POLICY "Own notifications mark read" ON notifications FOR UPDATE USING (
  user_id = auth.uid()::text OR user_id = 'ALL'
);
CREATE POLICY "Authenticated insert notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (true);
```

---

## 9. TABEL `chats` (Live chat user ↔ admin)
```sql
CREATE TABLE IF NOT EXISTS chats (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  messages JSONB NOT NULL DEFAULT '[]'::jsonb
);
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own chats" ON chats FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

---

## 10. TABEL `site_settings` (Konten situs, logo, dll)
```sql
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL DEFAULT '{}'::jsonb
);
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read site_settings publicly" ON site_settings FOR SELECT USING (true);

-- Seed baris id=1 agar .single() tidak error PGRST116
INSERT INTO site_settings (id, data) VALUES (1, '{}'::jsonb) ON CONFLICT (id) DO NOTHING;
```

---

## 11. STORAGE BUCKET `public` (WAJIB untuk upload foto)
Aplikasi ini hanya pakai SATU bucket bernama `public`.

```sql
-- Buat bucket (jika belum ada)
INSERT INTO storage.buckets (id, name, public)
VALUES ('public', 'public', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies untuk Storage Bucket 'public'
-- Semua user bisa READ gambar yang sudah di-upload
CREATE POLICY "Public read access to public bucket" ON storage.objects
  FOR SELECT USING (bucket_id = 'public');

-- User authenticated bisa upload SEMUA file ke bucket public (avatar, receipt, produk, logo)
CREATE POLICY "Authenticated upload to public bucket" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'public');

-- User bisa hapus/update file yang ada di path folder avatars dirinya sendiri
CREATE POLICY "User can manage own avatar folder" ON storage.objects
  FOR ALL TO authenticated USING (
    bucket_id = 'public' AND
    (storage.foldername(name))[1] = 'avatars' AND
    name LIKE (auth.uid() || '%')
  ) WITH CHECK (
    bucket_id = 'public' AND
    (storage.foldername(name))[1] = 'avatars' AND
    name LIKE (auth.uid() || '%')
  );
```

---

## 🚨 TROUBLESHOOTING

### Error: `Could not find the 'avatar' column of 'profiles' in the schema cache`
Jalankan no.1 (ALTER TABLE profiles ADD COLUMN avatar TEXT). Lalu buka **Table Editor → profiles → klik Reset Schema Cache** di kanan atas.

### Error: `operator does not exist: uuid = text` (kode 42883)
Itu karena RLS policy membandingkan `auth.uid()` (UUID) dengan kolom `user_id` TEXT di tabel `notifications`. Gunakan cast `::text` seperti contoh di no.8.

### Error: `new row violates row-level security policy` (insert/update ditolak)
Berarti policy INSERT/UPDATE belum dibuat untuk tabel tersebut. Cek ulang blok RLS di atas.

### Error Upload Gambar: `bucket not found`
Jalankan no.11 untuk insert ke storage.buckets, dan pastikan nama bucket persis `public` (lowercase).

---

## 📊 TABEL STATUS PESANAN (Enum yang dipakai kode)
| key | Label | Deskripsi |
|---|---|---|
| `belum_dibayar` | Belum Dibayar | User baru checkout, belum upload bukti |
| `menunggu_verifikasi` | Menunggu Verifikasi | User sudah upload bukti transfer |
| `diproses` | Diproses | Admin terima pembayaran & sedang packing |
| `dikirim` | Dikirim | Sudah ada nomor resi |
| `selesai` | Selesai | Pesanan diterima user |
| `dibatalkan` | Dibatalkan | Bisa by user / by admin / by scheduler timeout 24 jam |

Badge admin "Pesanan" menghitung status aktif: `belum_dibayar` + `menunggu_verifikasi` + `diproses`.

---

## 12. ⏰ PG_CRON: AUTO BATAL PESANAN LEBIH DARI 24 JAM (BUKTI TRANSFER TIDAK DIUPLOAD)

**Cara kerja:** Scheduler berjalan tiap **10 menit**. Untuk setiap pesanan `belum_dibayar` yang `created_at` > 24 jam lalu:
1. Ubah status → `dibatalkan`
2. Tambah `cancelReason`: `'Timeout 24 jam tidak upload bukti transfer (otomatis oleh sistem)'`
3. **Rollback voucher**: Jika order pakai voucher (`voucher_code` ada) → kurangi `used` di tabel vouchers 1 poin.

⚠️ **Prasyarat:** Extension `pg_cron` harus tersedia di Supabase Free Tier. Jalankan SQL dibawah:

```sql
-- (STEP 1) Enable extension pg_cron (hanya bisa dijalankan OLEH POSTGRES ROLE / SUPABASE ADMIN)
CREATE EXTENSION IF NOT EXISTS pg_cron SCHEMA extensions;
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT EXECUTE ON FUNCTION cron.schedule(text, text, text) TO postgres;
GRANT EXECUTE ON FUNCTION cron.unschedule(bigint) TO postgres;

-- (STEP 2) Buat FUNCTION yang dijalankan scheduler
CREATE OR REPLACE FUNCTION public.cancel_expired_unpaid_orders()
RETURNS SETOF public.orders AS $$
DECLARE
  r_order RECORD;
  v_voucher_id TEXT;
BEGIN
  FOR r_order IN
    SELECT id, voucher_code
    FROM public.orders
    WHERE status = 'belum_dibayar'
      AND created_at < NOW() - INTERVAL '24 hours'
    FOR UPDATE SKIP LOCKED
  LOOP
    -- 1. Update order status ke dibatalkan
    UPDATE public.orders
    SET status = 'dibatalkan',
        payment_status = 'dibatalkan',
        customer_info = COALESCE(customer_info, '{}'::jsonb) ||
          jsonb_build_object('cancelReason', 'Timeout 24 jam tidak upload bukti transfer (otomatis oleh sistem)')
    WHERE id = r_order.id;

    -- 2. Rollback voucher usage (jika order pakai voucher & kodenya tercatat)
    IF r_order.voucher_code IS NOT NULL AND r_order.voucher_code <> '' THEN
      SELECT id INTO v_voucher_id FROM public.vouchers WHERE code = r_order.voucher_code LIMIT 1;
      IF FOUND THEN
        UPDATE public.vouchers
        SET used = GREATEST(0, COALESCE(used, 0) - 1)
        WHERE id = v_voucher_id;
      END IF;
    END IF;

    RETURN NEXT;
  END LOOP;
  RETURN;
END;
$$ LANGUAGE plpgsql VOLATILE SECURITY DEFINER;
ALTER FUNCTION public.cancel_expired_unpaid_orders() OWNER TO postgres;

-- (STEP 3) Jadwalkan scheduler berjalan tiap 10 menit
SELECT cron.schedule(
  'cancel-expired-unpaid-orders',
  '*/10 * * * *',
  $$ SELECT count(*) FROM public.cancel_expired_unpaid_orders(); $$
);
```

**Cek apakah cron job sudah aktif:**
```sql
SELECT * FROM cron.job;
```

**Hapus job jika tidak diperlukan:**
```sql
SELECT cron.unschedule('cancel-expired-unpaid-orders');
```
