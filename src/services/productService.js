import { supabase } from '../config/supabase'
import { SEED_PRODUCTS } from '../data/products'

function mapFromDb(dbItem) {
  if (!dbItem) return null
  const specs = dbItem.specs || {}

  return {
    ...dbItem,
    oldPrice: dbItem.old_price,
    inStock: dbItem.in_stock,
    contentVolume: dbItem.content_volume,
    isNew: dbItem.is_new,
    longDesc: dbItem.description,
    externalLink: dbItem.external_link || null,
    compatibility: dbItem.compatibility || specs.compatibility || null,
    connector: dbItem.connector || specs.connector || null,
    material: dbItem.material || specs.material || null,
    color: dbItem.color || null,
    brand: dbItem.brand || null,
    colors: Array.isArray(dbItem.colors) ? dbItem.colors : (dbItem.colors ? [dbItem.colors] : []),
    images: Array.isArray(dbItem.images) ? dbItem.images : (dbItem.images ? [dbItem.images] : []),
    sold: Number(dbItem.sold || 0),
    specs: {
      batteryCapacity: specs.batteryCapacity || '',
      powerOutput: specs.powerOutput || '',
      batteryLife: specs.batteryLife || '',
      storageCapacity: specs.storageCapacity || '',
      bluetoothVersion: specs.bluetoothVersion || '',
      interfacePort: specs.interfacePort || '',
      dataTransferSpeed: specs.dataTransferSpeed || '',
      audioSafetyFeatures: specs.audioSafetyFeatures || '',
      glassTypeHardness: specs.glassTypeHardness || '',
      glassThickness: specs.glassThickness || '',
      protectionFeatures: specs.protectionFeatures || '',
      waterproofRating: specs.waterproofRating || '',
      standType: specs.standType || '',
      maxHeightClamp: specs.maxHeightClamp || '',
      maxLoad: specs.maxLoad || '',
      compatibility: dbItem.compatibility || specs.compatibility || '',
      connector: dbItem.connector || specs.connector || '',
      material: dbItem.material || specs.material || '',
      contentVolume: dbItem.content_volume || specs.contentVolume || ''
    }
  }
}

function mapToDb(item) {
  const specs = item.specs || {
    batteryCapacity: item.batteryCapacity || '',
    powerOutput: item.powerOutput || '',
    batteryLife: item.batteryLife || '',
    storageCapacity: item.storageCapacity || '',
    bluetoothVersion: item.bluetoothVersion || '',
    interfacePort: item.interfacePort || '',
    dataTransferSpeed: item.dataTransferSpeed || '',
    audioSafetyFeatures: item.audioSafetyFeatures || '',
    glassTypeHardness: item.glassTypeHardness || '',
    glassThickness: item.glassThickness || '',
    protectionFeatures: item.protectionFeatures || '',
    waterproofRating: item.waterproofRating || '',
    standType: item.standType || '',
    maxHeightClamp: item.maxHeightClamp || '',
    maxLoad: item.maxLoad || '',
    compatibility: item.compatibility || '',
    connector: item.connector || '',
    material: item.material || '',
    contentVolume: item.contentVolume || ''
  }

  return {
    id: item.id,
    name: item.name,
    price: item.price,
    old_price: item.oldPrice,
    category: item.category,
    weight: item.weight,
    in_stock: item.inStock,
    content_volume: item.contentVolume || specs.contentVolume || null,
    is_new: item.isNew,
    description: item.longDesc || item.description,
    images: item.images || [],
    external_link: item.externalLink || null,
    compatibility: item.compatibility || specs.compatibility || null,
    connector: item.connector || specs.connector || null,
    material: item.material || specs.material || null,
    color: item.color || null,
    brand: item.brand || null,
    colors: item.colors || [],
    specs: specs,
    sold: Number(item.sold || 0)
  }
}

export async function incrementProductsSold(itemsWithQty) {
  if (!itemsWithQty || !itemsWithQty.length) return []
  const results = []
  for (const { id, qty } of itemsWithQty) {
    if (!id || !qty) continue
    const { data: current } = await supabase.from('products').select('sold').eq('id', id).maybeSingle()
    const newSold = Number(current?.sold || 0) + Number(qty || 0)
    const { data, error } = await supabase
      .from('products')
      .update({ sold: newSold })
      .eq('id', id)
      .select()
      .maybeSingle()
    if (!error && data) results.push(mapFromDb(data))
  }
  return results
}

export async function decrementProductsSold(itemsWithQty) {
  if (!itemsWithQty || !itemsWithQty.length) return []
  const results = []
  for (const { id, qty } of itemsWithQty) {
    if (!id || !qty) continue
    const { data: current } = await supabase.from('products').select('sold').eq('id', id).maybeSingle()
    const newSold = Math.max(0, Number(current?.sold || 0) - Number(qty || 0))
    const { data, error } = await supabase
      .from('products')
      .update({ sold: newSold })
      .eq('id', id)
      .select()
      .maybeSingle()
    if (!error && data) results.push(mapFromDb(data))
  }
  return results
}

export async function listProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch products:', error)
    return []
  }

  if (!data || data.length === 0) {
    return []
  }

  return data.map(mapFromDb)
}

export async function getProduct(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Failed to fetch product:', error)
    return null
  }

  return mapFromDb(data)
}

export async function createProduct(product) {
  const payload = mapToDb({
    ...product,
    id: product.id || 'prod-' + Date.now()
  })

  const { data, error } = await supabase
    .from('products')
    .insert(payload)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return mapFromDb(data)
}

export async function updateProduct(id, updates) {
  const payload = mapToDb({ ...updates, id })

  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return mapFromDb(data)
}

export async function deleteProduct(id) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  return true
}

export async function resetProducts() {
  const { error: deleteError } = await supabase.from('products').delete().neq('id', '___')
  if (deleteError) throw new Error(deleteError.message)

  const payload = SEED_PRODUCTS.map(mapToDb)
  const { error: insertError } = await supabase.from('products').insert(payload)
  if (insertError) throw new Error(insertError.message)

  return listProducts()
}
