import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag } from 'lucide-react'
import ProductThumb from '../components/ProductThumb'
import { useCart } from '../context/CartContext'

const fmt = (n) => 'Rp' + n.toLocaleString('id-ID')
const SHIPPING = 15000

export default function CartPage() {
  const { cartList, subtotal, updateQty, removeItem } = useCart()

  if (cartList.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-24 flex flex-col items-center text-center gap-4">
        <ShoppingBag size={40} className="text-gray-200" />
        <h1 className="text-xl font-extrabold">Keranjangmu masih kosong</h1>
        <p className="text-sm text-slate-600">Yuk pilih aksesoris gadget favoritmu di halaman toko.</p>
        <Link to="/toko" className="bg-black text-white font-bold px-6 py-3 mt-2 hover:bg-gray-800 transition-colors">
          Mulai Belanja
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
      <h1 className="text-2xl font-extrabold mb-8">Keranjang Belanja</h1>
      <div className="grid lg:grid-cols-[1fr_320px] gap-10">
        <div className="flex flex-col divide-y divide-gray-200 border-t border-b border-gray-200">
          {cartList.map((item) => (
            <div key={item.cartKey || item.id} className="flex items-center gap-4 py-5">
              <div className="w-16 h-16 bg-gray-100 flex items-center justify-center shrink-0 border border-gray-100 overflow-hidden rounded">
                <ProductThumb image={item.displayImage || item.image} product={item} size={48} />
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/produk/${item.id}`} className="font-semibold text-sm hover:text-black hover:underline">{item.name}</Link>
                {item.selectedColor && (
                  <div className="text-xs text-slate-700 font-semibold mt-0.5">Varian Warna: {item.selectedColor}</div>
                )}
                <div className="text-xs text-slate-500">{item.category}</div>
                <button onClick={() => removeItem(item.cartKey || item.id)} className="text-xs text-rose-500 hover:underline mt-1">Hapus</button>
              </div>
              <div className="flex items-center border border-gray-200">
                <button onClick={() => updateQty(item.cartKey || item.id, item.qty - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100" aria-label="Kurangi"><Minus size={13} /></button>
                <span className="w-8 text-center text-sm font-mono">{item.qty}</span>
                <button onClick={() => updateQty(item.cartKey || item.id, item.qty + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100" aria-label="Tambah"><Plus size={13} /></button>
              </div>
              <span className="font-mono font-bold w-24 text-right">{fmt(item.price * item.qty)}</span>
            </div>
          ))}
        </div>

        <div className="bg-gray-100 p-6 h-fit border border-gray-200">
          <h3 className="font-bold mb-4">Ringkasan Pesanan</h3>
          <div className="flex justify-between text-sm mb-2 text-slate-700">
            <span>Subtotal</span><span className="font-mono">{fmt(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm mb-4 text-slate-700">
            <span>Ongkos Kirim</span><span className="font-mono">{fmt(SHIPPING)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-4 mb-6">
            <span>Total</span><span className="font-mono">{fmt(subtotal + SHIPPING)}</span>
          </div>
          <Link to="/checkout" className="block text-center bg-black hover:bg-gray-800 text-white font-bold py-3 transition-colors">
            Lanjut ke Checkout
          </Link>
        </div>
      </div>
    </div>
  )
}
