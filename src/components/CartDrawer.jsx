import { Link } from 'react-router-dom'
import { X, Minus, Plus, ShoppingBag } from 'lucide-react'
import ProductThumb from './ProductThumb'
import { useCart } from '../context/CartContext'

const fmt = (n) => 'Rp' + n.toLocaleString('id-ID')

export default function CartDrawer({ open, onClose }) {
  const { cartList, subtotal, updateQty, removeItem } = useCart()

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-slate-900/40 z-50 transition-opacity ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />
      <aside
        role="dialog"
        aria-label="Keranjang belanja"
        className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="font-bold text-lg">Keranjang</h3>
          <button onClick={onClose} aria-label="Tutup" className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 border border-gray-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {cartList.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-center text-slate-600 py-10">
              <ShoppingBag size={36} className="text-gray-200" />
              <p className="text-sm">Keranjangmu masih kosong.</p>
              <Link to="/toko" onClick={onClose} className="text-sm font-bold text-black border-b border-black pb-0.5 hover:opacity-70 transition-opacity">
                Mulai belanja
              </Link>
            </div>
          ) : (
            cartList.map((item) => (
              <div key={item.cartKey || item.id} className="flex gap-3 py-4 border-b border-gray-100">
                <div className="w-14 h-14 bg-gray-100 flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden rounded">
                  <ProductThumb image={item.displayImage || item.image} product={item} size={48} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900 truncate">{item.name}</h4>
                  {item.selectedColor && (
                    <div className="text-[11px] text-slate-500 font-medium">Varian: {item.selectedColor}</div>
                  )}
                  <span className="font-mono text-xs text-slate-700">{fmt(item.price)}</span>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-gray-200">
                      <button onClick={() => updateQty(item.cartKey || item.id, item.qty - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100" aria-label="Kurangi">
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-xs font-mono">{item.qty}</span>
                      <button onClick={() => updateQty(item.cartKey || item.id, item.qty + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100" aria-label="Tambah">
                        <Plus size={12} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.cartKey || item.id)} className="text-xs text-rose-500 hover:underline">
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartList.length > 0 && (
          <div className="p-5 border-t border-gray-200 bg-gray-50 flex flex-col gap-3">
            <div className="flex justify-between font-bold text-sm">
              <span>Subtotal</span>
              <span className="font-mono">{fmt(subtotal)}</span>
            </div>
            <Link
              to="/checkout"
              onClick={onClose}
              className="block text-center bg-black text-white font-bold py-3 hover:bg-gray-800 transition-colors"
            >
              Checkout Sekarang
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}
