import { supabase } from '../config/supabase'

function mapFromDb(item) {
  if (!item) return null
  return {
    id: item.id,
    userId: item.user_id,
    title: item.title,
    message: item.message,
    link: item.link || null,
    date: item.created_at || item.date || new Date().toISOString(),
    isRead: !!item.is_read,
    readBy: Array.isArray(item.read_by) ? item.read_by : [],
  }
}

function mapToDb(item) {
  return {
    id: item.id,
    user_id: item.userId,
    title: item.title,
    message: item.message,
    link: item.link || null,
    is_read: !!item.isRead,
    read_by: Array.isArray(item.readBy) ? item.readBy : [],
  }
}

export async function listAllNotifications() {
  try {
    const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false })
    if (error && error.code !== 'PGRST116') console.error('Error listAllNotifications:', error)
    return (data || []).map(mapFromDb)
  } catch (err) {
    console.error(err)
    return []
  }
}

export async function listForUser(userId) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .or(`user_id.eq.${userId},user_id.eq.ALL`)
      .order('created_at', { ascending: false })
    if (error && error.code !== 'PGRST116') console.error('Error listForUser:', error)
    return (data || []).map(mapFromDb)
  } catch (err) {
    console.error(err)
    return []
  }
}

export async function addNotification(userId, title, message, link = null) {
  const id = 'NOTF-' + Date.now() + '-' + Math.random().toString(36).slice(2, 5)
  const dbRow = mapToDb({
    id,
    userId,
    title,
    message,
    link,
    isRead: false,
    readBy: [],
  })
  const { data, error } = await supabase.from('notifications').insert(dbRow).select().single()
  if (error) throw new Error(error.message)
  return mapFromDb(data)
}

export async function markAsRead(id, userId) {
  try {
    const { data: current, error: getErr } = await supabase.from('notifications').select('*').eq('id', id).maybeSingle()
    if (getErr) throw new Error(getErr.message)
    if (!current) return null

    if (current.user_id === 'ALL') {
      const readBy = Array.isArray(current.read_by) ? [...current.read_by] : []
      if (!readBy.includes(userId)) readBy.push(userId)
      const { data, error } = await supabase
        .from('notifications')
        .update({ read_by: readBy })
        .eq('id', id)
        .select()
        .maybeSingle()
      if (error) throw new Error(error.message)
      return data ? mapFromDb(data) : mapFromDb({ ...current, read_by: readBy })
    } else {
      if (current.is_read) return mapFromDb(current)
      const { data, error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id).select().maybeSingle()
      if (error) throw new Error(error.message)
      return data ? mapFromDb(data) : mapFromDb({ ...current, is_read: true })
    }
  } catch (err) {
    console.error('markAsRead error:', err)
    throw err
  }
}

export async function markAllAsReadForUser(userId) {
  const list = await listForUser(userId)
  for (const n of list) {
    const nUserId = n.userId
    if (nUserId === 'ALL') {
      if ((n.readBy || []).includes(userId)) continue
      const readBy = [...(n.readBy || []), userId]
      const { error } = await supabase.from('notifications').update({ read_by: readBy }).eq('id', n.id)
      if (error) console.warn('Error update readBy:', error.message)
    } else {
      if (n.isRead) continue
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', n.id)
      if (error) console.warn('Error update is_read:', error.message)
    }
  }
  return true
}

export async function deleteNotification(id) {
  const { error } = await supabase.from('notifications').delete().eq('id', id)
  if (error) throw new Error(error.message)
  return true
}
