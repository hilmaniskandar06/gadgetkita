import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as voucherService from '../services/voucherService'

const VoucherContext = createContext()

export function VoucherProvider({ children }) {
  const [vouchers, setVouchers] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const list = await voucherService.listVouchers()
    setVouchers(list)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function addVoucher(voucher) {
    const created = await voucherService.addVoucher(voucher)
    await refresh()
    return created
  }

  async function updateVoucher(id, data) {
    const updated = await voucherService.updateVoucher(id, data)
    await refresh()
    return updated
  }

  async function deleteVoucher(id) {
    await voucherService.deleteVoucher(id)
    await refresh()
  }

  async function incrementVoucherUsage(id) {
    const updated = await voucherService.incrementVoucherUsage(id)
    await refresh()
    return updated
  }

  function verifyVoucher(code, subtotal) {
    const v = vouchers.find(x => String(x.code).toUpperCase() === String(code).toUpperCase())
    if (!v) return { valid: false, error: 'Voucher tidak ditemukan' }

    if (v.minOrder && Number(subtotal) < Number(v.minOrder)) {
      return { valid: false, error: `Minimal belanja Rp${Number(v.minOrder).toLocaleString('id-ID')}` }
    }
    if (v.expiryDate && new Date() > new Date(v.expiryDate)) {
      return { valid: false, error: 'Voucher sudah kadaluarsa' }
    }
    if (v.usageLimit && Number(v.used || 0) >= Number(v.usageLimit)) {
      return { valid: false, error: 'Batas pemakaian voucher sudah habis' }
    }

    let discount = 0
    if (v.type === 'nominal') {
      discount = Number(v.value)
    } else if (v.type === 'persentase') {
      discount = Math.floor((Number(subtotal) * Number(v.value)) / 100)
      if (v.maxDiscount && discount > Number(v.maxDiscount)) {
        discount = Number(v.maxDiscount)
      }
    }

    if (discount > Number(subtotal)) {
      discount = Number(subtotal)
    }

    return { valid: true, voucher: v, discount }
  }

  return (
    <VoucherContext.Provider value={{ vouchers, loading, addVoucher, updateVoucher, deleteVoucher, verifyVoucher, incrementVoucherUsage }}>
      {children}
    </VoucherContext.Provider>
  )
}

export const useVouchers = () => useContext(VoucherContext)
