import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { AppProvider } from "../context/AppContext"
import Home from "./Home"

beforeEach(() => {
  localStorage.clear()
  URL.createObjectURL = vi.fn(() => "blob:mock")
  URL.revokeObjectURL = vi.fn()
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {})
})

function renderHome(initialEntries = ["/"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AppProvider>
        <Home />
      </AppProvider>
    </MemoryRouter>
  )
}

describe("Home 筛选", () => {
  it("点击全部时同时清除分类和收藏筛选", () => {
    renderHome(["/?cat=cat-1&starred=1"])

    expect(screen.getByText("柠檬除水垢")).toBeInTheDocument()
    expect(screen.queryByText("香蕉保鲜法")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "全部" }))

    expect(screen.getByText("香蕉保鲜法")).toBeInTheDocument()
  })
})

describe("Home 备份入口", () => {
  it("点击导出后生成备份文件并提示结果", async () => {
    renderHome()

    fireEvent.click(screen.getByText("⬇️ 导出备份"))

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1)
    const blob = URL.createObjectURL.mock.calls[0][0]
    const payload = JSON.parse(await blob.text())
    expect(payload.app).toBe("lifeskill")
    expect(Array.isArray(payload.tips)).toBe(true)

    expect(await screen.findByRole("status")).toHaveTextContent(/已导出 \d+ 条技巧/)
  })
})
