import { beforeEach, describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { AppProvider } from "../context/AppContext"
import Stats from "./Stats"

beforeEach(() => {
  localStorage.clear()
})

function renderStats() {
  return render(
    <AppProvider>
      <Stats />
    </AppProvider>
  )
}

describe("Stats 分类分布", () => {
  it("按全部技巧计算占比，并展示未分类与未使用分类", () => {
    localStorage.setItem(
      "ls_tips",
      JSON.stringify([
        {
          id: "t1",
          title: "分类技巧一",
          content: "",
          categoryId: "cat-1",
          tagIds: [],
          starred: false,
          createdAt: 1,
          updatedAt: 1,
        },
        {
          id: "t2",
          title: "分类技巧二",
          content: "",
          categoryId: "cat-1",
          tagIds: [],
          starred: false,
          createdAt: 2,
          updatedAt: 2,
        },
        {
          id: "t3",
          title: "失效分类技巧",
          content: "",
          categoryId: "missing-cat",
          tagIds: [],
          starred: false,
          createdAt: 3,
          updatedAt: 3,
        },
      ])
    )

    renderStats()

    expect(screen.getByText("2 / 3")).toBeInTheDocument()
    expect(screen.getByText("1 / 3")).toBeInTheDocument()
    expect(screen.getByText(/未分类/)).toBeInTheDocument()
    expect(screen.getByText("4 个分类暂无技巧")).toBeInTheDocument()
  })
})
