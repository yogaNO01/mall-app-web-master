<template>
  <view class="home-page" :class="{ 'locale-pt': locale !== 'zh', 'locale-es': locale === 'es' }">
    <h5-site-header />
    <view class="search-region"
      ><storefront-search v-model="searchDraft" @search="searchProducts" /></view
    >
    <view class="mobile-about-section">
      <image class="mobile-about-image" src="/static/home/aboutUs_h5.svg" mode="widthFix" />
      <text class="mobile-about-slogan">{{ t('轻松穿搭，自由出发') }}</text>
    </view>
    <view class="hero">
      <view class="hero-image-slot">
        <image class="hero-image hero-image-mobile" src="/static/home/h5-banner.svg" mode="widthFix" />
        <image class="hero-image hero-image-pc" src="/static/home/aboutUs_pc.svg" />
      </view>
      <view class="hero-copy"
        ><text class="hero-eyebrow">{{ t('EVERYDAY STYLE · 2026') }}</text
        ><text class="hero-title">{{ t('轻松穿搭，自在出发') }}</text></view
      >
    </view>
    <view class="social-grid">
      <button
        v-for="contact in contacts"
        :key="contact.id"
        class="social-card"
        @click="openContact(contact)"
      >
        <view class="desktop-contact-icon">
          <template v-if="contact.id.startsWith('whatsapp')">
            <image class="desktop-whatsapp-disc" src="/static/home/desktop/666ed.svg" />
            <image class="desktop-whatsapp-mark" src="/static/home/desktop/767ce.svg" />
          </template>
          <image v-else :src="contact.icon" class="desktop-social-image" />
        </view>
        <view class="social-label"
          ><image
            :src="contact.icon"
            :class="['social-icon', { 'whatsapp-icon': contact.id.startsWith('whatsapp') }]"
          /><text>{{ t(contact.label) }}</text></view
        >
        <text class="social-value">{{ t(localized(contact, 'value')) }}</text>
      </button>
    </view>
    <view class="home-section new-products">
      <home-section-title
        :title="t('当季新品')"
        :description="t('为巴西客户精选广州各大市场的热门商品')"
        :more="t('查看全部')"
        @more="openCategories"
      />
      <view v-if="loading" class="product-grid" :aria-label="t('商品加载中')"
        ><view v-for="index in 4" :key="index" class="product-skeleton"
      /></view>
      <view v-else-if="loadError" class="load-message"
        ><text>{{ t('商品加载失败，请稍后重试') }}</text><button @click="loadData">{{ t('重新加载') }}</button></view
      >
      <view v-else-if="newProductList.length" class="product-grid">
        <home-product-card
          v-for="(product, index) in newProductList.slice(0, 8)"
          :key="product.id"
          :product="product"
          :color-asset="colorAssets[index % colorAssets.length]"
          hide-mobile-consult-icon
          @detail="openProduct"
          @consult="consultProduct"
        />
      </view>
      <text v-else class="load-message">{{ t('新品即将上架，敬请期待') }}</text>
      <button class="mobile-more-button" @click="openCategories">{{ t('查看全部') }} ›</button>
    </view>
    <view class="services-section">
      <text class="services-title">{{ t('服务保障') }}</text>
      <view class="services-grid">
        <view v-for="service in services" :key="service.title" class="service-card">
          <view class="desktop-service-icon"><image :src="service.desktopIcon" mode="aspectFit" /></view>
          <view class="service-icon-disc"><image :src="service.icon" class="service-icon" /></view>
          <view class="service-copy"
            ><text class="service-name">{{ t(localized(service, 'title')) }}</text
            ><text class="service-description">{{ t(localized(service, 'description')) }}</text></view
          >
          <image class="desktop-service-divider" src="/static/home/desktop/a4def.svg" />
        </view>
      </view>
      <button class="personal-buyer" @click="openContacts">
        <view class="desktop-service-icon"><image class="desktop-buyer-icon" src="/static/home/desktop/service-buyer.png" mode="aspectFit" /></view>
        <view class="buyer-icon-disc"
          ><image src="/static/home/62adf.svg" class="service-icon"
        /></view>
        <view class="buyer-copy"
          ><text class="buyer-title">{{ t('专属买手') }}</text
          ><text class="buyer-description">{{ t('一对一贴心服务') }}</text></view
        >
        <image src="/static/home/9e84c.svg" class="buyer-arrow" />
      </button>
    </view>
    <view class="home-section brands-section">
      <home-section-title
        :title="t('探索品牌')"
        :description="t('按品牌快速找到你喜欢的商品')"
        :more="t('全部品牌')"
        @more="openBrands"
      />
      <view v-if="brandList.length" class="brand-grid">
        <button
          v-for="brand in brandList"
          :key="brand.id"
          class="brand-card"
          @click="openBrand(brand)"
        >
          <view class="brand-cover"
            ><image
              :src="brand.logo || '/static/errorImage.jpg'"
              mode="aspectFit"
              class="brand-logo"
          /></view>
          <view class="brand-caption"
            ><text>{{ localized(brand, 'name') }}</text
            ><image src="/static/home/5df61.svg" class="brand-arrow"
          /></view>
        </button>
      </view>
      <text v-else-if="!loading" class="load-message">{{ t('暂无品牌') }}</text>
      <button class="mobile-more-button" @click="openBrands">{{ t('全部品牌') }} ›</button>
    </view>
    <view class="home-section editorial-section">
      <home-section-title
        :title="t('精选好物')"
        :description="t('为巴西客户精选广州各大市场的热门商品')"
        :more="t('查看全部')"
        @more="openCategories"
      />
      <button class="editorial-main" @click="openCategories">
        <view class="commute-image-slot"
          ><image class="commute-base" src="/static/home/78efe.png" mode="aspectFill" /><view
            class="commute-photo-slot"
            ><image class="commute-photo" src="/static/home/cd5e4.png" /></view
        ></view>
        <view class="editorial-copy"
          ><text class="editorial-title">{{ t('通勤精选') }}</text
          ><text class="editorial-description">{{ t('简约有形，轻松应对每一天') }}</text></view
        >
      </button>
      <view class="editorial-grid">
        <button class="editorial-small" @click="openCategories"
          ><view class="weekend-image-slot"
            ><image class="weekend-photo" src="/static/home/20920.png" /></view
          ><view class="editorial-copy"><text class="editorial-title">{{ t('周末休闲') }}</text
          ><text class="editorial-description">{{ t('自在舒适，享受生活的节奏') }}</text></view></button
        >
        <button class="editorial-small" @click="openCategories"
          ><view class="accessories-image-slot"
            ><image class="accessories-photo" src="/static/home/8d4b0.png" /></view
          ><view class="editorial-copy"><text class="editorial-title">{{ t('配饰灵感') }}</text
          ><text class="editorial-description">{{ t('点缀细节，彰显独特品味') }}</text></view></button
        >
      </view>
    </view>
    <view v-if="contactOpen" v-modal-scroll-lock class="overlay centered-overlay" @click="contactOpen = false">
      <view class="dialog-panel" @click.stop>
        <view class="panel-heading"
          ><text>{{ t(consultedProduct ? '咨询商品' : '联系我们') }}</text
          ><button :aria-label="t('关闭联系方式')" @click="contactOpen = false">×</button></view
        >
        <text v-if="consultedProduct" class="consulted-product">{{ localized(consultedProduct, 'name') }}</text
        ><text class="dialog-description">{{ t('选择下方渠道，直接联系') }}</text>
        <button
          v-for="contact in contacts"
          :key="contact.id"
          class="contact-option"
          @click="openContact(contact)"
          ><text>{{ t(contact.label) }}</text
          ><text>{{ t(localized(contact, 'value')) }}</text></button
        >
      </view>
    </view>
    <view v-if="aboutOpen" v-modal-scroll-lock class="overlay centered-overlay about-overlay" @click="aboutOpen = false">
      <view class="dialog-panel" @click.stop>
        <view class="panel-heading"
          ><text>{{ t('关于我们') }}</text
          ><button :aria-label="t('关闭关于我们')" @click="aboutOpen = false">×</button></view
        >
        <text class="dialog-about-title">{{ t('从广州出发，连接全球品质生活') }}</text
        ><text class="dialog-description"
          >{{ t('专注服饰、鞋履、箱包、腕表、眼镜及珠宝首饰的精选与跨境贸易，为巴西客户精选广州各大市场的热门商品。') }}</text
        >
        <button
          class="about-button"
          @click="contactFromAbout"
          >{{ t('联系我们') }}</button
        >
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { t, localized, locale, setLocale } from '@/i18n'

