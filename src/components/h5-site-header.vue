<template>
  <view class="site-header-shell">
    <view class="shared-mobile"><mobile-site-header @home="navigate('home')" @menu="drawerOpen = true" /></view>
    <view class="shared-pc"><pc-site-header @navigate="navigate" @search="openSearch" /></view>
    <view v-if="drawerOpen" v-modal-scroll-lock class="drawer-overlay" @click="drawerOpen = false" @keydown.esc="drawerOpen = false">
      <view class="drawer-panel" role="dialog" aria-modal="true" :aria-label="t('网站导航')" @click.stop>
        <view class="drawer-heading"><text>{{ t('网站导航') }}</text><button class="close-button" :aria-label="t('关闭网站导航')" @click="drawerOpen = false"><text /></button></view>
        <view class="drawer-divider" />
        <button v-for="item in navigation" :key="item.key" class="drawer-item" @click="navigate(item.key)">
          <image class="drawer-icon" :src="item.icon" mode="aspectFit" /><text class="drawer-label">{{ t(item.label) }}</text><text class="drawer-chevron">›</text>
        </button>
        <view class="drawer-spacer" /><view class="drawer-footer"><text>中国广州商品进出口贸易总会</text><text class="drawer-footer-subtitle">GUANGZHOU GLOBAL TRADE ASSOCIATION</text></view>
      </view>
    </view>
  </view>
</template>
<script setup lang="ts">
import { t, locale, loadStorefrontCopy } from '@/i18n'

