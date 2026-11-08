<template>
  <button ref="trigger" class="region-trigger" :aria-label="t('配送地区')" aria-haspopup="dialog" :aria-expanded="open" @click.stop="show">
    <text>{{ marketCurrency(modelValue) }}</text><image src="/static/icons/chevron-down.svg" mode="aspectFit" />
  </button>
  <Teleport to="body">
    <view v-if="open" v-modal-scroll-lock class="region-backdrop" @click="close" @keydown.esc="close">
      <view class="region-panel" :style="position" role="dialog" aria-modal="true" :aria-label="t('配送地区')" @click.stop>
        <view class="region-sheet-handle" />
        <view class="region-panel-heading"><text>{{ t('配送地区') }}</text><button :aria-label="t('关闭')" @click="close"><image src="/static/icons/close.svg" mode="aspectFit" /></button></view>
        <button v-for="item in regions" :key="item.value" tabindex="0" class="region-option" :class="{selected:modelValue===item.value}" :aria-pressed="modelValue===item.value" @click="choose(item.value)">
          <view><text class="region-option-name">{{ t(item.label) }}</text><text class="region-option-code">{{ item.currency }}</text></view>
          <image v-if="modelValue===item.value" src="/static/icons/check.svg" mode="aspectFit" />
        </button>
        <button class="region-cancel" @click="close">{{ t('取消') }}</button>
      </view>
    </view>
  </Teleport>
</template>
<script setup lang="ts">
import { ref, nextTick, onBeforeUnmount, Teleport } from 'vue'
import { t } from '@/i18n'
import { marketCurrency, type PriceRegion } from '@/utils/money'
import { useModalScrollLock } from '@/composables/use-modal-scroll-lock'
const vModalScrollLock=useModalScrollLock()
defineProps<{modelValue:PriceRegion}>()
const emit=defineEmits<{(event:'update:modelValue',value:PriceRegion):void}>()
const open=ref(false),trigger=ref<any>(),position=ref<Record<string,string>>({})
const regions:{value:PriceRegion;label:string;currency:string}[]=[{value:'cn',label:'中国',currency:'CNY · ¥'},{value:'us',label:'美国',currency:'USD · $'},{value:'eu',label:'欧洲',currency:'EUR · €'}]
function show(){
 const element=trigger.value?.$el||trigger.value
 const rect=element.getBoundingClientRect(),height=268
 position.value={left:Math.max(12,Math.min(rect.left,window.innerWidth-252))+'px',top:(rect.bottom+height<window.innerHeight-12?rect.bottom+8:Math.max(12,rect.top-height-8))+'px'}
 open.value=true
 nextTick(()=>document.querySelector<HTMLElement>('.region-panel .region-option.selected')?.focus())
}
function close(){open.value=false;nextTick(()=>{const element=trigger.value?.$el||trigger.value;element?.focus?.()})}
function choose(value:PriceRegion){emit('update:modelValue',value);close()}
const dismiss=()=>{if(open.value)close()}
const onKeydown=(event:KeyboardEvent)=>{if(event.key==='Escape')dismiss()}
window.addEventListener('resize',dismiss)
window.addEventListener('keydown',onKeydown)
onBeforeUnmount(()=>{window.removeEventListener('resize',dismiss);window.removeEventListener('keydown',onKeydown)})
</script>
<style scoped>
.region-trigger{display:flex;align-items:center;justify-content:center;gap:5px;flex:none;min-height:30px;margin:0;padding:4px 7px;border:1px solid #e6ebf1;border-radius:6px;background:#f5f7fa;color:#52667b;font-size:11px;font-weight:500;line-height:20px;cursor:pointer}
.region-trigger::after{border:0}.region-trigger image{width:12px;height:12px}.region-trigger:focus-visible{outline:2px solid #244e76}
.region-backdrop{position:fixed;inset:0;z-index:10000;background:transparent}
.region-panel{position:fixed;box-sizing:border-box;width:240px;padding:8px;border:1px solid #e6ebf1;border-radius:12px;background:#fff;box-shadow:0 12px 40px #15345126;color:#153451;font-family:'Noto Sans SC','Microsoft YaHei',sans-serif}
.region-sheet-handle{display:none}.region-panel-heading{display:flex;align-items:center;justify-content:space-between;padding:8px 10px 12px;font-size:13px;font-weight:600}
.region-panel-heading button{display:flex;align-items:center;justify-content:center;width:26px;height:26px;margin:0;padding:5px;border:0;background:transparent;border-radius:50%}
.region-panel-heading image{width:16px;height:16px}
.region-option{display:flex;align-items:center;justify-content:space-between;box-sizing:border-box;width:100%;min-height:52px;margin:2px 0;padding:9px 12px;border:0;border-radius:7px;background:#fff;text-align:left;color:#52667b;cursor:pointer}
.region-option::after,.region-panel-heading button::after,.region-cancel::after{border:0}.region-option:hover{background:#f4f7fb}.region-option.selected{background:#edf3f9;color:#244e76}.region-option>view{display:flex;flex-direction:column;gap:3px}.region-option-name{font-size:13px;font-weight:500;line-height:1.4}.region-option-code{color:#8a98a7;font-size:11px;line-height:1.3}.region-option image{width:18px;height:18px}.region-cancel{display:none}
@media(max-width:767px){
 .region-trigger{min-height:32px}
 .region-backdrop{background:#10253d66;display:flex;align-items:flex-end}
 .region-panel{left:0!important;top:auto!important;bottom:0;width:100%;padding:12px 20px calc(18px + env(safe-area-inset-bottom));border:0;border-radius:20px 20px 0 0;box-shadow:0 -8px 32px #1534511a}
 .region-sheet-handle{display:block;width:34px;height:4px;margin:0 auto 10px;border-radius:4px;background:#dbe2ea}
 .region-panel-heading{padding:10px 0 16px;font-size:17px}.region-panel-heading button{width:32px;height:32px;background:#f4f6f8}
 .region-option{min-height:64px;padding:12px 14px;margin:6px 0;border:1px solid #edf0f4;border-radius:10px}.region-option.selected{border-color:#b9ccdf}.region-option-name{font-size:15px}.region-option-code{font-size:12px}.region-option image{width:20px;height:20px}
 .region-cancel{display:block;width:100%;min-height:44px;margin:14px 0 0;border:0;border-radius:9px;background:#f3f5f8;color:#64768a;font-size:14px}
}
</style>
