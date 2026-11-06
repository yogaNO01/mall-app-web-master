import { nextTick, onBeforeUnmount, type ObjectDirective } from 'vue'
import { onHide, onShow } from '@dcloudio/uni-app'
import { lockModalScroll } from '@/utils/modal-scroll-lock'

/** Use on an overlay: v-modal-scroll-lock, or bind false while it is hidden. */
export const useModalScrollLock = (): ObjectDirective<HTMLElement, boolean | undefined> => {
  const entries = new Map<HTMLElement, { active: boolean; release?: () => void }>()
  let pageVisible = true
  const sync = (element: HTMLElement) => {
    if (typeof document === 'undefined') return
    const entry = entries.get(element)
    if (!entry) return
    const visible = pageVisible && entry.active && element.getClientRects().length > 0
    if (visible && !entry.release) entry.release = lockModalScroll(() => element)
    else if (!visible) { entry.release?.(); entry.release = undefined }
  }
  const releaseAll = () => {
    for (const entry of entries.values()) { entry.release?.(); entry.release = undefined }
  }
  onHide(() => { pageVisible = false; releaseAll() })
  onShow(() => {
    pageVisible = true
    nextTick(() => { for (const element of entries.keys()) sync(element) })
  })
  onBeforeUnmount(() => { releaseAll(); entries.clear() })
  return {
    mounted(element, binding) { entries.set(element, { active: binding.value !== false }); sync(element) },
    updated(element, binding) {
      const entry = entries.get(element)
      if (entry) entry.active = binding.value !== false
      sync(element)
    },
    beforeUnmount(element) { entries.get(element)?.release?.(); entries.delete(element) },
  }
}