import { ref, watch } from 'vue'
import { onHide } from '@dcloudio/uni-app'
import { useRoute } from 'vue-router'
import PcSiteHeader from './pc-site-header.vue'
import MobileSiteHeader from './mobile-site-header.vue'
import { useModalScrollLock } from '@/composables/use-modal-scroll-lock'
import { useProductSearch } from '@/composables/use-product-search'
const vModalScrollLock = useModalScrollLock()
const drawerOpen = ref(false)
const route = useRoute()
watch(() => route.fullPath, () => { drawerOpen.value = false })
onHide(() => { drawerOpen.value = false })
const { searchProducts: openSearch } = useProductSearch()
const navigation = [
  { key: 'home', label: '首页', icon: '/static/navigation/home.svg' },
  { key: 'category', label: '商品分类列表', icon: '/static/navigation/grid.svg' },
  { key: 'about', label: '关于我们', icon: '/static/navigation/info.svg' },
  { key: 'guide', label: '购买流程', icon: '/static/navigation/guide.svg' },
  { key: 'faq', label: '常见问题', icon: '/static/navigation/help.svg' },
] as const
loadStorefrontCopy()
const infoTitles: Record<string, string> = { about: '关于我们', guide: '购买流程', faq: '常见问题' }
watch(() => [route.fullPath, locale.value], () => {
  const path = route.path
  const title = path.includes('/product/') ? '商品详情' : path.includes('/category/') ? '全部商品' : path.includes('/brand/') ? '探索品牌' : path.includes('/public/info') ? (infoTitles[String(route.query.section)] || '关于我们') : '首页'
  uni.setNavigationBarTitle({ title: t(title) })
}, { immediate: true })
const navigate = (key: (typeof navigation)[number]['key']) => {
  drawerOpen.value = false
  if (key === 'home') return uni.switchTab({ url: '/pages/index/index' })
  if (key === 'category') return uni.switchTab({ url: '/pages/category/category' })
  uni.navigateTo({ url: `/pages/public/info?section=${key}` })
}
</script>
<style lang="scss" scoped>
@use '@/styles/home-tokens.scss' as *;
.shared-pc { display:none; }
.drawer-overlay {
  height:100vh;
  height:100dvh;
  overflow:hidden;
  overscroll-behavior:none;
}
@media(min-width:1024px) { .shared-mobile { display:none; } .shared-pc { display:block; } }
.site-header-shell{width:100%}.site-header{display:flex;align-items:center;gap:clamp(8px,2.05vw,14px);width:100%;min-height:clamp(64px,11.6vw,80px);padding:clamp(10px,2.55vw,18px) clamp(18px,4.62vw,32px);border:1px solid #edf0f2;background:#fff;color:$home-navy}.site-name{min-width:0;flex:1;overflow:hidden;font-size:clamp(15px,3.9vw,28px);font-weight:700;line-height:1.45;text-overflow:ellipsis;white-space:nowrap;cursor:pointer}.language,.menu-trigger,.drawer-heading button,.drawer-item{margin:0;padding:0;border:0;background:transparent;color:inherit}.language{flex:0 0 auto;font-size:clamp(20px,5.15vw,36px);font-weight:500;line-height:1}.menu-trigger{display:flex;width:clamp(44px,11.3vw,64px);height:clamp(44px,11.3vw,64px);flex:0 0 auto;align-items:center;justify-content:center}.menu-trigger image{width:clamp(22px,5.65vw,32px);height:clamp(22px,5.65vw,32px)}.drawer-overlay{position:fixed;inset:0;z-index:9999;display:flex;justify-content:flex-end;background:rgba(21,52,81,.12);animation:fade-in .18s ease-out}.drawer-panel{display:flex;flex-direction:column;width:80%;min-height:100%;padding:clamp(22px,5.65vw,40px) clamp(24px,6.15vw,43px) max(clamp(24px,6.15vw,43px),env(safe-area-inset-bottom));background:#fff;color:$home-navy;box-shadow:-4px 0 12px rgba(21,52,81,.04);animation:drawer-in .22s ease-out}.drawer-heading{display:flex;height:clamp(44px,11.3vw,78px);align-items:flex-start;justify-content:space-between;font-size:clamp(20px,5.15vw,36px);font-weight:700;line-height:1.5}.close-button{position:relative;display:flex!important;width:clamp(44px,11.3vw,64px)!important;height:clamp(44px,11.3vw,64px)!important;align-items:center;justify-content:center}.close-button text::before,.close-button text::after{position:absolute;top:50%;left:50%;width:clamp(24px,6.15vw,34px);height:2px;background:$home-navy;content:''}.close-button text::before{transform:translate(-50%,-50%) rotate(45deg)}.close-button text::after{transform:translate(-50%,-50%) rotate(-45deg)}.drawer-divider{height:1px;margin-top:clamp(18px,4.62vw,32px);background:$home-line}.drawer-item{display:flex;min-height:clamp(59px,15.15vw,104px);align-items:center;border-bottom:1px solid $home-line;text-align:left}.drawer-icon{width:clamp(22px,5.65vw,32px);height:clamp(22px,5.65vw,32px);flex:0 0 auto}.drawer-label{flex:1;margin-left:clamp(14px,3.6vw,28px);font-size:clamp(16px,4.1vw,28px);font-weight:500;line-height:1.5}.drawer-chevron{font-size:clamp(24px,6.15vw,38px);font-weight:300;color:$home-navy}.drawer-spacer{min-height:clamp(173px,44.36vw,306px);flex:1}.drawer-footer{padding-top:clamp(18px,4.62vw,32px);color:$home-muted;font-size:clamp(12px,3.08vw,20px);font-weight:500;line-height:1.5;text-align:left}@keyframes fade-in{from{opacity:0}}@keyframes drawer-in{from{transform:translateX(100%)}}@media(max-width:350px){.site-header{padding-inline:12px}.menu-trigger{width:36px}.drawer-panel{padding-inline:20px}}
.language {
  border: 0 !important;
  outline: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}
.language::after { border: 0 !important; }
.pc-navigation,.pc-search,.pc-language { display:none; }
@media(min-width:1024px) {
  .site-header { min-height:64px; padding:12px 3.125%; gap:24px; background:#fbf7f1; }
  .site-name { flex:0 1 auto; font-size:clamp(19px,1.82vw,25px); }
  .pc-navigation { display:flex; flex:1; justify-content:center; gap:clamp(18px,3vw,60px); }
  .pc-navigation button { margin:0; padding:0; background:transparent; color:#153451; font-size:16px; white-space:nowrap; }
  .pc-search { display:flex; align-items:center; gap:10px; width:clamp(170px,18.4vw,300px); height:40px; margin:0; padding:8px 12px; border:1px solid #dfd7cf; border-radius:8px; background:#fff; color:#adadb1; font-size:14px; }
  .pc-search image { width:20px; height:20px; flex-shrink:0; }
  .pc-language { display:inline; color:#244e8b; }
  .language { font-size:16px; }
  .menu-trigger { display:none; }
  .pc-navigation button::after { border:0; }
}
.close-button,
.drawer-item {
  border-radius: 0 !important;
  box-shadow: none !important;
}
.close-button::after,
.drawer-item::after {
  border: 0 !important;
  border-radius: 0 !important;
}
.drawer-panel {
  box-sizing: border-box;
  height: 100vh;
  height: 100dvh;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior-y: contain;
  touch-action: pan-y;
  -webkit-overflow-scrolling: touch;
}
.drawer-panel > * { flex-shrink: 0; }
.drawer-panel .drawer-spacer { min-height: 24px; flex: 1 0 24px; }
.drawer-footer { display:flex; flex-direction:column; gap:2px; }
.drawer-footer-subtitle { color:#81909d; font-size:clamp(7px,1.8vw,11px); font-weight:500; letter-spacing:.1em; line-height:1.2; }
</style>
