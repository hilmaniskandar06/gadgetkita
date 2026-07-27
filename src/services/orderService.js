import { supabase } from '../config/supabase'

export async function createOrder(orderPayload) {
  const { data, error } = await supabase.from('orders').insert({
    id: orderPayload.id,
    user_id: orderPayload.userId,
    status: orderPayload.status,
    payment_status: orderPayload.paymentStatus,
    total: orderPayload.total,
    items: orderPayload.items,
    customer_info: {
      ...orderPayload.customer,
      subtotal: orderPayload.subtotal,
      discount: orderPayload.discount,
      voucherCode: orderPayload.voucherCode,
      shipping: orderPayload.shipping,
      serviceFee: orderPayload.serviceFee,
      note: orderPayload.note
    },
    created_at: orderPayload.date || new Date().toISOString()
  }).select().single()

  if (error) throw new Error(error.message)
  return data
}

export async function getOrdersByUser(userId) {
  const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data.map(mapOrderFromDb)
}

export async function getOrderById(id) {
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).maybeSingle()
  if (error || !data) return null
  return mapOrderFromDb(data)
}

export async function getAllOrders() {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data.map(mapOrderFromDb)
}

export async function updateOrderStatus(id, status, extraData = {}) {
  const { data: existing, error: fetchErr } = await supabase.from('orders').select('customer_info').eq('id', id).single()
  if (fetchErr) throw new Error(fetchErr.message)

  const payload = { status }
  if (extraData.trackingNumber) payload.tracking_number = extraData.trackingNumber
  if (extraData.paymentStatus) {
    payload.payment_status = extraData.paymentStatus
  } else if (status === 'menunggu_verifikasi') {
    payload.payment_status = 'menunggu_verifikasi'
  } else if (status === 'dibatalkan') {
    payload.payment_status = 'dibatalkan'
  } else if (status === 'diproses') {
    payload.payment_status = 'lunas'
  } else if (status === 'dikirim') {
    payload.payment_status = 'dikirim'
  } else if (status === 'selesai') {
    payload.payment_status = 'selesai'
  }

  const updatedCustomerInfo = { ...existing.customer_info }
  let customerInfoChanged = false
  if (extraData.paymentProof) {
    updatedCustomerInfo.paymentProof = extraData.paymentProof
    customerInfoChanged = true
  }
  if (extraData.cancelReason) {
    updatedCustomerInfo.cancelReason = extraData.cancelReason
    customerInfoChanged = true
  }
  if (customerInfoChanged) {
    payload.customer_info = updatedCustomerInfo
  }

  const { data, error } = await supabase.from('orders').update(payload).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return mapOrderFromDb(data)
}

export async function deleteOrder(id) {
  const { error } = await supabase.from('orders').delete().eq('id', id)
  if (error) throw new Error(error.message)
  return true
}

function mapOrderFromDb(dbItem) {
  const cInfo = dbItem.customer_info || {}
  return {
    id: dbItem.id,
    userId: dbItem.user_id,
    date: dbItem.created_at,
    status: dbItem.status,
    paymentStatus: dbItem.payment_status,
    total: Number(dbItem.total),
    trackingNumber: dbItem.tracking_number,
    items: dbItem.items,
    subtotal: cInfo.subtotal || 0,
    discount: cInfo.discount || 0,
    voucherCode: cInfo.voucherCode || null,
    shipping: cInfo.shipping || 0,
    serviceFee: cInfo.serviceFee || 0,
    note: cInfo.note || '',
    paymentProof: cInfo.paymentProof || null,
    cancelReason: cInfo.cancelReason || null,
    customer: {
      name: cInfo.name,
      phone: cInfo.phone,
      address: cInfo.address,
      province: cInfo.province,
      regency: cInfo.regency,
      district: cInfo.district,
      village: cInfo.village,
      postal: cInfo.postal,
      payment: cInfo.payment
    }
  }
}
