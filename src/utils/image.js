// Mengubah file gambar menjadi dataURL base64 yang sudah dikompres.
// Format output menyesuaikan file asli: PNG/WebP -> PNG (agar transparansi tetap).
// JPG/JPEG/GIF -> JPEG (hemat size, tapi tanpa transparansi).
export function resizeImage(file, maxWidth = 640, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Gagal membaca file'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('File bukan gambar yang valid'))
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width)
        const canvas = document.createElement('canvas')
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        const ctx = canvas.getContext('2d')

        const isPngOrWebp = /png|webp/i.test(file.type || file.name || '')

        if (isPngOrWebp) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL('image/png'))
        } else {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          resolve(canvas.toDataURL('image/jpeg', quality))
        }
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}
