import { useParams, useNavigate, Link } from "react-router-dom"
import { useApp } from "../context/AppContext"
import TipForm from "../components/TipForm"

function goBack(navigate, fallback) {
  if (window.history.length > 1) {
    navigate(-1)
  } else {
    navigate(fallback)
  }
}

export default function EditTip() {
  const { id } = useParams()
  const { getTip, updateTip } = useApp()
  const navigate = useNavigate()
  const tip = getTip(id)

  if (!tip) {
    return (
      <div className="empty-state">
        <div className="icon">😅</div>
        <h3>技巧不存在</h3>
        <p>这个技巧可能已被删除</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>
          返回首页
        </Link>
      </div>
    )
  }

  return (
    <div className="detail-page">
      <button className="detail-back" onClick={() => goBack(navigate, "/")}>← 返回</button>
      <h1 className="page-title" style={{ marginBottom: 24 }}>
        <span className="hand-underline">编辑技巧</span>
      </h1>
      <TipForm
        key={tip.id}
        initial={tip}
        onSubmit={(data) => {
          updateTip(id, data)
          goBack(navigate, "/")
        }}
        onCancel={() => goBack(navigate, "/")}
      />
    </div>
  )
}
