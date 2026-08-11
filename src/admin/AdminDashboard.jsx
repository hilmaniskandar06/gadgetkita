import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, RotateCcw, Tag, FileText, Ticket, CreditCard, ExternalLink } from 'lucide-react'
import AdminShell from './AdminShell'
import ProductThumb from '../components/ProductThumb'
import { useProducts } from '../context/ProductsContext'
import { useToast } from '../context/ToastContext'

const fmt = (n) => 'Rp' + n.toLocaleString('id-ID')

export default function AdminDashboard() {
  const { products, loading, removeProduct, resetAll } = useProducts()
  const { addToast } = useToast()

  async function handleDelete(p) {
    if (confirm(`Hapus "${p.name}"? Tindakan ini tidak bisa dibatalkan.`)) {
      await removeProduct(p.id)
      addToast('Produk dihapus')
    }
  }

  async function handleReset() {
    if (confirm('Kembalikan semua produk ke data awal? Perubahan yang belum tersimpan akan hilang.')) {
      await resetAll()
      addToast('Data produk dikembalikan ke awal')
    }
  }

  return (
    <AdminShell
      title="Kelola Produk"
      actions={
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-sm font-semibold border border-gray-200 rounded-full px-4 py-2 hover:border-lime-500 transition-colors"
          >
            <RotateCcw size={14} /> Reset Data
          </button>
          <Link
            to="/admin/produk/baru"
            className="flex items-center gap-1.5 text-sm font-bold bg-lime-500 hover:bg-lime-400 text-slate-900 rounded-full px-4 py-2 transition-colors"
          >
            <Plus size={14} /> Tambah Produk
          </Link>
        </div>
      }
    >
      {loading ? (
        <p className="text-slate-600 text-sm">Memuat produk...</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-gray-100 text-left text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Produk</th>
                <th className="px-4 py-3 font-semibold">Kategori</th>
                <th className="px-4 py-3 font-semibold">Harga</th>
                <th className="px-4 py-3 font-semibold">Terjual</th>
                <th className="px-4 py-3 font-semibold">Stok</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <ProductThumb product={p} size={26} />
                      </div>
                      <span className="font-semibold">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.category}</td>
                  <td className="px-4 py-3 font-mono">{fmt(p.price)}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-lime-50 text-lime-600 border border-lime-200">
                      {Number(p.sold || 0).toLocaleString('id-ID')} Terjual
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.inStock ? 'bg-ok-50 text-ok-500' : 'bg-rose-50 text-rose-500'}`}>
                      {p.inStock ? 'Tersedia' : 'Habis'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {p.externalLink && (
                        <a
                          href={p.externalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Buka Link Produk"
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-slate-600 transition-colors"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}
                      <Link
                        to={`/admin/produk/${p.id}/edit`}
                        aria-label="Edit"
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <Pencil size={14} />
                      </Link>
                      <button
                        onClick={() => handleDelete(p)}
                        aria-label="Hapus"
                        className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-rose-50 text-rose-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    Belum ada produk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  )
}
