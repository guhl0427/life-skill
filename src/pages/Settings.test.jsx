import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { AppProvider } from "../context/AppContext"
import Settings from "./Settings"

beforeEach(() => {
  localStorage.clear()
  URL.createObjectURL = vi.fn(() => "blob:mock")
  URL.revokeObjectURL = vi.fn()
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {})
})

function renderSettings() {
  return render(
    <MemoryRouter>
      <AppProvider>
        <Settings />
      </AppProvider>
    </MemoryRouter>
  )
}

describe("Settings 数据备份", () => {
  it("点击导出后生成备份文件并提示结果", async () => {
    renderSettings()

    fireEvent.click(screen.getByRole("button", { name: "导出备份" }))

    expect(URL.createObjectURL).toHaveBeenCalledTimes(1)
    const blob = URL.createObjectURL.mock.calls[0][0]
    const payload = JSON.parse(await blob.text())
    expect(payload.app).toBe("lifeskill")
    expect(Array.isArray(payload.tips)).toBe(true)

    expect(await screen.findByRole("status")).toHaveTextContent(/已导出 \d+ 条技巧/)
  })
})
