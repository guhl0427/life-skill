import { useState } from "react"
import { Link } from "react-router-dom"
import { useApp } from "../context/AppContext"
import ConfirmDialog from "../components/ConfirmDialog"

export default function Tags() {
  const { tags, tips, addTag, updateTag, deleteTag } = useApp()
  const [name, setName] = useState("")
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState("")
  const [deleteId, setDeleteId] = useState(null)

  const handleAdd = () => {
    if (!name.trim()) return
    addTag({ name: name.trim() })
    setName("")
  }

  const startEdit = (tag) => {
    setEditingId(tag.id)
    setEditName(tag.name)
  }

  const handleUpdate = () => {
    if (!editName.trim()) return
    updateTag(editingId, { name: editName.trim() })
    setEditingId(null)
  }

  const getCount = (id) => tips.filter((t) => t.tagIds?.includes(id)).length

  return (
    <div className="mgmt-page">
      <Link to="/" className="detail-back">← 返回首页</Link>
      <div className="mgmt-header">
        <h1 className="page-title"><span className="hand-underline">标签管理</span></h1>
      </div>

      <div className="mgmt-add-form">
        <input
          className="form-input"
          placeholder="标签名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button className="btn btn-primary btn-sm" onClick={handleAdd}>
          添加
        </button>
      </div>

      <div className="mgmt-list">
        {tags.map((tag) => (
          <div key={tag.id} className="mgmt-item">
            {editingId === tag.id ? (
              <>
                <input
                  className="form-input"
                  style={{ flex: 1, padding: "6px 10px", fontSize: 14 }}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
                />
                <button className="btn btn-primary btn-sm" onClick={handleUpdate}>保存</button>
                <button className="btn btn-outline btn-sm" onClick={() => setEditingId(null)}>取消</button>
              </>
            ) : (
              <>
                <span className="mgmt-item-emoji">🏷️</span>
                <div className="mgmt-item-info">
                  <div className="mgmt-item-name">{tag.name}</div>
                  <div className="mgmt-item-count">{getCount(tag.id)} 个技巧</div>
                </div>
                <div className="mgmt-item-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => startEdit(tag)}>编辑</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(tag.id)}>删除</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {deleteId && (
        <ConfirmDialog
          title="删除标签"
          message="删除后该标签会从所有技巧中移除。确定删除吗？"
          onConfirm={() => { deleteTag(deleteId); setDeleteId(null) }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
