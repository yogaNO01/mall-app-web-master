<template>
  <view class="brand-page">
    <h5-site-header />
    <view class="brand-body">
      <view class="breadcrumbs"><button @click="goHome">{{ t('首页') }}</button><text>›</text><button @click="goProducts">{{ t('全部商品') }}</button><text>›</text><text>{{ (localized(brand, 'name') || t('品牌详情')) }}</text></view>
      <view v-if="brandLoading" class="brand-skeleton" :aria-label="t('品牌加载中')" />
      <view v-else-if="brandError" class="empty-state">
        <text>{{ t('品牌信息加载失败') }}</text><button v-if="queryParam.brandId" @click="loadBrandDetail(queryParam.brandId)">{{ t('重新加载') }}</button>
      </view>
      <template v-else>
        <view v-if="brand.bigPic" class="brand-cover">
          <image class="brand-cover-mobile" :src="brand.bigPic" mode="widthFix" />
          <image class="brand-cover-pc" :src="brand.bigPic" mode="aspectFill" />
        </view>
        <view class="brand-overview" :class="{ 'with-cover': !!brand.bigPic }">
          <view v-if="brand.logo" class="brand-logo"><image :src="brand.logo" mode="aspectFit" /></view>
          <view class="brand-identity"><text class="brand-eyebrow">{{ t('品牌专区') }}</text><text class="brand-name">{{ localized(brand, 'name') }}</text><text v-if="brand.brandDesc" class="brand-description">{{ localized(brand, 'brandDesc') }}</text></view>
          <button v-if="memberEntriesEnabled" class="favorite-button" :class="{ active: favoriteStatus }" :disabled="favoriteBusy" :aria-pressed="favoriteStatus" @click="handleToggleFavorite"><text>{{ t(favoriteStatus ? '♥' : '♡') }}</text>{{ t(favoriteStatus ? '已关注品牌' : '关注品牌') }}</button>
        </view>
        <view v-if="brand.brandStory" class="brand-story">
          <text class="section-title">{{ t('品牌故事') }}</text>
          <text class="story-content">{{ localized(brand, 'brandStory') }}</text>
        </view>
      </template>
      <view class="brand-products">
        <view class="products-heading"><view><text class="section-title">{{ t('品牌商品') }}</text><text v-if="!productsError && (productList.length || loadingType === 'nomore')" class="product-count">{{ t('共 {count} 件商品', { count: total }) }}</text></view><button @click="goProducts">{{ t('全部商品') }} <text>›</text></button></view>
        <view v-if="!productList.length && loadingType === 'loading'" class="brand-product-grid" :aria-label="t('商品加载中')"><view v-for="n in 4" :key="n" class="product-skeleton" /></view>
        <view v-else-if="!productList.length && !productsError" class="empty-state"><text>{{ t('该品牌暂无商品') }}</text><button @click="goProducts">{{ t('浏览全部商品') }}</button></view>
        <view v-else class="brand-product-grid">
          <home-product-card v-for="item in productList" :key="item.id" :product="item" color-asset="" :show-color-preview="false" variant="catalog" @detail="handleNavToDetail" />
        </view>
        <button class="mobile-brand-more" @click="goProducts">{{ t('全部商品') }} ›</button>
        <view class="load-state" aria-live="polite">
          <template v-if="productsError"><text>{{ t('商品加载失败，请稍后重试') }}</text><button @click="loadData(productList.length ? 'add' : 'refresh')">{{ t('重新加载') }}</button></template>
          <text v-else-if="loadingType === 'loading' && productList.length">{{ t('正在加载更多商品…') }}</text>
          <button v-else-if="loadingType === 'more'" @click="loadData()">{{ t('加载更多商品') }} <text>⌄</text></button>
          <text v-else-if="productList.length">{{ t('已展示全部商品') }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { t, localized, locale } from '@/i18n'

import { ref } from 'vue'
import { memberEntriesEnabled } from '@/config/features'
import H5SiteHeader from '@/components/h5-site-header.vue'
import HomeProductCard from '@/components/home-product-card.vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { getBrandDetailAPI, getBrandProductListAPI } from '@/apis/brand'
import type { BrandProductListParam } from '@/apis/brand'
import {
  createBrandAttentionAPI,
  deleteBrandAttentionAPI,
  getBrandAttentionDetailAPI,
} from '@/apis/memberBrandAttention'
import type { PmsBrand } from '@/types/brand'
import type { PmsProduct } from '@/types/product'
import { useMemberStore } from '@/stores/member'

// ===== 页面数据 =====
// 品牌信息
const brand = ref<PmsBrand>({} as PmsBrand)
// 商品列表
const productList = ref<PmsProduct[]>([])
const total = ref(0)
const productsError = ref(false)
const brandError = ref(false)
const brandLoading = ref(true)
const favoriteBusy = ref(false)
const goHome = () => uni.switchTab({ url: '/pages/index/index' })
const goProducts = () => uni.switchTab({ url: '/pages/category/category' })
// 加载更多状态
const loadingType = ref<'more' | 'loading' | 'nomore'>('more')
// 收藏状态
const favoriteStatus = ref(false)
// 分页请求参数
const queryParam = ref<BrandProductListParam>({
  brandId: 0,
  pageNum: 1,
  pageSize: 12,
})

// ===== 加载品牌详情 =====
const loadBrandDetail = async (id: number) => {
  brandLoading.value = true
  brandError.value = false
  try {
    const res = await getBrandDetailAPI(id)
    if (!res.data) throw new Error('品牌不存在')
    brand.value = res.data
    if (memberEntriesEnabled) void initBrandAttention()
  } catch (error) {
    brandError.value = true
    console.error('加载品牌详情失败', error)
  } finally {
    brandLoading.value = false
  }
}

let productsBusy = false
const loadData = async (type: 'refresh' | 'add' = 'add') => {
  if (!queryParam.value.brandId || productsBusy || (type === 'add' && loadingType.value === 'nomore')) {
    if (type === 'refresh') uni.stopPullDownRefresh()
    return
  }
  productsBusy = true
  productsError.value = false
  loadingType.value = 'loading'
  const pageNum = type === 'refresh' ? 1 : queryParam.value.pageNum
  try {
    const res = await getBrandProductListAPI({ ...queryParam.value, pageNum })
    const list = res.data.list || []
    productList.value = type === 'refresh' ? list : [...productList.value, ...list]
    total.value = res.data.total
    queryParam.value.pageNum = pageNum + 1
    loadingType.value = pageNum >= res.data.totalPage || !list.length ? 'nomore' : 'more'
  } catch (error) {
    productsError.value = true
    loadingType.value = 'more'
    console.error('加载品牌商品失败', error)
  } finally {
    productsBusy = false
    if (type === 'refresh') uni.stopPullDownRefresh()
  }
}

// ===== 初始化收藏状态 =====
const initBrandAttention = async () => {
  const memberStore = useMemberStore()
  if (memberStore.hasLogin) {
    try {
      const res = await getBrandAttentionDetailAPI(brand.value.id)
      favoriteStatus.value = res.data != null
    } catch {
      favoriteStatus.value = false
    }
  }
}

// ===== 收藏/取消收藏 =====
const handleToggleFavorite = async () => {
  if (favoriteBusy.value || !brand.value.id) return
  const memberStore = useMemberStore()
  if (!memberStore.hasLogin) {
    uni.showModal({
      title: t('提示'),
      content: t('你还没登录，是否要登录？'),
      confirmText: t('去登录'),
      cancelText: t('取消'),
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({ url: '/pages/public/login' })
        }
      },
    })
    return
  }

  favoriteBusy.value = true
  try {
    if (favoriteStatus.value) {
      // 取消收藏
      await deleteBrandAttentionAPI(brand.value.id)
      uni.showToast({ title: t('取消收藏成功！'), icon: 'none' })
    } else {
      // 收藏
      await createBrandAttentionAPI({
        brandId: brand.value.id,
        brandName: brand.value.name,
        brandLogo: brand.value.logo,
        brandCity: '',
      })
      uni.showToast({ title: t('收藏成功！'), icon: 'none' })
    }
    favoriteStatus.value = !favoriteStatus.value
  } catch (e) {
    console.error('收藏操作失败', e)
  } finally {
    favoriteBusy.value = false
  }
}

