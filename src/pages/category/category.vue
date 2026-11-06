<template>
  <view class="category-page">
    <h5-site-header />
    <view class="search-area"><storefront-search v-model="searchDraft" submit-on-clear @search="submitSearch" /></view>
    <view class="category-hero"><view v-if="locale === 'pt'" class="category-banner-pt"><view class="category-banner-copy"><text class="category-banner-title">{{ t('探索全品类') }}</text><text class="category-banner-description">{{ t('从日常穿搭到精致配饰，发现属于你的品质好物') }}</text></view></view><template v-else><image class="banner-mobile" src="/static/category/banner-mobile.svg" mode="aspectFit" /><image class="banner-pc" src="/static/category/banner-pc.png" mode="aspectFit" /></template></view>
    <view class="catalog-layout">
    <view class="pc-filter-sidebar">
      <view class="sidebar-heading"><text>{{ t('筛选商品') }}</text><button @click="resetFilters">{{ t('清除全部') }}</button></view>
      <text class="sidebar-title">{{ t('品牌') }}</text>
      <checkbox-group @change="handleBrandChange"><label v-for="brand in filterBrands" :key="brand" class="sidebar-brand"><checkbox :value="brand" :checked="selectedBrands.includes(brand)"/>{{ t(brand) }}</label></checkbox-group>
      <text class="sidebar-title">{{ t('价格区间') }}</text><view class="price-inputs"><input v-model="minPrice" :placeholder="pricePlaceholder('20')" type="number"/><input v-model="maxPrice" :placeholder="pricePlaceholder('5,000')" type="number"/></view>
      <text v-if="priceRangeError" class="filter-error">{{ t(priceRangeError) }}</text>
      <text class="sidebar-title">{{ t('颜色') }}</text><view class="filter-colors"><button v-for="color in availableColors" :key="color.color" :class="{ selected: selectedColors.includes(color.color) }" :style="{ backgroundColor: color.color }" :title="t(`${localized(color, 'name')} ${color.color}`)" :aria-label="t(localized(color, 'name'))" :aria-pressed="selectedColors.includes(color.color)" @click="toggleColor(color.color)" /></view>
      <text class="sidebar-title">{{ t('品质等级') }}</text><view class="quality-list"><button v-for="item in ['高级','中级','基础级']" :key="item" :class="{active:quality===item}" @click="quality=item">{{ t(item) }}</button></view>
      <text class="sidebar-title">{{ t('尺码/规格') }}</text><view class="filter-sizes"><text v-if="!selectedCategory">{{ t('请先选择分类') }}</text><button v-for="size in availableSizes" :key="size" :class="{ selected: selectedSizes.includes(size) }" @click="toggleSize(size)">{{ sizeLabel(size) }}</button></view>
    </view>
    <view class="catalog-main">
    <view class="category-nav"><button :class="{ active: !selectedCategory }" @click="selectCategory()">{{ t('全部') }}</button><button v-for="item in categoryList" :key="item.id" :class="{ active: selectedCategory === item.id }" @click="selectCategory(item.id)">{{ t(localized(item, 'name')) }}</button></view>
    <view class="sort-area"><view class="sort-tabs"><button :class="{ active: sort === 0 }" @click="changeSort(0)">{{ t('排序：综合推荐') }}</button><button :class="{ active: sort === 3 || sort === 4, 'price-asc': sort === 3, 'price-desc': sort === 4 }" @click="togglePrice">{{ t('价格') }} <text class="price-direction">{{ t(sort === 3 ? '↑' : sort === 4 ? '↓' : '↕') }}</text></button><button :class="{ active: sort === 2 }" @click="changeSort(2)">{{ t('销量') }}</button><button :class="{ active: sort === 1 }" @click="changeSort(1)">{{ t('新品') }}</button><button @click="discountOnly = !discountOnly" :class="{ active: discountOnly }">{{ t('折扣') }}</button><button class="selected-effects" @click="filterOpen = true">{{ t('已选效果') }}</button><button class="filter-button" @click="filterOpen = true">{{ t('更多筛选 ☷') }}</button></view><view class="mobile-sort-tabs"><button :class="{ active: sort === 0 }" @click="changeSort(0)">{{ t('综合推荐') }}</button><button :class="{ active: sort === 3 || sort === 4 }" @click="togglePrice">{{ t('价格') }} {{ t(sort === 3 ? '↑' : sort === 4 ? '↓' : '↕') }}</button><button :class="{ active: sort === 1 }" @click="changeSort(1)">{{ t('新品') }}</button><button class="mobile-filter-button" @click="filterOpen = true">{{ t('更多筛选') }}</button></view><view class="result-line"><text>{{ t('共{count}件商品', { count: total }) }}</text><view class="mobile-layout-options"><button :aria-pressed="!listLayout" :aria-label="t('双列展示')" @click="listLayout = false">▦</button><button :aria-pressed="listLayout" :aria-label="t('单列展示')" @click="listLayout = true">☷</button></view></view></view>
    <view class="pc-catalog-tools"><storefront-search v-model="searchDraft" class="catalog-search-field" compact submit-on-clear @search="submitSearch" /><view class="layout-options"><button :aria-pressed="!listLayout" :aria-label="t('网格布局')" @click="listLayout = false"><image :src="listLayout ? '/static/category/layout-grid.png' : '/static/category/layout-grid-active.png'" mode="aspectFit"/></button><button :aria-pressed="listLayout" :aria-label="t('列表布局')" @click="listLayout = true"><image :src="listLayout ? '/static/category/layout-list-active.png' : '/static/category/layout-list.png'" mode="aspectFit"/></button></view><text>{{ t('点击切换商品布局') }}</text></view>
    <view v-if="keyword" class="search-summary"><text>{{ t('“{keyword}”的搜索结果', { keyword }) }}</text><button @click="clearSearch">{{ t('清空搜索') }}</button></view>
    <view v-if="activeFilterChips.length" class="active-filters"><button v-for="chip in activeFilterChips" :key="chip.id" @click="removeFilterChip(chip)">{{ t(chip.label) }} <text>×</text></button><button class="clear-all-filters" @click="resetFilters">{{ t('清空筛选') }}</button></view>
    <view v-if="!productsLoading && !productsError" class="product-grid" :class="{ 'list-layout': listLayout }"><home-product-card v-for="item in productList" :key="item.id" :product="item" color-asset="/static/home/126cc.svg" variant="catalog" hide-mobile-consult-icon @detail="openDetail" @consult="openContact" /></view>
    <view v-if="totalPages > 1" class="mobile-pagination"><button :disabled="currentPage === 1 || productsLoading" @click="goPage(currentPage - 1)">{{ t('上一页') }}</button><template v-for="(page, index) in pageItems" :key="index"><text v-if="page === '…'">…</text><button v-else :class="{ active: currentPage === page }" :disabled="productsLoading" :aria-current="currentPage === page ? 'page' : undefined" @click="goPage(page)">{{ t(page) }}</button></template><button :disabled="currentPage === totalPages || productsLoading" @click="goPage(currentPage + 1)">{{ t('下一页') }}</button></view>
    <view v-if="productsLoading" class="empty-state" role="status" aria-live="polite">{{ t('正在查找商品…') }}</view><view v-else-if="productsError" class="empty-state"><text>{{ t('商品加载失败') }}</text><button @click="loadProducts(currentPage)">{{ t('重新加载') }}</button></view><view v-else-if="!productList.length" class="empty-state"><text>{{ t(keyword ? `没有找到“${keyword}”相关商品` : '暂无匹配商品') }}</text><text class="empty-hint">{{ t('试试其他商品名称、品牌或货号，或调整筛选条件') }}</text><view class="empty-actions"><button v-if="keyword" @click="clearSearch">{{ t('清空搜索') }}</button><button @click="resetFilters">{{ t('重置筛选') }}</button></view></view>
    </view>
    </view>
    <view v-if="contactOpen" v-modal-scroll-lock class="overlay contact-overlay" @click="contactOpen = false"><view class="contact-panel" @click.stop><text>{{ t('咨询购买') }}</text><text>{{ t(localized(consultedProduct, 'name')) }}</text><button @click="contactOpen = false">{{ t('关闭') }}</button></view></view>
    <view v-if="filterOpen" v-modal-scroll-lock class="filter-overlay" @click="filterOpen = false">
      <view class="filter-drawer" role="dialog" aria-modal="true" :aria-label="t('筛选商品')" @click.stop>
        <view class="filter-heading">
          <view class="filter-heading-copy"><text>{{ t('筛选商品') }}</text><text class="filter-description">{{ t('找到适合你的品牌、颜色与规格') }}</text></view>
          <view class="filter-heading-actions">
            <button class="filter-close" :aria-label="t('关闭筛选')" @click="filterOpen = false"><text class="filter-close-label">{{ t('关闭') }} </text><text class="filter-close-symbol">×</text></button>
            <button class="clear-filter desktop-clear-filter" @click="resetFilters">{{ t('清除全部') }}</button>
          </view>
        </view>
        <view class="filter-body">
          <view class="filter-section filter-brand-section">
            <text class="filter-title">{{ t('品牌') }}<text class="filter-section-hint">{{ t('可多选') }}</text></text>
            <checkbox-group class="filter-brand-options" @change="handleBrandChange"><label v-for="brand in filterBrands" :key="brand" class="filter-option" :class="{ selected: selectedBrands.includes(brand) }"><checkbox :value="brand" :checked="selectedBrands.includes(brand)" /><text>{{ t(brand) }}</text></label></checkbox-group>
          </view>
          <view class="filter-section">
            <text class="filter-title">{{ t('颜色') }}<text class="filter-section-hint">{{ t('可多选') }}</text></text>
            <view class="filter-colors"><button v-for="color in availableColors" :key="color.color" :class="{ selected: selectedColors.includes(color.color) }" :style="{ backgroundColor: color.color }" :title="t(`${localized(color, 'name')} ${color.color}`)" :aria-label="t(localized(color, 'name'))" :aria-pressed="selectedColors.includes(color.color)" @click="toggleColor(color.color)" /></view>
          </view>
          <view class="filter-section">
            <text class="filter-title">{{ t('尺码/规格') }}</text>
            <view class="filter-sizes"><text v-if="!selectedCategory">{{ t('请先选择分类') }}</text><text v-else-if="!availableSizes.length">{{ t('此分类暂无可选尺码/规格') }}</text><button v-for="size in availableSizes" :key="size" :class="{ selected: selectedSizes.includes(size) }" :aria-pressed="selectedSizes.includes(size)" @click="toggleSize(size)">{{ sizeLabel(size) }}</button></view>
          </view>
          <view class="filter-section">
            <text class="filter-title">{{ t('价格区间') }}</text>
            <view class="price-inputs"><input v-model="minPrice" type="number" :aria-label="t('最低价格')" :placeholder="pricePlaceholder(t('最低价'))" /><text class="price-separator">—</text><input v-model="maxPrice" type="number" :aria-label="t('最高价格')" :placeholder="pricePlaceholder(t('最高价'))" /></view>
            <text v-if="priceRangeError" class="filter-error">{{ t(priceRangeError) }}</text>
          </view>
          <view class="filter-section">
            <text class="filter-title">{{ t('品质等级') }}</text>
            <view class="quality-list"><button v-for="item in ['高级','中级','基础级']" :key="item" :class="{ active: quality === item }" :aria-pressed="quality === item" @click="quality = item">{{ t(item) }}</button></view>
          </view>
        </view>
        <view class="filter-actions"><button @click="resetFilters">{{ t('重置') }}</button><button @click="applyFilters">{{ t('应用筛选') }}</button><text class="filter-selection-summary">{{ t(activeFilterChips.length ? `已选 ${activeFilterChips.length} 项条件` : '支持组合筛选') }}</text></view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.contact-panel { box-sizing:border-box; max-height:90vh; max-height:90dvh; overflow-y:auto; }
