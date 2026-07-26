import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as paymentService from '../services/paymentService'

const PaymentContext = createContext()

export function PaymentProvider({ children }) {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const list = await paymentService.listPayments()
    setPayments(list)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function addPayment(payment) {
    const created = await paymentService.addPayment(payment)
    await refresh()
    return created
  }

  async function updatePayment(id, data) {
    const updated = await paymentService.updatePayment(id, data)
    await refresh()
    return updated
  }

  async function deletePayment(id) {
    await paymentService.deletePayment(id)
    await refresh()
  }

  return (
    <PaymentContext.Provider value={{ payments, loading, addPayment, updatePayment, deletePayment }}>
      {children}
    </PaymentContext.Provider>
  )
}

export const usePayments = () => useContext(PaymentContext)
