# Periksa dan Pelajari Web

> **Workspace:** d:\vibecoding\kakao-kita-shop clone

---

**User**

perikasa dan pelajari web ini

**Assistant**

Saya akan memeriksa dan mempelajari struktur proyek web ini. Mari saya mulai dengan melihat konteks proyek sebelumnya dan struktur direktori.

Mari saya pelajari file-file kunci proyek ini untuk memahami arsitektur dan fiturnya.

Mari saya periksa konfigurasi Supabase dan beberapa service kunci untuk memahami implementasi saat ini.

Mari saya periksa beberapa service untuk memastikan implementasi Supabase-nya, serta komponen UI utama.

## Ringkasan Analisis Proyek: **Kakao Kita Shop**

Aplikasi e-commerce toko cokelat online yang **sudah full-stack** dengan Supabase sebagai backend. Berikut ringkasannya:

---

### 🛠️ Stack Teknologi
| Komponen | Teknologi |
|---|---|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS (palette custom: cacao/cream/gold) |
| Routing | React Router v6 |
| Backend | **Supabase** (Postgres + Auth + Storage) |
| Maps | Leaflet + OpenStreetMap (gratis) |
| Wilayah ID | API emsifa (Prov/Kota/Kec/Desa) |
| Icons | lucide-react |
| Deploy | Vercel / Netlify (sudah ada config) |

---

### 📁 Struktur Utama
```
src/
├── admin/          12 halaman panel admin (CRUD produk, kategori, pesanan, dll)
├── components/     Header, BottomNav (5-tab mobile FAB keranjang), CartDrawer, MapPicker, ChatWidget, ProductCard, dll
├── context/        11 Providers: Auth, Products, Cart, Wishlist, Voucher, Payment, Notification, Chat, dll
├── pages/          Home, Shop, ProductDetail, Checkout, OrderHistory, Profile, Wishlist, Login/Register, Invoice
├── services/       Semua akses data ke Supabase (productsService, orderService, dll)
└── config/         supabase.js (Project: krpqmngiitfwferlzqjl)
```

---

### 👤 Fitur User
1. **Auth** - Login/Register via Supabase Auth
2. **Katalog** - Search, filter kategori/harga, sorting
3. **Keranjang & Wishlist** - Sync ke Supabase (per user)
4. **Checkout Lengkap** - Dropdown wilayah bertingkat + peta interaktif (Leaflet) + auto-fill alamat + voucher
5. **Order** - Upload bukti transfer, riwayat, invoice, tracking
6. **Notifikasi** - Broadcast + personal (badge unread)
7. **Live Chat** - Realtime user ↔ admin
8. **Download App** - Proxy endpoint `/api/download-apk` (sembunyikan URL 3rd party via Netlify Function)

---

### 🛡️ Fitur Admin (`/admin`)
Password demo: `admin123` (statis di kode)
- Dashboard, CRUD Produk (+upload gambar ke Storage), Kategori, Voucher, Pembayaran
- Kelola Pesanan (verifikasi bukti, input resi, ubah status)
- Notifikasi Broadcast, Reply Chat User, Kelola Halaman Statis, Konten Situs

---

### 💾 Database Supabase (13 Tabel)
| Tabel | Keterangan |
|---|---|
| `profiles` | Data user (trigger auto-create saat signup) |
| `products` | Katalog (kolom `sold` untuk terjual, `external_link` untuk affiliate) |
| `categories`, `payments`, `vouchers` | Master data |
| `carts`, `wishlists` | Cloud sync per user |
| `orders` | Status: `belum_dibayar` → `menunggu_verifikasi` → `diproses` → `dikirim` → `selesai` / `dibatalkan` |
| `notifications` | Broadcast (user_id='ALL') / personal |
| `chats` | Live chat messages (JSONB) |
| `site_settings` | Setting situs dalam JSONB |
| `storage.buckets` | Bucket `public` untuk semua upload |

**Otomasi:** PG_CRON job berjalan tiap 10 menit → auto-batal pesanan `belum_dibayar` > 24 jam + rollback voucher + rollback `sold` produk.

---

### 🎨 Design System
- **Mode**: Light saja (tanpa dark mode)
- **Warna**: `cacao` (tua), `cream` (bg), `gold` (CTA), `rose` (error), `ok` (sukses)
- **Flat Design**: Border radius kecil (4-8px), tanpa emoji
- **Bottom Nav Mobile**: 5 tab dengan FAB keranjang mengambang (sesuai preferensi Anda)

---

