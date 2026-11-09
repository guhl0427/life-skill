import { useEffect, useId, useRef } from "react"
import { btnDanger, btnOutline } from "./ui"

export default function ConfirmDialog({
  title,
  message,
  confirmText = "确认删除",
  onConfirm,
  onCancel,
}) {
  const titleId = useId()
  const descId = useId()
  const boxRef = useRef(null)
  const cancelRef = useRef(null)
  const confirmRef = useRef(null)

  useEffect(() => {
    const previouslyFocused = document.activeElement
    confirmRef.current?.focus()

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault()
        onCancel()
        return
      }
      if (e.key !== "Tab" || !boxRef.current) return
      const focusable = boxRef.current.querySelectorAll("button")
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
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/30 animate-[fadeIn_0.2s_ease-out]"
      onClick={onCancel}
    >
      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="w-[90%] max-w-[380px] rotate-[-0.3deg] animate-[slideUp_0.3s_var(--spring)] rounded-sketch-lg border-2 border-line bg-card p-7 shadow-ink-hover"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id={titleId} className="mb-2 font-display text-lg text-ink">{title}</h3>
        <p id={descId} className="mb-5 text-sm text-ink-soft">{message}</p>
        <div className="flex justify-end gap-2.5 max-md:flex-col-reverse">
          <button ref={cancelRef} className={`${btnOutline} max-md:w-full`} onClick={onCancel}>
            取消
          </button>
          <button ref={confirmRef} className={`${btnDanger} max-md:w-full`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
