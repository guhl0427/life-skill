import { useMemo, useCallback, useEffect } from "react"
import { AppContext } from "./app-context"
import { useLocalStorage } from "../hooks/useLocalStorage"
import { seedCategories, seedTags, seedTips } from "../data/seed"

const SEED_VERSION = "2026-11-21.2"
const SEED_VERSION_KEY = "ls_seed_version"

let _id = 0
function genId() {
  _id++
  return "id-" + Date.now().toString(36) + "-" + _id
}

// 预设数据升级时，只追加本地缺失的条目，保留用户自己的数据
function mergeSeedItems(current, seeds) {
  const ids = new Set(current.map((item) => item.id))
  const missing = seeds.filter((item) => !ids.has(item.id))
  return missing.length ? [...current, ...missing] : current
}

const SEED_TIP_IDS = new Set(seedTips.map((tip) => tip.id))

export function AppProvider({ children }) {
  const [tips, setTips] = useLocalStorage("ls_tips", seedTips)
  const [categories, setCategories] = useLocalStorage("ls_categories", seedCategories)
  const [tags, setTags] = useLocalStorage("ls_tags", seedTags)

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  )
  const tagMap = useMemo(() => new Map(tags.map((t) => [t.id, t])), [tags])

  useEffect(() => {
    let stored = null
    try {
      stored = localStorage.getItem(SEED_VERSION_KEY)
    } catch {
      return
    }
    if (stored === SEED_VERSION) return
    // 只有沿用预设数据的用户才补新预设，避免影响导入的自定义数据
    if (tips.some((tip) => SEED_TIP_IDS.has(tip.id))) {
      setTips((prev) => mergeSeedItems(prev, seedTips))
      setCategories((prev) => mergeSeedItems(prev, seedCategories))
      setTags((prev) => mergeSeedItems(prev, seedTags))
    }
    try {
      localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION)
    } catch {
      // 存储不可用时忽略，下次打开再尝试
    }
  }, [tips, setTips, setCategories, setTags])

  const addTip = useCallback((tip) => {
    const now = Date.now()
    setTips((prev) => [
      {
        ...tip,
        id: genId(),
        starred: false,
        pinned: false,
        usageCount: 0,
        lastUsedAt: null,
        scenario: tip.scenario || "",
        duration: tip.duration || "",
        difficulty: tip.difficulty || "",
        materials: tip.materials || [],
        notes: tip.notes || "",
        createdAt: now,
        updatedAt: now,
      },
      ...prev,
    ])
  }, [setTips])

  const updateTip = useCallback((id, updates) => {
    setTips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t))
    )
  }, [setTips])

  const deleteTip = useCallback((id) => {
    setTips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, deletedAt: Date.now() } : t))
    )
  }, [setTips])

  const restoreTip = useCallback((id) => {
    setTips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, deletedAt: null } : t))
    )
  }, [setTips])

  const restoreAllTips = useCallback(() => {
    setTips((prev) =>
      prev.map((t) => (t.deletedAt ? { ...t, deletedAt: null } : t))
    )
  }, [setTips])

  const purgeTip = useCallback((id) => {
    setTips((prev) => prev.filter((t) => t.id !== id))
  }, [setTips])

  const emptyTrash = useCallback(() => {
    setTips((prev) => prev.filter((t) => !t.deletedAt))
  }, [setTips])

  const toggleStar = useCallback((id) => {
    setTips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, starred: !t.starred } : t))
    )
  }, [setTips])

  const togglePin = useCallback((id) => {
    setTips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t))
    )
  }, [setTips])

  const markUsed = useCallback((id) => {
    setTips((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, usageCount: (t.usageCount || 0) + 1, lastUsedAt: Date.now() }
          : t
      )
    )
  }, [setTips])

  const getTip = useCallback(
    (id) => tips.find((t) => t.id === id && !t.deletedAt),
    [tips]
  )

  const addCategory = useCallback((cat) => {
    const created = { ...cat, id: genId() }
    setCategories((prev) => [...prev, created])
    return created
  }, [setCategories])

  const updateCategory = useCallback((id, updates) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    )
  }, [setCategories])

  const deleteCategory = useCallback((id) => {
    setCategories((prev) => prev.filter((c) => c.id !== id))
    setTips((prev) => prev.map((t) => (t.categoryId === id ? { ...t, categoryId: null } : t)))
  }, [setCategories, setTips])

  const addTag = useCallback((tag) => {
    const created = { ...tag, id: genId() }
    setTags((prev) => [...prev, created])
    return created
  }, [setTags])

  const updateTag = useCallback((id, updates) => {
    setTags((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }, [setTags])

  const deleteTag = useCallback((id) => {
    setTags((prev) => prev.filter((t) => t.id !== id))
    setTips((prev) => prev.map((t) => ({ ...t, tagIds: t.tagIds.filter((tid) => tid !== id) })))
  }, [setTags, setTips])

  // 合并标签：把源标签替换为目标标签，已存在目标标签时不重复添加
  const mergeTags = useCallback((sourceId, targetId) => {
    if (!sourceId || !targetId || sourceId === targetId) return
    setTips((prev) =>
      prev.map((t) => {
        const tagIds = t.tagIds || []
        if (!tagIds.includes(sourceId)) return t
        const rest = tagIds.filter((id) => id !== sourceId)
        return { ...t, tagIds: rest.includes(targetId) ? rest : [...rest, targetId] }
      })
    )
    setTags((prev) => prev.filter((t) => t.id !== sourceId))
  }, [setTags, setTips])

  const importData = useCallback(({ tips: nextTips, categories: nextCategories, tags: nextTags }) => {
    setTips(nextTips)
    setCategories(nextCategories)
    setTags(nextTags)
  }, [setTips, setCategories, setTags])

  return (
    <AppContext.Provider
      value={{
        tips, categories, tags, categoryMap, tagMap,
        addTip, updateTip, deleteTip, restoreTip, restoreAllTips, purgeTip, emptyTrash,
        getTip, toggleStar, togglePin, markUsed,
        addCategory, updateCategory, deleteCategory,
        addTag, updateTag, deleteTag, mergeTags, importData,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
