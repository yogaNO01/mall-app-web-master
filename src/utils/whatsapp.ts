import type { PmsProduct } from '@/types/product'
import { localized } from '@/i18n'

const phone = '573504897066'

/** Open a contact chat with the exact three-line product inquiry. */
export function consultOnWhatsApp(product: PmsProduct) {
  let productLink = `/pages/product/product?id=${product.id}`
  // #ifdef H5
  productLink = `${window.location.origin}${window.location.pathname}#/pages/product/product?id=${product.id}`
  // #endif
  const message = `Hi, I’m interested in ${localized(product, 'name')}.\nProduct link: ${productLink}\nSKU: ${product.productSn || product.id}`
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
  // #ifdef H5
  const target = window.matchMedia('(pointer: fine)').matches
    ? `https://web.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`
    : url
  window.open(target, '_blank', 'noopener,noreferrer')
  // #endif
}
