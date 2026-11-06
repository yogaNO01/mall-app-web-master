import type { PmsProduct } from '@/types/product'
import type { ProductColor } from '@/utils/product-colors'
import type { ContentTranslations } from '@/i18n'
import { productAmount } from '@/utils/money'

export type CatalogEntry = { product: PmsProduct; colors: ProductColor[]; sizes: string[]; quality: string; variants?: {color?:string;size?:string;stock:number}[]; sizeTranslations?: Record<string, ContentTranslations> }
export type CatalogFilters = { brands: string[]; colors: string[]; sizes: string[]; min: string; max: string; quality: string; keyword: string; sort: number; discount: boolean }
export const validatePriceRange = (min:string,max:string) => {
  if ([min,max].some(value => value.trim() && (!Number.isFinite(Number(value)) || Number(value) < 0))) return '请输入有效的非负价格'
  if (min.trim() && max.trim() && Number(min) > Number(max)) return '最低价不能高于最高价'
  return ''
}
export const filterCatalog = (entries: CatalogEntry[], filters: CatalogFilters) => {
  if (validatePriceRange(filters.min, filters.max)) return []
  const keyword = filters.keyword.trim().toLowerCase()
  const result = entries.filter(({ product: p, colors, sizes, quality,variants }) => {
    const price = productAmount(p, 'price')
    const originalPrice = productAmount(p, 'originalPrice')
    return (
    (!filters.brands.length || filters.brands.includes(p.brandName)) &&
    (!filters.colors.length || colors.some(color => filters.colors.includes(color.color))) &&
    (!filters.sizes.length || sizes.some(size => filters.sizes.includes(size))) &&
    (!(filters.colors.length && filters.sizes.length && variants?.length) || variants.some(variant => filters.colors.includes(variant.color || '') && filters.sizes.includes(variant.size || '') && variant.stock > 0)) &&
    (!filters.min || (price != null && price >= Number(filters.min))) &&
    (!filters.max || (price != null && price <= Number(filters.max))) &&
    (!filters.quality || quality === filters.quality) &&
    (!filters.discount || (price != null && originalPrice != null && originalPrice > price)) &&
    (!keyword || `${p.name} ${p.productSn} ${p.brandName} ${p.subTitle || ''}`.toLowerCase().includes(keyword))
  )}).map(entry => entry.product)
  if (filters.sort === 1) result.sort((a,b) => b.id-a.id)
  if (filters.sort === 2) result.sort((a,b) => Number(b.sale)-Number(a.sale))
  if (filters.sort === 3) result.sort((a,b) => (productAmount(a, 'price') ?? Number.POSITIVE_INFINITY) - (productAmount(b, 'price') ?? Number.POSITIVE_INFINITY))
  if (filters.sort === 4) result.sort((a,b) => (productAmount(b, 'price') ?? Number.NEGATIVE_INFINITY) - (productAmount(a, 'price') ?? Number.NEGATIVE_INFINITY))
  return result
}
