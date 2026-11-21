import { useState, useEffect, useCallback, useMemo } from "react"
import { NavLink, Link, useNavigate, useLocation, useSearchParams } from "react-router-dom"
import { useApp } from "../context/useApp"
import Icon from "./Icon"
import { btnPrimary, btnSm } from "./ui"

const navClass = ({ isActive }) =>
  "flex items-center gap-2.5 rounded-sketch px-3.5 py-2.5 text-[15px] transition-colors duration-200 " +
  (isActive ? "bg-primary text-on-primary" : "text-ink-soft hover:bg-primary-light hover:text-ink")

export default function Layout({ children }) {
  const { tips, categories, tags } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [storageError, setStorageError] = useState(false)
  const [syncNotice, setSyncNotice] = useState(false)
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const urlQuery = searchParams.get("q") || ""
  const [dark, setDark] = useState(() => localStorage.getItem("ls_dark") === "true")
  const navigate = useNavigate()

  const activeTipsCount = useMemo(() => tips.filter((t) => !t.deletedAt).length, [tips])
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
          Life<span className="text-primary">Skill</span>
        </Link>

        <div className="px-3.5 pb-1 pt-1 text-xs tracking-wider text-ink-faint">
          浏览
        </div>

        <NavLink to="/" end className={navClass} onClick={closeMenu}>
          <Icon name="home" className="h-[18px] w-[18px]" /> 首页
        </NavLink>

        <NavLink to="/stats" className={navClass} onClick={closeMenu}>
          <Icon name="chart" className="h-[18px] w-[18px]" /> 统计看板
        </NavLink>

        <div className="mt-3 border-t-2 border-line-soft pt-3">
          <div className="px-3.5 pb-1 pt-1 text-xs tracking-wider text-ink-faint">
            管理
          </div>

          <NavLink to="/categories" className={navClass} onClick={closeMenu}>
            <Icon name="grid" className="h-[18px] w-[18px]" /> 分类管理
          </NavLink>

          <NavLink to="/tags" className={navClass} onClick={closeMenu}>
            <Icon name="tag" className="h-[18px] w-[18px]" /> 标签管理
          </NavLink>

          <NavLink to="/trash" className={navClass} onClick={closeMenu}>
            <Icon name="trash" className="h-[18px] w-[18px]" /> 回收站
            {trashedCount > 0 && (
              <span className="ml-auto text-xs tabular-nums opacity-60">{trashedCount}</span>
            )}
          </NavLink>
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-4">
          <div className="rounded-sketch border-2 border-dashed border-line-soft bg-card px-3 py-3">
            <div className="mb-2 px-0.5 text-xs tracking-wider text-ink-faint">数据概览</div>
            <div className="flex items-start gap-2 text-center">
              <div className="flex-1">
                <div className="font-display text-lg leading-tight text-ink">{activeTipsCount}</div>
                <div className="mt-0.5 text-[11px] text-ink-faint">技巧</div>
              </div>
              <div className="flex-1">
                <div className="font-display text-lg leading-tight text-ink">{categories.length}</div>
                <div className="mt-0.5 text-[11px] text-ink-faint">分类</div>
              </div>
              <div className="flex-1">
                <div className="font-display text-lg leading-tight text-ink">{tags.length}</div>
                <div className="mt-0.5 text-[11px] text-ink-faint">标签</div>
              </div>
            </div>
          </div>

          <button
            className="flex items-center gap-2.5 rounded-sketch px-3.5 py-2.5 text-sm text-ink-soft transition-colors duration-200 hover:bg-primary-light hover:text-ink"
            onClick={() => setDark((d) => !d)}
          >
            <Icon name={dark ? "sun" : "moon"} className="h-[18px] w-[18px]" />
            {dark ? "浅色模式" : "深色模式"}
          </button>
        </div>
      </aside>
      {(menuOpen || closing) && (
        <div
          className={"sidebar-overlay" + ((menuOpen || closing) ? " show" : "") + (closing ? " closing" : "")}
          onClick={closeMenu}
        />
      )}

      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-10 flex items-center gap-4 border-b-2 border-line-soft bg-paper px-8 py-4 backdrop-blur-sm max-md:gap-2 max-md:px-4 max-md:py-3 max-[480px]:px-3 max-[480px]:py-2.5">
          <button
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-sketch-sm border-2 border-line bg-card text-xl max-md:flex max-[480px]:h-9 max-[480px]:w-9"
            onClick={toggleMenu}
            aria-label={menuOpen ? "关闭菜单" : "打开菜单"}
            aria-expanded={menuOpen}
          >
            <Icon name={menuOpen ? "close" : "menu"} className="h-5 w-5" />
          </button>
          <form
            className="flex max-w-[360px] flex-1 items-center gap-2 rounded-pill border-2 border-line bg-card px-4 py-2 transition-all duration-200 focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--primary-light)] max-md:min-w-0 max-md:max-w-full"
            onSubmit={handleSearch}
          >
            <Icon name="search" className="h-4 w-4 shrink-0 text-ink-faint" />
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
        <main className="min-w-0 flex-1 overflow-x-clip px-8 py-7 max-md:px-4 max-md:py-5 max-[480px]:px-3 max-[480px]:py-4">
          {children}
        </main>
      </div>
    </div>
  )
}
