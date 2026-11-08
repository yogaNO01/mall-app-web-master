<template>
  <view class="pc-product-detail">
    <view class="breadcrumbs">
      <button @click="goHome">{{ t('首页') }}</button><text>›</text>
      <button @click="goCategory">{{ (localized(product, 'productCategoryName') || t('全部商品')) }}</button>
    </view>

    <view class="detail-layout">
      <section class="product-visuals">
        <view class="gallery" :class="{ 'has-secondary': visibleImages.length > 4, 'single-image': visibleImages.length <= 1, 'multiple-images': visibleImages.length > 1 }">
          <view v-if="visibleImages.length > 1" class="thumbs">
            <button
              v-for="(image, index) in visibleImages.slice(0, 4)"
              :key="`${image}-${index}`"
              :class="{ active: currentImage === index }"
              @click="currentImage = index"
            ><image :src="image" mode="aspectFit" /></button>
          </view>
          <view class="main-image" tabindex="0" :aria-label="t('商品图片')" @keydown.left.prevent="moveImage(-1)" @keydown.right.prevent="moveImage(1)">
            <image :src="activeImage" mode="aspectFit" />
            <swiper v-if="visibleImages.length > 1" class="mobile-gallery-swiper" :current="currentImage" circular :duration="300" @change="currentImage = $event.detail.current">
              <swiper-item v-for="(image, index) in visibleImages" :key="index"><image :src="image" mode="aspectFit" /></swiper-item>
            </swiper>
            <button v-if="visibleImages.length > 1" class="gallery-arrow previous" @click="moveImage(-1)">‹</button>
            <button v-if="visibleImages.length > 1" class="gallery-arrow next" @click="moveImage(1)">›</button>
            <view v-if="visibleImages.length > 1" class="gallery-dots">
              <button v-for="(_, index) in visibleImages" :key="index" :class="{ active: currentImage === index }" @click="currentImage = index" />
            </view>
            <text v-if="visibleImages.length > 1" class="mobile-image-count">{{ t(currentImage + 1) }} / {{ t(visibleImages.length) }}</text>
          </view>
          <view v-if="visibleImages.length > 4" class="thumbs secondary">
            <button
              v-for="(image, index) in visibleImages.slice(4, 8)"
              :key="`${image}-secondary-${index}`"
              :class="{ active: currentImage === index + 4 }"
              @click="currentImage = index + 4"
            ><image :src="image" mode="aspectFit" /></button>
          </view>
          <scroll-view v-if="visibleImages.length > 1" class="mobile-thumbnails" scroll-x :scroll-into-view="`detail-thumb-${currentImage}`" scroll-with-animation>
            <view class="mobile-thumbnail-track">
              <button v-for="(image, index) in visibleImages" :id="`detail-thumb-${index}`" :key="index" :class="{ active: currentImage === index }" :aria-label="t(`查看第${index + 1}张商品图片`)" @click="currentImage = index"><image :src="image" mode="aspectFit" /></button>
            </view>
          </scroll-view>
        </view>

        <view v-if="recommendations.length" class="recommendations">
          <view class="section-heading">
            <text>{{ t('猜你喜欢') }}</text>
            <button v-if="hasMoreRecommendations" :disabled="recommendationsLoading" @click="loadRecommendations">{{ t(recommendationsLoading ? '加载中…' : '换一批 ↻') }}</button>
          </view>
          <view class="recommendation-grid">
            <home-product-card
              v-for="item in recommendations"
              :key="item.id"
              :product="item"
              color-asset="/static/home/126cc.svg"
              :show-color-preview="false"
              hide-mobile-consult-icon
              variant="catalog"
              @detail="openProduct"
            />
          </view>
        </view>
        <view class="information-card below-recommendations">
          <view class="info-section">
            <button class="info-heading" :aria-expanded="openSections.details" @click="toggleSection('details')">
              <text>{{ t('商品详情') }}</text><view class="toggle-label"><text>{{ t(openSections.details ? '收起' : '展开') }}</text><image class="toggle-chevron" :class="{ expanded: openSections.details }" src="/static/home/detail-arrow.svg" mode="aspectFit" aria-hidden="true" /></view>
            </button>
            <detail-collapse :open="openSections.details">
              <view class="info-box attributes">
              <view v-if="product.productSn"><text>{{ t('款号') }}</text><text>{{ t(product.productSn) }}</text></view>
              <view v-if="product.brandName"><text>{{ t('品牌') }}</text><text>{{ localized(product, 'brandName') }}</text></view>
              <view v-if="product.productCategoryName"><text>{{ t('分类') }}</text><text>{{ localized(product, 'productCategoryName') }}</text></view>
              <view v-for="item in generalAttributes" :key="item.key"><text>{{ localized(item, 'key') }}</text><text>{{ localized(item, 'value') }}</text></view>
            </view>
            </detail-collapse>
          </view>
          <view v-if="product.subTitle || product.description" class="info-section">
            <button class="info-heading" :aria-expanded="openSections.description" @click="toggleSection('description')">
              <text>{{ t('商品描述') }}</text><view class="toggle-label"><text>{{ t(openSections.description ? '收起' : '展开') }}</text><image class="toggle-chevron" :class="{ expanded: openSections.description }" src="/static/home/detail-arrow.svg" mode="aspectFit" aria-hidden="true" /></view>
            </button>
            <detail-collapse :open="openSections.description">
              <view class="info-box description-text">{{ (localized(product, 'description') || localized(product, 'subTitle')) }}</view>
            </detail-collapse>
          </view>
          <view v-if="product.detailMobileHtml" class="info-section">
            <button class="info-heading" :aria-expanded="openSections.content" @click="toggleSection('content')">
              <text>{{ t('图文详情') }}</text><view class="toggle-label"><text>{{ t(openSections.content ? '收起' : '展开') }}</text><image class="toggle-chevron" :class="{ expanded: openSections.content }" src="/static/home/detail-arrow.svg" mode="aspectFit" aria-hidden="true" /></view>
            </button>
            <detail-collapse :open="openSections.content">
              <view class="rich-detail"><rich-text :nodes="localized(product, 'detailMobileHtml')" /></view>
            </detail-collapse>
          </view>
        </view>
      </section>

      <aside class="purchase-panel">
        <view class="purchase-card">
          <view class="title-row">
            <text class="product-title">{{ (localized(product, 'name') || t('商品详情')) }}</text>
            <text v-if="product.newStatus === 1" class="new-badge">{{ t('新品') }}</text>
          </view>
          <view class="sku-line">
            <text>{{ t('货号：') }}</text>
            <text class="sku-value">{{ product.productSn || '--' }}</text>
            <button v-if="product.productSn" class="sku-copy" :aria-label="t('复制货号')" @click="copyProductSn">{{ t('复制') }}</button>
          </view>
          <view class="price-row">
            <view class="detail-region-picker"><card-region-picker :model-value="detailRegion" @update:model-value="previewRegion = $event" /></view>
            <view class="price-values" aria-live="polite"><text class="price">{{ detailPrice('price') }}</text><text v-if="hasProductOriginalPrice(product, detailRegion)" class="old-price">{{ detailPrice('originalPrice') }}</text></view>
          </view>
          <text class="freight-summary" aria-live="polite">{{ t('运费') }}: {{ detailFreight }}</text>
          <text v-if="product.subTitle || product.description" class="subtitle">{{ (localized(product, 'subTitle') || localized(product, 'description')) }}</text>

          <view v-for="spec in specList" :key="spec.id" class="spec-block">
            <view class="spec-label"><text class="required">*</text>{{ localized(spec, 'name') }}：<b>{{ displayOption(spec, selectedValue(spec.id)) }}</b></view>
            <view class="spec-options">
              <button
                v-for="option in optionsFor(spec.id)"
                :key="option.name"
                :class="['spec-option', { selected: option.selected, 'color-spec-option': isColorSpec(spec.name) }]"
                :title="displayOption(spec, option.name)"
                :aria-pressed="!!option.selected"
                :disabled="!isSkuOptionAvailable(option, specOptions, skus)"
                @click="selectSpec(option)"
              ><text v-if="isColorSpec(spec.name)" class="spec-color-dot" :style="{ backgroundColor: parseProductColor(option.name).color }" />{{ displayOption(spec, option.name) }}</button>
            </view>
          </view>

          <view class="quantity-row"><text>{{ t('购买数量') }}</text><view class="stepper"><button :aria-label="t('减少数量')" :disabled="quantity <= 1" @click="quantity = Math.max(1, quantity - 1)">−</button><text>{{ t(quantity) }}</text><button :aria-label="t('增加数量')" :disabled="quantity >= availableStock" @click="quantity += 1">+</button></view><text class="stock-hint">{{ t(availableStock > 0 ? `库存 ${availableStock} 件` : '该规格暂时无货') }}</text></view>
          <view class="primary-actions">
            <button class="consult" @click="consultOnWhatsApp(product)"><image src="/static/home/whatsapp-white.svg" mode="aspectFit" /><text class="consult-desktop-label">{{ t(availableStock > 0 ? 'WhatsApp 咨询购买' : 'WhatsApp 咨询库存') }}</text><text class="consult-mobile-label">{{ t('咨询') }}</text></button>
            <button class="share" @click="shareProduct">{{ t('↗  分享链接') }}</button>
          </view>
        </view>

        <view v-if="materialAttributes.length" class="information-card">
          <view v-if="materialAttributes.length" class="info-section">
            <button class="info-heading" :aria-expanded="openSections.material" @click="toggleSection('material')">
              <text>{{ t('材质与保养') }}</text><view class="toggle-label"><text>{{ t(openSections.material ? '收起' : '展开') }}</text><image class="toggle-chevron" :class="{ expanded: openSections.material }" src="/static/home/detail-arrow.svg" mode="aspectFit" aria-hidden="true" /></view>
            </button>
            <detail-collapse :open="openSections.material">
              <view class="info-box attributes">
              <view v-for="item in materialAttributes" :key="item.key"><text>{{ localized(item, 'key') }}</text><text>{{ localized(item, 'value') }}</text></view>
            </view>
            </detail-collapse>
          </view>
        </view>
      </aside>
    </view>
  </view>
