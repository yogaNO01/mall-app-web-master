<template>
  <view class="storefront-search" :class="{ compact }" @compositionstart.capture="composing = true" @compositionend.capture="composing = false" @keydown.esc="focused = false">
    <view class="search-field" :class="{ focused }">
      <image class="search-mark" src="/static/home/desktop/58328.svg" mode="aspectFit" />
      <input :value="modelValue" :focus="autofocus" :maxlength="100" :aria-label="t('搜索商品')" :placeholder="t('搜索商品名称、品牌或货号')" confirm-type="search" @input="update" @confirm="submit" @focus="focused = true" @blur="scheduleBlur" />
      <button v-if="modelValue" class="clear-search" :aria-label="t('清空搜索')" @mousedown.prevent @click="clear">×</button>
      <button class="submit-search" :aria-label="t('提交搜索')" @click="submit"><text v-if="compact" class="submit-search-icon" /><text v-else>{{ t('搜索') }}</text></button>
    </view>
    <view v-if="focused && suggestions.length" class="search-suggestions">
      <view class="suggestion-heading"><text>{{ t('最近搜索') }}</text><button @mousedown.prevent @click="history.clearHistory()">{{ t('清空记录') }}</button></view>
      <button v-for="item in suggestions" :key="item" class="suggestion" @mousedown.prevent @click="choose(item)"><text>↗</text><text>{{ t(item) }}</text></button>
    </view>
  </view>
</template>
<script setup lang="ts">
import { t, localized, locale } from '@/i18n'

import { computed, onBeforeUnmount, ref } from 'vue'
import { useSearchStore } from '@/stores/search'
import { normalizeSearchKeyword } from '@/composables/use-product-search'
const props = withDefaults(defineProps<{ modelValue?: string; compact?: boolean; autofocus?: boolean; submitOnClear?: boolean }>(), { modelValue: '', compact: false, autofocus: false, submitOnClear: false })
const emit = defineEmits<{ (event:'update:modelValue', value:string): void; (event:'search', value:string): void }>()
const history = useSearchStore()
const focused = ref(false)
const composing = ref(false)
let blurTimer: ReturnType<typeof setTimeout> | undefined
const suggestions = computed(() => history.historyList.filter(item => item.toLowerCase().includes(props.modelValue.trim().toLowerCase())).slice(0, 6))
const update = (event: { detail: { value: string } }) => emit('update:modelValue', event.detail.value)
const scheduleBlur = () => { blurTimer = setTimeout(() => { focused.value = false }, 120) }
const submit = (event?: { isComposing?: boolean; detail?: { value?: string } }) => {
  if (composing.value || event?.isComposing) return
  const value = normalizeSearchKeyword(event?.detail?.value ?? props.modelValue)
  emit('update:modelValue', value)
  focused.value = false
  uni.hideKeyboard()
  emit('search', value)
}
const choose = (value: string) => { emit('update:modelValue', value); focused.value = false; uni.hideKeyboard(); emit('search', value) }
const clear = () => { emit('update:modelValue', ''); if (props.submitOnClear) emit('search', '') }
onBeforeUnmount(() => { clearTimeout(blurTimer) })
</script>
<style scoped>
.storefront-search { position:relative; min-width:0; width:100%; z-index:20; }
.search-field { display:flex; align-items:center; gap:10px; box-sizing:border-box; min-height:44px; padding:0 5px 0 14px; border:1px solid #e3e9ef; border-radius:24px; background:#f6f7f8; transition:border-color .2s,box-shadow .2s; }
.search-field.focused { border-color:#91abc6; box-shadow:0 0 0 3px #244e7610; background:#fff; }
.search-mark { width:18px; height:18px; flex:none; }
input { flex:1; min-width:0; height:42px; color:#153451; font-size:14px; }
button { flex:none; margin:0; padding:0; border:0; box-shadow:none; cursor:pointer; line-height:1.4; }
button::after { border:0; }
.clear-search { width:32px; height:36px; color:#81909d; background:transparent; font-size:22px; }
.submit-search { display:flex; align-items:center; justify-content:center; min-width:56px; min-height:34px; padding:7px 10px; border-radius:18px; background:#244e76; color:#fff; font-size:13px; font-weight:600; line-height:1; text-align:center; white-space:nowrap; }
.search-suggestions { position:absolute; top:calc(100% + 8px); left:0; right:0; padding:10px; border:1px solid #e5ebf1; border-radius:12px; background:#fff; box-shadow:0 10px 30px #15345115; }
.suggestion-heading { display:flex; justify-content:space-between; align-items:center; padding:4px 6px 8px; color:#81909d; font-size:12px; }
.suggestion-heading button { color:#81909d; background:transparent; font-size:12px; }
.suggestion { display:flex; align-items:center; gap:10px; width:100%; min-height:40px; padding:8px; border-radius:6px; color:#153451; background:#fff; font-size:14px; text-align:left; }
.suggestion text:first-child { color:#81909d; }
.suggestion:hover,.suggestion:active { background:#f1f5f9; }
.compact .search-field { min-height:40px; padding-left:10px; gap:6px; border-radius:8px; background:#fff; }
.compact input { height:38px; font-size:13px; }
.compact .submit-search { min-width:30px; min-height:30px; padding:3px; border-radius:6px; font-size:22px; }
.submit-search-icon { display:block; position:relative; box-sizing:border-box; width:13px; height:13px; margin:3px auto 6px; border:1.8px solid currentColor; border-radius:50%; }
.submit-search-icon::after { content:''; position:absolute; right:-5px; bottom:-3px; width:7px; height:1.8px; border-radius:2px; background:currentColor; transform:rotate(45deg); }
.compact .clear-search { width:24px; min-height:30px; }
@media(max-width:1023px) {
  input { font-size:16px; }
  .search-field { min-height:48px; gap:8px; padding-right:4px; }
  .clear-search { width:40px; height:44px; }
  .submit-search { min-width:64px; min-height:40px; padding-inline:13px; }
}
@media(max-width:350px) {
  .search-field { gap:6px; padding-left:11px; }
  .search-mark { width:16px; height:16px; }
  .submit-search { min-width:58px; padding-inline:10px; font-size:12px; }
}
</style>
