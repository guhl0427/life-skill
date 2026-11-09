import { useMemo, useCallback } from "react"
import { AppContext } from "./app-context"
import { useLocalStorage } from "../hooks/useLocalStorage"
import { seedCategories, seedTags, seedTips } from "../data/seed"

let _id = 0
function genId() {
  _id++
  return "id-" + Date.now().toString(36) + "-" + _id
}

export function AppProvider({ children }) {
  const [tips, setTips] = useLocalStorage("ls_tips", seedTips)
  const [categories, setCategories] = useLocalStorage("ls_categories", seedCategories)
  const [tags, setTags] = useLocalStorage("ls_tags", seedTags)

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  )
  const tagMap = useMemo(() => new Map(tags.map((t) => [t.id, t])), [tags])

  const addTip = useCallback((tip) => {
    const now = Date.now()
    setTips((prev) => [
      {
        ...tip,
        id: genId(),
        starred: false,
        usageCount: 0,
        lastUsedAt: null,
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

  const importData = useCallback(({ tips: nextTips, categories: nextCategories, tags: nextTags }) => {
    setTips(nextTips)
    setCategories(nextCategories)
    setTags(nextTags)
  }, [setTips, setCategories, setTags])

  return (
    <AppContext.Provider
      value={{
        tips, categories, tags, categoryMap, tagMap,
        addTip, updateTip, deleteTip, restoreTip, purgeTip, emptyTrash,
        getTip, toggleStar, markUsed,
        addCategory, updateCategory, deleteCategory,
        addTag, updateTag, deleteTag, importData,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
