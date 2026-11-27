import { beforeEach, describe, expect, it } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { AppProvider } from "../context/AppContext"
import Tags from "./Tags"

const tags = [
  { id: "tag-a", name: "清洁" },
  { id: "tag-b", name: "去污" },
  { id: "tag-c", name: "省时" },
]

const tips = [
  {
    id: "t1",
    title: "水垢清理",
    content: "内容",
    categoryId: null,
    tagIds: ["tag-a", "tag-c"],
    starred: false,
    createdAt: 1,
    updatedAt: 1,
  },
  {
    id: "t2",
    title: "油污处理",
    content: "内容",
    categoryId: null,
    tagIds: ["tag-b"],
    starred: false,
    createdAt: 2,
    updatedAt: 2,
  },
]

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem("ls_tags", JSON.stringify(tags))
  localStorage.setItem("ls_tips", JSON.stringify(tips))
})

function renderTags() {
  return render(
    <AppProvider>
      <Tags />
    </AppProvider>
  )
}

describe("标签合并", () => {
  it("合并后更新技巧标签并移除源标签", () => {
    renderTags()

    fireEvent.click(screen.getByRole("button", { name: "合并标签 清洁" }))
    expect(screen.getByText(/该标签关联 1 条技巧/)).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText("合并目标标签"))
    fireEvent.click(screen.getByRole("option", { name: "去污" }))
    fireEvent.click(screen.getByRole("button", { name: "确认合并" }))

    const storedTips = JSON.parse(localStorage.getItem("ls_tips"))
    const merged = storedTips.find((t) => t.id === "t1")
    expect(merged.tagIds).toHaveLength(2)
    expect(new Set(merged.tagIds)).toEqual(new Set(["tag-b", "tag-c"]))
    expect(storedTips.find((t) => t.id === "t2").tagIds).toEqual(["tag-b"])

    const storedTags = JSON.parse(localStorage.getItem("ls_tags"))
    expect(storedTags.some((t) => t.id === "tag-a")).toBe(false)
    expect(screen.getByRole("status")).toHaveTextContent("已将「清洁」合并到「去污」")
  })

  it("只剩一个标签时合并按钮不可用", () => {
    localStorage.setItem("ls_tags", JSON.stringify([{ id: "tag-a", name: "清洁" }]))
    renderTags()

    expect(screen.getByRole("button", { name: "合并标签 清洁" })).toBeDisabled()
  })
})
