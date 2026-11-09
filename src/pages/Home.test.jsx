import { beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, fireEvent, within } from "@testing-library/react"
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

describe("Home 排序", () => {
  it("按最近更新排序", () => {
    localStorage.setItem(
      "ls_tips",
      JSON.stringify([
        {
          id: "tip-a",
          title: "新近编辑",
          content: "内容",
          categoryId: null,
          tagIds: [],
          starred: false,
          createdAt: 1000,
          updatedAt: 3000,
        },
        {
          id: "tip-b",
          title: "刚创建未编辑",
          content: "内容",
          categoryId: null,
          tagIds: [],
          starred: false,
          createdAt: 2000,
          updatedAt: 2000,
        },
      ])
    )
    renderHome()

    fireEvent.change(screen.getByLabelText("排序方式"), { target: { value: "updated" } })

    const titles = screen.getAllByRole("heading", { level: 3 }).map((el) => el.textContent)
    expect(titles).toEqual(["新近编辑", "刚创建未编辑"])
  })
})

describe("Home 回收站", () => {
  it("删除后移入回收站并可撤销", () => {
    renderHome()

    const card = screen.getByText("柠檬除水垢").closest(".tip-card")
    fireEvent.click(within(card).getByRole("button", { name: "删除" }))
    fireEvent.click(screen.getByRole("button", { name: "确认删除" }))

    expect(screen.queryByText("柠檬除水垢")).not.toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent("已移入回收站")

    fireEvent.click(screen.getByRole("button", { name: "撤销" }))

    expect(screen.getByText("柠檬除水垢")).toBeInTheDocument()
  })
})

describe("Home 最常用排序", () => {
  it("按使用次数降序排列并展示次数", () => {
    localStorage.setItem(
      "ls_tips",
      JSON.stringify([
        {
          id: "tip-a",
          title: "偶尔使用",
          content: "内容",
          categoryId: null,
          tagIds: [],
          starred: false,
          usageCount: 1,
          lastUsedAt: 1000,
          createdAt: 1000,
          updatedAt: 1000,
        },
        {
          id: "tip-b",
          title: "经常使用",
          content: "内容",
          categoryId: null,
          tagIds: [],
          starred: false,
          usageCount: 3,
          lastUsedAt: 2000,
          createdAt: 2000,
          updatedAt: 2000,
        },
      ])
    )
    renderHome(["/?sort=most"])

    const titles = screen.getAllByRole("heading", { level: 3 }).map((el) => el.textContent)
    expect(titles).toEqual(["经常使用", "偶尔使用"])
    expect(screen.getByText("· 用过 3 次")).toBeInTheDocument()
  })
})

describe("Home 标签筛选", () => {
  it("按标签筛选并与分类组合", () => {
    renderHome(["/?tag=tag-1"])

    expect(screen.getByText("柠檬除水垢")).toBeInTheDocument()
    expect(screen.getByText("香蕉保鲜法")).toBeInTheDocument()
    expect(screen.queryByText("衣服折叠法省空间")).not.toBeInTheDocument()
    expect(screen.getByText(/标签「#省钱」共 2 条/)).toBeInTheDocument()
  })

  it("标签与分类同时生效", () => {
    renderHome(["/?tag=tag-1&cat=cat-1"])

    expect(screen.getByText("柠檬除水垢")).toBeInTheDocument()
    expect(screen.queryByText("香蕉保鲜法")).not.toBeInTheDocument()
  })

  it("点击全部可清除标签筛选", () => {
    renderHome(["/?tag=tag-1"])
    expect(screen.queryByText("衣服折叠法省空间")).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "全部" }))

    expect(screen.getByText("衣服折叠法省空间")).toBeInTheDocument()
  })

  it("卡片上的标签可点击进入标签筛选", () => {
    renderHome()

    fireEvent.click(screen.getAllByRole("link", { name: "省钱" })[0])

    expect(screen.getByText(/标签「#省钱」共 2 条/)).toBeInTheDocument()
  })
})

describe("Home 批量操作", () => {
  it("批量设置分类", () => {
    renderHome()

    fireEvent.click(screen.getByRole("button", { name: "☑️ 批量选择" }))
    fireEvent.click(screen.getByRole("button", { name: "选择 柠檬除水垢" }))
    fireEvent.change(screen.getByLabelText("批量设置分类"), { target: { value: "cat-2" } })
    fireEvent.click(screen.getByRole("button", { name: "应用分类" }))

    const stored = JSON.parse(localStorage.getItem("ls_tips"))
    expect(stored.find((t) => t.id === "tip-1").categoryId).toBe("cat-2")
  })

  it("批量删除移入回收站", () => {
    renderHome()

    fireEvent.click(screen.getByRole("button", { name: "☑️ 批量选择" }))
    fireEvent.click(screen.getByRole("button", { name: "选择 柠檬除水垢" }))
    fireEvent.click(screen.getByRole("button", { name: "选择 香蕉保鲜法" }))
    fireEvent.click(screen.getByRole("button", { name: "批量删除" }))
    fireEvent.click(screen.getByRole("button", { name: "确认删除" }))

    expect(screen.queryByText("柠檬除水垢")).not.toBeInTheDocument()
    expect(screen.queryByText("香蕉保鲜法")).not.toBeInTheDocument()

    const stored = JSON.parse(localStorage.getItem("ls_tips"))
    expect(stored.find((t) => t.id === "tip-1").deletedAt).toBeGreaterThan(0)
    expect(stored.find((t) => t.id === "tip-4").deletedAt).toBeGreaterThan(0)
  })
})

describe("Home 数据健康筛选", () => {
  beforeEach(() => {
    localStorage.setItem(
      "ls_tips",
      JSON.stringify([
        {
          id: "t1",
          title: "未分类无标签",
          content: "内容",
          categoryId: null,
          tagIds: [],
          starred: false,
          createdAt: 2,
          updatedAt: 2,
        },
        {
          id: "t2",
          title: "完整技巧",
          content: "内容",
          categoryId: "cat-1",
          tagIds: ["tag-1"],
          starred: false,
          createdAt: 1,
          updatedAt: 1,
        },
      ])
    )
  })

  it("支持未分类筛选", () => {
    renderHome(["/?cat=__none__"])

    expect(screen.getByText("未分类无标签")).toBeInTheDocument()
    expect(screen.queryByText("完整技巧")).not.toBeInTheDocument()
  })

  it("支持无标签筛选", () => {
    renderHome(["/?untagged=1"])

    expect(screen.getByText("未分类无标签")).toBeInTheDocument()
    expect(screen.queryByText("完整技巧")).not.toBeInTheDocument()
  })
})

describe("Home 搜索", () => {
  it("可以通过标签名搜索到技巧", () => {
    renderHome(["/?q=省钱"])

    expect(screen.getByText("香蕉保鲜法")).toBeInTheDocument()
    expect(screen.queryByText("衣服折叠法省空间")).not.toBeInTheDocument()
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
