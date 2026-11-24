import { formatDate } from "./format"

function safeFileName(text) {
  return (
    String(text || "tip")
      .replace(/[\\/:*?"<>|\s]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "tip"
  )
}

export function buildTipMarkdown(tip, category, tags = []) {
  const lines = [`# ${tip.title}`, ""]
  const meta = []
  if (category) meta.push(`分类：${category.emoji} ${category.name}`)
  if (tip.duration) meta.push(`耗时：${tip.duration}`)
  if (tip.difficulty) meta.push(`难度：${tip.difficulty}`)
  if (meta.length > 0) {
    lines.push(`> ${meta.join(" · ")}`, "")
  }
  if (tip.scenario) {
    lines.push(`**适用场景**：${tip.scenario}`, "")
  }
  if (tip.content) {
    lines.push("## 内容", "", tip.content, "")
  }
  if (tip.materials?.length > 0) {
    lines.push("## 材料", "", ...tip.materials.map((item) => `- ${item}`), "")
  }
  if (tip.steps?.length > 0) {
    lines.push("## 步骤", "", ...tip.steps.map((step, index) => `${index + 1}. ${step}`), "")
  }
  if (tip.notes) {
    lines.push("## 注意事项", "", tip.notes, "")
  }
  if (tags.length > 0) {
    lines.push("## 标签", "", tags.map((tag) => `#${tag.name}`).join(" "), "")
  }
  lines.push("---", "", `来自 LifeSkill · ${formatDate(Date.now())}`)
  return lines.join("\n")
}

export function downloadTipMarkdown(tip, category, tags = []) {
  const blob = new Blob([buildTipMarkdown(tip, category, tags)], {
    type: "text/markdown;charset=utf-8",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "lifeskill-" + safeFileName(tip.title) + ".md"
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
