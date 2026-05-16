import { useNavigate, Link } from "react-router-dom"
import { useApp } from "../context/AppContext"
import TipForm from "../components/TipForm"

export default function NewTip() {
  const { addTip } = useApp()
  const navigate = useNavigate()

  return (
    <div>
      <Link to="/" className="detail-back">← 返回首页</Link>
      <h1 className="page-title" style={{ marginBottom: 24 }}>
        <span className="hand-underline">新建技巧</span>
      </h1>
      <TipForm
        onSubmit={(data) => {
          addTip(data)
          navigate("/")
        }}
        onCancel={() => navigate("/")}
      />
    </div>
  )
}
