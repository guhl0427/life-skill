import { useParams, useNavigate, Link } from "react-router-dom"
import { useApp } from "../context/useApp"
import TipForm from "../components/TipForm"
import { btnPrimary, pageTitle } from "../components/ui"

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
      <div className="px-5 py-16 text-center">
        <div className="mb-3 text-5xl">😅</div>
        <h3 className="mb-2 font-display text-xl text-ink">技巧不存在</h3>
        <p className="mb-5 text-sm text-ink-soft">这个技巧可能已被删除</p>
        <Link to="/" className={`${btnPrimary} mt-4`}>
          返回首页
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[720px]">
      <h1 className={`${pageTitle} mb-6`}>
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
