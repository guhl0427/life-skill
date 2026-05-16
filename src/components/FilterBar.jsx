import { useApp } from "../context/AppContext"

export default function FilterBar({ activeCat, onCatChange, sort, onSortChange }) {
  const { categories } = useApp()

  return (
    <div className="filter-bar">
      <span className="filter-label">分类</span>
      <div className="filter-chips">
        <span
          className={"filter-chip" + (!activeCat ? " active" : "")}
          onClick={() => onCatChange("")}
        >
          全部
        </span>
        {categories.map((cat) => (
          <span
            key={cat.id}
            className={"filter-chip" + (activeCat === cat.id ? " active" : "")}
            style={activeCat === cat.id ? { background: cat.color, borderColor: cat.color } : {}}
            onClick={() => onCatChange(cat.id)}
          >
            {cat.emoji} {cat.name}
          </span>
        ))}
      </div>

      <div style={{ marginLeft: "auto" }}>
        <select
          className="sort-select"
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
        >
          <option value="newest">最新</option>
          <option value="oldest">最早</option>
          <option value="title">标题 A-Z</option>
        </select>
      </div>
    </div>
  )
}
