import { ref } from 'vue'
import { portuguese } from './pt'

export type StorefrontLocale = 'zh' | 'pt'
export type ContentTranslations = Partial<Record<StorefrontLocale, Record<string, string>>>
const STORAGE_KEY = 'mall-storefront-locale'
export const organizationName = '中国广州商品进出口贸易总会'
const savedLocale = () => {
  try { return uni.getStorageSync(STORAGE_KEY) === 'pt' ? 'pt' : 'zh' } catch { return 'zh' }
}
export const locale = ref<StorefrontLocale>(savedLocale())
const overrides = ref<Record<string, { zh: string; pt: string }>>({})
const entityNames = ref<Record<string, string>>({})
export function registerLocaleEntities(records: unknown) {
  if (!Array.isArray(records)) return
  const next = { ...entityNames.value }
  const read = (items: unknown[]) => {
    for (const value of items) {
      if (!value || typeof value !== 'object') continue
      const item = value as { name?: string; translations?: ContentTranslations; children?: unknown[] }
      if (item.name && item.translations?.pt?.name?.trim()) next[item.name] = item.translations.pt.name
      if (item.children) read(item.children)
    }
  }
  read(records); entityNames.value = next
}
const patterns = Object.entries(portuguese).filter(([key]) => /\{\w+\}/.test(key)).map(([key, value]) => {
  const names: string[] = []
  const pattern = key.split(/(\{\w+\})/).map(part => {
    if (/^\{\w+\}$/.test(part)) { names.push(part.slice(1, -1)); return '(.+?)' }
    return part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }).join('')
  return { expression: new RegExp(`^${pattern}$`), names, value }
})

/** Translate UI copy, without touching canonical SKU values or request parameters. */
export function t(source: unknown, values: Record<string, unknown> = {}): string {
  const key = source == null ? '' : String(source)
  if (key === organizationName) return key
  const custom = (locale.value === 'pt' ? entityNames.value[key] : undefined) || overrides.value[key]?.[locale.value]
  let result = (custom?.trim() ? custom : undefined) || (locale.value === 'pt' ? portuguese[key] : key) || key
  if (locale.value === 'pt' && result === key) {
    for (const pattern of patterns) {
      const match = key.match(pattern.expression)
      if (match) {
        result = pattern.value.replace(/\{(\w+)\}/g, (_, name) => t(match[pattern.names.indexOf(name) + 1]))
        break
      }
    }
  }
  return result.replace(/\{(\w+)\}/g, (placeholder, name) => values[name] == null ? placeholder : String(values[name]))
}

export function localized(record: unknown, field: string): string {
  if (!record || typeof record !== 'object') return ''
  const content = record as Record<string, unknown> & { translations?: ContentTranslations }
  if (content[field] === organizationName) return organizationName
  if (locale.value === 'pt' && ['brandName','productCategoryName'].includes(field) && entityNames.value[String(content[field])]) return entityNames.value[String(content[field])]
  const translated = content.translations?.[locale.value]?.[field]
  return translated?.trim() || t(content[field])
}

/** Match a translated option by its original value, preserving the SKU identity. */
export function localizedOption(record: unknown, value: string): string {
  if (locale.value !== 'pt' || !record || typeof record !== 'object') return t(value.split('|')[0])
  const attr = record as { inputList?: string; translations?: ContentTranslations }
  const options = (attr.inputList || '').split(',')
  const index = options.indexOf(value)
  const translated = attr.translations?.pt?.inputList?.split(',')[index]?.trim()
  return t(translated || value.split('|')[0])
}

export function setLocale(value: StorefrontLocale) {
  locale.value = value
  try { uni.setStorageSync(STORAGE_KEY, value) } catch { /* A session can still switch languages without storage. */ }
  if (typeof document !== 'undefined') document.documentElement.lang = value === 'pt' ? 'pt-BR' : 'zh-CN'
}

let copyLoaded = false
let lookupsLoaded = false
let lastCopyAttempt = 0
export async function loadStorefrontCopy() {
  if (!lookupsLoaded) {
    lookupsLoaded = true
    for (const url of ['/brand/recommendList?pageNum=1&pageSize=100', '/product/categoryTreeList']) uni.request({ url, success: response => {
      const result = response.data as { code?: number; data?: unknown[] }
      if (result.code === 200) registerLocaleEntities(result.data)
    }, fail: () => {} })
  }
  if (copyLoaded || Date.now() - lastCopyAttempt < 60000) return
  lastCopyAttempt = Date.now()
  copyLoaded = true
  // Keep the bundled dictionary available while an older API is being upgraded.
  uni.request({ url: '/home/translations', success: response => {
    const result = response.data as { code?: number; data?: { source: string; zh: string; pt: string }[] }
    if (result.code === 200 && Array.isArray(result.data)) overrides.value = Object.fromEntries(result.data.map(item => [item.source, { zh: item.zh, pt: item.pt }]))
    else copyLoaded = false
  }, fail: () => { copyLoaded = false } })
}

export const useLocale = () => ({ locale, t, localized, localizedOption, setLocale })
