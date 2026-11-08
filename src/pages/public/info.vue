<template><view class="info-page"><h5-site-header/><view class="info-content"><text class="info-kicker">{{ t(current.kicker) }}</text><text class="info-title">{{ t(current.title) }}</text><text class="info-description">{{ t(current.description) }}</text><view v-for="(item,index) in current.items" :key="item.title" class="info-card"><text class="info-number">{{ t(String(index+1).padStart(2,'0')) }}</text><view><text class="card-title">{{ t(item.title) }}</text><text class="card-copy">{{ t(item.copy) }}</text></view></view></view></view></template>
<script setup lang="ts">
import { t, localized, locale } from '@/i18n'
import{computed}from'vue';import{useRoute}from'vue-router';import H5SiteHeader from'@/components/h5-site-header.vue';const route=useRoute();const section=computed(()=>typeof route.query.section==='string'?route.query.section:'about');const content={about:{kicker:'ABOUT US',title:'关于我们',description:'从广州出发，连接全球品质生活。专注服饰、鞋履、箱包、腕表、眼镜及珠宝首饰的精选与跨境贸易。',items:[{title:'广州优质货源',copy:'深入本地市场，为全球客户精选优质商品。'},{title:'一对一服务',copy:'专属买手跟进需求，让跨境采购更简单。'}]},guide:{kicker:'SHOPPING GUIDE',title:'购买流程',description:'从选品咨询到国际运输，每一步都有专人协助。',items:[{title:'选择商品',copy:'浏览分类与商品详情，确定需要的款式。'},{title:'联系买手',copy:'通过社交渠道确认价格、规格和库存。'},{title:'验货与发货',copy:'完成质量检查后安排安全的国际运输。'}]},faq:{kicker:'FAQ',title:'常见问题',description:'关于商品、支付和运输的常见问题。',items:[{title:'商品是否经过检查？',copy:'发货前会完成商品质量检查。'},{title:'如何确认规格？',copy:'专属买手会在下单前与你确认颜色、尺码和数量。'},{title:'如何了解物流进度？',copy:'发货后会提供物流信息并持续跟进。'}]}};const current=computed(()=>content[section.value as keyof typeof content]||content.about)</script>
<style lang="scss" scoped>@use '@/styles/home-tokens.scss' as *;.info-page{min-height:100vh;background:#fff;color:$home-ink;font-family:'Noto Sans SC','Microsoft YaHei',sans-serif}.info-content{width:min(100%,760px);margin:auto;padding:54px clamp(16px,5vw,48px) 80px}.info-kicker{display:block;color:$home-muted;font-size:11px;letter-spacing:2px;text-align:center}.info-title{display:block;margin-top:10px;color:$home-navy;font-size:30px;font-weight:700;text-align:center}.info-description{display:block;max-width:620px;margin:18px auto 40px;color:$home-muted;font-size:14px;line-height:1.8;text-align:center}.info-card{display:flex;gap:18px;padding:22px 0;border-top:1px solid $home-line}.info-card:last-child{border-bottom:1px solid $home-line}.info-number{color:$home-blue;font-size:13px;font-weight:700}.info-card view{display:flex;flex-direction:column;gap:6px}.card-title{color:$home-navy;font-size:16px;font-weight:700}.card-copy{color:$home-muted;font-size:13px;line-height:1.7}</style>
<style lang="scss" scoped>
@media (min-width: 768px) {
  .info-content { width:min(100%,1180px); padding:clamp(76px,6vw,112px) clamp(36px,5vw,80px) 120px; }
  .info-kicker { font-size:var(--mall-caption-text); letter-spacing:clamp(2px,.25vw,4px); }
  .info-title { margin-top:clamp(14px,1.2vw,24px); font-size:var(--mall-display-title); line-height:1.35; }
  .info-description { max-width:920px; margin:clamp(24px,2vw,38px) auto clamp(52px,4vw,76px); font-size:var(--mall-body-text); line-height:1.9; }
  .info-card { gap:clamp(24px,2.4vw,44px); padding:clamp(28px,2.4vw,44px) 0; }
  .info-number { min-width:42px; font-size:var(--mall-caption-text); line-height:1.7; }
  .info-card view { gap:clamp(8px,.8vw,14px); }
  .card-title { font-size:var(--mall-card-title); line-height:1.5; }
  .card-copy { font-size:var(--mall-body-text); line-height:1.75; }
}
</style>