</template>

<script setup lang="ts">
import { t, localized, localizedOption, locale, type ContentTranslations } from '@/i18n'

import { computed, onBeforeUnmount, ref, watch } from 'vue'
import HomeProductCard from '@/components/home-product-card.vue'
import CardRegionPicker from '@/components/card-region-picker.vue'
import DetailCollapse from '@/components/detail-collapse.vue'
import { searchProductListAPI } from '@/apis/product'
import { consultOnWhatsApp } from '@/utils/whatsapp'
import { isColorSpec, parseProductColor } from '@/utils/product-colors'
import type { PmsProduct, PmsProductAttribute, PmsSkuStock, SpecOption } from '@/types/product'
import { availableSkuStock, findSelectedSku, isSkuOptionAvailable } from '@/utils/sku-selection'
import { copyText } from '@/utils/clipboard'
import { formatProductMoney, hasProductOriginalPrice, formatFreight, market, type PriceRegion, type ProductMoneyField } from '@/utils/money'
import { useProductSearch } from '@/composables/use-product-search'
const { searchProducts } = useProductSearch()

const props = defineProps<{
  product: PmsProduct
  images: string[]
  specList: PmsProductAttribute[]
  specOptions: SpecOption[]
  attributes: { key: string; value: string; translations?: ContentTranslations }[]
  skus: PmsSkuStock[]
}>()
const emit = defineEmits<{ (event: 'select-spec', option: SpecOption): void }>()

