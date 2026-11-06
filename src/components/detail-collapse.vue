<template>
  <view class="detail-collapse" :class="{ 'is-open': open }" :aria-hidden="!open" :inert="open ? undefined : true">
    <view class="collapse-inner"><slot /></view>
  </view>
</template>

<script setup lang="ts">
defineProps<{ open: boolean }>()
</script>

<style scoped>
.detail-collapse {
  display:grid;
  grid-template-rows:0fr;
  opacity:0;
  visibility:hidden;
  transition:grid-template-rows .32s cubic-bezier(.22,1,.36,1), opacity .22s ease, visibility 0s .32s;
}
.detail-collapse.is-open {
  grid-template-rows:1fr;
  opacity:1;
  visibility:visible;
  transition:grid-template-rows .32s cubic-bezier(.22,1,.36,1), opacity .25s ease, visibility 0s;
}
.collapse-inner { min-height:0; overflow:hidden; }
@media (prefers-reduced-motion:reduce) {
  .detail-collapse,.detail-collapse.is-open { transition:none; }
}
</style>
