import type { PmsSkuStock, SpecOption } from '@/types/product'

export const readSkuValues = (sku: Pick<PmsSkuStock, 'spData'>) => {
  try {
    const values = JSON.parse(sku.spData || '[]')
    if (!Array.isArray(values)) return null
    return new Map<string,string>(values.filter(item => typeof item?.key === 'string' && typeof item?.value === 'string').map(item => [item.key,item.value]))
  } catch { return null }
}
export const availableSkuStock = (sku: Pick<PmsSkuStock, 'stock' | 'lockStock'>) =>
  Math.max(0, Math.floor(Number(sku.stock) || 0) - Math.max(0, Math.floor(Number(sku.lockStock) || 0)))

export const findSelectedSku = (skus: PmsSkuStock[], selected: SpecOption[], requiredCount: number) => {
  if (selected.length !== requiredCount) return null
  return skus.find(sku => {
    const values = readSkuValues(sku)
    return values && selected.every(option => values.get(option.pname) === option.name)
  }) || null
}
export const compatibleSkuForOption = (option: SpecOption, options: SpecOption[], skus: PmsSkuStock[]) => {
  const selected = options.filter(item => item.selected && item.pid !== option.pid)
  return skus.map(sku => {
    const values = readSkuValues(sku)
    return { sku, valid:availableSkuStock(sku) > 0 && values?.get(option.pname) === option.name, score:selected.filter(item => values?.get(item.pname) === item.name).length }
  }).filter(item => item.valid).sort((a,b) => b.score-a.score)[0]?.sku || null
}
export const isSkuOptionAvailable = (option: SpecOption, options: SpecOption[], skus: PmsSkuStock[]) =>
  !skus.length || !!compatibleSkuForOption(option, options, skus)
