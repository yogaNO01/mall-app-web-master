<template>
  <view class="guest-storefront">
    <h5-site-header />
    <view class="guest-content"><text class="guest-title">{{ t('发现品质好物') }}</text><text class="guest-description">{{ t('浏览商品，联系我们了解更多详情。') }}</text><button @click="openProducts">{{ t('浏览全部商品') }}</button></view>
  </view>
</template>
<script setup lang="ts">
import { t, localized, locale } from '@/i18n'

import H5SiteHeader from '@/components/h5-site-header.vue'
const openProducts = () => uni.switchTab({ url:'/pages/category/category' })
</script>
<style scoped>
.guest-storefront { min-height:100vh; background:#fff; color:#153451; }
.guest-content { display:flex; flex-direction:column; align-items:center; gap:16px; padding:64px 24px; text-align:center; }
.guest-title { font-size:24px; font-weight:700; }
.guest-description { color:#81909d; font-size:14px; }
button { margin:12px 0 0; padding:12px 24px; border:0; border-radius:6px; background:#244e76; color:#fff; font-size:14px; }
button::after { border:0; }
</style>