import { ref } from 'vue'
import { useModalScrollLock } from '@/composables/use-modal-scroll-lock'
const vModalScrollLock = useModalScrollLock()
import { onLoad, onShow, onHide, onPullDownRefresh } from '@dcloudio/uni-app'
import { getHomeContentAPI } from '@/apis/home'
import { getBrandRecommendListAPI } from '@/apis/brand'
import type { PmsProduct } from '@/types/product'
import type { PmsBrand } from '@/types/brand'
import HomeSectionTitle from '@/components/home-section-title.vue'
import HomeProductCard from '@/components/home-product-card.vue'
import H5SiteHeader from '@/components/h5-site-header.vue'
import StorefrontSearch from '@/components/storefront-search.vue'
import { useProductSearch } from '@/composables/use-product-search'
const searchDraft = ref('')
const { searchProducts } = useProductSearch()

const newProductList = ref<PmsProduct[]>([])
const brandList = ref<PmsBrand[]>([])
const loading = ref(true)
const loadError = ref(false)
const menuOpen = ref(false)
const contactOpen = ref(false)
const aboutOpen = ref(false)
const consultedProduct = ref<PmsProduct | null>(null)
const colorAssets = [
  '/static/home/126cc.svg',
  '/static/home/b34f4.svg',
  '/static/home/7c31f.svg',
  '/static/home/126cc.svg',
]
const contacts = [
  { id: 'whatsapp-1', label: 'WhatsApp 1', value: 'https://wa.me/message/L6BPFOED5EWPL1', icon: '/static/home/a2edb.svg' },
  { id: 'whatsapp-2', label: 'WhatsApp 2', value: 'http://wa.me/message/YCW3AKETHQVYM1', icon: '/static/home/a2edb.svg' },
  { id: 'whatsapp-3', label: 'WhatsApp 3', value: 'https://wa.me/message/L6BPFOED5EWPL1', icon: '/static/home/a2edb.svg' },
  {
    id: 'instagram',
    label: 'Instagram',
    value: 'https://www.instagram.com/aagoodwang',
    icon: '/static/home/557ff.png',
  },
]
const services = [
  { title: '正品保障', description: '来自广州优质货源', icon: '/static/home/1078d.svg', desktopIcon: '/static/home/desktop/service-quality.png' },
  { title: '发货快', description: '严格质量检验', icon: '/static/home/622bf.svg', desktopIcon: '/static/home/desktop/service-delivery.png' },
  { title: '国际运输', description: '安全有保障', icon: '/static/home/efd12.svg', desktopIcon: '/static/home/desktop/service-shipping.png' },
  { title: '贴心服务', description: '全球购物更简单', icon: '/static/home/d1cab.svg', desktopIcon: '/static/home/desktop/service-care.png' },
]
const loadData = async () => {
  loading.value = true
  loadError.value = false
  try {
    const [response, brands] = await Promise.allSettled([
      getHomeContentAPI(), getBrandRecommendListAPI({ pageNum: 1, pageSize: 100 }),
    ])
    if (brands.status === 'fulfilled') brandList.value = brands.value.data || []
    else if (response.status === 'fulfilled') brandList.value = response.value.data?.brandList || []
    if (response.status === 'rejected') throw response.reason
    newProductList.value = response.value.data?.newProductList || []
  } catch (error) {
    loadError.value = true
    console.error('加载首页数据失败', error)
  } finally {
    loading.value = false
    uni.stopPullDownRefresh()
  }
}
onLoad(loadData)
onPullDownRefresh(loadData)
// Header navigation replaces the home tab bar; other tabs remain registered.
onShow(() => {
  uni.hideTabBar({ animation: false, fail: () => {} })
})
onHide(() => {
  menuOpen.value = false
  contactOpen.value = false
  aboutOpen.value = false
})
const navigate = (url: string) => {
  menuOpen.value = false
  uni.navigateTo({ url })
}
const openBrands = () => navigate('/pages/brand/list')
const openProduct = (product: PmsProduct) => navigate('/pages/product/product?id=' + product.id)
const openBrand = (brand: PmsBrand) => navigate('/pages/brand/brandDetail?id=' + brand.id)
const openCategories = () => {
  menuOpen.value = false
  uni.switchTab({ url: '/pages/category/category' })
}
const openAccount = () => {
  menuOpen.value = false
  uni.switchTab({ url: '/pages/user/user' })
}
const openContacts = () => {
  menuOpen.value = false
  consultedProduct.value = null
  contactOpen.value = true
}
const consultProduct = (product: PmsProduct) => {
  consultedProduct.value = product
  contactOpen.value = true
}
const openContact = (contact: (typeof contacts)[number]) => {
  window.open(contact.value, '_blank', 'noopener,noreferrer')
}
const showLanguage = () => setLocale(locale.value === 'zh' ? 'pt' : 'zh')
const scrollHome = () => uni.pageScrollTo({ scrollTop: 0, duration: 300 })
const scrollAbout = () => uni.pageScrollTo({ selector: '#home-about', duration: 300 })
const openAbout = () => {
  menuOpen.value = false
  aboutOpen.value = true
}
const contactFromAbout = () => {
  aboutOpen.value = false
  openContacts()
}
</script>

