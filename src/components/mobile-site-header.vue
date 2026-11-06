<template>
  <view>
    <view class="mobile-header">
      <text class="brand" @click="$emit('home')">中国广州商品进出口贸易总会</text>
      <button class="language" :aria-label="t(locale === 'zh' ? '选择语言，当前为中文' : '选择语言，当前为葡萄牙语')" aria-haspopup="dialog" :aria-expanded="languageOpen" @click="languageOpen = true"><text class="current-language">{{ locale === 'zh' ? '中文' : 'PT' }}</text><text class="chevron" :class="{ expanded: languageOpen }" /></button>
      <button class="menu" :aria-label="t('打开网站导航')" @click="$emit('menu')"><image src="/static/home/18751.svg" mode="aspectFit" /></button>
    </view>
    <view v-if="languageOpen" v-modal-scroll-lock class="language-overlay" @click="languageOpen = false" @keydown.esc="languageOpen = false">
      <view class="language-sheet" role="dialog" aria-modal="true" :aria-label="t('选择语言')" @click.stop>
        <view class="sheet-handle" />
        <view class="sheet-heading"><text>{{ t('选择语言') }}</text><button class="sheet-close" :aria-label="t('关闭语言选择')" @click="languageOpen = false">×</button></view>
        <button class="language-option" :class="{ selected: locale === 'zh' }" :aria-pressed="locale === 'zh'" @click="chooseLanguage('zh')"><view class="option-copy"><text>简体中文</text><text class="option-subtitle">{{ locale === 'zh' ? t('当前语言') : 'Chinês simplificado' }}</text></view><text v-if="locale === 'zh'" class="selected-check">✓</text></button>
        <button class="language-option" :class="{ selected: locale === 'pt' }" :aria-pressed="locale === 'pt'" @click="chooseLanguage('pt')"><view class="option-copy"><text>Português</text><text class="option-subtitle">{{ locale === 'pt' ? t('当前语言') : '葡萄牙语' }}</text></view><text v-if="locale === 'pt'" class="selected-check">✓</text></button>
      </view>
    </view>
  </view>
</template>
<script setup lang="ts">
import { t, locale, setLocale, type StorefrontLocale } from '@/i18n'

import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useModalScrollLock } from '@/composables/use-modal-scroll-lock'
const vModalScrollLock = useModalScrollLock()
defineEmits<{ (event: 'home'): void; (event: 'menu'): void }>()
const languageOpen = ref(false)
const chooseLanguage = (value: StorefrontLocale) => { setLocale(value); languageOpen.value = false }
const route = useRoute()
watch(() => route.fullPath, () => { languageOpen.value = false })
</script>
<style scoped>
.mobile-header { display:flex; align-items:center; gap:6px; box-sizing:border-box; width:100%; min-height:64px; padding:10px 18px; border-bottom:1px solid #edf0f2; background:#fff; color:#153451; }
.brand { flex:1; min-width:0; font-size:clamp(13px,3.85vw,20px); font-weight:700; white-space:nowrap; }
button { box-sizing:border-box; margin:0; padding:0; border:0; background:transparent; color:inherit; box-shadow:none; cursor:pointer; -webkit-tap-highlight-color:transparent; }
button::after { border:0; }
button:focus-visible { outline:2px solid #7199c4; outline-offset:2px; }
.language { display:flex; flex:none; align-items:center; justify-content:center; gap:6px; min-width:44px; min-height:44px; padding:0 4px; border-radius:6px; font-size:16px; line-height:1.5; }
.current-language { color:#244e8b; font-weight:700; }
.chevron { width:5px; height:5px; border-right:1px solid #60788f; border-bottom:1px solid #60788f; transform:translateY(-2px) rotate(45deg); transition:transform .2s ease; }
.chevron.expanded { transform:translateY(1px) rotate(225deg); }
.language:active { background:#f1f5fa; }
.menu { display:flex; flex:none; align-items:center; justify-content:center; width:44px; height:44px; }
.menu image { width:22px; height:22px; }
.language-overlay { position:fixed; inset:0; z-index:10000; display:flex; align-items:flex-end; justify-content:center; background:rgba(17,38,60,.32); animation:overlay-enter .18s ease-out; }
.language-sheet { box-sizing:border-box; width:100%; max-width:600px; padding:10px 20px calc(24px + env(safe-area-inset-bottom)); border-radius:20px 20px 0 0; background:#fff; color:#153451; box-shadow:0 -8px 40px #17355312; animation:sheet-enter .25s cubic-bezier(.22,1,.36,1); }
.sheet-handle { width:32px; height:4px; margin:0 auto 8px; border-radius:4px; background:#dce3eb; }
.language-sheet { max-height:90vh; max-height:90dvh; overflow-y:auto; overscroll-behavior:contain; }
.sheet-heading { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; font-size:18px; font-weight:700; }
.sheet-close { width:44px; height:44px; margin-right:-10px; color:#788a9c; font-size:26px; font-weight:400; line-height:44px; }
.language-option { display:flex; align-items:center; justify-content:space-between; width:100%; min-height:70px; padding:14px 16px; border:1px solid #e6ecf2; border-radius:10px; background:#fff; text-align:left; font-size:15px; line-height:1.5; }
.language-option+.language-option { margin-top:10px; }
.language-option.selected { border-color:#c5d5e8; background:#f1f6fc; }
.option-copy { display:flex; flex-direction:column; gap:3px; }
.option-subtitle { color:#8292a3; font-size:11px; font-weight:400; }
.selected-check { color:#244e8b; font-size:20px; }
.language-option.unavailable { background:#fafbfc; color:#8292a3; cursor:default; }
.coming-soon { padding:3px 8px; border-radius:4px; background:#edf1f5; color:#8292a3; font-size:11px; }
@keyframes overlay-enter { from { opacity:0; } }
@keyframes sheet-enter { from { transform:translateY(100%); } }
@media(max-width:350px) { .mobile-header { gap:2px; padding-inline:12px; } .menu { width:36px; } }
@media(prefers-reduced-motion:reduce) { .language-overlay,.language-sheet { animation:none; } .chevron { transition:none; } }
</style>
