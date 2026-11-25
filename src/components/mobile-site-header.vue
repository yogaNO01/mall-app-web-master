<template>
  <view>
    <view class="mobile-header">
      <view class="brand-block" @click="$emit('home')"><text class="brand">中国广州商品进出口贸易总会</text><text class="brand-subtitle">GUANGZHOU GLOBAL TRADE ASSOCIATION</text></view>
      <language-dropdown />
      <button class="menu" :aria-label="t('打开网站导航')" @click="$emit('menu')"><image src="/static/home/18751.svg" mode="aspectFit" /></button>
    </view>
  </view>
</template>
<script setup lang="ts">
import { t } from '@/i18n'
import LanguageDropdown from './language-dropdown.vue'

defineEmits<{ (event: 'home'): void; (event: 'menu'): void }>()
</script>
<style scoped>
.mobile-header { display:flex; align-items:center; gap:6px; box-sizing:border-box; width:100%; min-height:64px; padding:10px 18px; border-bottom:1px solid #edf0f2; background:#fff; color:#153451; }
.brand-block { display:flex; flex:1; min-width:0; flex-direction:column; gap:1px; }
.brand { min-width:0; overflow:hidden; text-overflow:ellipsis; font-size:clamp(13px,3.85vw,20px); font-weight:700; white-space:nowrap; }
.brand-subtitle { overflow:hidden; color:#81909d; font-size:clamp(6px,1.55vw,9px); font-weight:500; letter-spacing:.1em; line-height:1.2; text-overflow:ellipsis; white-space:nowrap; }
button { box-sizing:border-box; margin:0; padding:0; border:0; background:transparent; color:inherit; box-shadow:none; cursor:pointer; -webkit-tap-highlight-color:transparent; }
button::after { border:0; }
button:focus-visible { outline:2px solid #7199c4; outline-offset:2px; }
.menu { display:flex; flex:none; align-items:center; justify-content:center; width:44px; height:44px; }
.menu image { width:22px; height:22px; }
@media(max-width:350px) { .mobile-header { gap:2px; padding-inline:12px; } .menu { width:36px; } }
</style>
