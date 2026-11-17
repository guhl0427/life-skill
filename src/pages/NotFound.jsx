import { Link } from "react-router-dom"
import { btnPrimary } from "../components/ui"

export default function NotFound() {
  return (
    <div className="px-5 py-16 text-center">
      <div className="mb-3 text-5xl">🧭</div>
      <h3 className="mb-5 font-display text-xl text-ink">页面不存在</h3>
      <Link to="/" className={btnPrimary}>返回首页</Link>
    </div>
  )
}
