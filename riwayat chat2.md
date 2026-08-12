# Hapus Sisa Sportkita

> **Workspace:** d:\vibecoding\gadget kita

---

**User**

kenapa ketika di refresh ada sekilas tulisan sportkita, sepertinya masih ada sisa sisa dari sport kita ya, sisa sisanya harus diapakan ya, beritahu rencanamu sebelum eksekusi

**Assistant**

Saya akan mencari semua sisa referensi "SportKita" atau "Sport Kita" di seluruh codebase terlebih dahulu, lalu menyusun rencana perubahan. Berikan saya waktu sebentar untuk memindainya.

Saya perlu cek file yang muncul saat awal render (sebelum JS hydrate) yaitu `index.html`, `package.json`, dan favicon. Ini yang biasanya muncul "sekilas" saat refresh.

Mari saya cek SiteContentContext untuk melihat loading state dan bagaimana default content ditampilkan saat fetch berjalan, karena itu kemungkinan besar sumber "sekilas" munculnya SportKita.

Berikut hasil analisis dan rencana perbaikan saya:

---

### 🔍 PENYABAB "SEKILAS SPORTKITA" SAAT REFRESH

Di `src/context/SiteContentContext.jsx:8`, initial state menggunakan `DEFAULT_CONTENT` dari `siteContentService.js`. **Initial state ini langsung dirender sebelum async fetch ke Supabase selesai** (butuh ~100-500ms). Jadi selama jeda itu, UI menampilkan isi DEFAULT_CONTENT yang masih SPORTKITA — itulah "sekilas" yang kamu lihat. Setelah fetch selesai, state berganti ke data GadgetKita dari Supabase.

---

### 📋 DAFTAR SISA-SISA SPORTKITA

| Lokasi File | Baris | Isi Sisa | Prioritas |
|---|---|---|---|
| `src/services/siteContentService.js` | Line 4-31 | **DEFAULT_CONTENT penuh SPORTKITA** (heroTitle, footerDescription, footerEmail, shopName, appDownloadBannerText, socialInstagram, pageAbout, pageTos) | 🔴 **KRITIS** (penyebab sekilas) |
| `package-lock.json` | Line 2, 8 | `"name": "sportkita"` | 🟡 (konfigurasi) |
| `SUPABASE_SETUP.md` | Line 87, 91 | RLS Policy: `LIKE '%@sportkita%'` | 🟠 (hanya template doc) |
| `riwayat chat1.md`, `tabel 10agustus.md` | Beberapa baris | Catatan lama tentang SportKita | ⚪ (doc saja, tidak pengaruh UI) |

---

### 🎯 RENCANA EKSEKUSI (3 Langkah)

**Langkah 1 — Fix utama (hilangkan sekilas):**
> Edit `src/services/siteContentService.js` — Ganti SEMUA field di `DEFAULT_CONTENT` dari tema SPORTKITA → GADGETKITA (hero title, nama toko, email, social, about, dll) dengan tema aksesoris HP.

**Langkah 2 — Rapikan konfigurasi:**
> Edit `package-lock.json` — Ubah `name` dari `"sportkita"` → `"gadgetkita"` (2 lokasi).

**Langkah 3 — Bersihkan template dokumentasi (opsional):**
> Edit `SUPABASE_SETUP.md` — Ganti `%@sportkita%` → `%@gadgetkita%` pada RLS policy (ini hanya dokumentasi, yang berlaku ada di dashboard Supabase).

**Tambahan saran setelah semua diubah:**
> Hapus folder `dist/` lalu jalankan `npm run build` ulang, agar bundle lama (yang mungkin masih ada string SportKita) terganti sepenuhnya.

---

**PERTANYAAN KONFIRMASI:** Apakah kamu setuju dengan rencana di atas? Jika ya, saya langsung eksekusi Langkah 1 + 2 terlebih dahulu.

---

**User**

ok lakukan berurutan, dan tambahan dari saya, buat screen refresh tiap browser di refresh desainnya putih polos saja dengan tengah ada loading berputar

**Assistant**

Error: Your requests have exceeded the quota.

---

