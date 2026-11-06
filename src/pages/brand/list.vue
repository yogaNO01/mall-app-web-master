<template>
  <view class="brands-page">
    <h5-site-header />
    <view class="brands-content">
      <view class="brands-heading"><view><text class="eyebrow">{{ t('EXPLORE BRANDS') }}</text><text class="page-title">{{ t('探索品牌') }}</text><text class="page-description">{{ t('从喜欢的品牌出发，发现适合你的品质好物') }}</text></view><view class="brand-search"><input v-model="query" :aria-label="t('查找品牌')" :placeholder="t('按品牌名称查找')" /><button v-if="query" :aria-label="t('清空品牌搜索')" @click="query = ''">×</button></view></view>
      <view v-if="loading && !brands.length" class="brands-grid" :aria-label="t('品牌加载中')"><view v-for="n in 4" :key="n" class="brand-skeleton" /></view>
      <view v-else-if="error && !brands.length" class="brand-empty"><text>{{ t('品牌加载失败，请重试') }}</text><button @click="loadBrands(retryRefresh)">{{ t('重新加载') }}</button></view>
      <view v-else-if="!visibleBrands.length" class="brand-empty"><text>{{ t(query ? '没有找到相关品牌' : '暂无品牌') }}</text><button v-if="query" @click="query = ''">{{ t('清空搜索') }}</button></view>
      <view v-else class="brands-grid"><button v-for="brand in visibleBrands" :key="brand.id" class="brand-card" @click="openBrand(brand)"><view class="brand-visual"><image v-if="brand.logo && !failedLogos.has(brand.id)" :src="brand.logo" mode="aspectFit" @error="failedLogos.add(brand.id)" /><text v-else>{{ t(localized(brand, 'name')) }}</text></view><view class="brand-card-info"><view><text class="brand-name">{{ t(localized(brand, 'name')) }}</text><text v-if="typeof brand.productCount === 'number'" class="brand-count">{{ t(brand.productCount) }} {{ t('件商品') }}</text></view><text class="brand-arrow">›</text></view></button></view>
      <view v-if="brands.length" class="brand-load-more"><button v-if="error" @click="loadBrands(retryRefresh)">{{ t('加载失败，点击重试') }}</button><button v-else-if="hasMore" :disabled="loading" @click="loadBrands()">{{ t(loading ? '加载中…' : '加载更多品牌') }}</button><text v-else>{{ t('已展示全部品牌') }}</text></view>
    </view>
  </view>
</template>
<script setup lang="ts">
import { t, localized, locale } from '@/i18n'

import { computed, ref } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import H5SiteHeader from '@/components/h5-site-header.vue'
import { getBrandRecommendListAPI } from '@/apis/brand'
import type { PmsBrand } from '@/types/brand'
const brands = ref<PmsBrand[]>([])
const query = ref('')
const loading = ref(false)
const error = ref(false)
const hasMore = ref(true)
const retryRefresh = ref(false)
const failedLogos = ref(new Set<number>())
const normalizeBrandSearch = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const visibleBrands = computed(() => brands.value.filter(brand => normalizeBrandSearch(`${brand.name} ${localized(brand, 'name')}`).includes(normalizeBrandSearch(query.value.trim()))))
let page = 1
let request = 0
const loadBrands = async (refresh = false) => {
  if (loading.value || (!refresh && !hasMore.value)) { if (refresh) uni.stopPullDownRefresh(); return }
  const current = ++request
  loading.value = true
  error.value = false
  const nextPage = refresh ? 1 : page
  try {
    const response = await getBrandRecommendListAPI({ pageNum:nextPage,pageSize:12 })
    if (current !== request) return
    const incoming = response.data || []
    brands.value = [...new Map([...(refresh ? [] : brands.value),...incoming].map(brand => [brand.id,brand])).values()]
    page = nextPage + 1
    hasMore.value = incoming.length === 12
  } catch { if (current === request) { error.value = true;retryRefresh.value = refresh } }
  finally { if (current === request) loading.value = false; if (refresh) uni.stopPullDownRefresh() }
}
const openBrand = (brand: PmsBrand) => uni.navigateTo({url:'/pages/brand/brandDetail?id='+brand.id})
onLoad(() => { void loadBrands() })
onReachBottom(() => { void loadBrands() })
onPullDownRefresh(() => { void loadBrands(true) })
</script>
<style scoped>
.brands-page { min-height:100vh; background:#fff; color:#153451; }
.brands-content { padding:44px 3.2% 64px; }
.brands-heading { display:flex; justify-content:space-between; align-items:flex-end; gap:32px; margin-bottom:30px; }
.eyebrow { display:block; color:#81909d; font-size:11px; letter-spacing:3px; }
.page-title { display:block; margin:10px 0 12px; font-size:34px; font-weight:700; }
.page-description { color:#81909d; font-size:14px; line-height:1.7; }
.brand-search { display:flex; align-items:center; flex:0 1 280px; padding:0 14px; border:1px solid #dfe6ee; border-radius:22px; background:#f6f8fa; }
.brand-search input { min-width:0; flex:1; height:42px; font-size:13px; }
button { margin:0; border:0; box-shadow:none; cursor:pointer; }
button::after { border:0; }
button:focus-visible { outline:2px solid #7199c4; outline-offset:3px; }
.brand-search button { padding:0; width:28px; background:transparent; color:#81909d; font-size:23px; }
.brands-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:24px; }
.brand-card { display:block; min-width:0; padding:0; overflow:hidden; border:1px solid #e4eaf0; border-radius:12px; background:#fff; text-align:left; transition:box-shadow .2s,transform .2s; }
.brand-visual { display:flex; align-items:center; justify-content:center; aspect-ratio:480/260; background:#f6f7f8; }
.brand-visual image { display:block; width:100%; height:100%; }
.brand-visual text { font-size:22px; font-weight:700; }
.brand-card-info { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:18px; }
.brand-name { display:block; color:#153451; font-size:17px; font-weight:600; line-height:1.5; }
.brand-count { display:block; margin-top:5px; color:#81909d; font-size:12px; line-height:1.5; }
.brand-arrow { display:flex; align-items:center; justify-content:center; flex:none; width:28px; height:28px; border-radius:50%; background:#f1f5f9; color:#4d6e8d; font-size:24px; }
.brand-load-more,.brand-empty { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px; padding:40px 16px; color:#81909d; font-size:13px; }
.brand-empty { min-height:240px; }
.brand-load-more button,.brand-empty button { padding:10px 22px; border:1px solid #cfdbe8; border-radius:6px; color:#244e76; background:#fff; font-size:13px; }
.brand-skeleton { min-height:230px; border-radius:12px; background:#f2f5f8; }
@media(hover:hover) { .brand-card:hover { transform:translateY(-3px); box-shadow:0 12px 28px #15345112; } }
@media(min-width:600px) and (max-width:1023px) { .brands-grid { grid-template-columns:repeat(3,minmax(0,1fr)); } }
@media(max-width:599px) { .brands-content { padding:28px 16px 44px; } .brands-heading { align-items:stretch; flex-direction:column; gap:22px; margin-bottom:22px; } .page-title { font-size:28px; } .page-description { font-size:13px; } .brand-search { flex:auto; } .brands-grid { grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px 12px; } .brand-card-info { padding:14px 12px; gap:8px; } .brand-name { font-size:15px; } }
@media(prefers-reduced-motion:reduce) { .brand-card { transition:none; } }
@media(max-width:1023px) { .brand-search input { font-size:16px; } }
</style>
