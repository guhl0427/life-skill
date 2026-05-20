import { useState, useEffect, useCallback } from "react"
import { NavLink, Link, useNavigate } from "react-router-dom"
import { useApp } from "../context/AppContext"

export default function Layout({ children }) {
  const { tips, categories } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [query, setQuery] = useState("")
  const [dark, setDark] = useState(() => localStorage.getItem("ls_dark") === "true")
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "")
    localStorage.setItem("ls_dark", dark)
  }, [dark])

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate("/?q=" + encodeURIComponent(query.trim()))
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
    <div className="app-layout">
      <aside
        className={"sidebar" + (menuOpen ? " open" : "") + (closing ? " closing" : "")}
        onAnimationEnd={(e) => { if (closing && e.animationName === "slideOut") onCloseEnd() }}
      >
        <Link to="/" className="sidebar-logo" onClick={closeMenu}>
          ✏️ Life<span>Skill</span>
        </Link>

        <NavLink to="/" end className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} onClick={closeMenu}>
          <span className="nav-icon">🏠</span> 首页
        </NavLink>

        <NavLink to="/stats" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} onClick={closeMenu}>
          <span className="nav-icon">📊</span> 统计看板
        </NavLink>

        <NavLink to="/categories" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} onClick={closeMenu}>
          <span className="nav-icon">📋</span> 分类管理
        </NavLink>

        <NavLink to="/tags" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} onClick={closeMenu}>
          <span className="nav-icon">🏷️</span> 标签管理
        </NavLink>

        <div className="nav-section">
          <div className="nav-section-title">Categories</div>
          {categories.map((cat) => {
            const count = tips.filter((t) => t.categoryId === cat.id).length
            return (
              <Link
                key={cat.id}
                to={"/?cat=" + cat.id}
                className="nav-link"
                onClick={closeMenu}
              >
                <span className="nav-icon">{cat.emoji}</span>
                {cat.name}
                <span style={{ marginLeft: "auto", fontSize: 12, opacity: 0.6 }}>{count}</span>
              </Link>
            )
          })}
        </div>

        <div style={{ marginTop: "auto", padding: "12px 14px 0" }}>
          <button className="dark-toggle" onClick={() => setDark((d) => !d)}>
            <span className="nav-icon">{dark ? "☀️" : "🌙"}</span>
            {dark ? "浅色模式" : "深色模式"}
          </button>
        </div>
      </aside>
      {(menuOpen || closing) && <div className={"sidebar-overlay" + ((menuOpen || closing) ? " show" : "") + (closing ? " closing" : "")} onClick={closeMenu} />}

      <div className="main-area">
        <header className="top-bar">
          <button className="mobile-menu-btn" onClick={toggleMenu}>
            {menuOpen ? "✕" : "☰"}
          </button>
          <form className="search-box" onSubmit={handleSearch}>
            <span className="icon">🔍</span>
            <input
              type="text"
              placeholder="搜索技巧..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>
          <span className="top-bar-grow" />
          <Link to="/tips/new" className="btn btn-primary btn-sm btn-wiggle">
            + 新技巧
          </Link>
        </header>
        <main className="main-content">{children}</main>
      </div>
    </div>
  )
}