// ===== 跳转商品详情 =====
const handleNavToDetail = (item: PmsProduct) => {
  uni.navigateTo({
    url: `/pages/product/product?id=${item.id}`,
  })
}

// ===== 生命周期 =====
onLoad((options) => {
  const id = Number(options?.id)
  if (!Number.isFinite(id) || id <= 0) {
    brandLoading.value = false
    brandError.value = true
    loadingType.value = 'nomore'
    return
  }
  queryParam.value.brandId = id
  loadBrandDetail(id)
  loadData('refresh')
})

onPullDownRefresh(() => {
  if (!queryParam.value.brandId) { uni.stopPullDownRefresh(); return }
  void loadBrandDetail(queryParam.value.brandId)
  loadData('refresh')
})

onReachBottom(() => {
  if (!productsError.value) loadData()
})
</script>

<style lang="scss" scoped>
@use '@/styles/home-tokens.scss' as *;
.brand-page { width:100%; min-height:100vh; background:#fff; color:$home-navy; font-family:'Noto Sans SC','Microsoft YaHei',sans-serif; }
.brand-body { padding:0 16px calc(32px + env(safe-area-inset-bottom)); }
button { box-sizing:border-box; margin:0; padding:0; border:0; background:transparent; color:inherit; font:inherit; line-height:1.5; cursor:pointer; }
button::after { border:0; }
button:focus-visible { outline:2px solid #7199c4; outline-offset:4px; }
.breadcrumbs { display:flex; flex-wrap:wrap; align-items:center; gap:8px; padding:16px 0; color:$home-muted; font-size:11px; }
.breadcrumbs>text:last-child { color:$home-navy; }
.brand-cover { width:100%; height:auto; overflow:hidden; border-radius:10px; background:#f6f7f8; }
.brand-cover image { display:block; width:100%; }
.brand-cover-mobile { height:auto; }
.brand-cover .brand-cover-pc { display:none; height:100%; }
.brand-overview { display:flex; flex-wrap:wrap; align-items:center; gap:16px; padding:20px 0; }
.brand-logo { display:flex; align-items:center; justify-content:center; flex:none; box-sizing:border-box; width:86px; height:86px; padding:12px; border:1px solid $home-line; border-radius:10px; background:#fff; }
.brand-logo image { width:100%; height:100%; }
.brand-identity { display:flex; flex-direction:column; flex:1; min-width:0; gap:5px; }
.brand-eyebrow { color:$home-muted; font-size:10px; letter-spacing:1px; }
.brand-name { font-size:24px; line-height:1.4; font-weight:700; overflow-wrap:anywhere; }
.brand-description { color:$home-muted; font-size:12px; line-height:1.8; overflow-wrap:anywhere; }
.favorite-button { display:flex; align-items:center; justify-content:center; gap:7px; min-height:38px; padding:8px 15px; border:1px solid #d5dfeb; border-radius:6px; color:$home-blue; font-size:12px; transition:background .2s,border-color .2s; }
.favorite-button>text { font-size:19px; line-height:1; }
.favorite-button.active { border-color:#b4c9e1; background:#edf3fa; }
.favorite-button:disabled { opacity:.6; cursor:wait; }
.section-title { display:block; font-size:18px; font-weight:700; line-height:1.5; }
.brand-story { margin:0 0 28px; padding:20px; border:1px solid #e9edf2; border-radius:10px; background:#f7f9fc; }
.story-content { display:block; margin-top:12px; color:#687b8d; font-size:13px; line-height:1.95; white-space:pre-wrap; overflow-wrap:anywhere; }
.products-heading { display:flex; align-items:center; justify-content:space-between; gap:12px; margin:10px 0 18px; }
.products-heading>view { display:flex; flex-wrap:wrap; align-items:baseline; gap:10px; }
.product-count { color:$home-muted; font-size:11px; }
.products-heading>button { display:none; flex:none; color:$home-blue; font-size:12px; }
.brand-product-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px 12px; }
.brand-product-grid :deep(.product-card.catalog) { border-radius:8px; border-color:#e9edf2; }
.brand-product-grid :deep(.product-image) { width:calc(100% - 20px); margin:10px 10px 0; aspect-ratio:1; }
.brand-product-grid :deep(.product-info) { gap:7px; padding:12px 10px; }
.brand-product-grid :deep(.product-name) { font-size:14px; line-height:22px; }
.brand-product-grid :deep(.price) { font-size:20px; }
.brand-product-grid :deep(.product-actions button) { padding:7px 2px; font-size:11px; }
.empty-state { display:flex; flex-direction:column; align-items:center; gap:18px; padding:48px 20px; border-radius:10px; background:#f7f9fc; color:$home-muted; font-size:14px; }
.empty-state button,.load-state button { padding:10px 22px; border:1px solid #d5dfeb; border-radius:7px; background:#fff; color:$home-blue; font-size:13px; }
.load-state { display:flex; flex-direction:column; align-items:center; gap:12px; padding:28px 0 8px; color:$home-muted; font-size:12px; }
.mobile-brand-more { display:flex; align-items:center; justify-content:center; width:100%; height:40px; margin-top:18px; border:1px solid $home-line; border-radius:6px; background:#fff; color:$home-navy; font-size:13px; line-height:1.4; }
.product-skeleton,.brand-skeleton { border-radius:10px; background:linear-gradient(100deg,#f1f4f7 30%,#fafbfd 50%,#f1f4f7 70%); background-size:200% 100%; animation:brand-loading 1.5s ease-in-out infinite; }
.product-skeleton { aspect-ratio:1 / 1.5; }
.brand-skeleton { height:240px; margin-bottom:24px; }
@keyframes brand-loading { from { background-position:100% 0; } to { background-position:-100% 0; } }
@media(min-width:600px) and (max-width:1023px) { .brand-body { padding-inline:28px; } .brand-product-grid { grid-template-columns:repeat(3,minmax(0,1fr)); } }
@media(min-width:1024px) {
  .mobile-brand-more { display:none; }
  .brand-body { padding:0 3.5% 64px; }
  .breadcrumbs { padding:26px 0; gap:12px; font-size:14px; }
  .brand-cover { height:clamp(260px,24vw,350px); border-radius:14px; }
  .brand-cover .brand-cover-mobile { display:none; }
  .brand-cover .brand-cover-pc { display:block; width:100%; height:100%; }
  .brand-overview { flex-wrap:nowrap; gap:26px; padding:32px 8px; }
  .brand-logo { width:120px; height:120px; padding:20px; border-radius:12px; }
  .brand-name { font-size:34px; }
  .brand-eyebrow { font-size:12px; }
  .brand-description { max-width:740px; font-size:15px; }
  .favorite-button { min-height:44px; margin-left:24px; padding:10px 24px; font-size:14px; white-space:nowrap; }
  .brand-story { margin-bottom:38px; padding:28px 32px; border-radius:12px; }
  .section-title { font-size:24px; }
  .story-content { margin-top:16px; font-size:15px; line-height:2; }
  .products-heading { margin-bottom:24px; }
  .products-heading>button { display:block; }
  .products-heading>view { gap:16px; }
  .product-count,.products-heading>button { font-size:14px; }
  .brand-product-grid { grid-template-columns:repeat(4,minmax(0,1fr)); gap:24px 20px; }
  .brand-product-grid :deep(.product-card.catalog) { border-radius:12px; }
  .brand-product-grid :deep(.product-image) { width:calc(100% - 32px); margin:16px 16px 0; }
  .brand-product-grid :deep(.product-info) { gap:8px; padding:16px 18px 20px; }
  .brand-product-grid :deep(.product-name) { font-size:17px; line-height:26px; }
  .brand-product-grid :deep(.price) { font-size:24px; }
  .brand-product-grid :deep(.prices) { padding-right:30px; flex-wrap:wrap; }
  .brand-product-grid :deep(.catalog-detail) { bottom:20px; }
  .brand-product-grid :deep(.catalog-consult) { top:20px; right:20px; }
  .load-state { padding-top:36px; }
}
@media(hover:hover) { .favorite-button:hover,.load-state button:hover,.empty-state button:hover { background:#edf3fa; border-color:#9fb9d5; } }
@media(prefers-reduced-motion:reduce) { .product-skeleton,.brand-skeleton { animation:none; } .favorite-button { transition:none; } }
</style>
