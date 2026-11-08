import { ref } from 'vue'
import { portuguese } from './pt'
import { english } from './languages'
import { spanish } from './es'

export type StorefrontLocale = 'zh' | 'en' | 'pt' | 'es'
export type ContentTranslations = Partial<Record<StorefrontLocale, Record<string, string>>>
const STORAGE_KEY = 'mall-storefront-locale'
export const organizationName = '中国广州商品进出口贸易总会'
const savedLocale = () => {
  try { const saved = uni.getStorageSync(STORAGE_KEY); return ['zh','en','pt','es'].includes(saved) ? saved : 'en' } catch { return 'en' }
}
export const locale = ref<StorefrontLocale>(savedLocale())
const entityNames = ref<Record<string, Partial<Record<StorefrontLocale, string>>>>({})
const dictionary = () => locale.value === 'en' ? english : locale.value === 'es' ? spanish : portuguese
export function registerLocaleEntities(records: unknown) {
  if (!Array.isArray(records)) return
  const next = { ...entityNames.value }
  const read = (items: unknown[]) => {
    for (const value of items) {
      if (!value || typeof value !== 'object') continue
      const item = value as { name?: string; translations?: ContentTranslations; children?: unknown[] }
      if (item.name) next[item.name] = Object.fromEntries(['en','pt','es'].map(lang => [lang,item.translations?.[lang as StorefrontLocale]?.name || '']))
      if (item.children) read(item.children)
    }
  }
  read(records); entityNames.value = next
}
const patterns = Object.keys(portuguese).filter(key => /\{\w+\}/.test(key)).map(key => {
  const names: string[] = []
  const pattern = key.split(/(\{\w+\})/).map(part => {
    if (/^\{\w+\}$/.test(part)) { names.push(part.slice(1, -1)); return '(.+?)' }
    return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }).join('')
  return { expression: new RegExp(`^${pattern}$`), names, key }
})

/** Translate UI copy, without touching canonical SKU values or request parameters. */
export function t(source: unknown, values: Record<string, unknown> = {}): string {
  const key = source == null ? '' : String(source)
  if (key === organizationName) return locale.value === 'zh' ? key : locale.value === 'pt' ? 'Associação de Comércio Global de Guangzhou' : locale.value === 'es' ? 'Asociación Global de Comercio de Guangzhou' : 'Guangzhou Global Trade Association'
  let result = (locale.value !== 'zh' ? dictionary()[key] : key) || key
  if (locale.value !== 'zh' && result === key) {
    for (const pattern of patterns) {
      const match = key.match(pattern.expression)
      if (match) {
        result = (dictionary()[pattern.key] || key).replace(/\{(\w+)\}/g, (_, name) => t(match[pattern.names.indexOf(name) + 1]))
        break
      }
    }
  }
  return result.replace(/\{(\w+)\}/g, (placeholder, name) => values[name] == null ? placeholder : String(values[name]))
}

export function localized(record: unknown, field: string): string {
  if (!record || typeof record !== 'object') return ''
  const content = record as Record<string, unknown> & { translations?: ContentTranslations }
  const translated = content.translations?.[locale.value]?.[field]
  if (translated?.trim()) return translated
  if (locale.value !== 'zh' && ['brandName','productCategoryName'].includes(field) && entityNames.value[String(content[field])]?.[locale.value]) return entityNames.value[String(content[field])][locale.value]!
  return content[field] == null ? '' : String(content[field])
}

/** Match a translated option by its original value, preserving the SKU identity. */
export function localizedOption(record: unknown, value: string): string {
  if (locale.value === 'zh' || !record || typeof record !== 'object') return value.split('|')[0]
  const attr = record as { inputList?: string; translations?: ContentTranslations }
  const options = (attr.inputList || '').split(',')
  const index = options.indexOf(value)
  const translated = attr.translations?.[locale.value]?.inputList?.split(',')[index]?.trim()
  return translated || value.split('|')[0]
}

export function setLocale(value: StorefrontLocale) {
  locale.value = value
  try { uni.setStorageSync(STORAGE_KEY, value) } catch { /* A session can still switch languages without storage. */ }
  if (typeof document !== 'undefined') document.documentElement.lang = value === 'zh' ? 'zh-CN' : value === 'pt' ? 'pt-BR' : value === 'es' ? 'es' : 'en'
}

let lookupsLoaded = false
export async function loadStorefrontCopy() {
  if (!lookupsLoaded) {
    lookupsLoaded = true
    for (const url of ['/brand/recommendList?pageNum=1&pageSize=100', '/product/categoryTreeList']) uni.request({ url, success: response => {
      const result = response.data as { code?: number; data?: unknown[] }
      if (result.code === 200) registerLocaleEntities(result.data)
    }, fail: () => {} })
  }
}

export const useLocale = () => ({ locale, t, localized, localizedOption, setLocale })
