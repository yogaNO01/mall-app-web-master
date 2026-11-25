<template>
  <view class="language-dropdown" @focusout="closeOnBlur" @keydown.esc.stop.prevent="closeAndFocus">
    <button ref="trigger" class="language-trigger" type="button" :aria-label="t('选择语言') + ': ' + current.name" :aria-expanded="open" @click="open = !open">
      <image class="flag" :src="current.flag" mode="aspectFit" aria-hidden="true" />
      <text>{{ current.code === 'zh' ? '中文' : current.code.toUpperCase() }}</text>
      <span class="chevron" aria-hidden="true" />
    </button>
    <view v-if="open" class="language-options" role="group" :aria-label="t('选择语言')">
      <button v-for="item in options" :key="item.code" type="button" class="language-option" :aria-pressed="locale === item.code" @click="choose(item.code)">
        <image class="flag" :src="item.flag" mode="aspectFit" aria-hidden="true" />
        <text>{{ item.name }}</text>
        <text v-if="locale === item.code" class="check" aria-hidden="true">✓</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { locale, setLocale, t, type StorefrontLocale } from '@/i18n'

const languages = [
  { code: 'zh', name: '简体中文' }, { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português' }, { code: 'es', name: 'Español' },
  { code: 'it', name: 'Italiano' }, { code: 'fr', name: 'Français' },
] satisfies { code: StorefrontLocale; name: string }[]
const options = languages.map(item => ({ ...item, flag: '/static/flags/' + item.code + '.svg' }))
const current = computed(() => options.find(item => item.code === locale.value) || options[1]!)
const open = ref(false)
const trigger = ref<HTMLButtonElement>()
const route = useRoute()
watch(() => route.fullPath, () => { open.value = false })

function closeOnBlur(event: FocusEvent) {
  if (event.relatedTarget && !(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)) open.value = false
}
function closeOnOutsidePress(event: PointerEvent) {
  if (!(event.target instanceof Element) || !event.target.closest('.language-dropdown')) open.value = false
}
onMounted(() => document.addEventListener('pointerdown', closeOnOutsidePress, true))
onBeforeUnmount(() => document.removeEventListener('pointerdown', closeOnOutsidePress, true))
function closeAndFocus() {
  open.value = false
  void nextTick(() => trigger.value?.focus?.())
}
function choose(code: StorefrontLocale) {
  setLocale(code)
  closeAndFocus()
}
</script>

<style scoped>
.language-dropdown { position:relative; flex:none; color:#153451; }
.language-trigger,.language-option { box-sizing:border-box; display:flex; align-items:center; gap:8px; margin:0; border:0; background:transparent; color:inherit; cursor:pointer; font:inherit; }
button::after { border:0; }
.language-trigger { height:48px; padding:0 9px; border:1px solid #dbe4ed; border-radius:8px; background:transparent; color:#244e8b; font-size:16px; font-weight:700; }
.language-trigger:hover,.language-trigger[aria-expanded="true"] { border-color:#8aa9cc; }
@media (min-width:1024px) { .language-trigger { height:40px; } }
.language-trigger:focus-visible,.language-option:focus-visible { outline:2px solid #527fb1; outline-offset:2px; }
.flag { display:block; flex:none; width:19px; height:13px; border-radius:2px; box-shadow:0 0 0 1px #15345122; }
.chevron { width:5px; height:5px; margin-left:1px; border:solid currentColor; border-width:0 1px 1px 0; transform:translateY(-2px) rotate(45deg); }
.language-options { position:absolute; z-index:100; inset-inline-end:0; top:100%; width:168px; max-height:65vh; overflow:auto; padding:5px; border:1px solid #d9e3ec; border-radius:10px; background:#fff; box-shadow:0 8px 24px #15345124; }
.language-option { width:100%; min-height:44px; padding:5px 9px; border-radius:6px; text-align:left; font-size:15px; }
.language-option:hover,.language-option[aria-pressed="true"] { background:#eff5fb; }
.check { margin-inline-start:auto; color:#244e8b; }
</style>