<style lang="scss" scoped>
@use '@/styles/home-tokens.scss' as *;
.desktop-navigation, .desktop-search, .desktop-language, .desktop-contact-icon,
.desktop-service-icon, .desktop-service-divider { display: none; }
.desktop-service-icon {
  width: 30px;
  height: 35px;
} 
.home-page {
  max-width: 600px;
  margin: 0 auto;
  background: #fff;
  color: $home-ink;
  font-family: 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  line-height: 1.5;
}
button {
  margin: 0;
  font-family: inherit;
  cursor: pointer;
}
button::after {
  border: none;
}
.home-header {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 64px;
  padding: 10px 18px;
  color: $home-navy;
}
.site-name {
  flex: 1;
  font-size: 15px;
  line-height: 24px;
  font-weight: 700;
  white-space: nowrap;
}
.language-button {
  flex-shrink: 0;
  padding: 0;
  font-size: 20px;
  font-weight: 500;
  line-height: 44px;
  border-radius: 0;
  background: transparent;
  color: $home-navy;
}
.menu-button {
  display: flex;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  padding: 0;
  align-items: center;
  justify-content: center;
  background: transparent;
}
.menu-icon {
  width: 22px;
  height: 22px;
}
.search-region {
  padding: 10px 18px;
  min-height: 64px;
  border-block: 1px solid rgba(129, 144, 157, 0.12);
}
.search-button {
  height: 42px;
  padding: 10px 16px;
  border-radius: 22px;
  background: $home-pale;
  color: $home-muted;
  text-align: left;
  font-size: 14px;
  line-height: 21px;
}
.hero {
  display: none;
  position: relative;
  width: 100vw;
  height: auto;
  margin-left: calc(50% - 50vw);
  aspect-ratio: 390 / 260;
  overflow: hidden;
  background: $home-pale;
}
.mobile-about-section {
  position: relative;
  display: block;
  width: 100vw;
  padding: 0;
  background: #fff;
}
.mobile-about-image {
  display: block;
  width: 100vw;
  height: auto;
}
.mobile-about-slogan {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 88%;
  transform: translate(-50%, -50%);
  color: #fff;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.35;
  text-align: center;
  text-shadow: 0 2px 8px rgba(15, 41, 69, .35);
}
.hero-image-slot {
  position: relative;
  width: 100vw;
  height: auto;
  aspect-ratio: 390 / 260;
  overflow: hidden;
}
.hero-image {
  display: block;
  width: 100vw;
  height: auto;
}
.hero-image-mobile {
  height: 100%;
  object-fit: cover;
}
.hero-image-pc { display: none; }
.hero-copy {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-sizing: border-box;
  padding: 0 24px;
  text-align: center;
}
.hero-eyebrow {
  color: #e6f3ff;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 2px;
  line-height: 15px;
}
.hero-title {
  font-size: 27px;
  font-weight: 700;
  line-height: 41px;
  color: white;
}
.social-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 12px;
  padding: 10px 16px;
}
.social-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  min-height: 63px;
  padding: 12px 10px;
  border: 0.5px solid $home-line;
  border-radius: 10px;
  background: #fff;
  line-height: 1.5;
}
.social-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  color: $home-navy;
}
.social-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  border-radius: 4px;
}
.social-card:nth-child(3) .social-icon {
  width: 17.4375px;
  height: 17.332px;
}
.whatsapp-icon {
  width: 22px;
  height: 22px;
  border-radius: 0;
}
.social-value {
  font-size: 10px;
  line-height: 15px;
  color: $home-muted;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: normal;
  min-width: 0;
  max-width: 100%;
}
.home-section {
  padding: 34px 16px 32px;
}
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 12px;
  margin-top: 18px;
}
.product-skeleton {
  height: 364px;
  border-radius: 4px;
  background: linear-gradient(#f0f2f4 51%, #fafafa 51%);
}
.load-message {
  display: block;
  padding: 36px 0;
  text-align: center;
  font-size: 12px;
  color: $home-muted;
}
.load-message button {
  margin: 16px auto 0;
  font-size: 12px;
  color: $home-blue;
}
@media(max-width:1023px) {
  .brands-section :deep(.heading-more),
  .new-products :deep(.heading-more),
  .editorial-section :deep(.heading-more) { display:none; }
}
.mobile-more-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 40px;
  margin-top: 18px;
  border: 1px solid $home-line;
  border-radius: 6px;
  background: #fff;
  color: $home-navy;
  font-size: 13px;
  line-height: 1.4;
}
.about-section {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 0 16px 32px;
}
.section-title {
  font-weight: 700;
  font-size: 21px;
  line-height: 1.4;
  color: $home-navy;
  text-align: center;
}
.about-visual {
  position: relative;
  width: 100%;
  height: auto;
  aspect-ratio: 2041 / 770;
  padding: 0;
  overflow: hidden;
  border-radius: 8px;
}
.about-base {
  display: none;
}
.about-photo-slot {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.about-photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.play-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60px;
  height: 60px;
  transform: translate(-50%, -50%);
}
.about-title {
  display: block;
  width: 100%;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.45;
  text-align: center;
  color: $home-navy;
  white-space: normal;
  overflow-wrap: break-word;
}
.about-description {
  display: block;
  width: 100%;
  font-size: 11px;
  line-height: 1.65;
  color: $home-muted;
  text-align: center;
  white-space: normal;
  overflow-wrap: break-word;
}
.about-button {
  width: 130px;
  padding: 10px 8px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  color: #fff;
  background: $home-blue;
}
.services-section {
  padding: 24px 16px;
  background: $home-pale;
}
.services-title {
  display: block;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  line-height: 27px;
  letter-spacing: 1px;
  color: $home-navy;
}
.services-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 12px;
}
.service-card {
  height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 12px;
  border: 0.5px solid $home-line;
  border-radius: 10px;
  background: white;
}
.service-icon-disc {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: $home-pale;
}
.service-icon {
  width: 26px;
  height: 26px;
}
.service-copy {
  text-align: center;
}
.service-name {
  display: block;
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  color: $home-navy;
}
.service-description {
  display: block;
  margin-top: 3px;
  font-size: 10px;
  line-height: 15px;
  color: $home-muted;
}
.personal-buyer {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  height: 84px;
  margin-top: 12px;
  padding: 16px 18px;
  border-radius: 10px;
  background: $home-navy;
  color: white;
  text-align: left;
}
.buyer-icon-disc {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 50%;
  background: $home-blue;
}
.buyer-copy {
  flex: 1;
}
.buyer-title {
  display: block;
  font-size: 15px;
  font-weight: 500;
  line-height: 23px;
}
.buyer-description {
  display: block;
  margin-top: 4px;
  font-size: 11px;
  line-height: 17px;
  opacity: 0.7;
}
.buyer-arrow {
  width: 18px;
  height: 18px;
  margin-right: 18px;
}
.brand-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 12px;
  margin-top: 18px;
}
.brand-card {
  overflow: hidden;
  padding: 0;
  border: 0.7px solid $home-line;
  border-radius: 8px;
  background: white;
}
.brand-cover {
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $home-pale;
}
.brand-logo {
  width: 90%;
  height: 72px;
  mix-blend-mode: multiply;
}
.brand-caption {
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  color: $home-navy;
  font-size: 13px;
  font-weight: 500;
}
.brand-arrow {
  width: 22px;
  height: 22px;
}
.editorial-section {
  padding-top: 10px;
}
.editorial-main {
  width: 100%;
  height: 264px;
  margin-top: 18px;
  padding: 0;
  border: 1px solid rgba(129, 145, 169, 0.08);
  border-radius: 7px;
  background: #fff;
  overflow: hidden;
}
.commute-image-slot {
  position: relative;
  width: 100%;
  height: 198px;
  overflow: hidden;
  border-radius: 8px;
}
.commute-base {
  width: 100%;
  height: 100%;
}
.commute-photo-slot {
  position: absolute;
  top: 1px;
  left: 1px;
  width: calc(100% - 1px);
  height: 196px;
  overflow: hidden;
}
.commute-photo {
  position: absolute;
  top: 0.4%;
  left: -33.41%;
  width: 218.11%;
  height: 132.75%;
}
.editorial-copy {
  padding-top: 8px;
}
.editorial-title {
  display: block;
  font-size: 14px;
  font-weight: 500;
  line-height: 21px;
  color: $home-navy;
  text-align: center;
}
.editorial-description {
  display: block;
  margin-top: 2px;
  font-size: 11px;
  line-height: 17px;
  text-align: center;
  color: $home-muted;
}
.editorial-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}
.editorial-small {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-width: 0;
  height: auto;
  min-height: 188px;
  overflow: hidden;
  padding: 0;
  border: 1px solid rgba(129, 145, 169, 0.08);
  border-radius: 7px;
  background: #fff;
}
.editorial-small .editorial-title {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  margin: 7px 8px 0;
  line-height: 1.45;
  white-space: normal;
  overflow-wrap: break-word;
}
.editorial-small .editorial-copy { width:100%; padding-top:0; }
.editorial-small .editorial-description {
  margin: 5px 8px 12px;
  line-height: 1.5;
  white-space: normal;
  overflow-wrap: break-word;
}
.weekend-image-slot,
.accessories-image-slot {
  position: relative;
  width: 100%;
  height: 100px;
  overflow: hidden;
  border-radius: 8px;
}
.weekend-photo {
  position: absolute;
  width: 246.91%;
  height: 143.4%;
  top: -15.51%;
  left: -14.78%;
}
.accessories-photo {
  position: absolute;
  width: 183.65%;
  height: 106.06%;
  top: 0.2%;
  left: -83.65%;
}
.overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
  background: rgba(15, 34, 51, 0.4);
}
.menu-panel {
  width: min(320px, 88vw);
  height: 100%;
  overflow-y: auto;
  padding: 24px;
  background: white;
}
.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
  color: $home-navy;
  font-size: 20px;
  font-weight: 700;
}
.panel-heading button {
  padding: 0;
  width: 44px;
  height: 44px;
  background: transparent;
  color: $home-navy;
  font-size: 28px;
  line-height: 44px;
}
.menu-panel > button {
  width: 100%;
  padding: 14px 0;
  border-bottom: 1px solid $home-line;
  border-radius: 0;
  background: white;
  color: $home-navy;
  font-size: 15px;
  line-height: 24px;
  text-align: left;
}
.centered-overlay {
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.about-overlay { background: rgba(21, 52, 81, .12); }
.dialog-panel {
  max-width: 400px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  padding: 20px;
  border-radius: 12px;
  background: white;
}
.dialog-description {
  display: block;
  margin: 14px 0;
  font-size: 13px;
  line-height: 1.8;
  color: $home-muted;
}
.consulted-product,
.dialog-about-title {
  display: block;
  font-size: 16px;
  font-weight: 500;
  color: $home-navy;
}
.contact-option {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 12px;
  margin-top: 10px;
  border: 1px solid $home-line;
  border-radius: 6px;
  background: $home-pale;
  color: $home-navy;
  font-size: 12px;
  line-height: 20px;
  text-align: left;
  min-width: 0;
  white-space: normal;
  overflow-wrap: anywhere;
}
@media (max-width: 374px) {
  .home-header {
    gap: 4px;
    padding-inline: 12px;
  }
  .site-name {
    font-size: 13px;
  }
  .about-title {
    font-size: 18px;
  }
  .social-value {
    font-size: 9px;
  }
  .editorial-small .editorial-description {
    font-size: 9px;
  }
}
@media (min-width: 1024px) {
  .home-page { max-width: none; width: 100%; margin-inline: auto; }
  .home-header { height: 96px; padding: 20px 3.125%; gap: 24px; background: #fbf7f1; }
  .site-name { flex: none; font-size: clamp(19px, 1.82vw, 35px); }
  .desktop-navigation { display: flex; flex: 1; justify-content: center; gap: clamp(18px, 3vw, 68px); }
  .desktop-navigation button { padding: 0; background: transparent; color: $home-navy; font-size: clamp(14px, 1.14vw, 22px); white-space: nowrap; }
  .desktop-navigation .active { font-weight: 700; }
  .desktop-search { display: flex; align-items: center; gap: 16px; width: clamp(170px, 18.4vw, 353px); height: 56px; padding: 14px 16px; border: 1px solid #dfd7cf; border-radius: 11px; background: white; color: #adadb1; font-size: 16px; }
  .desktop-search-icon { width: 24px; height: 24px; }
  .desktop-language { display: inline; color: #244e8b; }
  .language-divider { margin: 0 10px; color: #81909d; }
  .language-button { font-size: clamp(16px, 1.25vw, 24px); }
  .menu-button, .search-region { display: none; }
  .mobile-about-section { display: none; }
  .mobile-more-button { display: none; }
  .hero { display: block; width: 100%; height: auto; margin-left: 0; aspect-ratio: 1920 / 722.85; }
  .hero-image-slot { width: 100%; height: 100%; position: absolute; inset: 0; }
  .hero-image { position: absolute; inset: 0; width: 100%; height: 100%; }
  .hero-image-mobile { display: none; }
  .hero-image-pc { display: block; }
  .hero-copy { visibility:hidden; }
  .locale-es .hero::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,#83b8e6 0%,#83b8e6 39%,rgba(131,184,230,0) 59%); pointer-events:none; }
  .locale-es .hero-copy { visibility:visible; z-index:1; inset:auto; top:50%; left:4%; width:40%; padding:0; transform:translateY(-50%); align-items:flex-start; text-align:left; }
  .locale-es .hero-title { color:#fff; font-size:clamp(26px,2.8vw,42px); line-height:1.2; }
  .locale-es .hero-eyebrow { font-size:13px; }
  .social-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 24px; padding: 32px 5.208%; background: #fefbf5; border-bottom: 1px solid #e5dace; }
  .social-card { border: 0; border-radius: 0; padding: 0; background: transparent; align-items: flex-start; }
  .social-label { font-size: clamp(14px, 1.04vw, 20px); }
  .social-value { font-weight: 700; font-size: clamp(12px, 1.25vw, 24px); color: #244e8b; }
  .home-section { padding: 80px 5.208%; }
  .product-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; margin-top: 45px; }
  .about-section { display: block; padding: 0; height: auto; aspect-ratio: 1920 / 722.85; overflow: hidden; }
  .about-visual { position: absolute; inset: 0; height: 100%; border-radius: 0; }
  .about-base, .play-icon { display: none; }
  .about-photo-slot { inset: 0; width: 100%; height: 100%; }
  .about-photo { top: 0; height: 100%; width: 100%; }
  .about-section > .section-title, .about-section > .about-title, .about-section > .about-description { visibility: hidden; position: absolute; }
  .about-section > .about-button { position: absolute; top: 74.6%; left: 4.06%; width: auto; padding: 12px 30px; font-size: clamp(16px, 1.15vw, 22px); line-height: 1.5; }
  .services-section { display: flex; align-items: center; gap: 28px; padding: 26px 5.208%; background: white; border-bottom: 1px solid $home-line;border-top: 1px solid $home-line; }
  .services-title { display: none; }
  .services-grid { display: contents; }
  .desktop-service-icon { display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; flex-shrink: 0; }
  .desktop-service-icon > image { width: 42px !important; height: 42px !important; object-fit: contain; }
  .desktop-buyer-icon { width: 42px; height: 42px; }
  .service-icon-disc, .buyer-icon-disc { display: none; }
  .service-card { flex: 1; min-width: 0; min-height: 60px; height: auto; padding: 4px 0; gap: 16px; border: 0; flex-direction: row; background: transparent; }
  .service-icon-disc, .buyer-icon-disc { width: clamp(44px, 3.4vw, 64px); height: clamp(44px, 3.4vw, 64px); flex-shrink: 0; }
  .service-icon { width: clamp(28px, 2.1vw, 40px); height: clamp(28px, 2.1vw, 40px); }
  .service-copy { text-align: left; }
  .service-name { font-size: clamp(14px, 1.25vw, 24px); font-weight: 700; }
  .service-description { font-size: clamp(10px, .83vw, 16px); margin-top: 8px; line-height: 1.6; }
  .personal-buyer { flex: 1; min-width: 0; min-height: 60px; height: auto; margin: 0; padding: 4px 0; gap: 16px; background: transparent; color: $home-navy; }
  .buyer-icon-disc { background: $home-pale; }
  .buyer-title { font-size: clamp(14px, 1.25vw, 24px); font-weight: 700; }
  .buyer-description { font-size: clamp(10px, .83vw, 16px); margin-top: 8px; line-height: 1.6; color: $home-muted; }
  .buyer-arrow { display: none; }
  .brand-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; margin-top: 45px; }
  .brand-cover { height: 230px; }
  .brand-logo { height: 110px; }
  .brand-caption { height: 65px; font-size: 20px; }
  .editorial-section { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
  .editorial-section > .section-heading { grid-column: 1 / -1; margin-bottom: 25px; }
  .editorial-grid { display: contents; }
  .editorial-main, .editorial-small { position: relative; height: clamp(220px, 16.77vw, 322px); margin: 0; border-radius: 12px; }
  .commute-image-slot, .weekend-image-slot, .accessories-image-slot { height: 100%; }
  .commute-photo-slot { height: 100%; }
  .editorial-copy { position:absolute; bottom:20px; left:20px; right:20px; z-index:2; display:flex; flex-direction:column; gap:4px; width:auto; padding:0; }
  .editorial-small .editorial-title,.editorial-small .editorial-description { justify-content:flex-start; min-height:0; margin:0; }
  .editorial-small .editorial-title { line-height:32px; }
  .editorial-small .editorial-description { line-height:22px; }
  .editorial-title { color: white; text-align: left; font-size: clamp(20px, 1.56vw, 30px); font-weight: 700; line-height: 40px; }
  .editorial-description { color: white; text-align: left; font-size: clamp(12px, 1.04vw, 20px); line-height: 24px; }
  .editorial-copy .editorial-title { display:block; min-height:0; }
  .editorial-copy .editorial-description { display:block; min-height:0; margin:0; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
  .editorial-main::before, .editorial-small::before { content: ''; position: absolute; inset: 50% 0 0; z-index: 1; background: linear-gradient(transparent, #000a); pointer-events: none; }
}
.social-grid { gap: 14px; padding-top: 20px; padding-bottom: 20px; }
.social-card { gap: 10px; padding: 18px 10px; cursor: pointer; }
.social-icon, .social-card:nth-child(3) .social-icon { width: 28px; height: 28px; }
.whatsapp-icon { width: 32px; height: 32px; }
.brand-card, .social-card { transition: transform .28s ease, box-shadow .28s ease, border-color .28s ease, background .28s ease; }
.brand-card { cursor: pointer; }
.brand-logo { transition: transform .45s ease; }
.brand-arrow { transition: transform .25s ease; }
@media (min-width: 1024px) {
  .social-grid { padding-top: 20px; padding-bottom: 20px; gap: 28px; }
  .social-card { padding: 10px 12px; gap: 10px; align-items: center; border-radius: 16px; }
  .social-label { gap: 12px; }
  .social-icon, .social-card:nth-child(3) .social-icon { width: 42px; height: 42px; }
  .whatsapp-icon { width: 48px; height: 48px; }
  .social-value { font-size: clamp(12px, 1.1vw, 21px); }
  .home-section { padding-top: 50px; padding-bottom: 50; }
  .product-grid { column-gap: 28px; row-gap: 36px; }
  .brand-grid { gap: 28px; }
  .brand-caption { padding: 0 24px; height: 76px; }
}
@media (min-width: 1280px) {
  .editorial-section { grid-template-columns: repeat(3, 403px); justify-content: space-between; }
  .editorial-main, .editorial-small { width: 403px; height: auto; aspect-ratio: auto; }
  .commute-image-slot, .weekend-image-slot, .accessories-image-slot { height: auto; aspect-ratio: 403 / 320; }
}
@media (hover: hover) and (pointer: fine) {
  .brand-card:hover { transform: translateY(-7px); border-color: #a8bdd7; box-shadow: 0 18px 38px rgba(27, 56, 94, .12); }
  .brand-card:hover .brand-logo { transform: scale(1.08); }
  .brand-card:hover .brand-arrow { transform: translateX(5px); }
  .social-card:hover { transform: translateY(-3px); background: #fff; border-color: #e5ddd3; box-shadow: 0 8px 20px rgba(27, 56, 94, .08); }
}
@media (prefers-reduced-motion: reduce) {
  .brand-card, .brand-logo, .brand-arrow, .social-card { transition: none; }
}
@media (min-width: 1024px) {
  .site-name { font-size: 25px; }
  .desktop-navigation button, .language-button { font-size: 16px; }
  .desktop-search { font-size: 14px; }
  .social-label { font-size: 16px; }
  .social-value { font-size: 17px; }
  .about-section > .about-button { font-size: 18px; }
  .service-name, .buyer-title { font-size: 18px; }
  .service-description, .buyer-description { font-size: 12px; }
  .brand-caption { font-size: 17px; }
  .editorial-title { font-size: 23px; line-height: 32px; }
  .editorial-description { font-size: 14px; line-height: 22px; }
}
@media (min-width: 1920px) {
  .home-page { max-width: 1400px; }
}
.pc-site-header { display:none; }
@media(min-width:1024px) {
  .mobile-site-header { display:none; }
  .pc-site-header { display:flex; height:clamp(64px,5vw,96px); padding:12px 3.125%; gap:24px; }
  .home-section { padding:clamp(48px,4.7vw,90px) 5.208%; }
  .product-grid { margin-top:32px; gap:28px 20px; }
  .social-grid { padding:16px 5.208%; gap:24px; }
  .social-card { position:relative; width:min(100%, 300px); justify-self:center; align-items:flex-start; padding:8px 42px 8px 64px; gap:0; min-height:58px; box-sizing:border-box; justify-content:center; border:1px solid transparent; border-radius:12px; }
  .social-label { font-size:13px; }
  .social-label .social-icon { position:absolute; left:12px; top:50%; width:36px; height:36px; transform:translateY(-50%); }
  .social-label, .social-value { max-width:100%; min-width:0; overflow:visible; white-space:normal; overflow-wrap:anywhere; }
  .social-value { font-size:clamp(12px,1vw,18px); line-height:1.35; }
  .services-section { gap:20px; padding:20px 5.208%; }
  .service-name,.buyer-title { font-size:clamp(14px,1.15vw,20px); }
  .service-description,.buyer-description { font-size:clamp(10px,.75vw,14px); }
  .editorial-section { grid-template-columns:repeat(3,minmax(0,1fr)); gap:20px; }
  .editorial-main,.editorial-small { width:100%; height:auto; aspect-ratio:560 / 320; overflow:hidden; }
  .commute-image-slot,.weekend-image-slot,.accessories-image-slot { height:100%; aspect-ratio:auto; }
  .editorial-title { font-size:clamp(18px,1.5vw,28px); }
  .editorial-description { font-size:clamp(12px,1vw,18px); }
}
.social-card {
  min-width: 0;
  width: 100%;
  height: auto;
  box-sizing: border-box;
}
.social-value {
  display: block;
  line-height: 1.6;
  text-align: center;
  font-size: 12px;
}
.social-label {
  flex-wrap: wrap;
  justify-content: center;
}
.contact-option > text {
  display: block;
  max-width: 100%;
  min-width: 0;
  white-space: normal;
  overflow-wrap: anywhere;
}
@media (max-width: 359px) {
  .social-grid { grid-template-columns: minmax(0, 1fr); }
}
@media (min-width: 1024px) and (max-width: 1279px) {
  .social-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (min-width: 1024px) {
  .social-card { padding: 12px 8px 12px 56px; gap: 4px; }
  .social-label { justify-content: flex-start; }
  .social-value { text-align: left; font-size: clamp(10px, .65vw, 12px); font-weight: 500; }
}
</style>
