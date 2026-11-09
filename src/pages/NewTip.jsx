import { useNavigate, Link } from "react-router-dom"
import { useApp } from "../context/useApp"
import TipForm from "../components/TipForm"
import { backLink, pageTitle } from "../components/ui"

export default function NewTip() {
  const { addTip } = useApp()
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-[720px]">
      <Link to="/" className={backLink}>← 返回首页</Link>
      <h1 className={`${pageTitle} mb-6`}>
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
