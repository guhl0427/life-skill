import { formatDate } from "./format"

export const SHARE_STYLES = [
  { id: "paper", label: "手绘便签", hint: "暖纸、胶带与虚线" },
  { id: "dark", label: "墨绿夜读", hint: "深色底、柔和文字" },
  { id: "editorial", label: "编辑排版", hint: "大标题、留白与色块" },
]

const W = 540
const H = 720
const SCALE = 2
const PAD = 26

const THEMES = {
  paper: {
    background: "#FFFDF2",
    glowA: "rgba(126,184,160,0.10)",
    glowB: "rgba(244,162,97,0.10)",
    card: "#FFFEF9",
    shadow: "rgba(61,61,61,0.16)",
    border: "#D4C9B8",
    borderSoft: "#E8E0D0",
    dashed: true,
    tape: true,
    radius: 22,
    rotate: -0.006,
    ink: "#3D3D3D",
    inkSoft: "#63635F",
    inkFaint: "#7E7668",
    primary: "#467D67",
    primaryLight: "#E8F5EE",
    stepText: "#467D67",
    footerText: "#7E7668",
  },
  dark: {
    background: "#131E1A",
    glowA: "rgba(143,201,177,0.16)",
    glowB: "rgba(244,162,97,0.08)",
    card: "#1E2B26",
    shadow: "rgba(0,0,0,0.45)",
    border: "rgba(143,201,177,0.35)",
    borderSoft: "rgba(143,201,177,0.16)",
    dashed: false,
    tape: false,
    radius: 20,
    rotate: 0,
    ink: "#F2EEE2",
    inkSoft: "#C9D4CD",
    inkFaint: "#8FA79B",
    primary: "#8FC9B1",
    primaryLight: "rgba(143,201,177,0.2)",
    stepText: "#14201B",
    footerText: "#7F978B",
  },
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
  if (!/^[0-9a-f]{6}$/i.test(value)) return `rgba(126,184,160,${alpha})`
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

function drawPill(ctx, text, x, y, color, theme) {
  ctx.font = '13px "Noto Sans SC Variable", sans-serif'
  const width = ctx.measureText(text).width + 24
  const height = 26
  ctx.fillStyle = withAlpha(color, theme === THEMES.dark ? 0.26 : 0.18)
  roundRect(ctx, x, y, width, height, 9)
  ctx.fill()
  ctx.strokeStyle = withAlpha(color, theme === THEMES.dark ? 0.5 : 0.45)
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.fillStyle = theme.ink
  ctx.fillText(text, x + 12, y + 6)
  return width
}

function drawStamp(ctx, centerX, centerY, theme) {
  ctx.save()
  ctx.translate(centerX, centerY)
  ctx.rotate(-0.12)
  ctx.strokeStyle = withAlpha(theme.primary, 0.38)
  ctx.lineWidth = 2
  ctx.setLineDash([5, 5])
  ctx.beginPath()
  ctx.arc(0, 0, 46, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.fillStyle = withAlpha(theme.primary, 0.75)
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.font = '700 12px "Noto Sans SC Variable", sans-serif'
  ctx.fillText("LIFE SKILL", 0, -8)
  ctx.font = '11px "Noto Sans SC Variable", sans-serif'
  ctx.fillText("生活小技巧", 0, 12)
  ctx.restore()
  ctx.textAlign = "left"
  ctx.textBaseline = "top"
}

function drawGlows(ctx, theme) {
  ctx.fillStyle = theme.background
  ctx.fillRect(0, 0, W, H)
  const first = ctx.createRadialGradient(W * 0.15, H * 0.25, 0, W * 0.15, H * 0.25, W * 0.7)
  first.addColorStop(0, theme.glowA)
  first.addColorStop(1, theme.glowA.replace(/[\d.]+\)$/, "0)"))
  ctx.fillStyle = first
  ctx.fillRect(0, 0, W, H)
  const second = ctx.createRadialGradient(W * 0.85, H * 0.78, 0, W * 0.85, H * 0.78, W * 0.65)
  second.addColorStop(0, theme.glowB)
  second.addColorStop(1, theme.glowB.replace(/[\d.]+\)$/, "0)"))
  ctx.fillStyle = second
  ctx.fillRect(0, 0, W, H)
}

