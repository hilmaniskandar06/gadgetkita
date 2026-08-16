import ProductThumb from './ProductThumb'
import { useToast } from '../context/ToastContext'
import { Copy } from 'lucide-react'

const fmt = (n) => 'Rp' + n.toLocaleString('id-ID')

export default function OrderSummaryCard({ order }) {
  const { addToast } = useToast()

  function copyResi() {
    if (order.trackingNumber) {
      navigator.clipboard.writeText(order.trackingNumber)
      addToast('Nomor resi berhasil disalin!')
    }
  }

  return (
    <div className="bg-gray-100 rounded-xl p-6 text-left">
      <h3 className="font-bold mb-4">Produk Dipesan</h3>
      <div className="flex flex-col gap-3 mb-4">
        {order.items.map((i, idx) => (
          <div key={i.id || idx} className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-white flex items-center justify-center shrink-0 overflow-hidden">
              <ProductThumb image={i.image || (i.images && i.images[0])} product={i} size={40} />
            </div>
            <div className="flex-1 min-w-0 text-sm">
              <div className="font-semibold truncate">{i.name}</div>
              {(i.selectedColor || i.color) && (
                <div className="text-xs text-slate-700 font-semibold">Varian: {i.selectedColor || i.color}</div>
              )}
              <div className="text-slate-500 text-xs">Qty {i.qty}</div>
            </div>
            <span className="font-mono text-sm font-semibold">{fmt(i.price * i.qty)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 pt-4 flex flex-col gap-1.5 text-sm">
        <div className="flex justify-between text-slate-700"><span>Subtotal</span><span className="font-mono">{fmt(order.subtotal)}</span></div>
        <div className="flex justify-between text-slate-700"><span>Ongkos Kirim</span><span className="font-mono">{fmt(order.shipping)}</span></div>
        {order.serviceFee > 0 && <div className="flex justify-between text-slate-700"><span>Biaya Layanan</span><span className="font-mono">{fmt(order.serviceFee)}</span></div>}
        {order.discount > 0 && <div className="flex justify-between text-ok-600 font-semibold"><span>Diskon {order.voucherCode ? `(${order.voucherCode})` : ''}</span><span className="font-mono">-{fmt(order.discount)}</span></div>}
        <div className="flex justify-between font-bold text-base mt-2"><span>Total</span><span className="font-mono">{fmt(order.total)}</span></div>
      </div>

      <div className="border-t border-gray-200 mt-4 pt-4 text-sm text-slate-700">
        <div>Dikirim ke: <strong className="text-slate-900">{order.customer.name}</strong> ({order.customer.phone})</div>
        <div className="mt-1">{order.customer.address}</div>
        {order.note && <div className="mt-1">Catatan Pesanan: <strong className="text-slate-900">{order.note}</strong></div>}
        <div className="mt-1">
          Pembayaran: <strong className="text-slate-900">
            {typeof order.customer.payment === 'object' && order.customer.payment
              ? (
                  <>
                    {order.customer.payment.name} ({order.customer.payment.type === 'bank' ? 'Transfer Bank' : 'E-Wallet'})
                    {order.customer.payment.accountName ? ` - A/N: ${order.customer.payment.accountName}` : ''}
                  </>
                )
              : order.customer.payment || '-'}
          </strong>
          {typeof order.customer.payment === 'object' && order.customer.payment?.account && (
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-slate-900 font-bold">{order.customer.payment.account}</span>
              <button 
                type="button"
                onClick={() => { 
                  navigator.clipboard.writeText(order.customer.payment.account); 
                  addToast('Nomor rekening/e-wallet berhasil disalin!'); 
                }} 
                className="text-xs text-lime-600 hover:text-lime-700 flex items-center gap-1 font-semibold"
              >
                <Copy size={12} /> Salin
              </button>
            </div>
          )}
        </div>
      </div>

      {order.trackingNumber && (
        <div className="border-t border-gray-200 mt-4 pt-4 text-sm">
          <div className="font-bold text-slate-900 mb-1">Nomor Resi Pengiriman</div>
          <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
            <span className="font-mono font-bold text-slate-800">{order.trackingNumber}</span>
            <button
              onClick={copyResi}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
            >
              <Copy size={12} /> Salin Resi
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
