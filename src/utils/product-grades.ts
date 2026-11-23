import type { PmsProduct } from '@/types/product'
import type { PriceRegion } from './money'

export type GradePrice = { grade: string; enabled: boolean; cny: string; usd: string; eur: string }
export function productGrades(product: PmsProduct): GradePrice[] {
  try {
    const rows = JSON.parse(product.translations?.zh?.gradePrices || '[]')
    return Array.isArray(rows) ? rows.filter(row => row?.enabled === true && ['7A', '10A', '12A'].includes(row.grade)) : []
  } catch { return [] }
}

export function selectGrade(rows: GradePrice[], region: PriceRegion, preferred?: string) {
  const key = region === 'cn' ? 'cny' : region === 'eu' ? 'eur' : 'usd'
  const amount = (row: GradePrice) => String(row[key] ?? '').trim() && Number.isFinite(Number(row[key])) ? Number(row[key]) : Infinity
  return rows.find(row => row.grade === preferred) || [...rows].sort((a, b) => amount(a) - amount(b))[0]
}

export function pricedProduct(product: PmsProduct, grade?: GradePrice) {
  if (!grade) return product
  return {
    ...product,
    price: grade.cny,
    translations: {
      ...product.translations,
      en: { ...product.translations?.en, price: grade.usd, priceCurrency: 'USD' },
      pt: { ...product.translations?.pt, price: grade.eur, priceCurrency: 'EUR' },
    },
  }
}

export const productDetailUrl = (id: number, grade?: string, region?: PriceRegion) =>
  `/pages/product/product?id=${id}${grade ? '&grade=' + encodeURIComponent(grade) : ''}${region ? '&region=' + region : ''}`
