// geoService.js
//
// - listProvinces/listRegencies/listDistricts/listVillages: data wilayah Indonesia
//   resmi (provinsi → kabupaten/kota → kecamatan → desa/kelurahan), dari API publik
//   gratis emsifa (https://www.emsifa.com/api-wilayah-indonesia/).
// - searchAddress/reverseGeocode: pencarian & pin-point alamat memakai OpenStreetMap
//   Nominatim (gratis, tanpa API key). Ini pengganti Google Maps karena Google Maps
//   mewajibkan API key berbayar milik sendiri. Kalau nanti kamu sudah punya API key
//   Google Maps, lihat README bagian "Mengganti Peta ke Google Maps".

const WILAYAH_BASE = 'https://www.emsifa.com/api-wilayah-indonesia/api'
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org'

async function getJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Gagal mengambil data dari ' + url)
  return res.json()
}

export async function listProvinces() {
  return getJSON(`${WILAYAH_BASE}/provinces.json`)
}

export async function listRegencies(provinceId) {
  if (!provinceId) return []
  return getJSON(`${WILAYAH_BASE}/regencies/${provinceId}.json`)
}

export async function listDistricts(regencyId) {
  if (!regencyId) return []
  return getJSON(`${WILAYAH_BASE}/districts/${regencyId}.json`)
}

export async function listVillages(districtId) {
  if (!districtId) return []
  return getJSON(`${WILAYAH_BASE}/villages/${districtId}.json`)
}

export async function searchAddress(query) {
  if (!query || query.trim().length < 3) return []
  const url = `${NOMINATIM_BASE}/search?format=json&addressdetails=1&countrycodes=id&limit=6&q=${encodeURIComponent(query)}`
  return getJSON(url)
}

export async function reverseGeocode(lat, lng) {
  const url = `${NOMINATIM_BASE}/reverse?format=json&addressdetails=1&lat=${lat}&lon=${lng}`
  return getJSON(url)
}

// Pencocokan nama wilayah dari hasil Nominatim (data OpenStreetMap) ke data
// wilayah resmi di atas. Ini best-effort (cocok-cocokan nama), bukan pencocokan
// berbasis kode wilayah resmi, jadi sesekali bisa meleset — pengguna tetap bisa
// mengoreksi manual lewat dropdown.
function normalize(str = '') {
  return str
    .toLowerCase()
    .replace(/kabupaten|kota administrasi|kota|provinsi|daerah istimewa|d\.i\.|dki/g, '')
    .trim()
}

export function findBestMatch(name, list) {
  if (!name || !list?.length) return null
  const target = normalize(name)
  if (!target) return null
  return (
    list.find((item) => normalize(item.name) === target) ||
    list.find((item) => normalize(item.name).includes(target) || target.includes(normalize(item.name))) ||
    null
  )
}
