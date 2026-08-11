import { supabase } from '../config/supabase'

const DEFAULT_PAYMENTS = [
  { id: '1', type: 'bank', name: 'Bank BCA', account: '1234567890', accountName: 'Kakao Kita', logo: '', qr: '' },
  { id: '2', type: 'ewallet', name: 'GoPay', account: '081234567890', accountName: 'Kakao Kita', logo: '', qr: '' },
]

function mapFromDb(dbItem) {
  if (!dbItem) return null
  return {
    ...dbItem,
    accountName: dbItem.account_name,
  }
}

function mapToDb(item) {
  return {
    id: item.id,
    type: item.type,
    name: item.name,
    account: item.account,
    account_name: item.accountName,
    logo: item.logo || '',
    qr: item.qr || '',
  }
}

async function initDefaults() {
  try {
    const rows = DEFAULT_PAYMENTS.map(mapToDb)
    const { error } = await supabase.from('payments').insert(rows).select()
    if (error) console.warn('Init payments defaults gagal:', error.message)
  } catch (err) {
    console.warn('Init defaults payments error:', err)
  }
}

export async function listPayments() {
  try {
    const { data, error } = await supabase.from('payments').select('*').order('id', { ascending: true })
    if (error && error.code !== 'PGRST116') {
      console.error('Error listPayments:', error)
    }
    if (data && data.length > 0) {
      return data.map(mapFromDb)
    }
    await initDefaults()
    const { data: seeded, error: seedError } = await supabase
      .from('payments')
      .select('*')
      .order('id', { ascending: true })
    if (seedError) console.error('Error after seed payments:', seedError)
    return (seeded || []).map(mapFromDb)
  } catch (err) {
    console.error(err)
    return []
  }
}

export async function addPayment(payment) {
  const id = payment.id || 'pay_' + Date.now()
  const dbData = mapToDb({ ...payment, id })
  const { data, error } = await supabase.from('payments').insert(dbData).select().single()
  if (error) throw new Error(error.message)
  return mapFromDb(data)
}

export async function updatePayment(id, payload) {
  const dbData = mapToDb({ ...payload, id })
  const { data, error } = await supabase.from('payments').update(dbData).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return mapFromDb(data)
}

export async function deletePayment(id) {
  const { error } = await supabase.from('payments').delete().eq('id', id)
  if (error) throw new Error(error.message)
  return true
}
