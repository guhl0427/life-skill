export function getKeywords(query) {
  return (query || "").toLowerCase().split(/\s+/).filter(Boolean)
}

function buildHaystack(tip, categoryMap, tagMap) {
  const cat = categoryMap?.get(tip.categoryId)
  const tagNames = (tip.tagIds || []).map((id) => tagMap?.get(id)?.name || "")
  return [tip.title, tip.content, cat?.name, ...tagNames].filter(Boolean).join("\n").toLowerCase()
}

export function matchesTip(tip, query, categoryMap, tagMap) {
  const keywords = getKeywords(query)
  if (keywords.length === 0) return true
  const haystack = buildHaystack(tip, categoryMap, tagMap)
  return keywords.every((keyword) => haystack.includes(keyword))
}

export function getSnippet(text, query, maxLength = 90) {
  if (!text) return ""
  const keywords = getKeywords(query)
  if (keywords.length === 0) return text

  const lower = text.toLowerCase()
  let index = -1
  for (const keyword of keywords) {
    const found = lower.indexOf(keyword)
    if (found !== -1 && (index === -1 || found < index)) index = found
  }
  if (index === -1 || text.length <= maxLength) return text

  const start = Math.max(0, index - Math.floor(maxLength / 3))
  const end = Math.min(text.length, start + maxLength)
  return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "")
}

export function splitByKeywords(text, query) {
  if (!text) return []
  const keywords = getKeywords(query)
  if (keywords.length === 0) return [{ text, match: false }]

  const pattern = keywords
    .slice()
    .sort((a, b) => b.length - a.length)
    .map((keyword) => keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")

  return text
    .split(new RegExp("(" + pattern + ")", "gi"))
    .filter(Boolean)
    .map((part) => ({
      text: part,
      match: keywords.includes(part.toLowerCase()),
    }))
}
