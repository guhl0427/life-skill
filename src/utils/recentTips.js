const RECENT_KEY = "ls_recent_tips"
export const RECENT_LIMIT = 6

// 读取最近浏览的技巧 id，自动过滤非法值与重复项
export function readRecentTipIds() {
  let raw = null
  try {
    raw = localStorage.getItem(RECENT_KEY)
  } catch {
    return []
  }
  if (!raw) return []

  let parsed = null
  try {
    parsed = JSON.parse(raw)
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []

  const ids = []
  for (const id of parsed) {
    if (typeof id !== "string" || !id || ids.includes(id)) continue
    ids.push(id)
    if (ids.length >= RECENT_LIMIT) break
  }
  return ids
}

// 记录一次浏览，同一个技巧只保留一条并前移，最多保留 RECENT_LIMIT 条
export function rememberRecentTip(id) {
  if (!id) return readRecentTipIds()
  const next = [id, ...readRecentTipIds().filter((item) => item !== id)].slice(0, RECENT_LIMIT)
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    // 存储不可用时忽略，不影响正常浏览
  }
  return next
}

export function clearRecentTips() {
  try {
    localStorage.removeItem(RECENT_KEY)
  } catch {
    // 存储不可用时忽略
  }
}