const currentImage = ref(0)
const quantity = ref(1)
const previewRegion = ref<PriceRegion>()
const detailRegion = computed(() => previewRegion.value || market.value)
const compactCurrency = (value: string) => value.replace(/^(CNY|USD|EUR)\s/, '')
const detailPrice = (field: ProductMoneyField) => compactCurrency(formatProductMoney(props.product, field, detailRegion.value))
const detailFreight = computed(() => compactCurrency(formatFreight(quantity.value, detailRegion.value)))
const recommendations = ref<PmsProduct[]>([])
const recommendationPage = ref(1)
const recommendationsLoading = ref(false)
const hasMoreRecommendations = ref(false)
let recommendationRequest = 0
const selectedSku = computed(() => findSelectedSku(props.skus, props.specOptions.filter(option => option.selected), props.specList.length))
const availableStock = computed(() => props.skus.length ? selectedSku.value ? availableSkuStock(selectedSku.value) : 0 : Math.max(0, Number(props.product.stock) || 0))
watch(availableStock, stock => { quantity.value = Math.max(1, Math.min(quantity.value, stock)) })
type SectionKey = 'details' | 'material' | 'description' | 'content'
const closedSections = (): Record<SectionKey, boolean> => ({ details: false, material: false, description: false, content: false })
const openSections = ref<Record<SectionKey, boolean>>(closedSections())
const visibleImages = computed(() => props.images.filter(Boolean).slice(0, 8))
const activeImage = computed(() => visibleImages.value[currentImage.value] || props.product.pic || '/static/errorImage.jpg')
const attrList = computed(() => props.attributes.filter((item) => item.value))
const materialAttributes = computed(() => attrList.value.filter((item) => /材质|面料|成分|保养|洗涤|material|fabric|care/i.test(item.key)))
const generalAttributes = computed(() => attrList.value.filter((item) => !materialAttributes.value.includes(item)))

const optionsFor = (id: number) => props.specOptions.filter((item) => item.pid === id)
const selectedValue = (id: number) => optionsFor(id).find((item) => item.selected)?.name || '请选择'
const displayOption = (spec: PmsProductAttribute, value: string) => localizedOption(spec, value)
const selectSpec = (option: SpecOption) => emit('select-spec', option)
const toggleSection = (section: SectionKey) => { openSections.value[section] = !openSections.value[section] }
const moveImage = (direction: number) => { if (visibleImages.value.length) currentImage.value = (currentImage.value + direction + visibleImages.value.length) % visibleImages.value.length }
const goHome = () => uni.switchTab({ url: '/pages/index/index' })
const goCategory = () => searchProducts('', { categoryId: props.product.productCategoryId })
const openProduct = (item: PmsProduct) => uni.navigateTo({ url: `/pages/product/product?id=${item.id}` })

