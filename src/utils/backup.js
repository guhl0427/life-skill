const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v)
const asString = (v) => (typeof v === "string" ? v : "")

export const SNAPSHOT_KEY = "ls_backup_auto"

export function buildBackup({ tips, categories, tags }) {
  return {
    app: "lifeskill",
    version: 1,
    exportedAt: new Date().toISOString(),
    tips,
    categories,
    tags,
  }
}

function mergeItems(currentItems, incomingItems, pick) {
  const items = new Map((currentItems || []).map((item) => [item.id, item]))
  for (const item of incomingItems || []) {
    const existing = items.get(item.id)
    items.set(item.id, existing ? pick(existing, item) : item)
  }
  return Array.from(items.values())
}

export function mergeBackup(current, incoming) {
  return {
    categories: mergeItems(current.categories, incoming.categories, (existing) => existing),
    tags: mergeItems(current.tags, incoming.tags, (existing) => existing),
    tips: mergeItems(current.tips, incoming.tips, (existing, item) =>
      (item.updatedAt || item.createdAt || 0) > (existing.updatedAt || existing.createdAt || 0)
        ? item
        : existing
    ),
  }
}

export function saveSnapshot(data) {
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(buildBackup(data)))
    return true
  } catch {
    return false
  }
}

export function readSnapshot() {
  const raw = localStorage.getItem(SNAPSHOT_KEY)
  if (!raw) return null
  try {
    return parseBackup(raw)
  } catch {
    return null
  }
}

export function parseBackup(raw) {
  let data
  try {
    data = JSON.parse(raw)
  } catch {
    throw new Error("文件不是合法的 JSON")
  }

  if (
    !isObject(data) ||
    !Array.isArray(data.tips) ||
    !Array.isArray(data.categories) ||
    !Array.isArray(data.tags)
  ) {
    throw new Error("备份文件格式不正确")
  }

  const categories = data.categories
    .filter((c) => isObject(c) && asString(c.id) && asString(c.name))
    .map((c) => ({
      id: c.id,
      name: c.name,
      emoji: asString(c.emoji) || "📌",
      color: asString(c.color) || "#7EB8A0",
    }))

  const tags = data.tags
    .filter((t) => isObject(t) && asString(t.id) && asString(t.name))
    .map((t) => ({ id: t.id, name: t.name }))

  const categoryIds = new Set(categories.map((c) => c.id))
  const tagIds = new Set(tags.map((t) => t.id))
  const now = Date.now()

  const tips = data.tips
    .filter((t) => isObject(t) && asString(t.id) && asString(t.title))
    .map((t) => ({
      id: t.id,
      title: t.title,
      content: asString(t.content),
      categoryId: categoryIds.has(t.categoryId) ? t.categoryId : null,
      tagIds: Array.isArray(t.tagIds) ? t.tagIds.filter((id) => tagIds.has(id)) : [],
      starred: Boolean(t.starred),
      createdAt: Number.isFinite(t.createdAt) ? t.createdAt : now,
      updatedAt: Number.isFinite(t.updatedAt) ? t.updatedAt : now,
    }))

  if (tips.length === 0 && categories.length === 0 && tags.length === 0) {
    throw new Error("备份文件里没有可导入的数据")
  }

  return { tips, categories, tags }
}