function drawThemedCard(ctx, { tip, category, tags }, theme) {
  drawGlows(ctx, theme)

  ctx.save()
  if (theme.rotate) {
    ctx.translate(W / 2, H / 2)
    ctx.rotate(theme.rotate)
    ctx.translate(-W / 2, -H / 2)
  }

  const x = PAD
  const y = PAD
  const w = W - PAD * 2
  const h = H - PAD * 2

  ctx.save()
  ctx.shadowColor = theme.shadow
  ctx.shadowBlur = 18
  ctx.shadowOffsetY = 8
  ctx.fillStyle = theme.card
  roundRect(ctx, x, y, w, h, theme.radius)
  ctx.fill()
  ctx.restore()

  ctx.strokeStyle = theme.border
  ctx.lineWidth = 2
  roundRect(ctx, x, y, w, h, theme.radius)
  ctx.stroke()

  if (theme.dashed) {
    ctx.save()
    ctx.setLineDash([5, 5])
    ctx.strokeStyle = theme.borderSoft
    ctx.lineWidth = 1.5
    roundRect(ctx, x + 11, y + 11, w - 22, h - 22, 16)
    ctx.stroke()
    ctx.restore()
  }

  if (theme.tape) {
    ctx.save()
    ctx.translate(W / 2, y + 2)
    ctx.rotate(-0.03)
    ctx.fillStyle = "rgba(244,162,97,0.26)"
    ctx.fillRect(-58, -9, 116, 18)
    ctx.restore()
  }

  const cx = x + 36
  const cw = w - 72
  let cy = y + 40

  if (category) {
    drawPill(ctx, `${category.emoji} ${category.name}`, cx, cy, category.color, theme)
    cy += 42
  }

  ctx.font = '30px "ZCOOL KuaiLe", cursive'
  cy = drawParagraph(ctx, tip.title, cx, cy, cw, 42, 2, theme.ink)
  cy += 8
  ctx.fillStyle = withAlpha(theme.primary, 0.35)
  ctx.fillRect(cx, cy, 56, 3)
  cy += 22

  const meta = []
  if (tip.duration) meta.push("耗时 " + tip.duration)
  if (tip.difficulty) meta.push("难度 " + tip.difficulty)
  if (meta.length > 0) {
    ctx.font = '13px "Noto Sans SC Variable", sans-serif'
    cy = drawParagraph(ctx, meta.join("  ·  "), cx, cy, cw, 22, 1, theme.inkFaint)
    cy += 8
  }
  if (tip.scenario) {
    ctx.font = '13px "Noto Sans SC Variable", sans-serif'
    cy = drawParagraph(ctx, "适用场景：" + tip.scenario, cx, cy, cw, 22, 1, theme.inkFaint)
    cy += 8
  }
  if (tip.materials?.length > 0) {
    ctx.font = '14px "Noto Sans SC Variable", sans-serif'
    cy = drawParagraph(ctx, "材料：" + tip.materials.join("、"), cx, cy, cw, 24, 1, theme.inkSoft)
    cy += 8
  }

  const steps = (tip.steps || []).slice(0, 4)
  if (tip.content) {
    ctx.font = '17px "Noto Sans SC Variable", sans-serif'
    cy = drawParagraph(ctx, tip.content, cx, cy, cw, 29, steps.length > 0 ? 6 : 9, theme.inkSoft)
    cy += 16
  }

  steps.forEach((step, index) => {
    if (cy + 30 > y + h - 118) return
    ctx.fillStyle = theme.primaryLight
    ctx.beginPath()
    ctx.arc(cx + 10, cy + 10, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = theme.stepText
    ctx.font = '12px "Noto Sans SC Variable", sans-serif'
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(String(index + 1), cx + 10, cy + 10)
    ctx.textAlign = "left"
    ctx.textBaseline = "top"
    ctx.font = '15px "Noto Sans SC Variable", sans-serif'
    drawParagraph(ctx, step, cx + 30, cy, cw - 30, 22, 1, theme.ink)
    cy += 32
  })

  const footerTop = y + h - 58
  const remaining = footerTop - 50 - cy
  if (remaining > 120) {
    drawStamp(ctx, cx + cw / 2, cy + remaining / 2, theme)
  }
  if (tags.length > 0) {
    ctx.font = '13px "Noto Sans SC Variable", sans-serif'
    const tagText = tags
      .slice(0, 8)
      .map((tag) => "#" + tag.name)
      .join("   ")
    drawParagraph(ctx, tagText, cx, footerTop - 26, cw, 20, 1, theme.inkFaint)
  }

  ctx.save()
  if (theme.dashed) ctx.setLineDash([4, 4])
  ctx.strokeStyle = theme.borderSoft
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx, footerTop)
  ctx.lineTo(cx + cw, footerTop)
  ctx.stroke()
  ctx.restore()

  ctx.font = '12px "Noto Sans SC Variable", sans-serif'
  ctx.fillStyle = theme.footerText
  ctx.fillText("LifeSkill · 生活小技巧", cx, footerTop + 14)
  ctx.textAlign = "right"
  ctx.fillText(formatDate(Date.now()), cx + cw, footerTop + 14)
  ctx.textAlign = "left"

  ctx.restore()
}

