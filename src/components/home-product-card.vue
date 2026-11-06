<template>
  <view :class="['product-card', variant, { 'hide-mobile-consult-icon': hideMobileConsultIcon }]">
    <button v-if="variant === 'catalog'" class="catalog-consult" :aria-label="t('咨询商品')" @click="consultOnWhatsApp(product)"><image src="/static/home/whatsapp-white.svg" mode="aspectFit"/></button>
    <image
      class="product-image"
      :src="imageFailed ? '/static/errorImage.jpg' : product.pic || '/static/errorImage.jpg'"
      @error="imageFailed = true"
      :mode="variant === 'catalog' ? 'aspectFit' : 'aspectFill'"
      @click="$emit('detail', product)"
    />
    <view class="product-info">
      <button v-if="variant === 'catalog'" class="catalog-detail" :aria-label="t('查看商品详情')" @click="$emit('detail', product)">›</button>
      <text class="brand clamp">{{ t(localized(product, 'brandName') || '精选商品') }}</text>
      <text class="product-name clamp" role="link" tabindex="0" @keydown.enter="$emit('detail', product)" @click="$emit('detail', product)">{{ t(localized(product, 'name')) }}</text>
      <view class="prices">
        <text class="price">{{ formatProductMoney(product, 'price') }}</text>
        <text v-if="hasProductOriginalPrice(product)" class="original-price"
          >{{ formatProductMoney(product, 'originalPrice') }}</text
        >
      </view>
      <view v-if="showColorPreview && productColors.length" class="product-colors" :aria-label="t('可选颜色')"><text v-for="color in productColors" :key="color.value" class="product-color-dot" :style="{ backgroundColor: color.color }" :title="t(localized(color, 'name'))" /></view>
      <view class="product-actions">
        <button class="detail-button" @click="$emit('detail', product)"><image class="desktop-action-icon detail-icon" src="/static/home/desktop/d7d3f.svg" />{{ t('查看详情') }}</button>
        <button class="consult-button" @click="consultOnWhatsApp(product)"><image class="consult-icon" src="/static/home/whatsapp-white.svg" mode="aspectFit" />{{ t('咨询购买') }}</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { t, localized, locale } from '@/i18n'

import type { PmsProduct } from '@/types/product'
import { consultOnWhatsApp } from '@/utils/whatsapp'
import { formatProductMoney, hasProductOriginalPrice } from '@/utils/money'
import { ref, watch } from 'vue'
import { getCatalogProductDetail, readProductSpecs } from '@/utils/catalog-product-details'
import type { ProductColor } from '@/utils/product-colors'
const props = withDefaults(defineProps<{ product: PmsProduct; colorAsset: string; variant?: 'default' | 'catalog'; showColorPreview?: boolean; hideMobileConsultIcon?: boolean }>(), {
  variant: 'default',
  showColorPreview: true,
  hideMobileConsultIcon: false,
})
const productColors = ref<ProductColor[]>([])
const imageFailed = ref(false)
watch(() => props.product.pic, () => { imageFailed.value = false })
watch(() => [props.product.id, props.showColorPreview] as const, async ([id, show], _, onCleanup) => {
  let current = true
  onCleanup(() => { current = false })
  productColors.value = []
  if (!show || !id) return
  try {
    const result = await getCatalogProductDetail(id)
    if (current) productColors.value = readProductSpecs(result.data.skuStockList, result.data.productAttributeList, result.data.productAttributeValueList).colors
  } catch { /* Keep the card usable if color metadata is unavailable. */ }
}, { immediate: true })
defineEmits<{
  (event: 'detail', product: PmsProduct): void
  (event: 'consult', product: PmsProduct): void
}>()
</script>

