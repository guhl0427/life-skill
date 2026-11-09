import { useState, useEffect, useCallback, useMemo } from "react"
import { NavLink, Link, useNavigate, useLocation, useSearchParams } from "react-router-dom"
import { useApp } from "../context/useApp"
import { btnPrimary, btnSm } from "./ui"

const navClass = ({ isActive }) =>
  "flex items-center gap-2.5 rounded-sketch px-3.5 py-2.5 text-[15px] transition-colors duration-200 " +
  (isActive ? "bg-primary text-white" : "text-ink-soft hover:bg-primary-light hover:text-ink")

export default function Layout({ children }) {
  const { tips, categories } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [storageError, setStorageError] = useState(false)
  const [syncNotice, setSyncNotice] = useState(false)
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const urlQuery = searchParams.get("q") || ""
  const [dark, setDark] = useState(() => localStorage.getItem("ls_dark") === "true")
  const navigate = useNavigate()

  const tipsByCategory = useMemo(() => {
    const counts = new Map()
    for (const tip of tips) {
      if (tip.deletedAt) continue
      if (tip.categoryId) counts.set(tip.categoryId, (counts.get(tip.categoryId) || 0) + 1)
    }
    return counts
  }, [tips])

  const trashedCount = useMemo(() => tips.filter((t) => t.deletedAt).length, [tips])

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "")
    localStorage.setItem("ls_dark", dark)
  }, [dark])

  useEffect(() => {
    const onError = () => setStorageError(true)
    window.addEventListener("ls-storage-error", onError)
    return () => window.removeEventListener("ls-storage-error", onError)
  }, [])

  useEffect(() => {
    let timer
    const onSync = (e) => {
      if (!["ls_tips", "ls_categories", "ls_tags"].includes(e.detail?.key)) return
      setSyncNotice(true)
      clearTimeout(timer)
      timer = setTimeout(() => setSyncNotice(false), 3000)
    }
    window.addEventListener("ls-storage-sync", onSync)
    return () => {
      window.removeEventListener("ls-storage-sync", onSync)
      clearTimeout(timer)
    }
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const q = (new FormData(e.currentTarget).get("q") || "").trim()
    if (q) {
      navigate("/?q=" + encodeURIComponent(q))
    } else {
      navigate("/")
    }
  }

  const closeMenu = useCallback(() => {
    if (window.innerWidth >= 768) return
    setClosing(true)
  }, [])

  const onCloseEnd = useCallback(() => {
    setMenuOpen(false)
    setClosing(false)
  }, [])

  const toggleMenu = useCallback(() => {
    if (menuOpen) {
      closeMenu()
    } else {
      setMenuOpen(true)
    }
  }, [menuOpen, closeMenu])

  return (
    <div className="grid min-h-screen md:grid-cols-[200px_1fr]">
      {storageError && (
        <div
          role="alert"
          className="fixed left-1/2 top-4 z-[110] flex max-w-[90vw] -translate-x-1/2 items-center gap-3 rounded-sketch border-2 border-danger bg-card px-4 py-2 text-sm text-ink shadow-ink"
        >
          本地存储空间不足，最近的修改可能未保存。
          <button
            onClick={() => setStorageError(false)}
            aria-label="关闭提示"
            className="text-ink-soft transition-colors hover:text-danger"
          >
            ✕
          </button>
        </div>
      )}

      {syncNotice && (
        <div
          role="status"
          className="fixed left-1/2 top-16 z-[105] -translate-x-1/2 rounded-sketch border-2 border-primary bg-card px-4 py-2 text-sm text-ink shadow-ink"
        >
          已同步其他标签页的修改
        </div>
      )}

      <aside
        className={
          "app-sidebar flex-col gap-2 overflow-y-auto border-r-2 border-dashed border-line-soft bg-paper-deep px-4 py-7 md:sticky md:top-0 md:h-screen" +
          (menuOpen ? " open" : "") +
          (closing ? " closing" : "")
        }
        onAnimationEnd={(e) => { if (closing && e.animationName === "slideOut") onCloseEnd() }}
      >
        <Link
          to="/"
          className="hand-underline mb-4 px-2 py-1 text-center font-display text-[22px] text-ink"
          onClick={closeMenu}
        >
          ✏️ Life<span className="text-primary">Skill</span>
        </Link>

        <NavLink to="/" end className={navClass} onClick={closeMenu}>
          <span className="text-lg">🏠</span> 首页
        </NavLink>

        <NavLink to="/stats" className={navClass} onClick={closeMenu}>
          <span className="text-lg">📊</span> 统计看板
        </NavLink>

        <NavLink to="/categories" className={navClass} onClick={closeMenu}>
          <span className="text-lg">📋</span> 分类管理
        </NavLink>

        <NavLink to="/tags" className={navClass} onClick={closeMenu}>
          <span className="text-lg">🏷️</span> 标签管理
        </NavLink>

        <NavLink to="/trash" className={navClass} onClick={closeMenu}>
          <span className="text-lg">🗑️</span> 回收站
          {trashedCount > 0 && (
            <span className="ml-auto text-xs opacity-60">{trashedCount}</span>
          )}
        </NavLink>

        <div className="mt-3 border-t-2 border-dashed border-line-soft pt-3">
          <div className="px-3.5 pb-2 pt-1 font-hand text-xs uppercase tracking-wider text-ink-faint">
            Categories
          </div>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={"/?cat=" + cat.id}
              className="flex items-center gap-2.5 rounded-sketch px-3.5 py-2.5 text-[15px] text-ink-soft transition-colors duration-200 hover:bg-primary-light hover:text-ink"
              onClick={closeMenu}
            >
              <span className="text-lg">{cat.emoji}</span>
              {cat.name}
              <span className="ml-auto text-xs opacity-60">{tipsByCategory.get(cat.id) || 0}</span>
            </Link>
          ))}
        </div>

        <button
          className="mt-auto flex items-center gap-2.5 rounded-sketch px-3.5 py-2.5 pt-3 text-sm text-ink-soft transition-colors duration-200 hover:bg-primary-light hover:text-ink"
          onClick={() => setDark((d) => !d)}
        >
          <span className="text-lg">{dark ? "☀️" : "🌙"}</span>
          {dark ? "浅色模式" : "深色模式"}
        </button>
      </aside>
      {(menuOpen || closing) && (
        <div
          className={"sidebar-overlay" + ((menuOpen || closing) ? " show" : "") + (closing ? " closing" : "")}
          onClick={closeMenu}
        />
      )}

      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-10 flex items-center gap-4 border-b-2 border-dashed border-line-soft bg-paper px-8 py-4 backdrop-blur-sm max-md:gap-2 max-md:px-4 max-md:py-3 max-[480px]:px-3 max-[480px]:py-2.5">
          <button
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-line bg-card text-xl max-md:flex max-[480px]:h-9 max-[480px]:w-9 max-[480px]:text-lg"
            onClick={toggleMenu}
            aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
          <form
            className="flex max-w-[360px] flex-1 items-center gap-2 rounded-pill border-2 border-line bg-card px-4 py-2 transition-all duration-200 focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--primary-light)] max-md:min-w-0 max-md:max-w-full"
            onSubmit={handleSearch}
          >
            <span className="text-base text-ink-faint">🔍</span>
            <input
              key={location.key}
              type="text"
              name="q"
              placeholder="搜索标题、内容、标签..."
              defaultValue={urlQuery}
              className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
            />
          </form>
          <span className="flex-1 max-md:flex-none" />
          <Link to="/tips/new" className={`${btnPrimary} ${btnSm} btn-wiggle`}>
            + 新技巧
          </Link>
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden px-8 py-7 max-md:px-4 max-md:py-5 max-[480px]:px-3 max-[480px]:py-4">
          {children}
        </main>
      </div>
    </div>
  )
}
