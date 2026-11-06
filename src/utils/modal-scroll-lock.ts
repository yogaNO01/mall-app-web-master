type Overlay = () => HTMLElement | null

const overlays = new Map<symbol, Overlay>()
let restoreScroll: (() => void) | undefined
let touchX = 0
let touchY = 0

const topOverlay = () => [...overlays.values()].pop()?.() ?? null
const prevent = (event: Event) => { if (event.cancelable) event.preventDefault() }

// Let a scrollable descendant consume the gesture, but never chain it to the page.
const canScroll = (target: EventTarget | null, dx: number, dy: number) => {
  const overlay = topOverlay()
  if (!(target instanceof Element) || !overlay?.contains(target)) return false
  const horizontal = Math.abs(dx) > Math.abs(dy)
  const delta = horizontal ? dx : dy
  if (!delta) return true
  let element: Element | null = target
  while (element && overlay.contains(element)) {
    const style = getComputedStyle(element)
    const overflow = horizontal ? style.overflowX : style.overflowY
    const position = horizontal ? element.scrollLeft : element.scrollTop
    const limit = horizontal
      ? element.scrollWidth - element.clientWidth
      : element.scrollHeight - element.clientHeight
    if (/(auto|scroll)/.test(overflow) && limit > 1 &&
      (delta < 0 ? position > 0 : position < limit - 1)) return true
    element = element.parentElement
  }
  return false
}

const onTouchStart = (event: TouchEvent) => {
  touchX = event.touches[0]?.clientX ?? 0
  touchY = event.touches[0]?.clientY ?? 0
}
const onTouchMove = (event: TouchEvent) => {
  if (event.touches.length !== 1) return
  const touch = event.touches[0]
  const dx = touchX - touch.clientX
  const dy = touchY - touch.clientY
  touchX = touch.clientX
  touchY = touch.clientY
  if (!canScroll(event.target, dx, dy)) prevent(event)
}
const onWheel = (event: WheelEvent) => {
  if (!canScroll(event.target, event.deltaX, event.deltaY)) prevent(event)
}
const onKeyDown = (event: KeyboardEvent) => {
  if (!['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) return
  const target = event.target as HTMLElement | null
  if (topOverlay()?.contains(target) && target?.closest('input, textarea, select, [contenteditable="true"], button, [role="button"]')) return
  const delta = ['ArrowUp', 'PageUp', 'Home'].includes(event.key) || (event.key === ' ' && event.shiftKey) ? -1 : 1
  if (!canScroll(target, 0, delta)) prevent(event)
}

/** Each overlay owns one lock; only the last release restores the page. */
export const lockModalScroll = (overlay: Overlay): (() => void) => {
  if (typeof document === 'undefined') return () => {}
  const token = Symbol('modal-scroll-lock')
  overlays.set(token, overlay)
  if (overlays.size === 1) {
    const body = document.body
    const root = document.documentElement
    const x = window.scrollX
    const y = window.scrollY
    const bodyStyles = {
      position: body.style.position, top: body.style.top, left: body.style.left,
      width: body.style.width, overflow: body.style.overflow,
    }
    const rootOverflow = root.style.overflow
    // uni-app fixes body height to the viewport. Clipping a shifted body would
    // hide the scrolled page behind the overlay; the root and event guards lock it.
    Object.assign(body.style, { position: 'fixed', top: `-${y}px`, left: `-${x}px`, width: '100%', overflow: 'visible' })
    root.style.overflow = 'hidden'
    document.addEventListener('touchstart', onTouchStart, { capture: true, passive: true })
    document.addEventListener('touchmove', onTouchMove, { capture: true, passive: false })
    document.addEventListener('wheel', onWheel, { capture: true, passive: false })
    document.addEventListener('keydown', onKeyDown, true)
    restoreScroll = () => {
      document.removeEventListener('touchstart', onTouchStart, true)
      document.removeEventListener('touchmove', onTouchMove, true)
      document.removeEventListener('wheel', onWheel, true)
      document.removeEventListener('keydown', onKeyDown, true)
      Object.assign(body.style, bodyStyles)
      root.style.overflow = rootOverflow
      const behavior = root.style.scrollBehavior
      root.style.scrollBehavior = 'auto'
      window.scrollTo(x, y)
      root.style.scrollBehavior = behavior
    }
  }
  return () => {
    if (!overlays.delete(token) || overlays.size) return
    restoreScroll?.()
    restoreScroll = undefined
  }
}

let nativeDialogsInstalled = false
export const installNativeDialogScrollLock = () => {
  // #ifdef H5
  if (nativeDialogsInstalled || typeof document === 'undefined') return
  nativeDialogsInstalled = true
  for (const [api, selector] of [['showModal', 'uni-modal'], ['showActionSheet', 'uni-actionsheet']] as const) {
    const releases: Array<() => void> = []
    uni.addInterceptor(api, {
      invoke() { releases.push(lockModalScroll(() => document.querySelector<HTMLElement>(selector))) },
      complete() { releases.shift()?.() },
    })
  }
  // #endif
}