function drawEditorial(ctx, { tip, category, tags }) {
  // 背景与细网格
  ctx.fillStyle = "#F1ECE2"
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = "rgba(61,61,61,0.04)"
  ctx.lineWidth = 1
  for (let gx = 0; gx < W; gx += 36) {
    ctx.beginPath()
    ctx.moveTo(gx, 0)
    ctx.lineTo(gx, H)
    ctx.stroke()
  }
  for (let gy = 0; gy < H; gy += 36) {
    ctx.beginPath()
    ctx.moveTo(0, gy)
    ctx.lineTo(W, gy)
    ctx.stroke()
  }

  const x = PAD
  const y = PAD
  const w = W - PAD * 2
  const h = H - PAD * 2

  // 硬边阴影 + 卡片
  ctx.fillStyle = "rgba(61,61,61,0.12)"
  roundRect(ctx, x + 8, y + 8, w, h, 6)
  ctx.fill()
  ctx.fillStyle = "#FBF8F0"
  roundRect(ctx, x, y, w, h, 6)
  ctx.fill()

  // 左侧装饰列
  ctx.fillStyle = "#467D67"
  ctx.fillRect(x + 32, y + 30, 5, h - 100)
  ctx.save()
  ctx.translate(x + 19, y + h / 2)
  ctx.rotate(-Math.PI / 2)
  ctx.font = '9px "Noto Sans SC Variable", sans-serif'
  ctx.fillStyle = "rgba(70,125,103,0.55)"
  ctx.textAlign = "center"
  ctx.fillText("L I F E S K I L L", 0, 0)
  ctx.restore()
  ctx.textAlign = "left"

  const cx = x + 54
  const cw = w - 54 - 30
  let cy = y + 30

  // 顶部标签
  ctx.font = '700 11px "Noto Sans SC Variable", sans-serif'
  ctx.fillStyle = "#467D67"
  ctx.fillText("L I F E S K I L L", cx, cy)
  if (category) {
    ctx.font = '12px "Noto Sans SC Variable", sans-serif'
    ctx.fillStyle = "#7E7668"
    ctx.textAlign = "right"
    ctx.fillText(`${category.emoji} ${category.name}`, cx + cw, cy)
    ctx.textAlign = "left"
  }
  cy += 22
  ctx.strokeStyle = "#3D3D3D"
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(cx + cw, cy)
  ctx.stroke()
  cy += 22

  // 大标题
  ctx.font = '36px "ZCOOL KuaiLe", cursive'
  cy = drawParagraph(ctx, tip.title, cx, cy, cw, 46, 3, "#2F2A24")
  cy += 10
  ctx.fillStyle = "#467D67"
  ctx.fillRect(cx, cy, 64, 4)
  cy += 24

  const meta = []
  if (tip.duration) meta.push("耗时 " + tip.duration)
  if (tip.difficulty) meta.push("难度 " + tip.difficulty)
  if (tip.scenario) meta.push("场景 " + tip.scenario)
  if (meta.length > 0) {
    ctx.font = '12px "Noto Sans SC Variable", sans-serif'
    cy = drawParagraph(ctx, meta.join("   /   "), cx, cy, cw, 20, 1, "#7E7668")
    cy += 10
  }

  if (tip.materials?.length > 0) {
    ctx.font = '700 11px "Noto Sans SC Variable", sans-serif'
    ctx.fillStyle = "#467D67"
    ctx.fillText("材料", cx, cy)
    ctx.font = '14px "Noto Sans SC Variable", sans-serif'
    cy = drawParagraph(ctx, tip.materials.join("、"), cx + 32, cy - 2, cw - 32, 22, 1, "#4A453E")
    cy += 10
  }

  if (tip.content) {
    ctx.font = '16px "Noto Sans SC Variable", sans-serif'
    cy = drawParagraph(ctx, tip.content, cx, cy, cw, 28, (tip.steps || []).length > 0 ? 6 : 8, "#5B554C")
    cy += 14
  }

  const steps = (tip.steps || []).slice(0, 3)
  if (steps.length > 0) {
    ctx.font = '700 11px "Noto Sans SC Variable", sans-serif'
    ctx.fillStyle = "#467D67"
    ctx.fillText("步骤", cx, cy)
    cy += 20
    steps.forEach((step, index) => {
      if (cy + 26 > y + h - 92) return
      ctx.font = '700 13px "Noto Sans SC Variable", sans-serif'
      ctx.fillStyle = "#467D67"
      ctx.fillText(String(index + 1).padStart(2, "0"), cx, cy)
      ctx.font = '14px "Noto Sans SC Variable", sans-serif'
      drawParagraph(ctx, step, cx + 28, cy, cw - 28, 22, 1, "#3D3D3D")
      cy += 26
    })
  }

  // 底部色块
  const bandTop = y + h - 64
  ctx.save()
  roundRect(ctx, x, y, w, h, 6)
  ctx.clip()
  ctx.fillStyle = "#467D67"
  ctx.fillRect(x, bandTop, w, 64)
  ctx.restore()

  ctx.font = '12px "Noto Sans SC Variable", sans-serif'
  ctx.fillStyle = "#FFFDF2"
  const tagText = tags
    .slice(0, 6)
    .map((tag) => "#" + tag.name)
    .join("   ")
  if (tagText) {
    drawParagraph(ctx, tagText, cx, bandTop + 14, cw, 18, 1, "#FFFDF2")
  }
  ctx.font = '11px "Noto Sans SC Variable", sans-serif'
  ctx.textAlign = "right"
  ctx.fillStyle = "rgba(255,253,242,0.8)"
  ctx.fillText("LifeSkill · " + formatDate(Date.now()), cx + cw, bandTop + 38)
  ctx.textAlign = "left"

  // 边框后画，保证色块不盖住描边
  ctx.strokeStyle = "#2F2A24"
  ctx.lineWidth = 2
  roundRect(ctx, x, y, w, h, 6)
  ctx.stroke()
}

