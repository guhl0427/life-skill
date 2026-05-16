import { useState } from "react"
import { NavLink, Link, useNavigate } from "react-router-dom"
import { useApp } from "../context/AppContext"

export default function Layout({ children }) {
  const { tips, categories } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState("")
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate("/?q=" + encodeURIComponent(query.trim()))
    } else {
      navigate("/")
    }
  }

  return (
    <div className="app-layout">
      <aside className={"sidebar" + (menuOpen ? " open" : "")}>
        <Link to="/" className="sidebar-logo" onClick={() => setMenuOpen(false)}>
          ✏️ Life<span>Skill</span>
        </Link>

        <NavLink to="/" end className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} onClick={() => setMenuOpen(false)}>
          <span className="nav-icon">🏠</span> 首页
        </NavLink>

        <NavLink to="/categories" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} onClick={() => setMenuOpen(false)}>
          <span className="nav-icon">📋</span> 分类管理
        </NavLink>

        <NavLink to="/tags" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")} onClick={() => setMenuOpen(false)}>
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
                onClick={() => setMenuOpen(false)}
              >
                <span className="nav-icon">{cat.emoji}</span>
                {cat.name}
                <span style={{ marginLeft: "auto", fontSize: 12, opacity: 0.6 }}>{count}</span>
              </Link>
            )
          })}
        </div>
      </aside>

      <div className="main-area">
        <header className="top-bar">
          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
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
