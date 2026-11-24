import { formatDate } from "./format"

const W = 540
const H = 720
const SCALE = 2
const PAD = 26

const C = {
  paper: "#FFFDF2",
  card: "#FFFEF9",
  ink: "#3D3D3D",
  inkSoft: "#63635F",
  inkFaint: "#7E7668",
  line: "#D4C9B8",
  lineSoft: "#E8E0D0",
  primary: "#467D67",
  primaryLight: "#E8F5EE",
}

function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r)
  ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r)
  ctx.closePath()
}

function withAlpha(hex, alpha) {
  const value = String(hex || "").replace("#", "")
  if (!/^[0-9a-f]{6}$/i.test(value)) return "rgba(126,184,160,0.16)"
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function wrapLines(ctx, text, maxWidth) {
  const lines = []
  for (const paragraph of String(text || "").split("\n")) {
    let line = ""
    for (const char of paragraph) {
      const next = line + char
      if (line && ctx.measureText(next).width > maxWidth) {
        lines.push(line)
        line = char
      } else {
        line = next
      }
    }
    lines.push(line)
  }
  return lines
}

function drawParagraph(ctx, text, x, y, maxWidth, lineHeight, maxLines, color) {
  const all = wrapLines(ctx, text, maxWidth)
  const lines = all.slice(0, maxLines)
  if (all.length > maxLines && lines.length > 0) {
    lines[lines.length - 1] = lines[lines.length - 1].replace(/\s+$/, "") + "…"
  }
  ctx.fillStyle = color
  lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight))
  return y + lines.length * lineHeight
}

function drawPill(ctx, text, x, y, color) {
  ctx.font = '13px "Noto Sans SC Variable", sans-serif'
  const width = ctx.measureText(text).width + 24
  const height = 26
  ctx.fillStyle = withAlpha(color, 0.18)
  roundRect(ctx, x, y, width, height, 9)
  ctx.fill()
  ctx.fillStyle = C.inkSoft
  ctx.fillText(text, x + 12, y + 6)
  return width
}

async function loadFonts() {
  if (!document.fonts?.load) return
  try {
    await Promise.all([
      document.fonts.load('400 30px "ZCOOL KuaiLe"'),
      document.fonts.load('400 17px "Noto Sans SC Variable"'),
      document.fonts.load('500 13px "Noto Sans SC Variable"'),
    ])
  } catch {
    // 字体加载失败时使用回退字体
  }
}

