import { supabase } from '../config/supabase'

const DEFAULT_VOUCHERS = [
  {
    id: 'v_disc10',
    code: 'NEW10',
    type: 'persentase',
    value: 10,
    minOrder: 100000,
    maxDiscount: 25000,
    expiryDate: null,
    usageLimit: 100,
    used: 0,
  },
]

function mapFromDb(item) {
  if (!item) return null
  return {
    id: item.id,
    code: item.code,
    type: item.type,
    value: item.value,
    minOrder: item.min_order ?? item.minOrder,
    maxDiscount: item.max_discount ?? item.maxDiscount,
    expiryDate: item.expiry_date ?? item.expiryDate,
    usageLimit: item.usage_limit ?? item.usageLimit,
    used: item.used ?? 0,
  }
}

function mapToDb(item) {
  return {
    id: item.id,
    code: item.code,
    type: item.type,
    value: Number(item.value),
    min_order: item.minOrder ? Number(item.minOrder) : null,
    max_discount: item.maxDiscount ? Number(item.maxDiscount) : null,
    expiry_date: item.expiryDate || null,
    usage_limit: item.usageLimit ? Number(item.usageLimit) : null,
    used: Number(item.used || 0),
  }
}

async function initDefaults() {
  try {
    const rows = DEFAULT_VOUCHERS.map(mapToDb)
    const { error } = await supabase.from('vouchers').insert(rows).select()
    if (error) console.warn('Init vouchers defaults gagal:', error.message)
  } catch (err) {
    console.warn('Init defaults vouchers error:', err)
  }
}

export async function listVouchers() {
  try {
    const { data, error } = await supabase.from('vouchers').select('*').order('id', { ascending: true })
    if (error && error.code !== 'PGRST116') console.error('Error listVouchers:', error)
    if (data && data.length > 0) return data.map(mapFromDb)
    await initDefaults()
    const { data: seeded, error: seedErr } = await supabase.from('vouchers').select('*').order('id', { ascending: true })
    if (seedErr) console.error('Error after seed vouchers:', seedErr)
    return (seeded || []).map(mapFromDb)
  } catch (err) {
    console.error(err)
    return []
  }
}

export async function getVoucherByCode(code) {
  try {
    const cleanCode = typeof code === 'string' ? code.trim() : ''
    if (!cleanCode) return null
    const { data, error } = await supabase
      .from('vouchers')
      .select('*')
      .ilike('code', cleanCode)
      .limit(1)
      .maybeSingle()
    if (error && error.code !== 'PGRST116') {
      console.error('Error getVoucherByCode:', error)
    }
    return mapFromDb(data)
  } catch (err) {
    console.error(err)
    return null
  }
}

export async function addVoucher(voucher) {
  const id = voucher.id || 'v_' + Date.now()
  const dbData = mapToDb({ ...voucher, id })
  const { data, error } = await supabase.from('vouchers').insert(dbData).select().single()
  if (error) throw new Error(error.message)
  return mapFromDb(data)
}

export async function updateVoucher(id, payload) {
  const dbData = mapToDb({ ...payload, id })
  const { data, error } = await supabase.from('vouchers').update(dbData).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return mapFromDb(data)
}

export async function incrementVoucherUsage(id) {
  try {
    const { data: current } = await supabase.from('vouchers').select('used').eq('id', id).single()
    const newUsed = Number(current?.used || 0) + 1
    const { data, error } = await supabase.from('vouchers').update({ used: newUsed }).eq('id', id).select().single()
    if (error) throw new Error(error.message)
    return mapFromDb(data)
  } catch (err) {
    throw err
  }
}

export async function decrementVoucherUsage(id) {
  try {
    const { data: current } = await supabase.from('vouchers').select('used').eq('id', id).maybeSingle()
    if (!current) return null
    const newUsed = Math.max(0, Number(current.used || 0) - 1)
    const { data, error } = await supabase.from('vouchers').update({ used: newUsed }).eq('id', id).select().single()
    if (error) throw new Error(error.message)
    return mapFromDb(data)
  } catch (err) {
    throw err
  }
}

export async function deleteVoucher(id) {
  const { error } = await supabase.from('vouchers').delete().eq('id', id)
  if (error) throw new Error(error.message)
  return true
}
