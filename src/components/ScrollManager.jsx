import { useLayoutEffect, useRef } from "react"
import { useLocation } from "react-router-dom"

const KEY_PREFIX = "ls_scroll:"

function scrollKey(pathname, search) {
  return KEY_PREFIX + pathname + search
}

function readPosition(key) {
  try {
    return Number(sessionStorage.getItem(key)) || 0
  } catch {
    return 0
  }
}

// 统一管理路由切换时的滚动行为：
// 1. 从详情页返回首页（或点侧栏首页）时恢复列表位置
// 2. 首页内筛选、排序变化时回到列表顶部
// 3. 进入其他页面时回到页面顶部
export default function ScrollManager() {
  const { pathname, search } = useLocation()
  const prevPathRef = useRef(null)

  // 记录当前 URL 的滚动位置，离开时供返回恢复
  useLayoutEffect(() => {
    const key = scrollKey(pathname, search)
    const save = () => {
      try {
        sessionStorage.setItem(key, String(window.scrollY))
      } catch {
        // 存储不可用时忽略
      }
    }
    window.addEventListener("scroll", save, { passive: true })
    return () => {
      window.removeEventListener("scroll", save)
      save()
    }
  }, [pathname, search])

  useLayoutEffect(() => {
    const prevPath = prevPathRef.current
    prevPathRef.current = pathname
    const pathChanged = prevPath !== null && prevPath !== pathname
    const key = scrollKey(pathname, search)

    if (pathname === "/" && pathChanged) {
      const saved = readPosition(key)
      if (saved > 0) {
        window.scrollTo(0, saved)
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, search])

  return null
}
