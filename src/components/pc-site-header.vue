<template>
  <view class="pc-header" :class="{ 'locale-pt': locale !== 'zh' }">
    <view class="brand-block" @click="$emit('navigate', 'home')"><text class="brand">中国广州商品进出口贸易总会</text><text class="brand-subtitle">GUANGZHOU GLOBAL TRADE ASSOCIATION</text></view>
    <view class="links"><button :class="{ active: activeTab === 'home' }" @click="$emit('navigate', 'home')">{{ t('首页') }}</button><button :class="{ active: activeTab === 'category' }" @click="$emit('navigate', 'category')">{{ t('全部商品') }}</button><button :class="{ active: activeTab === 'about' }" @click="$emit('navigate', 'about')">{{ t('关于我们') }}</button><button :class="{ active: activeTab === 'guide' }" @click="$emit('navigate', 'guide')">{{ t('购买流程') }}</button><button :class="{ active: activeTab === 'faq' }" @click="$emit('navigate', 'faq')">{{ t('常见问题') }}</button></view>
    <storefront-search v-model="searchDraft" class="header-search" compact :submit-on-clear="activeTab === 'category'" @search="$emit('search', $event)" />
    <view class="language" role="group" :aria-label="t('选择语言')"><button :class="{ selected: locale === 'zh' }" :aria-pressed="locale === 'zh'" @click="setLocale('zh')">中文</button><text class="language-divider">|</text><button :class="{ selected: locale === 'en' }" @click="setLocale('en')">EN</button><text class="language-divider">|</text><button :class="{ selected: locale === 'pt' }" @click="setLocale('pt')">PT</button><text class="language-divider">|</text><button :class="{ selected: locale === 'es' }" @click="setLocale('es')">ES</button></view>
  </view>
</template>
<script setup lang="ts">
import { t, locale, setLocale } from '@/i18n'

import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import StorefrontSearch from './storefront-search.vue'
import { normalizeSearchKeyword } from '@/composables/use-product-search'

const route = useRoute()
const searchDraft = ref(normalizeSearchKeyword(route.query.keyword))
watch(() => route.query.keyword, (value, previous) => {
  if (normalizeSearchKeyword(searchDraft.value) === normalizeSearchKeyword(previous)) searchDraft.value = normalizeSearchKeyword(value)
})
const activeTab = computed(() => {
  const path = route.path
  if (path === '/' || path === '' || path.includes('/pages/index/')) return 'home'
  if (/\/pages\/(category|product|brand)\//.test(path)) return 'category'
  if (path.includes('/pages/public/info')) return String(route.query.section || 'about')
  return ''
})
defineEmits<{(event:'navigate',key:'home'|'category'|'about'|'guide'|'faq'):void;(event:'search',keyword:string):void;(event:'language'):void}>()
</script>
<style scoped>
.header-search { width:clamp(200px,22vw,320px); flex:none; }
.language text { font-weight:700; }
.links button { font-weight:400; }
.links button.active { font-weight:700; }
.language { display:flex; align-items:center; gap:6px; flex:none; }
.language button { min-height:40px; color:#687b8c; cursor:pointer; }
.language button.selected { color:#244e8b; font-weight:700; }
.language .language-divider { color:#a4afba; font-size:12px; font-weight:400; }
.pc-header.locale-pt { gap:14px; }
.locale-pt .brand { font-size:clamp(17px,1.65vw,25px); }
.locale-pt .links { gap:clamp(10px,1.35vw,22px); justify-content:center; }
.locale-pt .links button { font-size:14px; }
.locale-pt .header-search { width:clamp(180px,20vw,280px); }
.pc-header{display:flex;align-items:center;gap:24px;min-height:64px;padding:12px 3.125%;background:#fbf7f1;color:#153451;box-sizing:border-box}.brand-block{display:flex;flex-direction:column;flex:0 1 auto;gap:2px;cursor:pointer}.brand{font-size:clamp(19px,1.82vw,25px);font-weight:700;white-space:nowrap}.brand-subtitle{font-size:clamp(7px,.55vw,10px);font-weight:500;letter-spacing:.12em;color:#81909d;white-space:nowrap}.links{display:flex;flex:1;justify-content:center;gap:clamp(18px,3vw,60px)}button{margin:0;padding:0;border:0;background:transparent;color:inherit;font-size:16px;white-space:nowrap}button::after{border:0}.search{display:flex;align-items:center;gap:10px;width:clamp(170px,18.4vw,300px);height:40px;padding:8px 12px;border:1px solid #dfd7cf;border-radius:8px;background:#fff;color:#adadb1;font-size:14px;box-sizing:border-box}.search image{width:20px;height:20px;flex-shrink:0}.language text{color:#244e8b}
.pc-header.locale-pt .links { gap:clamp(8px,1vw,16px); justify-content:center; }
.pc-header .links { gap:clamp(12px,1.6vw,30px); justify-content:center; }
.pc-header.locale-pt .links { gap:clamp(8px,1vw,16px); }
</style>
