import { supabase } from '../config/supabase'

export async function getBrands() {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Failed to fetch brands:', error)
    return []
  }
  return data || []
}

export async function createBrand(brand) {
  const payload = {
    id: brand.id || 'brand-' + Date.now(),
    name: brand.name.trim(),
    logo: brand.logo || '',
    created_at: new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('brands')
    .insert(payload)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateBrand(id, updates) {
  const { data, error } = await supabase
    .from('brands')
    .update({
      name: updates.name?.trim(),
      logo: updates.logo !== undefined ? updates.logo : undefined
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteBrand(id) {
  const { error } = await supabase
    .from('brands')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  return true
}
