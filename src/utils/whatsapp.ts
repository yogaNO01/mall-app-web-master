import type { PmsProduct } from '@/types/product'
import { locale, localized } from '@/i18n'

const contactUrl = 'https://wa.me/message/L6BPFOED5EWPL1'

/** Open a contact chat with the exact three-line product inquiry. */
export function consultOnWhatsApp(product: PmsProduct) {
  let productLink = `/pages/product/product?id=${product.id}`
  // #ifdef H5
  productLink = `${window.location.origin}${window.location.pathname}#/pages/product/product?id=${product.id}`
  // #endif
  const productName = localized(product, 'name')
  const productCode = product.productSn || product.id
  const messages = {
    zh: `您好，我对 ${productName} 感兴趣。\n商品链接: ${productLink}\nSKU: ${productCode}`,
    en: `Hi, I’m interested in ${productName}.\nProduct link: ${productLink}\nSKU: ${productCode}`,
    pt: `Olá, tenho interesse em ${productName}.\nLink do produto: ${productLink}\nSKU: ${productCode}`,
    es: `Hola, me interesa ${productName}.\nEnlace del producto: ${productLink}\nSKU: ${productCode}`,
  }
  const message = messages[locale.value]
  const url = `${contactUrl}?text=${encodeURIComponent(message)}`
  // #ifdef H5
  window.open(url, '_blank', 'noopener,noreferrer')
  // #endif
}
