import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { AppProvider } from "../context/AppContext"
import TipDetail from "./TipDetail"

beforeEach(() => {
  localStorage.clear()
})

function renderDetail(id = "tip-1") {
  return render(
    <MemoryRouter initialEntries={["/tips/" + id]}>
      <AppProvider>
        <Routes>
          <Route path="/tips/:id" element={<TipDetail />} />
        </Routes>
      </AppProvider>
    </MemoryRouter>
  )
}

describe("TipDetail 步骤", () => {
  it("按编号渲染步骤，复制内容包含步骤", async () => {
    localStorage.setItem(
      "ls_tips",
      JSON.stringify([
        {
          id: "tip-steps",
          title: "带步骤的技巧",
          content: "内容",
          categoryId: null,
          tagIds: [],
          steps: ["第一步", "第二步"],
          starred: false,
          createdAt: 1,
          updatedAt: 1,
        },
      ])
    )
    const writeText = vi.fn().mockResolvedValue()
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    })

    renderDetail("tip-steps")

    expect(screen.getByText("第一步")).toBeInTheDocument()
    expect(screen.getByText("第二步")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "📋 复制" }))
    await screen.findByText("✅ 已复制")

    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("1. 第一步")
    )
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("2. 第二步")
    )
  })
})

describe("TipDetail 相关技巧", () => {
  it("展示同标签相关技巧", () => {
    localStorage.setItem(
      "ls_tips",
      JSON.stringify([
        {
          id: "tip-a",
          title: "当前技巧",
          content: "内容",
          categoryId: null,
          tagIds: ["tag-1"],
          starred: false,
          createdAt: 3000,
          updatedAt: 3000,
        },
        {
          id: "tip-b",
          title: "同标签技巧",
          content: "内容",
          categoryId: null,
          tagIds: ["tag-1"],
          starred: false,
          createdAt: 2000,
          updatedAt: 2000,
        },
        {
          id: "tip-c",
          title: "无关技巧",
          content: "内容",
          categoryId: null,
          tagIds: [],
          starred: false,
          createdAt: 1000,
          updatedAt: 1000,
        },
      ])
    )

    renderDetail("tip-a")

    expect(screen.getByRole("heading", { name: "相关技巧" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "同标签技巧" })).toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "无关技巧" })).not.toBeInTheDocument()
  })
})

describe("TipDetail 使用记录", () => {
  it("点击今天用到了会累计使用次数", () => {
    renderDetail()
    expect(screen.getByText("还没有使用记录")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "✅ 今天用到了" }))

    expect(screen.getByText(/已使用 1 次/)).toBeInTheDocument()
  })
})
