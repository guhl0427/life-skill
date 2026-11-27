import { beforeEach, describe, expect, it } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { AppProvider } from "../context/AppContext"
import Categories from "./Categories"

beforeEach(() => {
  localStorage.clear()
})

function renderCategories() {
  return render(
    <AppProvider>
      <Categories />
    </AppProvider>
  )
}

describe("Categories 合并分类", () => {
  it("合并后源分类消失、技巧改归目标分类并提示结果", () => {
    renderCategories()

    fireEvent.click(screen.getByRole("button", { name: "合并分类 收纳整理" }))
    fireEvent.click(screen.getByLabelText("合并目标分类"))
    fireEvent.click(screen.getByRole("option", { name: /清洁妙招/ }))
    fireEvent.click(screen.getByRole("button", { name: "确认合并" }))

    expect(screen.queryByRole("button", { name: "合并分类 收纳整理" })).not.toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent(
      "已将「收纳整理」合并到「清洁妙招」"
    )

    const stored = JSON.parse(localStorage.getItem("ls_tips"))
    expect(stored.some((tip) => tip.categoryId === "cat-2")).toBe(false)
    expect(stored.some((tip) => tip.categoryId === "cat-1")).toBe(true)
  })
})