.filter-drawer,.contact-panel { overscroll-behavior:contain; }
.filter-body { display:flex; flex-direction:column; flex-shrink:0; }
.filter-section,.filter-heading-copy { display:flex; flex-direction:column; min-width:0; flex-shrink:0; }
.filter-heading-actions { display:flex; align-items:center; }
.filter-description,.filter-section-hint,.desktop-clear-filter,.filter-selection-summary,.price-separator { display:none; }
.filter-colors,.filter-sizes { display:flex; flex-wrap:wrap; gap:10px; }
.category-page .filter-colors button { flex:none; width:30px; height:30px; margin:0; padding:0; border:1px solid #b8c4d0; border-radius:50%; }
.category-page .filter-colors button.selected { outline:2px solid #244e76; outline-offset:3px; }
.category-page .filter-sizes button { min-width:42px; margin:0; padding:5px 9px; border:1px solid #dce4ed; border-radius:5px; background:#fff; color:#244e76; font-size:12px; line-height:24px; }
.category-page .filter-sizes button.selected { border-color:#244e76; background:#244e76; color:#fff; }
.mobile-sort-tabs,.mobile-layout-options,.mobile-pagination { display:none; }
.category-page .search-area { display:block; height:auto; padding:0; background:transparent; }
.catalog-search-field { width:100%; }
.search-summary { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:0 16px 10px; color:#153451; font-size:13px; }
.search-summary > text { min-width:0; overflow-wrap:anywhere; }
.search-summary button { flex:none; margin:0; padding:5px 0; border:0; background:transparent; color:#73869a; font-size:12px; }
.search-summary button::after { border:0; }
.active-filters { display:flex; align-items:center; flex-wrap:wrap; gap:8px; padding:0 16px 12px; }
.selected-effects,.desktop-clear-filter,.clear-all-filters { display:none !important; }
.category-page .active-filters button { display:flex; align-items:center; gap:8px; margin:0; padding:6px 10px; border:1px solid #dfe8f1; border-radius:18px; background:#f2f6fa; color:#244e76; font-size:12px; line-height:20px; }
.category-page .active-filters button::after { border:0; }
.category-page .active-filters .clear-all-filters { border:0; background:transparent; color:#81909d; }
.filter-error { display:block; padding-top:8px; color:#ae4e4e; font-size:12px; line-height:1.6; }
.empty-actions { display:flex; justify-content:center; gap:12px; margin-top:16px; }
.empty-hint { display:block; margin-top:12px; color:#81909d; font-size:12px; }
@media(min-width:1024px) {
  .category-page .search-area { display:none; }
  .search-summary { margin-left:19.6%; padding:0 3% 16px 0; }
  .active-filters { margin-left:19.6%; padding:0 3% 16px 0; }
  .category-page .mobile-pagination { display:flex; justify-content:center; flex-wrap:wrap; gap:8px; margin-left:19.6%; padding:24px 3% 0 0; }
  .category-page .mobile-pagination button { min-width:32px; margin:0; padding:6px 10px; border:1px solid #dce5ef; border-radius:5px; background:#fff; color:#244e76; font-size:13px; line-height:22px; }
  .category-page .mobile-pagination button.active { background:#244e76; color:#fff; }
  .category-page .mobile-pagination button:disabled { opacity:.4; }
}
@media (max-width:1023px) {
  .category-page { width:100%; max-width:none; }
  .category-page button { box-sizing:border-box; margin:0; cursor:pointer; -webkit-tap-highlight-color:transparent; }
  .category-page button::after { border:0; }
  .category-page .search-area { height:auto; margin:10px 16px 12px; padding:0; background:transparent; }
  .category-page .search-icon { font-size:18px; }
  .category-page .category-hero { margin-top:0; }
  .category-page .category-nav { gap:8px 6px; padding:20px 16px 14px; }
  .category-page .category-nav button { display:flex; align-items:center; justify-content:center; min-width:62px; height:34px; padding:0 16px; border:1px solid #e6ebf0; border-radius:20px; background:#f5f7f9; color:#274463; font-size:12px; font-weight:400; line-height:1.4; }
  .category-page .category-nav button.active { border-color:#153451; background:#153451; color:#fff; }
  .category-page .sort-area { padding:0 16px 12px; }
  .category-page .sort-tabs { display:none; }
  .mobile-sort-tabs { display:grid; grid-template-columns:minmax(0,1.25fr) minmax(0,.78fr) minmax(0,.92fr) minmax(0,1.12fr); overflow:hidden; border:1px solid #e7edf3; border-radius:5px; }
  .category-page .mobile-sort-tabs button { display:flex; align-items:center; justify-content:center; min-width:0; min-height:48px; padding:6px 3px; border:0; border-right:1px solid #edf1f5; border-radius:0; background:#fff; color:#294a6a; font-size:11px; line-height:1.25; text-align:center; white-space:normal; word-break:normal; overflow-wrap:anywhere; }
  .category-page .mobile-sort-tabs button.active { color:#153451; font-weight:600; }
  .category-page .mobile-sort-tabs .mobile-filter-button { border:0; border-radius:4px; background:#153451; color:#fff; }
  .category-page .result-line { align-items:center; min-height:28px; margin-top:8px; color:#81909d; font-size:11px; font-weight:400; }
  .category-page .result-line>text { color:#81909d; font-size:11px; }
  .mobile-layout-options { display:flex; align-items:center; gap:6px; }
  .category-page .mobile-layout-options button { display:flex; align-items:center; justify-content:center; width:28px; height:28px; padding:0; border:0; border-radius:4px; background:transparent; color:#a1afbe; font-size:18px; line-height:1; }
  .category-page .mobile-layout-options button[aria-pressed="true"] { color:#244e76; background:#f2f6fa; }
  .category-page .product-grid { grid-template-columns:repeat(2,minmax(0,1fr)); gap:24px 12px; margin:0; padding:8px 16px 20px; }
  .category-page .product-grid.list-layout { grid-template-columns:minmax(0,1fr); }
  .category-page .product-grid :deep(.product-card.catalog) { border:0; border-bottom:1px solid #f0f3f6; border-radius:0; padding-bottom:16px; box-shadow:none; }
  .category-page .product-grid :deep(.product-image) { display:block; width:100%; margin:0; aspect-ratio:173 / 184; border-radius:4px; background:#fff; }
  .category-page .product-grid :deep(.product-info) { gap:7px; padding:12px 7px 0; }
  .category-page .product-grid :deep(.brand) { color:#8d9aaa; font-size:10px; line-height:15px; }
  .category-page .product-grid :deep(.product-name) { color:#1c2d3c; font-size:14px; font-weight:500; line-height:22px; }
  .category-page .product-grid :deep(.prices) { gap:6px; min-height:28px; }
  .category-page .product-grid :deep(.price) { color:#1e63a4; font-size:20px; line-height:28px; }
  .category-page .product-grid :deep(.original-price) { color:#8d9aaa; font-size:10px; }
  .category-page .product-grid :deep(.color-preview) { width:80px; height:16px; }
  .category-page .product-grid :deep(.product-actions) { display:flex; gap:7px; margin-top:1px; }
  .category-page .product-grid :deep(.product-actions button) { min-height:44px; padding:6px 2px; border-radius:3px; font-size:11px; font-weight:500; line-height:1.25; text-align:center; white-space:normal; word-break:normal; overflow-wrap:anywhere; }
  .category-page .product-grid :deep(.detail-button) { border-color:#e1e8ef; background:#fff; }
  .category-page .product-grid :deep(.consult-button) { background:#244e76; border-color:#244e76; }
  .category-page .product-grid :deep(.consult-icon),.category-page .product-grid :deep(.catalog-consult),.category-page .product-grid :deep(.catalog-detail) { display:none; }
  .category-page .product-grid.list-layout :deep(.product-image) { max-height:360px; aspect-ratio:1.2; }
  .mobile-pagination { display:flex; align-items:center; justify-content:flex-start; flex-wrap:nowrap; gap:8px; max-width:100%; overflow-x:auto; padding:8px 16px calc(28px + env(safe-area-inset-bottom)); scrollbar-width:none; }
  .mobile-pagination::-webkit-scrollbar { display:none; }
  .category-page .mobile-pagination button { display:flex; flex:0 0 auto; align-items:center; justify-content:center; min-width:36px; height:36px; padding:0 11px; border:0; border-radius:7px; background:#f5f7f9; color:#345572; font-size:12px; font-weight:500; line-height:1; }
  .category-page .mobile-pagination button.active { background:#244e76; color:#fff; }
  .category-page .mobile-pagination button:disabled { opacity:.4; cursor:default; }
  .mobile-pagination>text { color:#8d9aaa; font-size:12px; }
  .category-page .empty-state { display:flex; flex-direction:column; align-items:center; gap:16px; padding:48px 16px; font-size:13px; }
  .empty-state button { padding:8px 16px; border:1px solid #dce5ef; border-radius:5px; background:#fff; color:#244e76; font-size:12px; }
  .category-page .filter-drawer {
    box-sizing:border-box;
    height:min(76vh,620px);
    height:min(76dvh,620px);
    max-height:calc(100vh - 24px);
    max-height:calc(100dvh - 24px);
    padding:0;
    overflow:hidden;
    border-radius:20px 20px 0 0;
  }
  .category-page .filter-heading { flex:none; min-height:68px; padding:14px 20px; }
  .category-page .filter-heading button { min-height:40px; padding:8px 0 8px 12px; }
  .category-page .filter-body {
    flex:1;
    min-height:0;
    padding:0 20px 18px;
    overflow-x:hidden;
    overflow-y:auto;
    overscroll-behavior:contain;
    -webkit-overflow-scrolling:touch;
  }
  .category-page .filter-body > * { flex-shrink:0; }
  .category-page .filter-actions {
    position:static;
    flex:none;
    margin:0;
    padding:16px 20px calc(16px + env(safe-area-inset-bottom));
    border-top:1px solid #edf1f5;
  }
}
@media (min-width:600px) and (max-width:1023px) {
  .category-page .product-grid { gap:24px; padding-inline:28px; }
  .category-page .sort-area,.category-page .category-nav { padding-inline:28px; }
}
</style>

<script setup lang="ts">
import { t, localized, locale, type ContentTranslations } from '@/i18n'

import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StorefrontSearch from '@/components/storefront-search.vue'
import { normalizeSearchKeyword, useProductSearch } from '@/composables/use-product-search'
import { useModalScrollLock } from '@/composables/use-modal-scroll-lock'
const vModalScrollLock = useModalScrollLock()
const keyword = ref('')
const searchDraft = ref('')
const route = useRoute()
const router = useRouter()
const { searchProducts } = useProductSearch()
const submitSearch = (value: string) => searchProducts(value, { categoryId: selectedCategory.value })
const clearSearch = () => searchProducts('', { replace: true, categoryId: selectedCategory.value })
const discountOnly = ref(false)
const listLayout = ref(false)
import { onLoad, onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { getCategoryTreeAPI, searchProductListAPI } from '@/apis/product'
import { clearCatalogProductCache, getCatalogProductDetail, readProductSpecs } from '@/utils/catalog-product-details'
import { filterCatalog, validatePriceRange, type CatalogEntry } from '@/utils/filter-catalog'
import type { ProductColor } from '@/utils/product-colors'
import { currencySymbol } from '@/utils/money'
import HomeProductCard from '@/components/home-product-card.vue'
import H5SiteHeader from '@/components/h5-site-header.vue'
import type { CategoryTreeNode, PmsProduct } from '@/types/product'
const categoryList = ref<CategoryTreeNode[]>([]); const productList = ref<PmsProduct[]>([]); const selectedCategory = ref<number>(); const sort = ref(0); const total = ref(0); const menuOpen = ref(false); const filterOpen = ref(false); const contactOpen = ref(false); const consultedProduct = ref<PmsProduct>()
const filterBrands = ref<string[]>([])
const availableColors = ref<ProductColor[]>([])
const availableSizes = ref<string[]>([])
const availableSizeTranslations = ref<Record<string, ContentTranslations>>({})
const sizeLabel = (value: string) => localized({ name: value, translations: availableSizeTranslations.value[value] }, 'name')
const selectedBrands = ref<string[]>([])
const selectedColors = ref<string[]>([])
const selectedSizes = ref<string[]>([])
const minPrice = ref('')
const maxPrice = ref('')
const pricePlaceholder = (value: string) => `${currencySymbol()} ${value}`
const quality = ref('')
const priceRangeError = computed(() => validatePriceRange(minPrice.value,maxPrice.value))
type FilterChip = { id:string; kind:string; value:string; label:string }
const activeFilterChips = computed<FilterChip[]>(() => [
  ...selectedBrands.value.map(value => ({id:'brand:'+value,kind:'brand',value,label:value})),
  ...selectedColors.value.map(value => ({id:'color:'+value,kind:'color',value,label:localized(availableColors.value.find(color => color.color === value), 'name') || value})),
  ...selectedSizes.value.map(value => ({id:'size:'+value,kind:'size',value,label:'尺码 '+value})),
  ...(quality.value ? [{id:'quality',kind:'quality',value:quality.value,label:quality.value}] : []),
  ...(minPrice.value || maxPrice.value ? [{id:'price',kind:'price',value:'',label:t('价格 {min} — {max}', { min: minPrice.value ? `${currencySymbol()} ${minPrice.value}` : `${currencySymbol()} 0`, max: maxPrice.value ? `${currencySymbol()} ${maxPrice.value}` : t('不限') })}] : []),
  ...(discountOnly.value ? [{id:'discount',kind:'discount',value:'',label:'折扣商品'}] : []),
])
const removeFilterChip = (chip:FilterChip) => {
  if (chip.kind === 'brand') selectedBrands.value = selectedBrands.value.filter(value => value !== chip.value)
  if (chip.kind === 'color') selectedColors.value = selectedColors.value.filter(value => value !== chip.value)
  if (chip.kind === 'size') selectedSizes.value = selectedSizes.value.filter(value => value !== chip.value)
  if (chip.kind === 'quality') quality.value = ''
  if (chip.kind === 'price') { minPrice.value = '';maxPrice.value = '' }
  if (chip.kind === 'discount') discountOnly.value = false
}
let facetRequest = 0
let loadedKey: string | null = null
let catalogLoadedAt = 0
let catalogEntries: CatalogEntry[] = []
let catalogPending: { key: string; promise: Promise<CatalogEntry[]> } | undefined
const loadFacets = (categoryId?: number): Promise<CatalogEntry[]> => {
  const queryKeyword = keyword.value
  const key = JSON.stringify([categoryId, queryKeyword])
  if (loadedKey === key && Date.now()-catalogLoadedAt < 60000) return Promise.resolve(catalogEntries)
  if (catalogPending && catalogPending.key === key) return catalogPending.promise
  const request = ++facetRequest
  const promise = (async () => {
    const products: PmsProduct[] = []
    for (let pageNum = 1; ; pageNum++) {
      const response = await searchProductListAPI({ keyword: queryKeyword || undefined, productCategoryId: categoryId, pageNum, pageSize: 100, sort: 0 })
      products.push(...response.data.list)
      if (pageNum >= response.data.totalPage || !response.data.list.length) break
    }
    const entries: CatalogEntry[] = []
    for (let offset = 0; offset < products.length; offset += 6) {
      const results = await Promise.allSettled(products.slice(offset, offset+6).map(async product => {
        const response = await getCatalogProductDetail(product.id)
        const detail = response.data
        const qualityId = detail.productAttributeList?.find(item => item.name === '品质等级')?.id
        return { product, ...readProductSpecs(detail.skuStockList, detail.productAttributeList, detail.productAttributeValueList), quality: detail.productAttributeValueList?.find(item => item.productAttributeId === qualityId)?.value || '' }
      }))
      results.forEach((result, index) => entries.push(result.status === 'fulfilled' ? result.value : { product: products[offset+index], colors: [], sizes: [], quality: '' }))
    }
    if (request === facetRequest && key === JSON.stringify([selectedCategory.value, keyword.value])) {
      catalogEntries = entries
      loadedKey = key
      catalogLoadedAt = Date.now()
      filterBrands.value = [...new Set(products.map(p => p.brandName).filter(Boolean))]
      availableColors.value = [...new Map(entries.flatMap(entry => entry.colors).map(color => [color.color, color])).values()]
      availableSizes.value = categoryId ? [...new Set(entries.flatMap(entry => entry.sizes))] : []
      availableSizeTranslations.value = Object.assign({}, ...entries.map(entry => entry.sizeTranslations || {}))
    }
    return entries
  })()
  catalogPending = { key, promise }
  promise.finally(() => { if (catalogPending?.promise === promise) catalogPending = undefined }).catch(() => {})
  return promise
}
const handleBrandChange = (event: { detail: { value: string[] } }) => { selectedBrands.value = event.detail.value }
const toggleColor = (color: string) => { selectedColors.value = selectedColors.value.includes(color) ? selectedColors.value.filter(item => item !== color) : [...selectedColors.value, color] }
const toggleSize = (size: string) => { selectedSizes.value = selectedSizes.value.includes(size) ? selectedSizes.value.filter(item => item !== size) : [...selectedSizes.value, size] }
const resetFilters = () => { selectedBrands.value = []; selectedColors.value = []; selectedSizes.value = []; minPrice.value = ''; maxPrice.value = ''; quality.value = ''; discountOnly.value = false }
const applyFilters = () => { if (priceRangeError.value) return uni.showToast({title:t(priceRangeError.value),icon:'none'});filterOpen.value = false; void loadProducts() }
const currentPage = ref(1)
const totalPages = ref(0)
const productsLoading = ref(false)
const productsError = ref(false)
const pageItems = computed<(number | '…')[]>(() => {
  const last = totalPages.value
  const current = currentPage.value
  if (last <= 10) return Array.from({ length: last }, (_, index) => index + 1)
  const pages = [...new Set([1, last, current - 1, current, current + 1])].filter(p => p >= 1 && p <= last).sort((a, b) => a - b)
  const items: (number | '…')[] = []
  pages.forEach((page, index) => {
    if (index && page - pages[index - 1] > 1) items.push('…')
    items.push(page)
  })
  return items
})
let productRequest = 0
const loadProducts = async (page = 1) => {
  const request = ++productRequest
  productsLoading.value = true
  productsError.value = false
  try {
    const entries = await loadFacets(selectedCategory.value)
    if (request !== productRequest) return
    const products = filterCatalog(entries, { brands: selectedBrands.value, colors: selectedColors.value, sizes: selectedSizes.value, min: minPrice.value, max: maxPrice.value, quality: quality.value, keyword: '', sort: sort.value, discount: discountOnly.value })
    total.value = products.length
    totalPages.value = Math.ceil(products.length / 12)
    page = Math.max(1, Math.min(page, totalPages.value || 1))
    productList.value = products.slice((page-1)*12,page*12)
    currentPage.value = page
  } catch (error) {
    if (request === productRequest) productsError.value = true
    console.error('加载商品列表失败', error)
  } finally {
    if (request === productRequest) productsLoading.value = false
  }
}
const goPage = async (page: number) => {
  if (productsLoading.value || page < 1 || page > totalPages.value || page === currentPage.value) return
  await loadProducts(page)
  if (!productsError.value) uni.pageScrollTo({ selector: '.sort-area', duration: 250 })
}
const selectCategory = (id?: number) => { void router.replace({ path: route.path, query: { ...route.query, categoryId: id ? String(id) : undefined } }) }
const changeSort = (value: number) => { sort.value = value; void loadProducts() }
const togglePrice = () => { sort.value = sort.value === 3 ? 4 : 3; void loadProducts() }
const openDetail = (product: PmsProduct) => uni.navigateTo({ url: `/pages/product/product?id=${product.id}` })
const openContact = (product: PmsProduct) => { consultedProduct.value = product; contactOpen.value = true }

watch([selectedBrands, selectedColors, selectedSizes, minPrice, maxPrice, quality, discountOnly], () => { void loadProducts() })
watch(locale, () => { minPrice.value = ''; maxPrice.value = ''; void loadProducts(currentPage.value) })

let appliedQueryKey = ''
watch(() => [route.path,route.query.keyword, route.query.categoryId], ([path,query, category]) => {
  if (path !== '/pages/category/category') return
  const queryKey = JSON.stringify([normalizeSearchKeyword(query),category || ''])
  if (queryKey === appliedQueryKey) return
  appliedQueryKey = queryKey
  const previousKeyword = keyword.value
  keyword.value = normalizeSearchKeyword(query)
  if (normalizeSearchKeyword(searchDraft.value) === previousKeyword) searchDraft.value = keyword.value
  const id = Number(category)
  selectedCategory.value = Number.isSafeInteger(id) && id > 0 ? id : undefined
  resetFilters()
  void loadProducts()
}, { immediate: true })
onShow(() => { if (catalogLoadedAt && Date.now()-catalogLoadedAt >= 60000 && !productsLoading.value) void loadProducts(currentPage.value) })
onPullDownRefresh(async () => {
  loadedKey = null; catalogLoadedAt = 0; facetRequest++; catalogPending = undefined; clearCatalogProductCache()
  try { await loadProducts(1) } finally { uni.stopPullDownRefresh() }
})
onLoad(async () => { const response = await getCategoryTreeAPI(); categoryList.value = (response.data || []).sort((a,b) => (b.sort || 0)-(a.sort || 0)) })
</script>

<style lang="scss" scoped>
@use '@/styles/home-tokens.scss' as *;
.category-page { min-height:100vh; max-width:600px; margin:auto; background:#fff; color:$home-ink; font-family:'Noto Sans SC','Microsoft YaHei',sans-serif }.search-area{display:flex;align-items:center;gap:10px;box-sizing:border-box;height:42px;margin:10px 18px;padding:10px 16px;border-radius:22px;background:$home-pale;color:$home-muted;font-size:14px}.search-icon{font-size:22px}.category-hero{position:relative;height:166px;margin-top:10px;overflow:hidden}.category-hero image{width:100%;height:100%}.category-hero text{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:$home-navy;font-size:30px;font-weight:700}.category-nav{display:flex;flex-wrap:wrap;gap:8px 6px;padding:20px 16px}.category-nav button{height:34px;min-width:65px;padding:0 14px;border:1px solid rgba(129,144,157,.12);border-radius:18px;background:$home-pale;color:$home-navy;font-size:12px}.category-nav button.active{background:$home-navy;color:#fff}.sort-area{padding:8px 16px 16px}.sort-tabs{display:grid;grid-template-columns:repeat(4,1fr);overflow:hidden;border:1px solid rgba(129,145,169,.12);border-radius:4px}.sort-tabs button{min-width:0;padding:10px 3px;border:0;border-right:1px solid rgba(129,145,169,.12);background:#fff;color:$home-navy;font-size:12px}.sort-tabs button:last-child{border:0}.sort-tabs button.active{color:$home-blue}.sort-tabs .filter-button{background:$home-navy;color:#fff}.result-line{display:flex;justify-content:space-between;margin-top:8px;color:$home-muted;font-size:11px}.result-line text:last-child{color:$home-blue;font-size:14px}.product-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 12px;padding:16px}.empty-state{padding:60px 0;color:$home-muted;text-align:center}.overlay{position:fixed;inset:0;z-index:10;display:flex;justify-content:flex-end;background:rgba(20,35,54,.35)}.menu-panel{display:flex;flex-direction:column;gap:16px;width:240px;min-height:100%;padding:28px;background:#fff;color:$home-navy}.menu-panel button{padding:10px 0;border:0;background:transparent;color:inherit;text-align:left}.contact-overlay{align-items:center;justify-content:center}.contact-panel{display:flex;flex-direction:column;gap:16px;width:240px;padding:24px;border-radius:12px;background:#fff}.contact-panel button{padding:10px;border:0;border-radius:4px;background:$home-navy;color:#fff}.filter-overlay{position:fixed;inset:0;z-index:100;display:flex;align-items:flex-end;background:rgba(20,35,54,.42)}.filter-drawer{display:flex;flex-direction:column;width:100%;max-height:calc(100vh - 64px);padding:24px 20px calc(18px + env(safe-area-inset-bottom));overflow:auto;border-radius:18px 18px 0 0;background:#fff}.filter-heading{display:flex;align-items:center;justify-content:space-between;font-size:20px;font-weight:700;color:$home-navy}.filter-heading button,.clear-filter{margin:0;padding:4px 0;background:transparent;color:$home-muted;font-size:13px}.clear-filter{text-align:left}.filter-title{margin:16px 0 8px;font-weight:600;color:$home-navy}.filter-option{display:flex;align-items:center;min-height:40px;border-bottom:1px solid $home-line;color:$home-ink;font-size:14px}.filter-option checkbox{transform:scale(.75);transform-origin:left center}.price-inputs,.quality-list,.filter-actions{display:flex;gap:10px}.price-inputs input{width:50%;height:40px;padding:0 12px;border:1px solid $home-line;border-radius:4px;background:$home-pale}.quality-list button{flex:1;height:40px;border:1px solid $home-line;background:#fff;color:$home-navy;font-size:13px}.quality-list button.active{border-color:$home-navy;background:$home-navy;color:#fff}.filter-actions{position:sticky;bottom:calc(-18px - env(safe-area-inset-bottom));margin:22px -20px 0;padding:18px 20px calc(18px + env(safe-area-inset-bottom));background:#fff}.filter-actions button{height:44px;border:1px solid $home-navy;border-radius:4px;background:#fff;color:$home-navy}.filter-actions button:first-of-type{width:110px}.filter-actions button:last-of-type{flex:1;background:$home-navy;color:#fff}@media(max-width:350px){.category-nav{padding-inline:12px}.sort-area,.product-grid{padding-inline:12px}.sort-tabs button{font-size:11px}}@media(min-width:1024px){.category-page{max-width:1400px}.search-area{margin:0 5.208% 16px}.category-hero{height:300px}.category-nav,.sort-area,.product-grid{padding-left:5.208%;padding-right:5.208%}.category-nav{gap:12px}.category-nav button{font-size:14px}.product-grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:28px}.filter-drawer{width:390px;margin:auto}}
/* Final desktop toolbar rules override earlier responsive button sizes. */
@media(min-width:1024px) {
  .sort-tabs { gap:16px; align-items:center; padding-right:100px; }
  .category-page .sort-tabs button { display:flex; align-items:center; justify-content:center; min-width:20px; height:38px; padding:0 10px; border:1px solid #dce3fa; border-radius:8px; background:#f6f7fc; color:#153451; font-size:14px; font-weight:400; line-height:1.4; }
  .sort-tabs button:first-child { min-width: 80px; }
  .sort-tabs button.active { color:#244e8b; font-weight:700; }
  .category-page .sort-tabs .selected-effects { border-color:#dce6fa; background:#f5f8ff; color:#244e76; }
  .category-page:has(.active-filters) .sort-tabs .selected-effects { border-color:#aab8d1; background:#3c5687; color:#fff; }
  .category-page .layout-options button { width:30px; height:30px; padding:0; border:0; background:transparent; }
  .layout-options button image { display:block; width:30px; height:30px; }
  .product-grid.list-layout { grid-template-columns:repeat(2,minmax(0,1fr)); }
}
</style>
<style lang="scss" scoped>
.pc-filter-sidebar { display:none; }
@media(min-width:1024px) {
  .category-page { position:relative; padding-bottom:56px; }
  .search-area { display:none; }
  .category-nav,.sort-area,.product-grid { margin-left:19.6%; padding-left:0; padding-right:3%; }
  .category-nav { padding-top:30px; gap:8px; }
  .category-nav button { min-width:0; height:34px; padding:0 16px; background:#eaf2ff; color:#304f83; border:0; font-size:16px; font-weight:700; line-height:34px; }
  .category-nav button.active { background:#244780; }
  .sort-area { padding-top:0; padding-bottom:16px; }
  .sort-tabs { display:flex; gap:12px; border:0; }
  .sort-tabs button { flex:0 0 auto; height:30px; padding:0 14px; border:1px solid #dce6fa; border-radius:6px; background:#f5f8ff; font-size:14px; line-height:28px; }
  .sort-tabs .filter-button { display:none; }
  .result-line { margin-top:18px; font-size:13px; font-weight:700; }
  .product-grid { grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px 12px; padding-top:0; }
  .pc-filter-sidebar { display:block; position:absolute; top:calc((100vw * 557 / 1920) + 94px); left:3%; width:14.6%; min-height:1040px; padding:16px; border:1px solid #dce6fa; border-radius:6px; }
  .sidebar-heading { display:flex; justify-content:space-between; align-items:center; font-size:16px; font-weight:700; }
  .sidebar-heading button { margin:0; padding:0; background:transparent; font-size:10px; color:#81909d; }
  .sidebar-title { display:block; margin:12px 0 8px; padding-top:12px; border-top:1px solid #dce6fa; font-size:14px; font-weight:700; }
  .sidebar-brand { display:flex; align-items:center; font-size:12px; color:#304f83; line-height:26px; }
  .sidebar-brand checkbox { transform:scale(.6); width:20px; }
  .sidebar-colors { display:flex; gap:6px; }
  .sidebar-colors text { width:14px; height:14px; border-radius:50%; }
  .pc-filter-sidebar .quality-list { gap:4px; }
  .pc-filter-sidebar .quality-list button { padding:0 4px; height:28px; font-size:11px; line-height:26px; }
  .pc-filter-sidebar .price-inputs { gap:4px; }
  .pc-filter-sidebar input { padding:0 4px; font-size:11px; }
}
@media(width > 1440px) { .pc-filter-sidebar { top:calc((1400px * 557 / 1920) + 94px); } }
</style>
<style lang="scss" scoped>
.banner-pc { display:none; }
.pc-catalog-tools { display:none; }
@media(min-width:1024px) {
  .category-nav { padding-right:calc(3% + 255px); min-height:80px; align-content:start; }
  .category-nav button { margin:0; height:34px!important; padding:0 16px; border-radius:999px; border:0; background:#eaf2ff; color:#345588; font-size:16px; font-weight:700; line-height:34px; }
  .category-nav button.active { background:#244780; color:#fff; }
  .category-nav button::after,.sort-tabs button::after,.layout-options button::after { border:0; }
  .pc-catalog-tools { position:absolute; top:calc((100vw * 557 / 1920) + 94px); right:3%; display:flex; flex-direction:column; align-items:flex-end; gap:8px; width:clamp(280px, 22vw, 360px); }
  .catalog-search { display:flex; align-items:center; gap:10px; width:100%; height:40px; padding:0 14px; border:1px solid #e4ded7; border-radius:8px; color:#153451; }
  .catalog-search text { font-size:24px; }
  .catalog-search input { flex:1; min-width:0; font-size:14px; }
  .layout-options { display:flex; gap:12px; }
  .layout-options button { display:flex; align-items:center; justify-content:center; width:32px; height:32px; margin:0; padding:0; border:1px solid #dce6fa; border-radius:3px; background:#fff; color:#345588; font-size:26px; }
  .layout-options button.active { border-color:#819fdb; }
  .pc-catalog-tools > text { color:#81909d; font-size:11px; }
  .sort-tabs { padding-right:110px; overflow:visible; flex-wrap:wrap; }
  .sort-tabs .selected-effects { background:#f5f8ff; color:#345588; }
  .category-page:has(.active-filters) .sort-tabs .selected-effects { background:#345588; color:#fff; }
  .sort-tabs button { margin:0; }
}
@media(width > 1440px) { .pc-catalog-tools { top:calc((1400px * 557 / 1920) + 94px); } }
.category-hero { height:auto!important; aspect-ratio:1170 / 498; margin-top:10px; }
@media(min-width:1024px) { .category-hero { aspect-ratio:1920 / 557; margin-top:0; } .banner-mobile { display:none; } .banner-pc { display:block; } }
@media (min-width: 768px) {
  .category-hero text { font-size:var(--mall-display-title); }
  .search-area { height:clamp(48px,3.5vw,64px); font-size:var(--mall-body-text); }
  .search-icon { font-size:var(--mall-section-title); }
  .category-nav button,.sort-tabs button { height:clamp(40px,3vw,54px); font-size:clamp(13px,.85vw,15px); }
  .result-line,.filter-heading button,.clear-filter { font-size:var(--mall-caption-text); }
  .filter-heading { font-size:var(--mall-section-title); }
  .filter-title,.filter-option { font-size:var(--mall-body-text); }
  .quality-list button,.filter-actions button { font-size:clamp(14px,1.05vw,18px); }
  .product-grid { gap:clamp(24px,2.1vw,38px); padding-top:clamp(28px,2.4vw,44px); padding-bottom:clamp(50px,4vw,72px); }
}
</style>

<style scoped>
@media(min-width:1024px) {
  .catalog-layout { display:grid; grid-template-columns:minmax(260px,22%) minmax(0,1fr); align-items:stretch; gap:30px; padding:30px 3% 56px; }
  .catalog-main { position:relative; min-width:0; }
  .catalog-layout .pc-filter-sidebar { position:static; width:auto; min-height:0; margin:0; align-self:stretch; background:#fff; }
  .catalog-layout .pc-filter-sidebar { padding:20px; border-radius:12px; }
  .catalog-layout .pc-filter-sidebar .sidebar-heading { font-size:20px; line-height:1.25; white-space:nowrap; }
  .catalog-layout .pc-filter-sidebar .sidebar-title { margin:16px 0 10px; padding-top:16px; font-size:15px; line-height:1.35; }
  .catalog-layout .pc-filter-sidebar .sidebar-brand { font-size:13px; line-height:30px; }
  .catalog-layout .pc-filter-sidebar .price-inputs input { height:44px; padding-inline:10px; font-size:13px; }
  .catalog-main .category-nav,.catalog-main .sort-area,.catalog-main .product-grid { margin-left:0; padding-left:0; }
  .catalog-main .category-nav { padding-top:0; padding-right:255px; }
  .catalog-main .sort-area { padding-right:0; }
  .catalog-main .product-grid { padding:12px 0 0; gap:18px 12px; }
  .catalog-main .pc-catalog-tools { top:0; right:0; }
  .catalog-main .search-summary,.catalog-main .active-filters,.catalog-main .mobile-pagination { margin-left:0; padding-right:0; padding-left:0; }
  .catalog-main .empty-state { padding:60px 16px; text-align:center; }

  .category-page .filter-overlay {
    box-sizing:border-box;
    align-items:center;
    justify-content:center;
    padding:28px;
    background:rgba(20,35,54,.38);
  }
  .category-page .filter-drawer {
    box-sizing:border-box;
    width:720px;
    max-width:100%;
    max-height:min(80vh,700px);
    max-height:min(80dvh,700px);
    margin:0;
    padding:0;
    overflow:hidden;
    border:1px solid rgba(255,255,255,.75);
    border-radius:18px;
    box-shadow:0 24px 80px rgba(20,35,54,.2);
  }
  .category-page .filter-drawer button {
    box-sizing:border-box;
    margin:0;
    cursor:pointer;
    transition:background-color .18s,border-color .18s,color .18s,box-shadow .18s;
  }
  .category-page .filter-drawer button::after { border:0; }
  .category-page .filter-heading {
    flex:none;
    gap:24px;
    padding:24px 28px 22px;
    border-bottom:1px solid #edf1f5;
    font-size:22px;
    line-height:1.4;
  }
  .filter-heading-copy { gap:6px; }
  .category-page .filter-description {
    display:block;
    color:#8a98a8;
    font-size:13px;
    font-weight:400;
    line-height:20px;
  }
  .category-page .filter-heading-actions { flex:none; gap:20px; }
  .category-page .filter-heading .desktop-clear-filter {
    display:block;
    order:-1;
    padding:8px 0;
    border:0;
    color:#7a899a;
    font-size:13px;
    font-weight:400;
    line-height:20px;
  }
  .category-page .filter-heading .desktop-clear-filter:hover { color:#244e76; }
  .category-page .filter-heading .filter-close {
    display:flex;
    align-items:center;
    justify-content:center;
    width:34px;
    height:34px;
    padding:0;
    border:0;
    border-radius:50%;
    background:#f3f6f9;
    color:#6e8094;
    line-height:1;
  }
  .category-page .filter-heading .filter-close:hover { background:#e7eef5; color:#153451; }
  .category-page .filter-close-label { display:none; }
  .category-page .filter-close-symbol { font-size:25px; font-weight:300; }
  .category-page .filter-body {
    display:grid;
    grid-template-columns:repeat(2,minmax(0,1fr));
    align-content:start;
    flex:1 1 auto;
    min-height:0;
    gap:26px 28px;
    padding:24px 28px 28px;
    overflow-x:hidden;
    overflow-y:auto;
    overscroll-behavior:contain;
    scrollbar-width:thin;
    scrollbar-color:#ccd6e1 transparent;
  }
  .category-page .filter-body::-webkit-scrollbar { width:5px; }
  .category-page .filter-body::-webkit-scrollbar-thumb { border-radius:5px; background:#ccd6e1; }
  .category-page .filter-section { display:flex; flex-direction:column; gap:12px; }
  .category-page .filter-brand-section { grid-column:1 / -1; }
  .category-page .filter-title {
    display:flex;
    align-items:center;
    gap:8px;
    margin:0;
    color:#203b58;
    font-size:14px;
    font-weight:600;
    line-height:20px;
  }
  .category-page .filter-section-hint { display:inline; margin-left:8px; color:#98a4b2; font-size:11px; font-weight:400; }
  .filter-brand-options { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:8px; }
  .category-page .filter-option {
    box-sizing:border-box;
    gap:8px;
    min-height:42px;
    padding:8px 12px;
    border:1px solid #e5ebf1;
    border-radius:7px;
    color:#52667b;
    font-size:13px;
    line-height:20px;
    cursor:pointer;
    transition:background-color .18s,border-color .18s;
  }
  .category-page .filter-option:hover { border-color:#adc0d4; background:#f8fafc; }
  .category-page .filter-option.selected { border-color:#9cb3cb; background:#f0f5fa; color:#244e76; }
  .category-page .filter-option checkbox { flex:none; transform:none; }
  .filter-option :deep(.uni-checkbox-input) { box-sizing:border-box; width:16px; height:16px; margin:0; border-color:#cbd6e2; border-radius:4px; }
  .filter-option.selected :deep(.uni-checkbox-input) { border-color:#244e76; background:#244e76; }
  .filter-option :deep(.uni-checkbox-input svg) { width:12px; height:12px; }
  .filter-option.selected :deep(.uni-checkbox-input path) { fill:#fff; }
  .category-page .filter-drawer .filter-colors { align-items:center; gap:13px; min-height:38px; padding-inline:4px; }
  .category-page .filter-drawer .filter-colors button { width:28px; height:28px; border-color:rgba(32,59,88,.18); }
  .category-page .filter-drawer .filter-sizes { gap:8px; align-items:center; min-height:38px; }
  .category-page .filter-drawer .filter-sizes button { min-width:40px; height:36px; padding:0 10px; font-size:13px; line-height:34px; }
  .category-page .filter-drawer .filter-sizes button:hover { border-color:#244e76; }
  .category-page .filter-drawer .filter-sizes > text { color:#8a98a8; font-size:12px; line-height:20px; }
  .category-page .filter-drawer .price-inputs { align-items:center; gap:10px; }
  .category-page .filter-drawer .price-inputs input {
    box-sizing:border-box;
    flex:1;
    min-width:0;
    width:0;
    height:38px;
    padding:0 12px;
    border-color:#e2e8f0;
    border-radius:6px;
    background:#fafbfd;
    color:#244e76;
    font-size:13px;
  }
  .category-page .price-separator { display:block; flex:none; color:#b0bcc8; font-size:12px; }
  .category-page .filter-drawer .filter-error { padding:0; font-size:12px; }
  .category-page .filter-drawer .quality-list { gap:8px; }
  .category-page .filter-drawer .quality-list button { min-width:0; height:38px; padding:0 8px; border-color:#e2e8f0; border-radius:6px; font-size:13px; line-height:36px; }
  .category-page .filter-drawer .quality-list button:hover { border-color:#9cb3cb; }
  .category-page .filter-drawer .quality-list button.active { border-color:#244e76; background:#244e76; color:#fff; }
  .category-page .filter-actions {
    position:static;
    flex:none;
    align-items:center;
    justify-content:flex-end;
    gap:12px;
    margin:0;
    padding:18px 28px;
    border-top:1px solid #edf1f5;
    background:#fcfdfe;
  }
  .category-page .filter-actions button { flex:none; width:88px; height:40px; padding:0 16px; border-color:#d7e1eb; border-radius:7px; background:#fff; color:#52667b; font-size:14px; font-weight:500; line-height:38px; }
  .category-page .filter-actions button:hover { border-color:#9cb3cb; background:#f3f7fb; }
  .category-page .filter-actions button:nth-of-type(2) { width:136px; border-color:#244e76; background:#244e76; color:#fff; box-shadow:0 3px 8px rgba(36,78,118,.12); }
  .category-page .filter-actions button:nth-of-type(2):hover { border-color:#1b3f61; background:#1b3f61; }
  .category-page .filter-selection-summary { display:block; order:-1; margin-right:auto; color:#8a98a8; font-size:12px; line-height:20px; }
}
</style>

