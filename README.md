# Kakao Kita — Toko Cokelat Online


Aplikasi e-commerce cokelat siap pakai. Dibangun dengan **React + Vite + Tailwind CSS**, mode terang, gaya *flat design*.

## Fitur

- Halaman beranda, katalog, detail produk, keranjang, checkout, konfirmasi pesanan, riwayat pesanan (bisa diklik untuk lihat detail), dan wishlist
- Tombol **Beli Sekarang** di kartu produk & halaman detail — langsung ke checkout tanpa perlu buka keranjang dulu
- Pencarian produk, filter kategori & harga, urutkan berdasarkan harga/rating (kategori tidak lagi tampil di navbar, tapi tetap bisa difilter di halaman Toko)
- **Halaman admin** (`/admin`) untuk CRUD produk, kelola kategori, kelola konten teks situs, dan upload gambar produk — lihat bagian [Halaman Admin](#halaman-admin--crud-produk)
- **Checkout dengan alamat lengkap**: dropdown Provinsi → Kota/Kabupaten → Kecamatan → Desa/Kelurahan (masing-masing bisa dicari), plus peta interaktif untuk pin lokasi — kolom lain terisi otomatis saat lokasi dipilih di peta
- Konfirmasi sebelum meninggalkan halaman checkout (klik menu lain, tombol back, atau menutup tab)
- Keranjang & wishlist tersimpan otomatis di browser (localStorage) — tidak hilang saat refresh
- Notifikasi toast, badge diskon, status stok
- Sepenuhnya responsif (mobile, tablet, desktop)

## Teknologi

| Bagian        | Teknologi               |
|----------------|--------------------------|
| Framework      | React 18 + Vite 5        |
| Styling        | Tailwind CSS (flat design, mode terang) |
| Routing        | React Router v6           |
| Ikon           | lucide-react              |
| Peta           | Leaflet + OpenStreetMap (gratis, tanpa API key) |
| Data wilayah   | API publik [emsifa](https://www.emsifa.com/api-wilayah-indonesia/) (provinsi/kota/kecamatan/desa) |
| Pencarian & pin alamat | [Nominatim OpenStreetMap](https://nominatim.org/) |
| Penyimpanan data | localStorage (tanpa backend) |

> Semua tiga layanan eksternal di atas (peta, data wilayah, pencarian alamat) dipanggil langsung dari browser pengguna saat aplikasi berjalan — bukan dari server kamu — jadi tidak butuh setup tambahan apa pun, asal browser pengguna terhubung internet.

## Menjalankan di Komputer Lokal

Prasyarat: [Node.js](https://nodejs.org) versi 18 ke atas.

```bash
# 1. Masuk ke folder proyek
cd kakao-kita-shop

# 2. Install dependency
npm install

# 3. Jalankan mode development
npm run dev
```

Buka `http://localhost:5173` di browser.

## Build untuk Produksi

```bash
npm run build
```

Perintah ini menghasilkan folder `dist/` — berisi file HTML, CSS, JS statis yang siap di-*deploy* ke hosting mana pun.

Untuk melihat hasil build secara lokal sebelum deploy:

```bash
npm run preview
```

---

## Cara Deploy

Karena hasil build adalah situs statis murni, ada beberapa opsi. Pilih salah satu:

### Opsi 1 — Vercel (paling direkomendasikan, gratis)

1. Buat akun di [vercel.com](https://vercel.com) (bisa login pakai GitHub/Google).
2. Klik **Add New → Project**.
3. Upload folder proyek ini (atau hubungkan ke repository GitHub jika sudah kamu unggah ke GitHub).
4. Vercel otomatis mendeteksi framework **Vite** — biarkan pengaturan default:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Klik **Deploy**. Dalam ±1 menit situs sudah *live* dengan URL seperti `nama-proyek.vercel.app`.

File `vercel.json` sudah disertakan agar navigasi antar halaman (misalnya `/toko`, `/produk/p1`) tidak error saat direfresh.

### Opsi 2 — Netlify (gratis, drag & drop)

**Cara tercepat (tanpa akun Git):**
1. Jalankan `npm run build` di komputer.
2. Buka [app.netlify.com/drop](https://app.netlify.com/drop).
3. Seret (drag & drop) folder `dist/` ke halaman tersebut.
4. Situs langsung online dengan URL acak dari Netlify — bisa diganti nama di pengaturan.

**Cara terhubung dengan Git (auto-deploy tiap update):**
1. Unggah proyek ini ke repository GitHub.
2. Di Netlify: **Add new site → Import an existing project** → pilih repo tersebut.
3. Build command: `npm run build`, Publish directory: `dist`.
4. File `netlify.toml` di proyek ini sudah mengatur redirect otomatis agar semua halaman React Router berjalan normal.

### Opsi 3 — GitHub Pages

1. Install helper deploy:
   ```bash
   npm install --save-dev gh-pages
   ```
2. Tambahkan di `package.json` bagian `"scripts"`:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
3. Tambahkan `base: '/nama-repo/'` di `vite.config.js` (sesuaikan dengan nama repository GitHub kamu).
4. Jalankan:
   ```bash
   npm run deploy
   ```
5. Aktifkan GitHub Pages di **Settings → Pages** repo, pilih branch `gh-pages`.

### Opsi 4 — Hosting statis lain (cPanel, Firebase Hosting, dsb.)

Karena `dist/` hanya berisi file statis (HTML/CSS/JS), kamu bisa mengunggahnya ke hosting apa pun yang mendukung file statis:

1. Jalankan `npm run build`.
2. Unggah **seluruh isi** folder `dist/` (bukan foldernya sendiri) ke `public_html` atau folder root hosting kamu.
3. Karena ini Single Page Application, pastikan hosting mengarahkan semua rute yang tidak ditemukan (404) kembali ke `index.html`. Untuk Firebase Hosting, gunakan `firebase.json` dengan aturan `"rewrites": [{ "source": "**", "destination": "/index.html" }]`.

---

## Halaman Admin & CRUD Produk

Akses di `/admin` (ada juga tautan kecil "Admin" di footer situs).

- **Password demo:** `admin123` — diatur di `src/admin/AdminLogin.jsx` (konstanta `ADMIN_PASSWORD`). Ganti sesuai kebutuhan, atau lebih baik lagi, ganti seluruh mekanismenya saat migrasi ke Supabase (lihat di bawah).
- Fitur yang tersedia: **daftar produk**, **tambah produk**, **edit produk**, **hapus produk**, dan **reset ke data awal**.
- Perubahan yang dibuat di admin **langsung terlihat** di halaman toko (beranda, katalog, detail produk) karena keduanya membaca dari sumber data yang sama.
- **Kelola Kategori** (`/admin/kategori`): tambah kategori baru, atau hapus (kategori yang masih dipakai produk tidak bisa dihapus sampai produknya dipindah/dihapus dulu).
- **Kelola Konten** (`/admin/konten`): ubah teks-teks utama situs — judul & subjudul hero di beranda, judul section newsletter, dan teks di footer — tanpa perlu edit kode.
- **Upload gambar produk**: di form tambah/edit produk, unggah foto asli (otomatis dikompres agar hemat tempat). Kalau tidak diunggah, produk memakai ikon SVG otomatis sebagai gantinya.

### Alamat Pengiriman: Dropdown Wilayah & Peta Interaktif

Di halaman checkout, alamat pengiriman diisi lewat:

1. **Dropdown bertingkat dengan pencarian** — Provinsi → Kota/Kabupaten → Kecamatan → Desa/Kelurahan. Setiap dropdown baru aktif setelah level di atasnya dipilih, dan datanya diambil dari API wilayah resmi Indonesia (emsifa) secara real-time.
2. **Peta interaktif** — cari alamat lewat kolom pencarian di atas peta, atau klik/geser langsung pin di peta. Begitu lokasi dipilih, sistem otomatis mencoba mengisi provinsi/kota/kecamatan/desa, kode pos, dan detail alamat.

**Catatan jujur soal peta:** kamu sebelumnya minta Google Maps — saya pakai **OpenStreetMap + Leaflet** sebagai gantinya, karena Google Maps mewajibkan API key berbayar milik akun Google Cloud kamu sendiri (tidak bisa saya sertakan). OpenStreetMap gratis dan langsung jalan tanpa setup apa pun. Pengisian otomatis dari titik peta ke dropdown wilayah dilakukan dengan mencocokkan nama tempat (bukan kode wilayah resmi), jadi **sesekali bisa kurang tepat** — pengguna tetap bisa mengoreksi manual lewat dropdown. Kalau kamu nanti punya API key Google Maps sendiri dan ingin menggantinya, lihat bagian di bawah.

#### Mengganti Peta ke Google Maps (opsional)

1. Buat API key di [Google Cloud Console](https://console.cloud.google.com/) dengan **Maps JavaScript API** dan **Geocoding API** aktif, plus billing account (Google Maps berbayar setelah kuota gratis habis).
2. Install `@googlemaps/js-api-loader` atau pakai `<script>` tag resmi Google Maps.
3. Ganti isi `src/components/MapPicker.jsx` dengan implementasi `google.maps.Map` + `google.maps.Marker` (props `lat`, `lng`, `onChange` bisa dipertahankan sama supaya `Checkout.jsx` tidak perlu diubah).
4. Ganti `searchAddress`/`reverseGeocode` di `src/services/geoService.js` dengan `google.maps.places.AutocompleteService` dan `google.maps.Geocoder` — nama fungsi & bentuk argumennya bisa dipertahankan sama seperti sekarang.

### Checkout: Konfirmasi Sebelum Keluar Halaman

Selama halaman checkout masih terbuka dan keranjang belum kosong, aplikasi akan menampilkan konfirmasi kalau kamu:
- Klik tautan lain di situs (menu, logo, dsb.) → muncul modal kustom "Tetap di Sini" / "Ya, Tinggalkan"
- Menekan tombol **back** browser → muncul modal yang sama
- Menutup tab, refresh, atau mengetik URL baru → muncul dialog konfirmasi bawaan browser (teksnya tidak bisa dikustomisasi lebih lanjut — ini batasan standar semua browser modern demi keamanan, bukan batasan kode ini)

Konfirmasi ini otomatis dilewati begitu pesanan berhasil dibuat (tidak akan muncul saat diarahkan ke halaman sukses).

### Metode Pembayaran

Saat ini tersedia **Transfer Bank** dan **E-Wallet**. (COD sudah dihapus sesuai permintaan.)

### ⚠️ Batasan versi saat ini (penting dibaca)

Ini masih versi **sederhana**, cocok untuk demo/prototipe/latihan — bukan untuk toko produksi:

- Data produk disimpan di **localStorage browser**, bukan database. Artinya perubahan yang dibuat admin di satu perangkat/browser **tidak muncul** di perangkat/browser lain.
- Login admin hanya password statis di kode sumber (bisa dilihat siapa pun yang membuka file JS hasil build). **Tidak aman** untuk data sungguhan.
- Siapa pun yang tahu URL `/admin` dan passwordnya bisa mengubah data — tidak ada pembatasan peran/pengguna.

Karena itu, seluruh logika akses data sengaja dipisah ke satu file: **`src/services/productService.js`**. Semua halaman (toko maupun admin) memanggil fungsi dari file ini lewat `ProductsContext` — tidak ada satu pun halaman yang bicara langsung ke localStorage. Ini artinya untuk pindah ke backend sungguhan, kamu **hanya perlu mengganti isi satu file itu saja**.

## Migrasi ke Supabase (untuk toko produksi sungguhan)

[Supabase](https://supabase.com) memberi database Postgres + autentikasi + API secara instan, dan ada paket gratis. Berikut langkahnya:

> Panduan di bawah fokus ke tabel `products` (bagian paling kompleks). Kategori (`categoryService.js`) dan konten situs (`siteContentService.js`) memakai pola yang sama persis — cukup buat tabel `categories` (kolom `name`) dan `site_content` (satu baris berisi semua kolom teks di `DEFAULT_CONTENT` dalam `siteContentService.js`), lalu terapkan pola yang sama. Untuk gambar produk, di produksi sebaiknya pakai **Supabase Storage** (upload file asli, simpan URL-nya di kolom `image`) alih-alih base64 — lebih hemat dan lebih cepat dimuat.

**1. Buat project & tabel**

Buat project baru di Supabase, lalu jalankan SQL berikut di SQL Editor:

```sql
create table products (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  category text not null,
  price numeric not null,
  old_price numeric,
  rating numeric default 4.5,
  reviews integer default 0,
  in_stock boolean default true,
  shape text default 'bar',
  tone text default '#4A2C1E',
  image text,
  short_desc text,
  long_desc text,
  weight text,
  created_at timestamp with time zone default now()
);

-- (opsional) isi data awal dari src/data/products.js secara manual atau lewat Table Editor
```

> Catatan: kolom di atas pakai `snake_case` (kebiasaan Postgres) sementara kode React memakai `camelCase` (`oldPrice`, `inStock`, dst). Sesuaikan penamaan di `productService.supabase.example.js` agar cocok, atau gunakan nama kolom camelCase dengan tanda kutip di SQL (`"oldPrice"`).

**2. Install SDK & buat client**

```bash
npm install @supabase/supabase-js
```

Buat `src/lib/supabaseClient.js`:

```js
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

Buat file `.env.local` di root proyek (jangan di-commit ke Git):

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=isi-anon-key-dari-dashboard-supabase
```

**3. Ganti service layer**

Timpa isi `src/services/productService.js` dengan isi `src/services/productService.supabase.example.js` (fungsinya sudah dibuat dengan nama & bentuk argumen yang identik, jadi `ProductsContext.jsx` dan semua halaman lain **tidak perlu diubah sama sekali**).

**4. Ganti autentikasi admin**

Ganti password statis di `src/admin/AdminLogin.jsx` dengan Supabase Auth, misalnya:

```js
const { error } = await supabase.auth.signInWithPassword({ email, password })
```

Lalu ganti `AdminRoute.jsx` agar mengecek sesi Supabase (`supabase.auth.getSession()`) alih-alih `sessionStorage`.

Setelah keempat langkah ini, seluruh toko (bukan cuma admin) akan membaca produk dari database sungguhan — dan siap dipakai banyak admin sekaligus dari perangkat berbeda.

## Catatan Penting

- **Tanpa backend/database sungguhan.** Keranjang, wishlist, dan riwayat pesanan disimpan di `localStorage` browser masing-masing pengunjung — artinya data tidak tersinkron antar perangkat dan akan hilang jika pengunjung membersihkan data browser. Untuk toko produksi sungguhan, hubungkan ke backend (misalnya database + API pembayaran seperti Midtrans/Xendit).
- **Font** dimuat dari Google Fonts CDN, jadi situs memerlukan koneksi internet agar font tampil sesuai desain (tetap bisa diakses tanpa internet, hanya font fallback yang dipakai).
- **Gambar produk yang diupload** disimpan sebagai teks base64 di localStorage juga, bukan file terpisah. Browser biasanya membatasi localStorage sekitar 5-10MB per situs — cukup untuk puluhan produk dengan gambar terkompresi, tapi bukan untuk ratusan produk beresolusi tinggi. Untuk skala lebih besar, migrasi ke Supabase (termasuk Supabase Storage untuk gambar) seperti dijelaskan di bawah.
- **Peta, pencarian alamat, dan data wilayah** memanggil layanan pihak ketiga gratis (OpenStreetMap, Nominatim, emsifa) langsung dari browser pengguna. Layanan-layanan ini punya batas wajar pemakaian (rate limit) untuk trafik sangat tinggi — cukup untuk toko skala kecil-menengah, tapi kalau trafiknya sudah besar, pertimbangkan API berbayar (Google Maps, atau layanan geocoding komersial lain).
- Struktur folder mengikuti konvensi Vite standar, mudah dikembangkan lebih lanjut (tambah halaman, hubungkan API, dll).

## Struktur Folder

```
kakao-kita-shop/
├─ src/
│  ├─ admin/            # Halaman admin: login, dashboard, form produk, kategori, konten
│  ├─ components/        # Header, Footer, ProductCard, CartDrawer, MapPicker, dll
│  ├─ context/            # State global: Products, Categories, SiteContent, Cart, Wishlist, Toast
│  ├─ data/               # Data awal/seed (products.js)
│  ├─ hooks/              # useLeaveConfirmation (konfirmasi keluar halaman checkout)
│  ├─ pages/              # Setiap halaman/route toko
│  ├─ services/           # productService, categoryService, siteContentService, geoService
│  ├─ utils/              # Util gambar (resize/kompres sebelum disimpan)
│  ├─ App.jsx
│  └─ main.jsx
├─ index.html
├─ tailwind.config.js
├─ vite.config.js
├─ netlify.toml
├─ vercel.json
└─ package.json
```
"# cokelatbandara" 
#   c o k e l a t b a n d a r a 
 
 
