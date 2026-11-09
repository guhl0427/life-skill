import { beforeEach, describe, expect, it } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { AppProvider } from "../context/AppContext"
import Trash from "./Trash"

const deletedTip = {
  id: "tip-x",
  title: "被删除的技巧",
  content: "内容",
  categoryId: null,
  tagIds: [],
  starred: false,
  createdAt: 1000,
  updatedAt: 1000,
  deletedAt: 2000,
}

const activeTip = {
  id: "tip-y",
  title: "正常技巧",
  content: "内容",
  categoryId: null,
  tagIds: [],
  starred: false,
  createdAt: 1000,
  updatedAt: 1000,
}

beforeEach(() => {
  localStorage.clear()
  localStorage.setItem("ls_tips", JSON.stringify([deletedTip, activeTip]))
})

function renderTrash() {
  return render(
    <MemoryRouter>
      <AppProvider>
        <Trash />
      </AppProvider>
    </MemoryRouter>
  )
}

describe("回收站", () => {
  it("只展示已删除的技巧，并可恢复", () => {
    renderTrash()

    expect(screen.getByText("被删除的技巧")).toBeInTheDocument()
    expect(screen.queryByText("正常技巧")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "恢复" }))

    expect(screen.queryByText("被删除的技巧")).not.toBeInTheDocument()
    expect(screen.getByText("回收站是空的")).toBeInTheDocument()
  })

  it("永久删除后从数据中移除", () => {
    renderTrash()

    fireEvent.click(screen.getByRole("button", { name: "永久删除" }))
    fireEvent.click(screen.getByRole("button", { name: "确认删除" }))

    expect(screen.getByText("回收站是空的")).toBeInTheDocument()
    const stored = JSON.parse(localStorage.getItem("ls_tips"))
    expect(stored.some((t) => t.id === "tip-x")).toBe(false)
    expect(stored.some((t) => t.id === "tip-y")).toBe(true)
  })
})