const loadRecommendations = async () => {
  if (!props.product.id || !props.product.productCategoryId) return
  const request = ++recommendationRequest
  const productId = props.product.id
  recommendationsLoading.value = true
  try {
    const response = await searchProductListAPI({ productCategoryId: props.product.productCategoryId, pageNum: recommendationPage.value, pageSize: 7, sort: 0 })
    let items = (response.data?.list || []).filter((item) => item.id !== productId).slice(0, 6)
    if (items.length < 6) {
      const extra = await searchProductListAPI({ ...(response.data.total > 7 ? {productCategoryId:props.product.productCategoryId} : {}),pageNum:1,pageSize:7,sort:0 })
      items = [...new Map([...items,...(extra.data.list || [])].filter(item => item.id !== productId).map(item => [item.id,item])).values()].slice(0,6)
    }
    if (request !== recommendationRequest) return
    recommendations.value = items
    hasMoreRecommendations.value = (response.data?.total || 0) > 7
    recommendationPage.value = recommendationPage.value * 7 >= (response.data?.total || 0) ? 1 : recommendationPage.value + 1
  } catch (error) {
    console.error('加载推荐商品失败:', error)
  } finally {
    if (request === recommendationRequest) recommendationsLoading.value = false
  }
}

const shareProduct = async () => {
  const url = `${window.location.origin}${window.location.pathname}#/pages/product/product?id=${props.product.id}`
  if (await copyText(url)) {
    uni.showToast({ title: t('商品链接已复制'), icon: 'none' })
  } else {
    uni.showModal({ title: t('商品链接'), content: t(url), editable: true, showCancel: false, confirmText: t('完成') })
  }
}

const copyProductSn = async () => {
  const productSn = String(props.product.productSn || '').trim()
  if (!productSn) return
  const copied = await copyText(productSn)
  uni.showToast({ title: t(copied ? '货号已复制' : '复制失败，请手动复制'), icon: 'none' })
}

watch(() => props.product.id, () => { currentImage.value = 0; quantity.value = 1; previewRegion.value = undefined; recommendationPage.value = 1; recommendations.value = []; openSections.value = closedSections(); void loadRecommendations() }, { immediate: true })
onBeforeUnmount(() => { recommendationRequest++ })
</script>

