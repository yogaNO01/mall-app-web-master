<template>
  <view class="search-page">
    <h5-site-header />
    <view class="search-content">
      <text class="search-title">搜索商品</text>
      <text class="search-description">输入商品名称、品牌、关键词或货号</text>
      <storefront-search v-model="keyword" autofocus @search="searchProducts" />
      <view v-if="searchStore.historyList.length" class="history-heading"><text>最近搜索</text><button @click="searchStore.clearHistory()">清空记录</button></view>
      <view class="history-list"><button v-for="item in searchStore.historyList" :key="item" @click="searchProducts(item)">{{ item }}</button></view>
    </view>
  </view>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useSearchStore } from '@/stores/search'
import { useProductSearch } from '@/composables/use-product-search'
import H5SiteHeader from '@/components/h5-site-header.vue'
import StorefrontSearch from '@/components/storefront-search.vue'
const keyword = ref('')
const searchStore = useSearchStore()
const { searchProducts } = useProductSearch()
</script>
<style scoped>
.search-page { min-height:100vh; background:#fff; color:#153451; }
.search-content { max-width:640px; margin:0 auto; padding:32px 20px; }
.search-title { display:block; font-size:24px; font-weight:700; }
.search-description { display:block; margin:10px 0 24px; font-size:13px; color:#81909d; }
.history-heading { display:flex; justify-content:space-between; align-items:center; margin:36px 0 16px; font-size:16px; font-weight:600; }
button { margin:0; border:0; }
button::after { border:0; }
.history-heading button { padding:4px 0; background:transparent; color:#81909d; font-size:12px; }
.history-list { display:flex; flex-wrap:wrap; gap:10px; }
.history-list button { padding:8px 14px; border-radius:18px; background:#f3f6f9; color:#244e76; font-size:13px; line-height:22px; }
@media(min-width:1024px) { .search-content { padding-top:64px; } }
</style>
