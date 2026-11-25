import type { PmsProduct } from '@/types/product'
import { locale, localized } from '@/i18n'

const contactUrl = 'https://wa.me/message/L6BPFOED5EWPL1'

import type { PriceRegion } from './money'
import { productDetailUrl } from './product-grades'
export function consultOnWhatsApp(product: PmsProduct, grade?: string, region?: PriceRegion) {
  let productLink = productDetailUrl(product.id, grade, region)
  // #ifdef H5
  productLink = `${window.location.origin}${window.location.pathname}#${productLink}`
  // #endif
  const productName = localized(product, 'name')
  const productCode = product.productSn || product.id
  const messages = {
    zh: `您好，我对 ${productName} 感兴趣。\n商品链接: ${productLink}\nSKU: ${productCode}`,
    en: `Hello, I’m interested in ${productName}.\nProduct link: ${productLink}\nSKU: ${productCode}`,
    pt: `Olá, tenho interesse em ${productName}.\nLink do produto: ${productLink}\nSKU: ${productCode}`,
    es: `Hola, me interesa ${productName}.\nEnlace del producto: ${productLink}\nSKU: ${productCode}`,
    it: `Ciao, mi interessa ${productName}.\nLink del prodotto: ${productLink}\nSKU: ${productCode}`,
    fr: `Bonjour, je suis intéressé par ${productName}.\nLien du produit : ${productLink}\nSKU : ${productCode}`,
  }
  const gradeLabel = { zh: '品质等级', en: 'Grade', pt: 'Grau', es: 'Grado', it: 'Grado', fr: 'Qualité' }[locale.value]
  const message = messages[locale.value] + (grade ? `\n${gradeLabel}: ${grade}` : '')
  const url = `${contactUrl}?text=${encodeURIComponent(message)}`
  // #ifdef H5
  window.open(url, '_blank', 'noopener,noreferrer')
  // #endif
}