### ⚠️ Hal yang Perlu Diperhatikan
1. **Admin Auth masih statis** `admin123` di `AdminLogin.jsx` - belum pakai Supabase Auth
2. **Supabase Anon Key hardcoded** di `src/config/supabase.js` - sebaiknya pindah ke `.env`
3. **Netlify Function download APK** duplikat di dua folder (`api/` & `netlify/functions/`)

---

Saya sudah memahami seluruh arsitektur dan fitur proyek ini. Silakan beri tahu apa yang ingin Anda lakukan selanjutnya!

---

**User**

nah ku ingin mengganti web ini menjadi web ecommers sport, bisa? apa rencanamu?

**Assistant**

Tentu bisa. Berikut rencana migrasi **Kakao Kita Shop (Cokelat)** → **E-Commerce Sport** secara terstruktur:

---

## 🎯 RENCANA MIGRASI E-COMMERCE SPORT

### **FASE 1 - Branding & Tema (Dasar dulu, cepat)**
1. **Ganti Palet Warna Tailwind** - Dari `cacao/cream/gold` → palet olahraga (biru tua/hijau/orange/hitam-putih)
2. **Ganti Nama Toko** - `KAKAO.KITA` → nama brand sport baru (misal: `SPORTKITA` atau sesuai nama Anda)
3. **Update Setting Teks** - Hero title, subjudul, footer text, placeholder search (dari "Cari cokelat..." → "Cari sepatu/jersey...")
4. **Ganti Logo & FavIcon** (jika ada aset)
5. **Seed Data Produk Sport** - Ganti `SEED_PRODUCTS` dengan kategori: Sepatu, Jersey, Celana, Aksesoris, Alat Olahraga

### **FASE 2 - Struktur Produk & Kategori**
1. **Kategori Sport** - Sepatu Lari, Sepatu Futsal, Jersey, Baju Olahraga, Celana, Tas, Aksesoris (Headband, Kaos Kaki), Alat Fitness
2. **Atribut Produk Khusus Sport** - Tambah field jika perlu:
   - `size` (EU/US/IDR untuk sepatu, S/M/L/XL untuk apparel)
   - `color_variants`
   - `material`
   - `gender` (Pria/Wanita/Unisex/Anak)
   - `sport_type` (Lari, Futsal, Basket, Fitness, Badminton, dll)
3. **Update Filter di Halaman Toko** - Tambah filter ukuran & jenis olahraga (sebelumnya hanya kategori + harga)

### **FASE 3 - UI/UX Khusus Sport**
1. **Hero Section** - Ganti visual dari cokelat → gambar atlet/sepatu
2. **Product Card** - Tampilkan badge: `NEW ARRIVAL`, `BEST SELLER`, `UP TO 70%`
3. **Detail Produk** - Tambah size chart, opsi pilih ukuran sebelum Beli Sekarang
4. **Kosmetik** - Hapus semua referensi "cokelat", "kakao", "cocoa"

### **FASE 4 - Backend (Supabase)**
1. **SQL Update Schema** - Tambah kolom baru ke tabel `products` (size, gender, sport_type, material)
2. **Update `mapFromDb` / `mapToDb`** di `productService.js`
3. **Update Admin Form** (`AdminProductForm.jsx`) - Tambah input field baru
4. **Reset Data** - Hapus produk cokelat lama, insert produk sport baru

---

## 🚀 PRIORITAS PERTAMA (yang paling impactful & cepat dikerjakan)

