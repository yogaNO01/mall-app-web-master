<template>
  <view class="section-heading">
    <view class="heading-row">
      <text class="heading-title">{{ t(title) }}</text>
    </view>
    <text class="heading-description">{{ t(description) }}</text>
    <button v-if="more" class="heading-more" @click="$emit('more')">{{ t(more) }} ›</button>
  </view>
</template>

<script setup lang="ts">
import { t, localized, locale } from '@/i18n'

defineProps<{ title: string; description: string; more?: string }>()
defineEmits<{ (event: 'more'): void }>()
</script>

<style lang="scss" scoped>
@use '@/styles/home-tokens.scss' as *;
.heading-row {
  position: relative;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.heading-title {
  font-size: 21px;
  font-weight: 700;
  line-height: 32px;
  color: $home-navy;
}
.heading-more {
  display: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 40px;
  margin: 18px 0 0;
  padding: 0 16px;
  border: 1px solid $home-line;
  border-radius: 6px;
  background: #fff;
  color: $home-navy;
  font-size: 13px;
  line-height: 1.4;
  box-sizing: border-box;
}
.heading-more::after {
  border: none;
}
.heading-description {
  display: block;
  margin-top: 18px;
  font-size: 11px;
  line-height: 17px;
  color: $home-muted;
  text-align: center;
}
@media (min-width: 1024px) {
  .section-heading { position: relative; display: flex; align-items: baseline; gap: 26px; padding-right: 130px; }
  .heading-row { position: static; height: auto; flex: 0 0 auto; }
  .heading-title { display: block; flex: 0 0 auto; max-width: none; overflow: visible; font-size: clamp(28px, 2.34vw, 45px); line-height: 1.5; white-space: nowrap; }
  .heading-description { min-width: 0; margin: 0; font-size: clamp(14px, 1.3vw, 25px); line-height: 1.6; text-align: left; }
  .heading-more { display:flex; position: absolute; right: 0; top: 8px; width: auto; height: auto; margin: 0; padding: 0 0 10px; border: 0; border-bottom: 2px solid #d3b899; border-radius: 0; background: none; font-size: clamp(15px, 1.3vw, 25px); line-height: 1.5; color: $home-navy; }
}
@media (min-width: 1024px) {
  .heading-title { font-size: 28px; }
  .heading-description { font-size: 15px; }
  .heading-more { font-size: 16px; }
}
</style>
