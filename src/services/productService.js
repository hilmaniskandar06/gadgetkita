import { supabase } from '../config/supabase'
import { SEED_PRODUCTS } from '../data/products'

function mapFromDb(dbItem) {
  if (!dbItem) return null
  return {
    ...dbItem,
    oldPrice: dbItem.old_price,
    inStock: dbItem.in_stock,
    contentVolume: dbItem.content_volume,
    isNew: dbItem.is_new,
    shortDesc: dbItem.short_desc,
    longDesc: dbItem.description,
    externalLink: dbItem.external_link || null
  }
}

function mapToDb(item) {
  return {
    id: item.id,
    name: item.name,
    price: item.price,
    old_price: item.oldPrice,
    rating: item.rating,
    reviews: item.reviews,
    category: item.category,
    weight: item.weight,
    in_stock: item.inStock,
    content_volume: item.contentVolume,
    is_new: item.isNew,
    short_desc: item.shortDesc,
    description: item.longDesc || item.description,
    images: item.images || [],
    external_link: item.externalLink || null
  }
}

export async function listProducts() {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
  if (error) {
    console.error('Error listProducts:', error)
    return []
  }
  return data.map(mapFromDb)
}

export async function getProduct(id) {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle()
  if (error || !data) return null
  return mapFromDb(data)
}

export async function createProduct(payload) {
  const id = payload.id || 'p' + Date.now()
  const dbData = mapToDb({ ...payload, id })
  const { data, error } = await supabase.from('products').insert(dbData).select().single()
  if (error) throw new Error(error.message)
  return mapFromDb(data)
}

export async function updateProduct(id, payload) {
  const dbData = mapToDb({ ...payload, id })
  const { data, error } = await supabase.from('products').update(dbData).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return mapFromDb(data)
}

export async function deleteProduct(id) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw new Error(error.message)
  return true
}

export async function resetProducts() {
  const dbItems = SEED_PRODUCTS.map(mapToDb)
  const { error } = await supabase.from('products').upsert(dbItems)
  if (error) throw new Error(error.message)
  return SEED_PRODUCTS
}