<style lang="scss" scoped>
@use '@/styles/home-tokens.scss' as *;
.desktop-action-icon { display: none; }
.product-name.clamp { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; white-space:normal; min-height:3em; overflow:hidden; overflow-wrap:anywhere; }
.product-colors { display:flex; align-items:center; flex-wrap:wrap; gap:6px; min-height:18px; }
.product-color-dot { display:block; width:15px; height:15px; flex:none; border:1px solid #bbc4ce; border-radius:50%; }
.consult-icon { display:block; flex-shrink:0; width:16px; height:16px; }
@media (max-width:1023px) {
  .product-card .consult-icon { display:none; }
}
.product-card {
  overflow: hidden;
  min-width: 0;
  border-radius: 4px;
  background: #fff;
}
.product-image {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 173 / 184;
  border-radius: 4px;
  cursor: pointer;
}
.product-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 8px;
}
.brand {
  color: $home-muted;
  font-size: 10px;
  line-height: 15px;
}
.product-name {
  font-size: 14px;
  line-height: 21px;
  color: $home-ink;
  font-weight: 500;
  cursor: pointer;
}
.prices {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 29px;
}
.price {
  font-weight: 700;
  font-size: 19px;
  color: #1e63a4;
  line-height: 29px;
}
.original-price {
  color: $home-muted;
  font-size: 10px;
  text-decoration: line-through;
}
.color-preview {
  width: 80px;
  height: 16px;
}
.product-actions {
  display: flex;
  align-items: stretch;
  gap: 8px;
}
.product-actions button {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-width: 0;
  min-height: 36px;
  margin: 0;
  padding: 8px 4px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  line-height: 20px;
  white-space: nowrap;
  letter-spacing: .2px;
  -webkit-tap-highlight-color: transparent;
}
.product-actions button::after {
  border: 0;
  box-shadow: none;
}
.product-actions button:focus-visible {
  outline: 2px solid #7199c4;
  outline-offset: 3px;
}
.detail-button {
  border: 1px solid #d1dce8;
  color: $home-blue;
  background: #fff;
}
.consult-button {
  gap:4px;
  border: 1px solid $home-blue;
  background: $home-blue;
  color: #fff;
}
@media (min-width: 1024px) {
  .product-card { border: 1px solid $home-line; border-radius: 12px; }
  .product-image { aspect-ratio: 415 / 375; }
  .product-info { padding: 18px; gap: 12px; }
  .brand { font-size: 14px; line-height: 22px; }
  .product-name { font-size: clamp(17px, 1.56vw, 30px); line-height: 40px; font-weight: 700; }
  .price { font-size: clamp(22px, 1.56vw, 30px); line-height: 40px; }
  .original-price { font-size: 16px; }
  .product-actions { gap: 12px; }
  .product-actions button { gap: 6px; min-height:38px; padding: 7px 4px; font-size: 13px; border-radius: 6px; line-height: 22px; white-space:nowrap; }
  .desktop-action-icon { display: block; flex-shrink: 0; }
  .detail-icon { width: 30px; height: 30px; }
  .consult-icon { width: 20px; height: 20px; }
}
.product-card.catalog {
  border: 1px solid $home-line;
  border-radius: 12px;
  background: #fff;
}
.product-card.catalog .product-image {
  width: calc(100% - 24px);
  margin: 12px 12px 0;
  aspect-ratio: 1 / .92;
  border-radius: 9px;
  background: #fff;
}
.product-card.catalog .product-info {
  gap: 10px;
  padding: 16px 14px 18px;
}
@media (min-width: 768px) {
  .product-card.catalog { border-radius: clamp(12px, 1vw, 18px); }
  .product-card.catalog .product-image {
    width: calc(100% - clamp(32px, 2.5vw, 48px));
    margin: clamp(20px, 1.8vw, 30px) clamp(16px, 1.25vw, 24px) 0;
    aspect-ratio: 1 / .9;
    border-radius: clamp(10px, .8vw, 14px);
  }
  .product-card.catalog .product-info {
    gap: clamp(12px, 1vw, 18px);
    padding: clamp(20px, 1.7vw, 30px) clamp(18px, 1.55vw, 28px) clamp(24px, 1.8vw, 32px);
  }
  .product-card.catalog .brand { font-size: clamp(13px, .9vw, 16px); line-height: 1.5; }
  .product-card.catalog .product-name { font-size: clamp(18px, 1.45vw, 26px); line-height: 1.45; }
  .product-card.catalog .price { font-size: clamp(24px, 1.8vw, 32px); line-height: 1.4; }
  .product-card.catalog .original-price { font-size: clamp(13px, .9vw, 16px); }
  .product-card.catalog .color-preview { width: clamp(90px, 7vw, 124px); height: clamp(18px, 1.5vw, 26px); }
  .product-card.catalog .product-actions { gap: clamp(10px, .9vw, 16px); margin-top: 2px; }
  .product-card.catalog .product-actions button { min-height: clamp(42px, 3.4vw, 58px); }
}
.product-card { transition: transform .28s ease, box-shadow .28s ease, border-color .28s ease; }
.product-image { transition: transform .5s ease; transform-origin: center; }
.product-actions button { cursor: pointer; transition: background .2s ease, transform .2s ease, box-shadow .2s ease; }
.product-actions button:active { transform: scale(.98); }
.detail-button:active { background:#eaf1f9; border-color:#a2b9d2; }
.consult-button:active { background:#1b405f; }
@media (hover: hover) and (pointer: fine) {
  .product-card:hover { transform: translateY(-7px); border-color: #a8bdd7; box-shadow: 0 18px 38px rgba(27, 56, 94, .12); }
  .product-card:hover .product-image { transform: scale(1.035); }
  .detail-button:hover { background: #f2f6fb; border-color:#a2b9d2; }
  .consult-button:hover { background: #183f70; box-shadow: 0 3px 8px rgba(27, 56, 94, .14); }
}
@media (prefers-reduced-motion: reduce) {
  .product-card, .product-image, .product-actions button { transition: none; }
}
@media (min-width: 1024px) {
  .brand { font-size: 12px; line-height: 18px; }
  .product-name { font-size: 18px; line-height: 28px; }
  .price { font-size: 22px; line-height: 30px; }
  .original-price { font-size: 12px; }
  .product-actions button { font-size: 13px; line-height: 24px; }
  .desktop-action-icon { width: 22px; height: 22px; }
}
.catalog-consult,.catalog-detail { display:none; }
@media(min-width:1024px) {
  .product-card.catalog { position:relative; border-radius:8px; }
  .product-card.catalog .product-image { width:100%; margin:0; aspect-ratio:250 / 226; border-radius:0; }
  .product-card.catalog .product-info { position:relative; gap:8px; padding:12px 20px; }
  .product-card.catalog .brand { font-size:13px; line-height:20px; }
  .product-card.catalog .product-name { font-size:17px; line-height:25px; font-weight:700; color:#111; }
  .product-card.catalog .price { font-size:22px; line-height:30px; }
  .product-card.catalog .original-price { font-size:12px; }
  .product-card.catalog .color-preview { width:104px; height:22px; }
  .product-card.catalog .product-actions { display:none; }
  .catalog-consult { display:flex; position:absolute; top:12px; right:12px; z-index:2; width:32px; height:32px; padding:6px; border-radius:50%; background:#304f83; }
  .catalog-consult image { width:20px; height:20px; }
  .catalog-detail { display:flex; position:absolute; right:14px; bottom:34px; align-items:center; justify-content:center; width:30px; height:30px; margin:0; padding:0; border-radius:50%; background:#fff; color:#222; font-size:26px; box-shadow:0 1px 7px #0003; }
  .catalog-consult::after,.catalog-detail::after { border:0; }
}
@media(max-width:1023px) {
  .product-actions { gap:6px; }
  .product-actions button {
    min-height:44px;
    padding:6px 3px;
    font-size:11px;
    line-height:1.25;
    text-align:center;
    white-space:normal;
    word-break:normal;
    overflow-wrap:anywhere;
  }
}
</style>
