import { supabase } from '../config/supabase'

export async function getColors() {
  const { data, error } = await supabase
    .from('colors')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Failed to fetch colors:', error)
    return []
  }
  return data || []
}

export async function createColor(color) {
  const payload = {
    id: color.id || 'col-' + Date.now(),
    name: color.name.trim(),
    type: color.type || 'solid',
    hex1: color.hex1,
    hex2: color.type === 'dual' ? (color.hex2 || '#ffffff') : null,
    created_at: new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('colors')
    .insert(payload)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateColor(id, updates) {
  const payload = {
    name: updates.name?.trim(),
    type: updates.type || 'solid',
    hex1: updates.hex1,
    hex2: updates.type === 'dual' ? (updates.hex2 || '#ffffff') : null
  }

  const { data, error } = await supabase
    .from('colors')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteColor(id) {
  const { error } = await supabase
    .from('colors')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  return true
}
