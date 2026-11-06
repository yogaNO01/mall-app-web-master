<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { commerceEnabled } from '@/config/features'

onLaunch(() => {
  // #ifdef H5
  document.documentElement.classList.toggle('commerce-disabled', !commerceEnabled)
  uni.hideTabBar({ animation: false, fail: () => {} })
  // #endif
  console.log('App Launch')
})
onShow(() => {
  // #ifdef H5
  uni.hideTabBar({ animation: false, fail: () => {} })
  // #endif
  console.log('App Show')
})
onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
// 字体图标
@use '@/styles/fonts.scss';
@use '@/styles/localization.scss';

/* Keep tab routes registered for switchTab navigation, without the H5 bottom bar. */
/* #ifdef H5 */
uni-tabbar { display:none !important; }
uni-app,uni-page,uni-page-wrapper,uni-page-body { --window-bottom:0px !important; }
uni-page-wrapper { padding-bottom:0 !important; }
/* #endif */

view,
navigator,
input,
scroll-view {
  box-sizing: border-box;
}

button::after {
  border: none;
}
button:focus-visible,[role="link"]:focus-visible {
  outline:2px solid #7199c4;
  outline-offset:3px;
}

/* H5 pages use the 390px Figma canvas as their reference while staying usable
   on 320px devices and phones with display cutouts. */
/* #ifdef H5 */
html,
body,
#app,
uni-app,
uni-page,
uni-page-wrapper {
  width: 100%;
  min-width: 0;
}
uni-page-body {
  --mall-display-title: clamp(30px, 3.1vw, 56px);
  --mall-section-title: clamp(24px, 2.35vw, 42px);
  --mall-card-title: clamp(16px, 1.45vw, 26px);
  --mall-body-text: clamp(14px, 1.15vw, 20px);
  --mall-caption-text: clamp(11px, 0.9vw, 16px);
  width: 100vw;
  max-width: none;
  min-width: 0;
  margin-right: auto;
  margin-left: auto;
  overflow-x: clip;
}

/* Every storefront page follows the same responsive content boundary.
   This overrides legacy page-level 600px/1400px limits. */
uni-page-body > view:first-child {
  width: 100% !important;
  max-width: none !important;
  margin-right: auto !important;
  margin-left: auto !important;
}

@media (width > 1440px) {
  uni-page-body {
    width: 1400px;
    max-width: 1400px;
  }
}
body {
  margin: 0;
  overflow-x: hidden;
  background: #f6f7f8;
  -webkit-text-size-adjust: 100%;
}
button,
input {
  box-sizing: border-box;
}
/* #endif */

swiper,
scroll-view {
  flex: 1;
  height: 100%;
  overflow: hidden;
}

image {
  width: 100%;
  height: 100%;
  vertical-align: middle;
}

// 一行省略
.clamp {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
}

// 两行省略
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  -webkit-line-clamp: 2;
}

// 边框样式（底部边框）
.b-b:after,
.b-t:after {
  position: absolute;
  z-index: 3;
  left: 0;
  right: 0;
  height: 0;
  content: '';
  transform: scaleY(0.5);
  border-bottom: 1px solid #e4e7ed;
}

.b-b:after {
  bottom: 0;
}

.b-t:after {
  top: 0;
}
</style>
