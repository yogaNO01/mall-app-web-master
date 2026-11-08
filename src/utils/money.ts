import { locale, t, type ContentTranslations } from '@/i18n'
import { ref } from 'vue'
import { http } from '@/utils/http'
const exchangeRates = ref<Record<string,number>>({ CNY:1 })
const freightSettings=ref<Record<string,number>>({})
export async function loadFreightSettings(){try{const result=await http<Record<string,number>>({url:'/home/freight',method:'GET'});freightSettings.value=result.data}catch{}}
export type SalesMarket = 'us' | 'eu'
export type PriceRegion = SalesMarket | 'cn'
const savedMarket = ():SalesMarket => {try{return uni.getStorageSync('mall-sales-market')==='eu'?'eu':'us'}catch{return 'us'}}
export const market=ref<SalesMarket>(savedMarket())
export function setMarket(value:SalesMarket){market.value=value;try{uni.setStorageSync('mall-sales-market',value)}catch{}void loadExchangeRates()}
export const marketCurrency=(region:PriceRegion=market.value)=>region==='cn'?'CNY':region==='eu'?'EUR':'USD'
export const exchangeRateDate = ref('')
let lastAttempt=0
export async function loadExchangeRates() {
  if(Date.now()-lastAttempt<300000)return
  lastAttempt=Date.now()
  try {
    const result=await http<{rates:Record<string,number>;date:string}>({url:'/home/exchange-rates',method:'GET'})
    if(result.data?.rates?.EUR>0 && result.data?.rates?.USD>0){exchangeRates.value=result.data.rates;exchangeRateDate.value=result.data.date}
  }catch { /* Retain CNY and any previously loaded rates. */ }
}

export type ProductMoneyField = 'price' | 'originalPrice'
type MoneyProduct = Partial<Record<ProductMoneyField, number | string>> & { translations?: ContentTranslations }

const numericAmount = (value: unknown): number | undefined => {
  if (value === '' || value == null) return undefined
  const amount = Number(value)
  return Number.isFinite(amount) && amount >= 0 ? amount : undefined
}

/** Read the amount belonging to the active storefront locale without converting currencies. */
export const productAmount = (product: MoneyProduct, field: ProductMoneyField): number | undefined =>
  numericAmount(product[field])
export const marketProductAmount = (product:MoneyProduct,field:ProductMoneyField):number|undefined => {
  return regionalProductAmount(product, field, market.value)
}
const regionalProductAmount = (product:MoneyProduct,field:ProductMoneyField,region:PriceRegion):number|undefined => {
  if (region === 'cn') return productAmount(product, field)
  const saved = product.translations?.[region === 'us' ? 'en' : 'pt']
  // Legacy Portuguese prices were BRL; only explicitly identified EUR prices are valid.
  if (saved?.priceCurrency !== marketCurrency(region)) return undefined
  return numericAmount(saved?.[field])
}
export const activeExchangeRates=exchangeRates
/** Per-piece CNY 10 base freight with the merchant's 2x multiplier. */
export const freightCny = (quantity=1,region:PriceRegion=market.value) => 10 * (region==='cn'?1:2) * Math.max(0,Math.floor(quantity))
export const formatFreight = (quantity=1,region:PriceRegion=market.value,withCurrency=true) => {
 const unit=freightSettings.value[region==='cn'?'cn':region==='us'?'usd':'eur']
 if(unit==null)return '—'
 const amount=(unit*Math.max(0,Math.floor(quantity))).toFixed(2)
 return withCurrency?`${marketCurrency(region)} ${currencySymbol(region)}${amount}`:amount
}

export const currencySymbol = (region:PriceRegion=market.value) => region==='cn'?'¥':region==='eu'?'€':'$'

export const formatMoneyAmount = (amount: number,region:PriceRegion=market.value,withCurrency=true): string => {
  const rate=exchangeRates.value[marketCurrency(region)]
  if(!(rate>0))return withCurrency?`${marketCurrency(region)} —`:'—'
  const formatted = new Intl.NumberFormat(locale.value === 'pt' ? 'pt-BR' : locale.value === 'en' ? 'en-US' : 'zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount*rate)
  return withCurrency?`${marketCurrency(region)} ${currencySymbol(region)}${formatted}`:formatted
}

export const formatProductMoney = (product: MoneyProduct, field: ProductMoneyField,region:PriceRegion=market.value,withCurrency=true): string => {
  const amount = regionalProductAmount(product, field, region)
  if(amount==null)return t('价格请咨询')
  const formatted = new Intl.NumberFormat(locale.value === 'pt' ? 'pt-BR' : locale.value === 'en' ? 'en-US' : 'zh-CN', {minimumFractionDigits:2,maximumFractionDigits:2}).format(amount)
  return withCurrency?`${marketCurrency(region)} ${currencySymbol(region)}${formatted}`:formatted
}

export const hasProductOriginalPrice = (product: MoneyProduct, region:PriceRegion=market.value): boolean => {
  const price = regionalProductAmount(product, 'price', region)
  const originalPrice = regionalProductAmount(product, 'originalPrice', region)
  return price != null && originalPrice != null && originalPrice > price
}
