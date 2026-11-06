import { locale, t, type ContentTranslations } from '@/i18n'

export type ProductMoneyField = 'price' | 'originalPrice'
type MoneyProduct = Partial<Record<ProductMoneyField, number | string>> & { translations?: ContentTranslations }

const numericAmount = (value: unknown): number | undefined => {
  if (value === '' || value == null) return undefined
  const amount = Number(value)
  return Number.isFinite(amount) && amount >= 0 ? amount : undefined
}

/** Read the amount belonging to the active storefront locale without converting currencies. */
export const productAmount = (product: MoneyProduct, field: ProductMoneyField): number | undefined =>
  locale.value === 'pt'
    ? numericAmount(product.translations?.pt?.[field])
    : numericAmount(product[field])

export const currencySymbol = () => locale.value === 'pt' ? 'R$' : '￥'

export const formatMoneyAmount = (amount: number): string => {
  const formatted = new Intl.NumberFormat(locale.value === 'pt' ? 'pt-BR' : 'zh-CN', {
    minimumFractionDigits: locale.value === 'pt' ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount)
  return locale.value === 'pt' ? `R$ ${formatted}` : `￥${formatted}`
}

export const formatProductMoney = (product: MoneyProduct, field: ProductMoneyField): string => {
  const amount = productAmount(product, field)
  return amount == null ? t('价格请咨询') : formatMoneyAmount(amount)
}

export const hasProductOriginalPrice = (product: MoneyProduct): boolean => {
  const price = productAmount(product, 'price')
  const originalPrice = productAmount(product, 'originalPrice')
  return price != null && originalPrice != null && originalPrice > price
}