async function loadFonts() {
  if (!document.fonts?.load) return
  try {
    await Promise.all([
      document.fonts.load('400 30px "ZCOOL KuaiLe"'),
      document.fonts.load('400 17px "Noto Sans SC Variable"'),
      document.fonts.load('500 13px "Noto Sans SC Variable"'),
      document.fonts.load('700 11px "Noto Sans SC Variable"'),
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

export async function renderTipImage({ tip, category, tags = [], styleId = "paper" }) {
  await loadFonts()

  const canvas = document.createElement("canvas")
  canvas.width = W * SCALE
  canvas.height = H * SCALE
  const ctx = canvas.getContext("2d")
  ctx.scale(SCALE, SCALE)
  ctx.textBaseline = "top"
  ctx.textAlign = "left"

  const data = { tip, category, tags }
  if (styleId === "dark") {
    drawThemedCard(ctx, data, THEMES.dark)
  } else if (styleId === "editorial") {
    drawEditorial(ctx, data)
  } else {
    drawThemedCard(ctx, data, THEMES.paper)
  }

  return canvas
}

export function downloadCanvasImage(canvas, title) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("图片生成失败"))
        return
      }
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "lifeskill-" + safeFileName(title) + ".png"
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 0)
      resolve()
    }, "image/png")
  })
}
