import { useEffect, useRef, useState } from "react"

export default function Select({
  id,
  value,
  onChange,
  options,
  ariaLabel,
  placeholder = "请选择",
  disabled = false,
  className = "",
  triggerClassName = "",
}) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef(null)
  const buttonRef = useRef(null)
  const selectedIndex = options.findIndex((option) => option.value === value)
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [open])

  const openMenu = (index = selectedIndex) => {
    setActiveIndex(index >= 0 ? index : 0)
    setOpen(true)
  }

  const choose = (index) => {
    const option = options[index]
    if (!option) return
    onChange(option.value)
    setOpen(false)
    buttonRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setOpen(false)
      return
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault()
      if (!open) {
        openMenu()
        return
      }
      const step = e.key === "ArrowDown" ? 1 : -1
      setActiveIndex((i) => (i + step + options.length) % options.length)
      return
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      if (open) choose(activeIndex)
      else openMenu()
      return
    }
    if (e.key === "Tab") setOpen(false)
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
        className={`flex w-full items-center justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-60 ${triggerClassName}`}
      >
        <span className="grid min-w-0 flex-1 text-left">
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <span
                key={option.value}
                aria-hidden={isSelected ? undefined : "true"}
                className={`col-start-1 row-start-1 truncate ${isSelected ? "" : "invisible"}`}
              >
                {option.label}
              </span>
            )
          })}
          {!selected && <span className="col-start-1 row-start-1 truncate">{placeholder}</span>}
        </span>
        <svg
          viewBox="0 0 12 8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-2 w-3 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M1 1l5 5 5-5" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className="select-menu absolute left-0 top-[calc(100%+6px)] z-50 max-h-64 w-full overflow-y-auto rounded-sketch border-2 border-line bg-card p-1 shadow-ink"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => choose(index)}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex cursor-pointer items-center gap-2 rounded-sketch-sm px-3 py-1.5 text-left text-[13px] transition-colors duration-150 ${
                  isSelected ? "font-medium text-primary" : "text-ink-soft"
                } ${index === activeIndex ? "bg-primary-light" : ""}`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && (
                  <span aria-hidden="true" className="ml-auto text-[11px]">
                    ✓
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
