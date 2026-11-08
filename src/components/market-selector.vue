<template>
  <view class="market-selector" :aria-label="t('配送地区')">
    <button :class="{active:market==='us'}" :aria-pressed="market==='us'" @click="setMarket('us')">{{ t('美国') }} · USD</button>
    <button :class="{active:market==='eu'}" :aria-pressed="market==='eu'" @click="setMarket('eu')">{{ t('欧洲') }} · EUR</button>
  </view>
</template>
<script setup lang="ts">
import { t } from '@/i18n'
import { market, setMarket } from '@/utils/money'
</script>
<style scoped>
.market-selector{display:flex;gap:4px;align-items:center;flex-wrap:wrap}
.market-selector button{margin:0;padding:4px 7px;min-height:28px;border:1px solid #e5e9ec;border-radius:4px;background:transparent;color:#81909d;font-size:11px;line-height:18px;white-space:nowrap}
.market-selector button.active{color:#244e76;border-color:#244e76;background:#f5f8fc}
.market-selector button::after{border:0}
</style>
