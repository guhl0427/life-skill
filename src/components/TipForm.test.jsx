import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { AppProvider } from "../context/AppContext"
import TipForm from "./TipForm"

beforeEach(() => {
  localStorage.clear()
})

function setup() {
  const onSubmit = vi.fn()
  render(
    <AppProvider>
      <TipForm onSubmit={onSubmit} onCancel={() => {}} />
    </AppProvider>
  )
  return onSubmit
}

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText("标题"), { target: { value: "测试标题" } })
  fireEvent.change(screen.getByLabelText("内容"), { target: { value: "测试内容" } })
}

describe("TipForm 快速新建", () => {
  it("就地新建分类并自动选中", () => {
    const onSubmit = setup()
    fillRequiredFields()

    fireEvent.click(screen.getByRole("button", { name: "+ 新建分类" }))
    fireEvent.change(screen.getByLabelText("新分类名称"), { target: { value: "临时分类" } })
    fireEvent.click(screen.getByRole("button", { name: "添加" }))

    const select = screen.getByLabelText("分类")
    expect(screen.getByRole("option", { name: /临时分类/ })).toBeInTheDocument()
    expect(select.value).not.toBe("")

    fireEvent.click(screen.getByRole("button", { name: "保存" }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ categoryId: select.value })
    )
  })

  it("可添加、删除步骤并随表单提交", () => {
    const onSubmit = setup()
    fillRequiredFields()

    fireEvent.click(screen.getByRole("button", { name: "+ 添加步骤" }))
    fireEvent.change(screen.getByLabelText("步骤 1"), { target: { value: "第一步" } })
    fireEvent.click(screen.getByRole("button", { name: "+ 添加步骤" }))
    fireEvent.change(screen.getByLabelText("步骤 2"), { target: { value: "第二步" } })
    fireEvent.click(screen.getByRole("button", { name: "删除步骤 2" }))
    fireEvent.click(screen.getByRole("button", { name: "保存" }))

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ steps: ["第一步"] })
    )
  })

  it("就地新建标签并自动选中", () => {
    const onSubmit = setup()
    fillRequiredFields()

    fireEvent.click(screen.getByRole("button", { name: "+ 新建标签" }))
    fireEvent.change(screen.getByLabelText("新标签名称"), { target: { value: "临时标签" } })
    fireEvent.click(screen.getByRole("button", { name: "添加" }))

    const tagButton = screen.getByRole("button", { name: "临时标签" })
    expect(tagButton).toHaveAttribute("aria-pressed", "true")

    fireEvent.click(screen.getByRole("button", { name: "保存" }))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ tagIds: [expect.any(String)] })
    )
  })
})
