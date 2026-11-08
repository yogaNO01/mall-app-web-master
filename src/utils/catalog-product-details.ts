import { getProductDetailAPI } from '@/apis/product'
import { isColorSpec, parseProductColor } from '@/utils/product-colors'
import { availableSkuStock } from '@/utils/sku-selection'
import type { PmsProductAttribute, PmsProductAttributeValue } from '@/types/product'
import type { ContentTranslations } from '@/i18n'

const cache = new Map<number, { request:ReturnType<typeof getProductDetailAPI>; created:number }>()
export const clearCatalogProductCache = () => cache.clear()
export const getCatalogProductDetail = (id: number) => {
  const cached = cache.get(id)
  if (cached && Date.now()-cached.created < 60000) return cached.request
  const request = getProductDetailAPI(id)
  if (cache.size >= 200) cache.delete(cache.keys().next().value!)
  cache.set(id, { request,created:Date.now() })
  request.catch(() => {
    if (cache.get(id)?.request === request) cache.delete(id)
  })
  return request
}
export const readProductSpecs = (skus: { spData: string; stock?:number; lockStock?:number }[], attributes: PmsProductAttribute[] = [], values: PmsProductAttributeValue[] = []) => {
  const colors = new Map<string, ReturnType<typeof parseProductColor>>()
  const sizes = new Set<string>()
  const sizeTranslations: Record<string, ContentTranslations> = {}
  const optionTranslation = (key: string, value: string) => {
    const attr = attributes.find(item => item.name === key)
    if (!attr) return undefined
    const custom = values.find(item => item.productAttributeId === attr.id)
    const translatedOptions: ContentTranslations = {}
    for (const lang of ['en','pt'] as const) {
    const source = custom?.translations?.[lang]?.value ? custom.value : attr.inputList
    const translated = custom?.translations?.[lang]?.value || attr.translations?.[lang]?.inputList
    const index = (source || '').split(',').indexOf(value)
    const name = index >= 0 ? translated?.split(',')[index]?.trim() : undefined
    if (name) translatedOptions[lang] = { name }
    }
    return Object.keys(translatedOptions).length ? translatedOptions : undefined
  }
  const variants: { color?:string; size?:string; stock:number }[] = []
  for (const sku of skus || []) {
    try {
      const variant: { color?:string; size?:string; stock:number } = { stock:availableSkuStock({stock:sku.stock || 0,lockStock:sku.lockStock || 0}) }
      for (const spec of JSON.parse(sku.spData || '[]')) {
        if (isColorSpec(spec.key)) {
          const color = parseProductColor(spec.value)
          const translated = optionTranslation(spec.key, spec.value)
          if (translated) color.translations = translated
          colors.set(spec.value, color)
        } else if (/尺码|尺寸|规格|size/i.test(spec.key)) {
          sizes.add(String(spec.value))
          const translated = optionTranslation(spec.key, spec.value)
          if (translated) sizeTranslations[String(spec.value)] = translated
        }
        if (isColorSpec(spec.key)) variant.color = parseProductColor(spec.value).color
        if (/尺码|尺寸|规格|size/i.test(spec.key)) variant.size = String(spec.value)
      }
      variants.push(variant)
    } catch { /* Skip invalid metadata without losing other SKUs. */ }
  }
  return { colors: [...colors.values()], sizes: [...sizes], variants, sizeTranslations }
}
