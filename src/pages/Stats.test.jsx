import { beforeEach, describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { AppProvider } from "../context/AppContext"
import Stats from "./Stats"

beforeEach(() => {
  localStorage.clear()
})

function renderStats() {
  return render(
    <MemoryRouter>
      <AppProvider>
        <Stats />
      </AppProvider>
    </MemoryRouter>
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
    expect(screen.getByText("📥 未分类")).toBeInTheDocument()
  })
})

describe("Stats 数据健康", () => {
  it("提供未分类、无标签与回收站入口", () => {
    localStorage.setItem(
      "ls_tips",
      JSON.stringify([
        {
          id: "t1",
          title: "既无分类也无标签",
          content: "",
          categoryId: null,
          tagIds: [],
          starred: false,
          createdAt: 1,
          updatedAt: 1,
        },
        {
          id: "t2",
          title: "已删除技巧",
          content: "",
          categoryId: null,
          tagIds: [],
          starred: false,
          deletedAt: 2,
          createdAt: 2,
          updatedAt: 2,
        },
      ])
    )

    renderStats()

    expect(screen.getByRole("link", { name: /未分类技巧/ })).toHaveAttribute("href", "/?cat=__none__")
    expect(screen.getByRole("link", { name: /无标签技巧/ })).toHaveAttribute("href", "/?untagged=1")
    expect(screen.getByRole("link", { name: /回收站/ })).toHaveAttribute("href", "/trash")
    expect(screen.getByRole("link", { name: /无标签技巧/ })).toHaveTextContent("1")
    expect(screen.getByRole("link", { name: /回收站/ })).toHaveTextContent("1")
  })
})