<style lang="scss" scoped>
.stock-hint { color:#81909d; font-size:12px; }
.quantity-row { flex-wrap:wrap; row-gap:10px!important; }
.spec-option:disabled { opacity:.4; cursor:not-allowed; text-decoration:line-through; }
.consult-mobile-label { display:none; }
.stepper button:disabled,.consult:disabled { opacity:.45; cursor:not-allowed; box-shadow:none; }
.spec-color-dot { display:inline-block; width:20px; height:20px; flex:none; border:1px solid #b9c4d1; border-radius:50%; }
.color-spec-option { display:inline-flex; align-items:center; gap:8px; }
.mobile-gallery-swiper,.mobile-thumbnails,.mobile-image-count { display:none; }

@media (min-width:0px) {
  .pc-product-detail {
    --detail-ink:#16324f;
    --detail-blue:#244e8b;
    --detail-muted:#78879a;
    --detail-line:#e5eaf0;
    display:block;
    box-sizing:border-box;
    width:100%;
    padding:30px 3.5% 72px;
    background:#fff;
    color:var(--detail-ink);
  }
  button {
    box-sizing:border-box;
    margin:0;
    padding:0;
    border:0;
    background:transparent;
    color:inherit;
    font:inherit;
    line-height:1.5;
    cursor:pointer;
    transition:background .2s ease,border-color .2s ease,box-shadow .2s ease;
  }
  button::after { border:0; }
  button:focus-visible { outline:2px solid #5082bc; outline-offset:4px; }
  .breadcrumbs { display:flex; align-items:center; gap:12px; margin-bottom:24px; color:var(--detail-muted); font-size:14px; }
  .breadcrumbs button:hover { color:var(--detail-blue); }
  .detail-layout { display:grid; grid-template-columns:minmax(0,1.65fr) minmax(370px,1fr); gap:32px 28px; align-items:stretch; }
  .product-visuals { display:contents; }
  .gallery {
    grid-column:1;
    grid-row:1;
    display:grid;
    grid-template-columns:76px minmax(0,1fr) 76px;
    gap:12px;
    min-width:0;
    align-items:start;
  }
  .thumbs { display:flex; height:auto; align-self:start; flex-direction:column; gap:12px; min-width:0; overflow:visible; }
  .gallery:not(.has-secondary) { grid-template-columns:76px minmax(0,1fr); }
  .gallery.single-image { grid-template-columns:minmax(0,1fr); }
  .thumbs button { position:relative; flex:none; width:100%; aspect-ratio:1; overflow:hidden; border:1px solid var(--detail-line); border-radius:10px; background:#fff; }
  .thumbs button.active { border-color:var(--detail-blue); box-shadow:inset 0 0 0 1px var(--detail-blue); }
  .thumbs button:hover { border-color:#809dbc; }
  .thumbs image { position:absolute; inset:6px; width:calc(100% - 12px); height:calc(100% - 12px); }
  .main-image { position:relative; width:100%; min-width:0; aspect-ratio:1; overflow:hidden; border:1px solid #eef0f3; border-radius:14px; background:#fff; }
  .main-image>image { position:absolute; inset:20px; width:calc(100% - 40px); height:calc(100% - 40px); }
  .gallery-arrow { position:absolute; top:50%; display:flex; align-items:center; justify-content:center; width:36px; height:36px; border:1px solid #e8edf3; border-radius:50%; background:rgba(255,255,255,.95); box-shadow:0 3px 12px #18334a12; font-size:28px; transform:translateY(-50%); }
  .gallery-arrow.previous { left:12px; }
  .gallery-arrow.next { right:12px; }
  .gallery-arrow:hover { background:#edf3fa; border-color:#b4c6dc; }
  .gallery-dots { position:absolute; left:50%; bottom:14px; display:flex; gap:7px; padding:8px 12px; border-radius:24px; background:#ffffffdb; transform:translateX(-50%); }
  .gallery-dots button { width:7px; height:7px; border-radius:50%; background:#c8d2de; transition:width .2s ease,background .2s ease; }
  .gallery-dots button.active { width:20px; border-radius:5px; background:var(--detail-blue); }
  .purchase-panel { grid-column:2; grid-row:1; min-width:0; overflow:hidden; border:1px solid var(--detail-line); border-radius:14px; background:#fff; box-shadow:0 5px 24px #17355305; }
  .purchase-card { padding:28px; }
  .title-row { display:flex; align-items:flex-start; gap:12px; }
  .product-title { min-width:0; color:#142c45; font-size:24px; line-height:1.5; font-weight:700; overflow-wrap:anywhere; }
  .new-badge { flex:none; margin-top:5px; padding:3px 10px; border:1px solid #f3d18b; border-radius:5px; background:#fff3d9; color:#906014; font-size:12px; }
  .sku-line { display:flex; align-items:center; flex-wrap:wrap; gap:4px; margin-top:10px; color:var(--detail-muted); font-size:12px; letter-spacing:.3px; overflow-wrap:anywhere; }
  .sku-value { color:#52667c; font-variant-numeric:tabular-nums; }
  .sku-copy { flex:none; min-height:24px; margin-left:4px; padding:2px 9px; border:1px solid #d7e0eb; border-radius:5px; background:#f7f9fc; color:var(--detail-blue); font-size:11px; line-height:18px; }
  .sku-copy:hover { border-color:#9bb0c9; background:#edf3fa; }
  .price-row { display:flex; flex-wrap:wrap; align-items:center; gap:12px; margin-top:22px; }
  .price-values { display:flex; flex-wrap:wrap; align-items:baseline; gap:12px; min-width:0; }
  .detail-region-picker :deep(.region-trigger) { min-height:38px; padding:6px 10px; font-size:13px; }
  .price { color:var(--detail-blue); font-size:34px; font-weight:700; line-height:1.3; }
  .old-price { color:#96a1af; text-decoration:line-through; font-size:14px; }
  .subtitle { display:block; margin:12px 0 26px; color:var(--detail-muted); font-size:14px; line-height:1.85; overflow-wrap:anywhere; }
  .spec-block { margin-top:24px; }
  .spec-label { margin-bottom:12px; color:#64768a; font-size:14px; }
  .spec-label b { margin-left:5px; color:var(--detail-ink); font-weight:500; }
  .required { margin-right:5px; color:#cf605a; }
  .spec-options { display:flex; flex-wrap:wrap; gap:10px; }
  .spec-option { min-width:44px; min-height:40px; padding:8px 14px; border:1px solid #dae2ec; border-radius:7px; background:#fff; font-size:14px; }
  .spec-option:hover { border-color:#7998bf; background:#f7faff; }
  .spec-option.selected { border-color:var(--detail-blue); background:#edf3fb; color:var(--detail-blue); box-shadow:inset 0 0 0 1px var(--detail-blue); font-weight:700; }
  .quantity-row { display:flex; align-items:center; gap:22px; margin:26px 0; color:#64768a; font-size:14px; }
  .stepper { display:flex; overflow:hidden; border:1px solid #dae2ec; border-radius:7px; }
  .stepper>* { display:flex; align-items:center; justify-content:center; width:38px; height:36px; }
  .stepper>text { border-inline:1px solid #e5eaf0; color:var(--detail-ink); font-variant-numeric:tabular-nums; }
  .stepper button:hover { background:#edf3fb; }
  .primary-actions { display:grid; grid-template-columns:minmax(0,1fr) 116px; gap:10px; padding-top:4px; }
  .primary-actions button { display:flex; align-items:center; justify-content:center; min-height:46px; border-radius:8px; font-size:14px; font-weight:600; }
  .consult { gap:8px; background:var(--detail-blue); color:#fff; box-shadow:0 5px 12px #244e8b14; }
  .consult:hover { background:#183c70; box-shadow:0 5px 15px #244e8b26; }
  .consult image { flex:none; width:20px; height:20px; }
  .share { border:1px solid #cedaeb; background:#fff; color:var(--detail-blue); }
  .share:hover { background:#f3f7fc; border-color:#8fa8c8; }
  .information-card { padding:0 28px 24px; }
  .below-recommendations { grid-column:1 / -1; box-sizing:border-box; width:100%; min-width:0; padding:8px 28px 24px; border:1px solid var(--detail-line); border-radius:14px; }
  .info-section { padding-top:20px; border-top:1px solid var(--detail-line); }
  .info-section+.info-section { margin-top:22px; }
  .below-recommendations>.info-section:first-child { border-top:0; }
  .info-heading { display:flex; align-items:center; justify-content:space-between; width:100%; min-height:40px; margin-bottom:14px; text-align:left; font-size:17px; font-weight:600; }
  .info-heading:hover { color:var(--detail-blue); }
  .toggle-label { display:inline-flex; flex:none; align-items:center; gap:8px; white-space:nowrap; color:var(--detail-muted); font-size:12px; font-weight:400; line-height:1; }
  .toggle-label>text { display:block; flex:none; white-space:nowrap; }
  .toggle-chevron { display:block; flex:none; width:14px; height:14px; transform:rotate(180deg); transition:transform .32s cubic-bezier(.22,1,.36,1); }
  .toggle-chevron.expanded { transform:rotate(0deg); }
  .info-box { border-radius:8px; background:#f5f8fc; color:#4a6079; font-size:14px; line-height:1.85; }
  .attributes { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:0 32px; padding:12px 22px; }
  .attributes>view { display:grid; grid-template-columns:90px minmax(0,1fr); gap:16px; padding:11px 0; overflow-wrap:anywhere; }
  .attributes>view>text:first-child { color:var(--detail-muted); }
  .purchase-panel .attributes { grid-template-columns:1fr; padding:10px 16px; font-size:13px; }
  .description-text { padding:20px 24px; white-space:pre-wrap; overflow-wrap:anywhere; }
  .rich-detail { max-width:900px; margin-inline:auto; overflow:hidden; border-radius:8px; background:#fff; }
  .rich-detail :deep(img) { display:block; max-width:100% !important; height:auto !important; margin-inline:auto; }
  .recommendations { grid-column:1 / -1; box-sizing:border-box; width:100%; min-width:0; padding:24px; border:1px solid var(--detail-line); border-radius:14px; }
  .section-heading { display:flex; align-items:center; justify-content:space-between; margin-bottom:22px; color:var(--detail-ink); font-size:22px; font-weight:700; }
  .section-heading button { padding:6px 12px; border:1px solid #e2e8f0; border-radius:6px; color:var(--detail-muted); font-size:13px; font-weight:400; }
  .section-heading button:hover { background:#f3f7fc; color:var(--detail-blue); }
  .recommendation-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:20px; }
  .recommendation-grid :deep(.product-card) { border:1px solid #e9edf2; border-radius:10px; }
  .recommendation-grid :deep(.product-image) { width:calc(100% - 24px); margin:12px 12px 0; aspect-ratio:1; border-radius:6px; }
  .recommendation-grid :deep(.product-info) { gap:6px; padding:14px 14px 18px; }
  .recommendation-grid :deep(.product-name) { overflow:hidden; white-space:nowrap; text-overflow:ellipsis; color:#24384e; font-size:14px; line-height:24px; }
  .recommendation-grid :deep(.brand) { color:#8795a5; font-size:11px; }
  .recommendation-grid :deep(.price) { color:var(--detail-blue); font-size:20px; }
  .recommendation-grid :deep(.original-price) { font-size:11px; }
  .recommendation-grid :deep(.catalog-detail) { right:12px; bottom:18px; width:26px; height:26px; font-size:22px; box-shadow:0 2px 8px #17355316; }
  .recommendation-grid :deep(.prices) { flex-wrap:wrap; gap:4px; padding-right:26px; }
  .recommendation-grid :deep(.catalog-consult) { top:16px; right:16px; width:28px; height:28px; padding:5px; }
  .recommendation-grid :deep(.catalog-consult image) { width:18px; height:18px; }
}
@media (min-width:1024px) and (max-width:1180px) {
  .pc-product-detail { padding-inline:24px; }
  .detail-layout { grid-template-columns:minmax(0,1.45fr) minmax(350px,1fr); gap:24px 20px; }
  .gallery,.gallery:not(.has-secondary) { grid-template-columns:68px minmax(0,1fr); }
  .gallery.single-image { grid-template-columns:minmax(0,1fr); }
  .thumbs.secondary { display:none; }
  .purchase-card { padding:22px; }
  .purchase-panel .information-card { padding-inline:22px; }
  .primary-actions { grid-template-columns:minmax(0,1fr) 108px; }
  .product-title { font-size:22px; }
}
@media (min-width:1280px) and (max-width:2140px) {
  .recommendation-grid { grid-template-columns:repeat(3,minmax(0,1fr)); gap:18px; }
}
@media (min-width:2141px) {
  .recommendation-grid { grid-template-columns:repeat(6,minmax(0,1fr)); gap:16px; }
}
@media (min-width:1024px) {
  .recommendation-grid :deep(.product-info) { gap:8px; padding:15px 16px 18px; }
  .recommendation-grid :deep(.product-name) { display:-webkit-box; min-height:44px; overflow:hidden; white-space:normal; text-overflow:clip; -webkit-box-orient:vertical; -webkit-line-clamp:2; line-height:22px; }
  .recommendation-grid :deep(.card-pricing-row) { display:grid; grid-template-columns:58px minmax(0,1fr); align-items:start; gap:10px; min-height:50px; margin-top:4px; }
  .recommendation-grid :deep(.region-trigger) { width:58px; min-height:32px; padding:5px 6px; font-size:11px; }
  .recommendation-grid :deep(.card-price-values) { min-width:0; }
  .recommendation-grid :deep(.prices) { display:flex; flex-direction:column; align-items:flex-start; flex-wrap:nowrap; gap:0; min-height:50px; padding:0; }
  .recommendation-grid :deep(.prices .price) { font-size:20px; line-height:29px; }
  .recommendation-grid :deep(.prices .original-price) { font-size:12px; line-height:18px; }
  .recommendation-grid :deep(.freight) { min-height:18px; margin-top:0; padding-right:34px; font-size:12px; line-height:18px; }
  .recommendation-grid :deep(.catalog-detail) { right:14px; bottom:14px; width:28px; height:28px; }
}
@media (max-width:1023px) {
  .pc-product-detail { padding:0 0 calc(28px + env(safe-area-inset-bottom)); color:#153451; }
  .breadcrumbs { gap:9px; margin:0; padding:14px 16px; border-top:1px solid #f0f2f4; font-size:11px; }
  .breadcrumbs button { min-height:20px; }
  .detail-layout { display:flex; flex-direction:column; gap:0; }
  .gallery,.gallery:not(.has-secondary) { display:flex; flex-direction:column; min-height:0; gap:0; width:100%; }
  .gallery .thumbs { display:none; }
  .main-image { flex:none; width:100%; aspect-ratio:1; border:0; border-radius:0; }
  .main-image>image { display:none; }
  .gallery.single-image .main-image>image { display:block; position:absolute; inset:12px; width:calc(100% - 24px); height:calc(100% - 24px); }
  .mobile-gallery-swiper { display:block; width:100%; height:100%; }
  .mobile-gallery-swiper image { display:block; width:100%; height:100%; }
  .gallery-arrow { z-index:1; width:30px; height:30px; font-size:24px; }
  .gallery-arrow.previous { left:10px; }
  .gallery-arrow.next { right:10px; }
  .gallery-dots { z-index:1; bottom:10px; max-width:65%; gap:6px; padding:8px 10px; }
  .gallery-dots button { flex:none; width:6px; height:6px; }
  .gallery-dots button.active { width:14px; }
  .mobile-image-count { display:block; position:absolute; right:16px; bottom:15px; z-index:1; padding:3px 6px; border-radius:4px; background:#ffffffc9; color:#516275; font-size:11px; }
  .mobile-thumbnails { display:block; box-sizing:border-box; width:100%; padding:12px 16px; white-space:nowrap; }
  .mobile-thumbnail-track { display:flex; width:max-content; gap:6px; padding:1px; }
  .mobile-thumbnail-track button { flex:none; width:70px; height:70px; overflow:hidden; border:1px solid #e5e9ec; border-radius:5px; background:#fff; }
  .mobile-thumbnail-track button.active { border-color:#244e76; box-shadow:inset 0 0 0 1px #244e76; }
  .mobile-thumbnail-track image { width:100%; height:100%; }
  .purchase-panel { display:contents; }
  .purchase-card { order:1; padding:12px 16px 24px; }
  .title-row { gap:10px; align-items:flex-start; }
  .product-title { flex:1; font-size:22px; line-height:1.45; }
  .new-badge { margin-top:3px; padding:4px 12px; border:0; border-radius:4px; background:#ffbf3f; color:#153451; font-size:11px; }
  .sku-line { margin-top:8px; font-size:11px; }
  .sku-copy { min-height:26px; padding:3px 10px; font-size:11px; }
  .price-row { margin-top:10px; gap:8px; }
  .price { color:#244e76; font-size:30px; }
  .old-price { font-size:16px; }
  .subtitle { margin:10px 0 16px; color:#81909d; font-size:14px; line-height:1.7; }
  .spec-block { margin-top:18px; }
  .spec-block:first-of-type { border-top:1px solid #e5e9ec; padding-top:16px; }
  .spec-label { margin-bottom:10px; color:#153451; font-size:13px; }
  .spec-options { gap:8px; }
  .spec-option { min-width:52px; min-height:42px; padding:9px 13px; border-color:#e5e9ec; border-radius:4px; background:#f6f7f8; color:#244e76; font-size:13px; }
  .spec-option.selected { border-color:#153451; background:#153451; color:#fff; box-shadow:none; }
  .quantity-row { justify-content:space-between; margin:20px 0 14px; font-size:13px; }
  .stepper { gap:6px; overflow:visible; border:0; }
  .stepper>* { width:44px; height:44px; border:0; border-radius:6px; background:#f6f7f8; }
  .stepper>text { border:0; }
  .primary-actions { grid-template-columns:minmax(0,1fr) 108px; gap:10px; padding:0; }
  .primary-actions button { min-height:44px; border-radius:6px; font-size:13px; }
  .consult { gap:5px; background:#244e76; box-shadow:none; }
  .consult-desktop-label { display:none; }
  .consult-mobile-label { display:inline; }
  .consult image { width:18px; height:18px; }
  .share { border:0; background:#f6f7f8; color:#244e76; }
  .purchase-panel>.information-card { order:2; padding:0 16px 20px; }
  .below-recommendations { order:3; padding:0 16px 20px; border:0; border-radius:0; }
  .info-section { padding-top:14px; }
  .info-section+.info-section { margin-top:20px; }
  .info-heading { min-height:36px; margin-bottom:12px; font-size:15px; }
  .toggle-label { font-size:11px; }
  .attributes,.purchase-panel .attributes { grid-template-columns:1fr; gap:0; padding:10px 14px; font-size:12px; }
  .attributes>view { grid-template-columns:74px minmax(0,1fr); gap:12px; padding:6px 0; }
  .info-box { border-radius:6px; background:#f0f6fd; font-size:12px; line-height:1.8; }
  .description-text { padding:14px; }
  .rich-detail { width:100%; border-radius:5px; }
  .recommendations { order:4; padding:24px 16px; border:0; border-top:8px solid #f6f7f8; border-radius:0; }
  .section-heading { margin-bottom:20px; font-size:19px; }
  .section-heading button { padding:5px 8px; font-size:11px; }
  .recommendation-grid { grid-template-columns:repeat(2,minmax(0,1fr)); gap:18px 12px; }
  .recommendation-grid :deep(.product-card.catalog) { border:1px solid #eef1f4; border-radius:6px; }
  .recommendation-grid :deep(.product-image) { width:calc(100% - 16px); margin:8px 8px 0; aspect-ratio:1; border-radius:4px; }
  .recommendation-grid :deep(.product-info) { gap:6px; padding:12px 8px; }
  .recommendation-grid :deep(.brand) { font-size:10px; }
  .recommendation-grid :deep(.product-name) { font-size:14px; line-height:21px; }
  .recommendation-grid :deep(.prices) { min-height:27px; padding:0; }
  .recommendation-grid :deep(.price) { font-size:19px; line-height:27px; }
  .recommendation-grid :deep(.original-price) { font-size:10px; }
  .recommendation-grid :deep(.product-actions) { gap:6px; }
  .recommendation-grid :deep(.product-actions button) { min-height:36px; padding:7px 2px; font-size:11px; line-height:20px; border-radius:6px; }
  .recommendation-grid :deep(.catalog-consult),.recommendation-grid :deep(.catalog-detail) { display:none; }
}
@media (min-width:600px) and (max-width:1023px) {
  .pc-product-detail { max-width:720px; margin-inline:auto; }
  .main-image { max-height:640px; }
  .recommendation-grid { grid-template-columns:repeat(3,minmax(0,1fr)); }
}
@media (max-width:359px) {
  .product-title { font-size:20px; }
  .primary-actions { grid-template-columns:minmax(0,1fr) 90px; }
  .primary-actions button { font-size:12px; }
  .stepper>* { width:38px; }
}
@media (prefers-reduced-motion:reduce) {
  .pc-product-detail button,.toggle-chevron { transition:none; }
}
</style>
<style scoped>
.price-row .price { white-space:pre-line; font-size:24px; line-height:1.5; }
.freight-summary { display:block; margin-top:8px; color:#81909d; font-size:13px; line-height:1.5; }
.price-row .old-price { white-space:pre-line; line-height:1.5; }
</style>
