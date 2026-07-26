import { supabase } from '../config/supabase'

function mapFromDb(item) {
  if (!item) return null
  return {
    id: item.id,
    userId: item.user_id,
    userName: item.user_name,
    lastUpdated: item.last_updated || item.updated_at || new Date().toISOString(),
    messages: Array.isArray(item.messages) ? item.messages : [],
  }
}

function mapToDb(item) {
  return {
    id: item.id,
    user_id: item.userId,
    user_name: item.userName,
    last_updated: item.lastUpdated,
    messages: item.messages || [],
  }
}

export async function listChats() {
  try {
    const { data, error } = await supabase.from('chats').select('*').order('last_updated', { ascending: false })
    if (error && error.code !== 'PGRST116') console.error('Error listChats:', error)
    return (data || []).map(mapFromDb)
  } catch (err) {
    console.error(err)
    return []
  }
}

export async function getChatByUserId(userId) {
  try {
    const { data, error } = await supabase.from('chats').select('*').eq('user_id', userId).limit(1).maybeSingle()
    if (error && error.code !== 'PGRST116') console.error('Error getChatByUserId:', error)
    return mapFromDb(data)
  } catch (err) {
    console.error(err)
    return null
  }
}

export async function upsertChat(chat) {
  const dbData = mapToDb(chat)
  const { data, error } = await supabase
    .from('chats')
    .upsert(dbData, { onConflict: 'id' })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return mapFromDb(data)
}

export async function deleteChat(id) {
  const { error } = await supabase.from('chats').delete().eq('id', id)
  if (error) throw new Error(error.message)
  return true
}
