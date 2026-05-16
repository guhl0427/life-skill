import { useState } from "react"
import { Link } from "react-router-dom"
import { useApp } from "../context/AppContext"
import ConfirmDialog from "../components/ConfirmDialog"

const colorOptions = ["#7EB8A0","#F4A261","#E8A87C","#A8D5BA","#C9B8E0","#F7C6C6","#B8D4E3","#D4C9B8"]

export default function Categories() {
  const { categories, tips, addCategory, updateCategory, deleteCategory } = useApp()
  const [name, setName] = useState("")
  const [emoji, setEmoji] = useState("📌")
  const [color, setColor] = useState(colorOptions[0])
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState("")
  const [editEmoji, setEditEmoji] = useState("")
  const [editColor, setEditColor] = useState("")
  const [deleteId, setDeleteId] = useState(null)

  const handleAdd = () => {
    if (!name.trim()) return
    addCategory({ name: name.trim(), emoji, color })
    setName("")
  }

  const startEdit = (cat) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditEmoji(cat.emoji)
    setEditColor(cat.color)
  }

  const handleUpdate = () => {
    if (!editName.trim()) return
    updateCategory(editingId, { name: editName.trim(), emoji: editEmoji, color: editColor })
    setEditingId(null)
  }

  const getCount = (id) => tips.filter((t) => t.categoryId === id).length

  return (
    <div className="mgmt-page">
      <Link to="/" className="detail-back">← 返回首页</Link>
      <div className="mgmt-header">
        <h1 className="page-title"><span className="hand-underline">分类管理</span></h1>
      </div>

      <div className="mgmt-add-form">
        <input
          className="form-input"
          placeholder="分类名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <input
          className="form-input"
          style={{ width: 56, textAlign: "center" }}
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder="📌"
          maxLength={2}
        />
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {colorOptions.map((c) => (
            <div
              key={c}
              style={{
                width: 24, height: 24, borderRadius: 6,
                background: c, cursor: "pointer",
                border: color === c ? "3px solid var(--text)" : "2px solid transparent"
              }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <button className="btn btn-primary btn-sm" onClick={handleAdd}>
          添加
        </button>
      </div>

      <div className="mgmt-list">
        {categories.map((cat) => (
          <div key={cat.id} className="mgmt-item">
            {editingId === cat.id ? (
              <>
                <input
                  className="form-input"
                  style={{ flex: 1, padding: "6px 10px", fontSize: 14 }}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                />
                <input
                  className="form-input"
                  style={{ width: 44, textAlign: "center", padding: "6px" }}
                  value={editEmoji}
                  onChange={(e) => setEditEmoji(e.target.value)}
                  maxLength={2}
                />
                <div style={{ display: "flex", gap: 3 }}>
                  {colorOptions.map((c) => (
                    <div key={c} style={{
                      width: 18, height: 18, borderRadius: 4,
                      background: c, cursor: "pointer",
                      border: editColor === c ? "2px solid var(--text)" : "1px solid transparent"
                    }} onClick={() => setEditColor(c)} />
                  ))}
                </div>
                <button className="btn btn-primary btn-sm" onClick={handleUpdate}>保存</button>
                <button className="btn btn-outline btn-sm" onClick={() => setEditingId(null)}>取消</button>
              </>
            ) : (
              <>
                <div className="mgmt-item-color" style={{ background: cat.color }} />
                <span className="mgmt-item-emoji">{cat.emoji}</span>
                <div className="mgmt-item-info">
                  <div className="mgmt-item-name">{cat.name}</div>
                  <div className="mgmt-item-count">{getCount(cat.id)} 个技巧</div>
                </div>
                <div className="mgmt-item-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => startEdit(cat)}>编辑</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(cat.id)}>删除</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {deleteId && (
        <ConfirmDialog
          title="删除分类"
          message="删除后该分类下的技巧将变为未分类。确定删除吗？"
          onConfirm={() => { deleteCategory(deleteId); setDeleteId(null) }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
