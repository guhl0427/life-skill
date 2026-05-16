import { createContext, useContext, useCallback } from "react"
import { useLocalStorage } from "../hooks/useLocalStorage"
import { seedCategories, seedTags, seedTips } from "../data/seed"

let _id = 0
function genId() {
  _id++
  return "id-" + Date.now().toString(36) + "-" + _id
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [tips, setTips] = useLocalStorage("ls_tips", seedTips)
  const [categories, setCategories] = useLocalStorage("ls_categories", seedCategories)
  const [tags, setTags] = useLocalStorage("ls_tags", seedTags)

  const addTip = useCallback((tip) => {
    const now = Date.now()
    setTips((prev) => [
      { ...tip, id: genId(), createdAt: now, updatedAt: now },
      ...prev,
    ])
  }, [setTips])

  const updateTip = useCallback((id, updates) => {
    setTips((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t))
    )
  }, [setTips])

  const deleteTip = useCallback((id) => {
    setTips((prev) => prev.filter((t) => t.id !== id))
  }, [setTips])

  const getTip = useCallback((id) => tips.find((t) => t.id === id), [tips])

  const addCategory = useCallback((cat) => {
    setCategories((prev) => [...prev, { ...cat, id: genId() }])
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
    setTags((prev) => [...prev, { ...tag, id: genId() }])
  }, [setTags])

  const updateTag = useCallback((id, updates) => {
    setTags((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }, [setTags])

  const deleteTag = useCallback((id) => {
    setTags((prev) => prev.filter((t) => t.id !== id))
    setTips((prev) => prev.map((t) => ({ ...t, tagIds: t.tagIds.filter((tid) => tid !== id) })))
  }, [setTags, setTips])

  return (
    <AppContext.Provider
      value={{
        tips, categories, tags,
        addTip, updateTip, deleteTip, getTip,
        addCategory, updateCategory, deleteCategory,
        addTag, updateTag, deleteTag,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}