Sebelum mulai, perlu saya konfirmasi:
1. **Nama Brand Sport** apa? (contoh: SPORTKITA, ATHLETESHOP, OLAHRAGASTORE, dst)
2. **Palet Warna** preferensi? Default saya rekomendasikan:
   - `navy` (biru tua #0F172A) / `electric-blue` (#2563EB) / `orange-sport` (#F97316) / `white`
3. **Kategori utama** apa? (dari yang saya daftar di atas, ada yang mau ditambah/hapus?)
4. **Ukuran** mau support field `size`? (penting untuk sepatu & apparel)

Setelah jawab 4 pertanyaan itu, saya langsung eksekusi Fase 1 terlebih dahulu. Mau?

---

**User**

lebih baik proyek ini diedit atau buat folder proyek baru? 
 jawab singkat

**Assistant**

**Edit proyek ini saja.** Alasannya:
- Semua *core logic* (cart, checkout, admin, auth, Supabase, payment, voucher) sudah jadi & tinggal ganti konten/branding saja
- Buat proyek baru = buang-buang waktu setup ulang routing, context providers, services, konfigurasi Vercel/Netlify
- Cukup backup sementara dengan `git branch backup-kakao-kita` sebelum mulai edit, kalau mau aman.

---

**User**

kan ini sudah terhubung ke supabase dan github, jika di edit apakah yang sudah di upload akan berubah juga?

**Assistant**

**TIDAK langsung berubah otomatis.** Berikut batasannya:

| Komponen | Berubah Otomatis? | Keterangan |
|---|---|---|
| **GitHub** | ❌ Tidak | Hanya berubah setelah kamu `git add` → `git commit` → `git push` |
| **Schema Tabel Supabase** | ❌ Tidak | Hanya berubah jika kamu jalankan SQL baru di dashboard Supabase |
| **Data Produk/Konten di Supabase** | ⚠️ Hanya lewat Admin Panel | Edit kode lokal (warna, nama toko) TIDAK ubah data DB. Perubahan data hanya lewat CRUD Admin Panel di web yang jalan. |
| **Deploy (Vercel/Netlify)** | ❌ Tidak | Hanya update setelah push ke GitHub (jika auto-deploy aktif) |

**Cara Aman Sebelum Edit:**
```bash
# Buat backup branch di Git
git branch backup-kakao-kita
```

Kalau mau rollback tinggal `git checkout backup-kakao-kita`. Untuk data Supabase, export dulu tabel products/kategori via **Table Editor → Export** di dashboard Supabase.

---

**User**

kita akan pakai akun supabase yang sama? atau supabase yang sudah ada di export dulu lalu nanti di import ke akun yang baru> atau gimana?

**Assistant**

**Rekomendasi: PAKAI AKUN SUPABASE SAMA, tapi buat PROJECT BARU.**

Alasan:
1. **Data produk cokelat & sport berbeda** - Ga mungkin di campur dalam tabel yang sama (nama field beda, kategori beda, ukuran/sepatu butuh field baru)
2. **Akun sama = tidak bayar double** - Supabase free tier 2 project per akun, masih cukup
3. **Config tinggal ganti URL+Anon Key** di `src/config/supabase.js`

---

**Yang harus diekspor dari project lama (cokelat):**
TIDAK PERLU ekspor tabel produk/kategori (kan beda niche). Cukup:
1. ✅ **SQL schema setup** (dari `SUPABASE_SETUP.md`) - ini bisa dijalankan ulang ke project baru
2. ❌ **Skip export data products/categories** (nanti seed ulang dengan produk sport)
3. ❌ **Skip export users** (kalau user beda, mulai dari nol lebih bersih)

---

**Kecuali jika:**
Kamu **maunya** user akun lama (yang sudah signup di toko cokelat) bisa login juga di toko sport → barulah perlu migrasi data `auth.users` + `profiles`. Kalau tidak perlu, skip saja.

**Jadi mulai dari mana?**
Buat project Supabase baru dulu, kasih nama misal `sportkita-shop`, lalu jalankan SQL dari `SUPABASE_SETUP.md` (tambah kolom `size`, `gender`, `sport_type` nanti).

Mau saya bantu mulai edit dulu bagian kode (warna, nama toko, kategori) sementara kamu buat project Supabase baru? Atau mau urut step by step?

---

**User**

masalalahnya akun itu sudah tidak bisa nambah proyek baru

**Assistant**

**Pakai PROJECT YANG SAMA aja, bersihkan isi tabelnya.**

Langkah-langkah aman:

---

## 🔧 CARA PAKAI SUPABASE PROJECT YANG SAMA

### **Langkah 1 - Backup Data Lama (DULU!)**
Di dashboard Supabase → **Table Editor** → tiap tabel klik **Export** (CSV):
- `products`, `categories`, `orders`, `profiles`, `carts`, `wishlists`, `notifications`, `chats`, `site_settings`

Backup juga **Storage bucket `public`** → download semua filenya (avatar, gambar produk lama).

### **Langkah 2 - Tambah Kolom Baru ke Tabel `products`**
Jalankan ini di SQL Editor (TIDAK usah drop tabel, tinggal alter):
```sql
-- Tambah field khusus sport
ALTER TABLE products ADD COLUMN IF NOT EXISTS size TEXT;        -- "42,43,44" untuk sepatu, "S,M,L,XL" untuk baju
ALTER TABLE products ADD COLUMN IF NOT EXISTS gender TEXT;      -- pria/wanita/unisex/anak
ALTER TABLE products ADD COLUMN IF NOT EXISTS sport_type TEXT;  -- lari/futsal/basket/fitness/badminton
ALTER TABLE products ADD COLUMN IF NOT EXISTS material TEXT;    -- mesh/katun/dry-fit/kulit

-- Tambah kolom ini ke orders untuk voucher & alasan batal (jika belum ada)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS voucher_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cancel_reason TEXT;
```

### **Langkah 3 - Bersihkan Data Lama**
```sql
-- Hapus produk & kategori lama
DELETE FROM products;
DELETE FROM categories;

-- Hapus site_settings lama (akan di-setting ulang)
DELETE FROM site_settings;

-- Opsional: hapus orders/chat/notifikasi lama (jika project mau dimulai bersih)
DELETE FROM chats;
DELETE FROM notifications;
DELETE FROM orders;
DELETE FROM carts;
DELETE FROM wishlists;
-- JANGAN hapus `profiles` & `auth.users` jika user lama mau tetap login
```

### **Langkah 4 - Ganti Config (opsional)**
`src/config/supabase.js` → **TIDAK perlu ganti** (URL & Anon Key tetap sama).

---

**Selesai.** Supabase project yang sama sekarang siap untuk e-commerce sport. User akun lama tetap bisa login (jika profiles tidak dihapus).

Mau saya langsung mulai edit kodenya sekarang? (Fase 1: Warna Tailwind + Nama Toko + Seed Data Produk Sport)

---

**User**

kalau pakai projek yang sama apakah website kakao yang sudah dideploy akan berubah?

**Assistant**

**YA, BERUBAH LANGSUNG** untuk bagian **DATA** (produk, nama toko, kategori, konten).

| Yang berubah | Web Kakao yang LIVE |
|---|---|
| Produk, kategori, harga | ✅ Berubah langsung (baca dari Supabase) |
| Nama toko, logo, text hero/site_settings | ✅ Berubah langsung |
| Warna, layout, tampilan frontend | ❌ Tidak berubah (baru berubah setelah push GitHub + auto-deploy) |

**Risiko:** Web kakao yang live bisa menampilkan produk sport dengan branding masih cokelat = user bingung.

---

**Kalau web kakao masih dipakai → SOLUSI:**
1. **Daftar akun Supabase BARU** (email beda, tetap free) → project sport di sana
2. Atau **Upgrade Supabase** pro tier untuk nambah slot project

**Kalau web kakao sudah tidak dipakai → Aman** pakai project yang sama, bersihkan data.

Jadi mana?

---

**User**

nah ku maunya kakao yang sudah dideploy jangan diubah, dan kita akan buat proyek baru tapi dengan sistem web alurnya sama kaya kakao

**Assistant**

Oke, jelas. Rencana: **Duplikat project ini ke folder baru + Supabase baru (email beda).**

---

## 📋 LANGKAH-LANGKAH

### **Kamu lakukan dulu:**
1. **Buat akun Supabase BARU** (email beda, free tier dapat 2 project slot)
2. Buat project baru di Supabase itu, kasih nama misal `sportkita-shop`
3. Copy **Project URL** + **Anon Key` dari Settings → API

### **Saya akan kerjakan:**
1. **Copy seluruh folder** `kakao-kita-shop clone` ke folder baru (misal `sportkita-shop`)
2. **Update `src/config/supabase.js`** → URL + Anon Key project Supabase baru
3. **Edit semua branding**:
   - Palet warna Tailwind (cacao/cream/gold → sport theme)
   - Nama toko, placeholder, text hero
   - Favicon + referensi "kakao/cokelat"
4. **Seed data produk sport** baru di `src/data/products.js`
5. **Update struktur produk** (tambah field: size, gender, sport_type, material)
6. Jalankan SQL schema dari `SUPABASE_SETUP.md` ke Supabase baru (plus kolom tambahan)

---

**Yang saya butuhkan dari kamu untuk mulai:**
1. ✅ Sudah siap? Beri nama **folder proyek baru** (misal: `sportkita-shop` atau sesuai nama brand)
2. **Nama brand toko sport**-nya apa?
3. (Opsional nanti) URL + Anon Key Supabase baru (kalau akunnya sudah jadi)

Kalo sudah jawab no.1 & 2, saya langsung generate file-file perubahannya.

---

**User**

ok ku ingin 
 namanya sportkita 
 warnanya hitamputih dan hijau lemon 
 `https://kmyrknrjcjmmqpknkdwf.supabase.co` 
 sb_publishable_JouVWnRpwtN3BN3UP5sjzA_hWU_9jic 
 jawaban saya benar? ada pertanyaan apa rencanamu?

**Assistant**

**Ya, jawaban Anda sudah lengkap dan benar. 👍**

---

## 🚀 RENCANA KERJA SAYA (Urutan Prioritas)

### **Langkah 0 - Kamu lakukan DULU:**
Copy folder proyek ini secara manual ke folder **BARU** bernama `sportkita`:
```
Folder asal:  d:\vibecoding\kakao-kita-shop clone
Folder baru:  d:\vibecoding\sportkita
```
*(Copy-paste biasa di File Explorer Windows)*

---

### **Setelah folder baru siap, saya akan edit di `d:\vibecoding\sportkita\`:**

| No | File yang diedit | Apa yang diubah |
|---|---|---|
| 1 | `package.json` | Nama project jadi `sportkita` |
| 2 | `tailwind.config.js` | **Ganti palet warna** - cacao/cream/gold → Hitam (`slate/zinc`) + Putih + Hijau Lemon (`#84CC16` / `lime-500`) |
| 3 | `src/config/supabase.js` | Ganti URL + Anon Key dengan Supabase baru Anda |
| 4 | `index.html` | Ganti `<title>` + favicon placeholder |
| 5 | `src/data/products.js` | **Seed produk SPORT** + field baru: `size`, `gender`, `sport_type`, `material` |
| 6 | `src/services/productService.js` | Tambah mapping field baru (size, gender, sport_type, material) di `mapFromDb` / `mapToDb` |
| 7 | `SUPABASE_SETUP.md` | Tambah SQL `ALTER TABLE products ADD COLUMN...` untuk 4 field baru |
| 8 | `src/components/Header.jsx` | Placeholder search: "Cari cokelat..." → "Cari sepatu/jersey..." |
| 9 | `src/pages/Home.jsx` + `SiteContentContext` | Default nama toko `SPORTKITA`, text hero & subjudul tema olahraga |
| 10 | `src/components/ProductCard.jsx` | Badge: `NEW`, `BEST SELLER`, `DISKON` (tanpa emoji) |
| 11 | `src/admin/AdminProductForm.jsx` | Tambah input field baru: Size, Gender, Sport Type, Material |

---

### **Selesai semua di atas, kamu tinggal:**
1. Buka `d:\vibecoding\sportkita`
2. Jalankan `npm install` + `npm run dev`
3. Buka Supabase dashboard baru → SQL Editor → jalankan script dari `SUPABASE_SETUP.md`
4. Login admin → setup konten situs & tambah produk lewat `/admin`

---

**Kamu sudah copy folder ke `d:\vibecoding\sportkita`? Kalau sudah, bilang ya, saya langsung mulai edit file per file.**

---

**User**

jika saya buka folder baru nanti history chat ini hilang

**Assistant**

**TIDAK hilang.** History chat ini tersimpan di **aplikasi Trae** (bukan di folder proyek).

Anda bisa:
1. ✅ Copy folder sekarang ke `sportkita` (di File Explorer)
2. ✅ Tetap buka chat ini
3. ✅ Nanti saya generate perubahan file — dan saya akan **saja kasih path absolut `d:\vibecoding\sportkita\nama_file.jsx`** di setiap output
4. ✅ Anda terapkan perubahan ke folder `sportkita`

Atau... kalau folder `sportkita` belum ada, saya bisa mulai generate perubahan duluan, dan **Anda nanti tinggal buat foldernya + copy isinya sebelum jalankan `npm install`**.

**Pertanyaan:** Mau saya langsung mulai generate perubahan file sekarang? (Path akan saya tulis `d:\vibecoding\sportkita\...` supaya Anda tinggal taruh di folder baru)

---

**User**

sudah tuh ada di workspace

**Assistant**

Bagus, folder `d:\vibecoding\sport kita` sudah ada di workspace. Mari saya mulai edit file per file. Kita mulai dengan konfigurasi dasar:

**1. Update `tailwind.config.js` - Ganti palet warna cacao → hitam/putih + hijau lemon**
**2. Update `src/config/supabase.js` - Ganti ke Supabase baru**
**3. Update `package.json` - Ganti nama project**

Folder `sport kita` masih kosong. Mari saya cek dulu perbedaan path folder di environment:

⚠️ **Catatan:** Workspace mendeteksi folder `d:\vibecoding\sport kita` (dengan spasi), tapi isinya kosong. Sementara file saya tadi coba edit ke path `d:\vibecoding\sport kita\...` yang memang sudah ada tapi **kosong** (belum dicopy isinya dari folder `kakao-kita-shop clone`).

**Sebelum lanjut, ada 2 opsi:**

---

**OPSI A (CEPAT):** Anda copy-paste manual dulu SEMUA isi folder `d:\vibecoding\kakao-kita-shop clone\` ke dalam `d:\vibecoding\sport kita\` (di File Explorer). Setelah folder `sport kita` berisi file yang sama persis, saya baru bisa edit pakai `show_diff`.

---

**OPSI B:** Saya generate file baru satu per satu dari awal (pakai code block, bukan show_diff). Tapi ini butuh waktu lebih lama karena file ada 50+.

---

**Pilih mana? Saya sarankan OPSI A lebih cepat.** Anda copy dulu isinya, kasih kabar "sudah", lalu saya lanjut edit semua file.

---

**User**

oh iya, yasudah sama kamu saja dari awal

**Assistant**

Baik, saya kerjakan dari awal. Mari saya buat rencana kerja dulu, lalu cek kondisi folder saat ini.

Folder `sport kita` baru sebagian file. Saya copy seluruh isi folder lama ke folder baru dulu via command, agar lengkap:

File berhasil dicopy. Sekarang saya mulai edit file konfigurasi dasar. Mari update `todo` status dan mulai edit:

Sekarang saya edit 4 file konfigurasi dasar sekaligus. Mari baca file aslinya dulu (dari folder sport kita) untuk memastikan konten terbaru:

Bagus. Sekarang saya edit 4 file konfigurasi sekaligus:

Bagus! Sekarang saya lanjut ke Fase 2: Ganti semua referensi palet warna lama (cacao/cream/gold) ke baru (slate/gray/lime) di seluruh file JSX dan CSS. Ini paling krusial karena banyak. Mari saya baca file utama dulu:

Sekarang saya perlu mengganti semua referensi palet warna lama (cacao/cream/gold) ke baru (slate/gray/lime) di banyak file. Strategi paling cepat: baca semua file JSX/CSS dan lakukan replace mapping. Mari saya daftar file-file yang perlu diedit (paling banyak digunakan):

Sekarang saya edit file index.css, App.jsx, Header.jsx, BottomNav.jsx. Mari ganti semua mapping warna:

Sekarang saya perlu ganti semua mapping warna di Header.jsx dan BottomNav.jsx. Karena mappingnya banyak, saya tulis ulang kedua file ini agar lebih cepat:

Bagus. Sekarang saya cari semua file yang masih mengandung palet warna lama (cacao/cream/gold) untuk diganti massal:

Ada 40 file! Saya pakai command PowerShell untuk replace mapping warna secara massal agar cepat:

Berhasil! 72 file diproses. Sekarang saya verifikasi tidak ada sisa warna lama, lalu lanjut ke update konten situs & seed produk:

Masih ada sisa 14 file. Mari saya cek pola yang belum terganti:

Ada `cacao-300` yang belum di-map (saya cuma map 400-900 sebelumnya). Saya ulangi replace dengan mapping lebih lengkap (semua varian cacao, cream, gold):

Ada 6 sisa pola `gold-50` dan `gold-800`. Saya ganti satu per satu karena cuma sedikit:

Sempurna. Semua warna lama sudah bersih. Sekarang lanjut ke Fase 4 & 5: default konten toko + seed data produk sport. Mari update todo status:

Sekarang saya update `SiteContentContext.jsx` (default konten SPORTKITA) dan `Home.jsx` (hero text). Mari baca file aslinya:

Sekarang saya update file seed data produk sport dan mapping field baru di productService:

Saya tulis ulang `products.js` dengan seed data produk sport lengkap + field baru:

Sekarang saya update `productService.js` untuk menambahkan mapping field baru (size, gender, sport_type, material):

Sekarang saya update `SUPABASE_SETUP.md` (tambah SQL alter kolom baru) dan `AdminProductForm.jsx` (tambah input field baru untuk size, gender, sport_type, material):

Sekarang saya update `SUPABASE_SETUP.md` untuk menambahkan kolom baru di SQL schema:

Sekarang saya update `ProductDetail.jsx` untuk menampilkan size selector, sport type, gender, dan material:

Bagus. Sekarang saya selesaikan Fase 7 dan jalankan verifikasi build:

Sekarang saya jalankan build untuk verifikasi tidak ada error:

**BUILD BERHASIL!** ✅ Exit code 0, tidak ada error. Todo terakhir selesai.

---

