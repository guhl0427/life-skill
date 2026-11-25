import { useEffect, useId, useRef, useState } from "react"
import { SHARE_STYLES, renderTipImage, downloadCanvasImage } from "../utils/shareImage"
import { btnPrimary, btnOutline } from "./ui"

const SWATCHES = {
  paper: { background: "#FFFDF2", borderColor: "#D4C9B8" },
  dark: { background: "#1E2B26", borderColor: "#8FC9B1" },
  editorial: {
    background: "#FBF8F0",
    borderColor: "#2F2A24",
    borderLeftColor: "#467D67",
    borderLeftWidth: "4px",
  },
}

export default function ShareImageDialog({ tip, category, tags, onClose }) {
  const [styleId, setStyleId] = useState("paper")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [downloadError, setDownloadError] = useState("")
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const titleId = useId()
  const hostRef = useRef(null)
  const canvasRef = useRef(null)
  const boxRef = useRef(null)
  const closeRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    renderTipImage({ tip, category, tags, styleId })
      .then((canvas) => {
        if (cancelled) return
        canvasRef.current = canvas
        canvas.style.display = "block"
        canvas.style.width = "auto"
        canvas.style.height = "auto"
        canvas.style.maxWidth = "100%"
        canvas.style.maxHeight = "min(62vh, 560px)"
        canvas.style.borderRadius = "14px"
        canvas.style.boxShadow = "2px 3px 0 var(--line-soft)"
        hostRef.current?.replaceChildren(canvas)
        setLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setError("生成分享图失败，请重试。")
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [tip, category, tags, styleId, reloadKey])

  useEffect(() => {
    const previous = document.activeElement
    const bodyOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeRef.current?.focus()

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key !== "Tab" || !boxRef.current) return
      const focusable = boxRef.current.querySelectorAll("button, a")
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = bodyOverflow
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [onClose])

  const handleStyleChange = (id) => {
    if (id === styleId) return
    setLoading(true)
    setError("")
    setDownloadError("")
    setStyleId(id)
  }

  const handleRetry = () => {
    setLoading(true)
    setError("")
    setReloadKey((v) => v + 1)
  }

  const handleDownload = async () => {
    if (!canvasRef.current || downloading) return
    setDownloading(true)
    setDownloadError("")
    try {
      await downloadCanvasImage(canvasRef.current, tip.title)
      setDownloaded(true)
      setTimeout(() => setDownloaded(false), 2000)
    } catch {
      setDownloadError("下载失败，请重试。")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgb(74_66_56_/_0.32)] p-4 backdrop-blur-[2px] animate-[fadeIn_0.2s_ease-out] dark:bg-[rgb(0_0_0_/_0.65)]"
      onClick={onClose}
    >
      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[94vh] w-full max-w-[880px] flex-col overflow-y-auto rounded-sketch-lg border-2 border-line bg-card shadow-ink-hover md:flex-row md:overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex min-h-[300px] flex-1 items-center justify-center bg-paper-deep p-4 md:min-h-[440px] md:p-6">
          <div ref={hostRef} className="flex w-full items-center justify-center" />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-paper-deep/80 text-sm text-ink-soft">
              生成中…
            </div>
          )}
          {error && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-paper-deep/90 px-6 text-center">
              <p className="text-sm text-danger">{error}</p>
              <button
                type="button"
                className={`${btnOutline} px-4 py-1.5`}
                onClick={handleRetry}
              >
                重试
              </button>
            </div>
          )}
        </div>

        <div className="flex w-full shrink-0 flex-col gap-4 border-t-2 border-line-soft p-5 md:w-[280px] md:border-l-2 md:border-t-0">
          <div>
            <h2 id={titleId} className="font-display text-xl text-ink">
              分享图预览
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-ink-soft">
              选择样式后下载，图片尺寸 1080 × 1440。
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {SHARE_STYLES.map((style) => {
              const active = style.id === styleId
              return (
                <button
                  key={style.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => handleStyleChange(style.id)}
                  className={
                    "flex items-center gap-3 rounded-sketch border-2 px-3 py-2 text-left transition-all duration-200 " +
                    (active
                      ? "border-primary bg-primary-light"
                      : "border-line-soft bg-card hover:border-primary")
                  }
                >
                  <span
                    className="h-8 w-6 shrink-0 rounded-sketch-sm border-2"
                    style={SWATCHES[style.id]}
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className="block font-display text-sm text-ink">{style.label}</span>
                    <span className="block text-[11px] text-ink-faint">{style.hint}</span>
                  </span>
                </button>
              )
            })}
          </div>

          {downloadError && <p role="alert" className="text-sm text-danger">{downloadError}</p>}

          <div className="mt-auto flex gap-2">
            <button
              ref={closeRef}
              type="button"
              className={`${btnOutline} shrink-0`}
              onClick={onClose}
            >
              关闭
            </button>
            <button
              type="button"
              className={`${btnPrimary} flex-1`}
              onClick={handleDownload}
              disabled={loading || downloading || Boolean(error)}
            >
              {downloading ? "保存中…" : downloaded ? "已保存" : "下载图片"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