function safeFileName(text) {
  return (
    String(text || "tip")
      .replace(/[\\/:*?"<>|\s]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "tip"
  )
}

export async function renderTipImage({ tip, category, tags = [] }) {
  await loadFonts()

  const canvas = document.createElement("canvas")
  canvas.width = W * SCALE
  canvas.height = H * SCALE
  const ctx = canvas.getContext("2d")
  ctx.scale(SCALE, SCALE)
  ctx.textBaseline = "top"
  ctx.textAlign = "left"

  // 纸张背景
  ctx.fillStyle = C.paper
  ctx.fillRect(0, 0, W, H)
  const greenGlow = ctx.createRadialGradient(W * 0.15, H * 0.25, 0, W * 0.15, H * 0.25, W * 0.7)
  greenGlow.addColorStop(0, "rgba(126,184,160,0.10)")
  greenGlow.addColorStop(1, "rgba(126,184,160,0)")
  ctx.fillStyle = greenGlow
  ctx.fillRect(0, 0, W, H)
  const orangeGlow = ctx.createRadialGradient(W * 0.85, H * 0.78, 0, W * 0.85, H * 0.78, W * 0.65)
  orangeGlow.addColorStop(0, "rgba(244,162,97,0.10)")
  orangeGlow.addColorStop(1, "rgba(244,162,97,0)")
  ctx.fillStyle = orangeGlow
  ctx.fillRect(0, 0, W, H)

  // 轻微旋转，模拟手绘卡片
  ctx.save()
  ctx.translate(W / 2, H / 2)
  ctx.rotate(-0.006)
  ctx.translate(-W / 2, -H / 2)

  const x = PAD
  const y = PAD
  const w = W - PAD * 2
  const h = H - PAD * 2

  ctx.save()
  ctx.shadowColor = "rgba(61,61,61,0.16)"
  ctx.shadowBlur = 18
  ctx.shadowOffsetY = 8
  ctx.fillStyle = C.card
  roundRect(ctx, x, y, w, h, 22)
  ctx.fill()
  ctx.restore()

  ctx.strokeStyle = C.line
  ctx.lineWidth = 2
  roundRect(ctx, x, y, w, h, 22)
  ctx.stroke()

  ctx.save()
  ctx.setLineDash([5, 5])
  ctx.strokeStyle = C.lineSoft
  ctx.lineWidth = 1.5
  roundRect(ctx, x + 11, y + 11, w - 22, h - 22, 16)
  ctx.stroke()
  ctx.restore()

  // 顶部胶带装饰
  ctx.save()
  ctx.translate(W / 2, y + 2)
  ctx.rotate(-0.03)
  ctx.fillStyle = "rgba(244,162,97,0.26)"
  ctx.fillRect(-58, -9, 116, 18)
  ctx.restore()

  const cx = x + 36
  const cw = w - 72
  let cy = y + 40

  if (category) {
    drawPill(ctx, `${category.emoji} ${category.name}`, cx, cy, category.color)
    cy += 42
  }

  ctx.font = '30px "ZCOOL KuaiLe", cursive'
  cy = drawParagraph(ctx, tip.title, cx, cy, cw, 42, 2, C.ink)
  cy += 8
  ctx.fillStyle = C.primary
  ctx.globalAlpha = 0.35
  ctx.fillRect(cx, cy, 56, 3)
  ctx.globalAlpha = 1
  cy += 22

  const meta = []
  if (tip.duration) meta.push("耗时 " + tip.duration)
  if (tip.difficulty) meta.push("难度 " + tip.difficulty)
  if (meta.length > 0) {
    ctx.font = '13px "Noto Sans SC Variable", sans-serif'
    cy = drawParagraph(ctx, meta.join("  ·  "), cx, cy, cw, 22, 1, C.inkFaint)
    cy += 8
  }
  if (tip.scenario) {
    ctx.font = '13px "Noto Sans SC Variable", sans-serif'
    cy = drawParagraph(ctx, "适用场景：" + tip.scenario, cx, cy, cw, 22, 1, C.inkFaint)
    cy += 8
  }

  if (tip.materials?.length > 0) {
    ctx.font = '14px "Noto Sans SC Variable", sans-serif'
    cy = drawParagraph(ctx, "材料：" + tip.materials.join("、"), cx, cy, cw, 24, 1, C.inkSoft)
    cy += 8
  }

  const steps = (tip.steps || []).slice(0, 4)
  if (tip.content) {
    ctx.font = '17px "Noto Sans SC Variable", sans-serif'
    cy = drawParagraph(ctx, tip.content, cx, cy, cw, 29, steps.length > 0 ? 6 : 9, C.inkSoft)
    cy += 16
  }

  steps.forEach((step, index) => {
    if (cy + 30 > y + h - 118) return
    ctx.fillStyle = C.primaryLight
    ctx.beginPath()
    ctx.arc(cx + 10, cy + 10, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = C.primary
    ctx.font = '12px "Noto Sans SC Variable", sans-serif'
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(String(index + 1), cx + 10, cy + 10)
    ctx.textAlign = "left"
    ctx.textBaseline = "top"
    ctx.font = '15px "Noto Sans SC Variable", sans-serif'
    drawParagraph(ctx, step, cx + 30, cy, cw - 30, 22, 1, C.ink)
    cy += 32
  })

  const footerTop = y + h - 58
  if (tags.length > 0) {
    ctx.font = '13px "Noto Sans SC Variable", sans-serif'
    const tagText = tags
      .slice(0, 8)
      .map((tag) => "#" + tag.name)
      .join("   ")
    drawParagraph(ctx, tagText, cx, footerTop - 26, cw, 20, 1, C.inkFaint)
  }

  ctx.save()
  ctx.setLineDash([4, 4])
  ctx.strokeStyle = C.lineSoft
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx, footerTop)
  ctx.lineTo(cx + cw, footerTop)
  ctx.stroke()
  ctx.restore()

  ctx.font = '12px "Noto Sans SC Variable", sans-serif'
  ctx.fillStyle = C.inkFaint
  ctx.fillText("LifeSkill · 生活小技巧", cx, footerTop + 14)
  ctx.textAlign = "right"
  ctx.fillText(formatDate(Date.now()), cx + cw, footerTop + 14)
  ctx.textAlign = "left"

  ctx.restore()

  return canvas
}

export async function downloadTipImage(options) {
  const canvas = await renderTipImage(options)
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"))
  if (!blob) throw new Error("图片生成失败")

  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "lifeskill-" + safeFileName(options.tip?.title) + ".png"
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
