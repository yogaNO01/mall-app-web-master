import { useRouter } from 'vue-router'
import { useSearchStore } from '@/stores/search'

export const normalizeSearchKeyword = (value: unknown) =>
  (typeof value === 'string' ? value : '').trim().replace(/\s+/gu, ' ').slice(0, 100)

export const useProductSearch = () => {
  const router = useRouter()
  const history = useSearchStore()
  const searchProducts = (value: string, options: { replace?: boolean; categoryId?: number } = {}) => {
    const keyword = normalizeSearchKeyword(value)
    if (keyword) history.addKeyword(keyword)
    return router[options.replace ? 'replace' : 'push']({
      path: '/pages/category/category',
      query: { keyword: keyword || undefined, categoryId: options.categoryId ? String(options.categoryId) : undefined },
    })
  }
  return { searchProducts }
}
