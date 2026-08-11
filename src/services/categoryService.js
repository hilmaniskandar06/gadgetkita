import { supabase } from '../config/supabase'
import { SEED_CATEGORIES } from '../data/products'

function mapFromDb(c) {
  if (!c) return null
  return {
    ...c,
    image: c.image_url,
    textColor: c.text_color
  }
}

function mapToDb(c) {
  return {
    id: c.id || c.name.toLowerCase().replace(/\s+/g, '-'),
    name: c.name,
    description: c.description || '',
    image_url: c.image || '',
    color: c.color || '',
    text_color: c.textColor || ''
  }
}

export async function listCategories() {
  const { data, error } = await supabase.from('categories').select('*')
  if (error) {
    console.error('Error listCategories:', error)
    return []
  }
  return data.map(mapFromDb)
}

export async function addCategory(categoryObj) {
  const dbData = mapToDb(categoryObj)
  const { error } = await supabase.from('categories').insert(dbData)
  if (error) throw new Error(error.message)
  return listCategories()
}

export async function updateCategory(oldName, updatedObj) {
  const dbData = mapToDb(updatedObj)
  const { error } = await supabase.from('categories').update(dbData).eq('name', oldName)
  if (error) throw new Error(error.message)
  return listCategories()
}

export async function deleteCategory(name) {
  const { error } = await supabase.from('categories').delete().eq('name', name)
  if (error) throw new Error(error.message)
  return listCategories()
}
