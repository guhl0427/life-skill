import { beforeEach, describe, expect, it } from "vitest"
import { render, screen, fireEvent, within } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import { AppProvider } from "../context/AppContext"
import Home from "./Home"

beforeEach(() => {
  localStorage.clear()
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

function renderHomeWithDetail(initialEntries = ["/"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tips/:id" element={<div>技巧详情页</div>} />
        </Routes>
      </AppProvider>
    </MemoryRouter>
  )
}

function cardGrid() {
  return document.querySelector(".tip-grid")
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

describe("Home 卡片点击", () => {
  it("点击卡片空白区域进入详情页", () => {
    renderHomeWithDetail()

    const card = within(cardGrid()).getByText("柠檬除水垢").closest(".tip-card")
    fireEvent.click(card)

    expect(screen.getByText("技巧详情页")).toBeInTheDocument()
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

    fireEvent.click(screen.getByLabelText("排序方式"))
    fireEvent.click(screen.getByRole("option", { name: "最近更新" }))

    const titles = screen.getAllByRole("heading", { level: 3 }).map((el) => el.textContent)
    expect(titles).toEqual(["新近编辑", "刚创建未编辑"])
  })
})

describe("Home 回收站", () => {
  it("删除后移入回收站并可撤销", () => {
    renderHome()

    const card = within(cardGrid()).getByText("柠檬除水垢").closest(".tip-card")
    fireEvent.click(within(card).getByRole("button", { name: "更多操作" }))
    fireEvent.click(within(card).getByRole("button", { name: "删除" }))
    fireEvent.click(screen.getByRole("button", { name: "确认删除" }))

    expect(within(cardGrid()).queryByText("柠檬除水垢")).not.toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent("已移入回收站")

    fireEvent.click(screen.getByRole("button", { name: "撤销" }))

    expect(within(cardGrid()).getByText("柠檬除水垢")).toBeInTheDocument()
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
    expect(screen.getByRole("button", { name: "清除标签筛选：省钱" })).toBeInTheDocument()
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

    fireEvent.click(screen.getAllByRole("link", { name: "#省钱" })[0])

    expect(screen.getByRole("button", { name: "清除标签筛选：省钱" })).toBeInTheDocument()
  })
})

describe("Home 批量操作", () => {
  it("批量设置分类", () => {
    renderHome()

    fireEvent.click(screen.getByRole("button", { name: "批量选择" }))
    fireEvent.click(screen.getByRole("button", { name: "选择 柠檬除水垢" }))
    fireEvent.click(screen.getByLabelText("批量设置分类"))
    fireEvent.click(screen.getByRole("option", { name: /收纳整理/ }))
    fireEvent.click(screen.getByRole("button", { name: "应用分类" }))

    const stored = JSON.parse(localStorage.getItem("ls_tips"))
    expect(stored.find((t) => t.id === "tip-1").categoryId).toBe("cat-2")
  })

  it("批量模式下点击卡片可切换选中", () => {
    renderHome()

    fireEvent.click(screen.getByRole("button", { name: "批量选择" }))
    fireEvent.click(screen.getByText("柠檬除水垢"))
    expect(screen.getByText("已选 1 条")).toBeInTheDocument()

    fireEvent.click(screen.getByText("柠檬除水垢"))
    expect(screen.getByText("已选 0 条")).toBeInTheDocument()
  })

  it("批量删除移入回收站", () => {
    renderHome()

    fireEvent.click(screen.getByRole("button", { name: "批量选择" }))
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

describe("Home 最近浏览", () => {
  it("按浏览顺序展示最近浏览的技巧并支持清空", () => {
    localStorage.setItem("ls_recent_tips", JSON.stringify(["tip-3", "tip-1"]))

    renderHome()

    const region = screen.getByRole("region", { name: "最近浏览" })
    const links = within(region).getAllByRole("link")
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveTextContent("切洋葱不流泪")
    expect(links[1]).toHaveTextContent("柠檬除水垢")

    fireEvent.click(within(region).getByRole("button", { name: "清空" }))

    expect(screen.queryByRole("region", { name: "最近浏览" })).not.toBeInTheDocument()
    expect(localStorage.getItem("ls_recent_tips")).toBeNull()
  })

  it("筛选状态下不展示最近浏览", () => {
    localStorage.setItem("ls_recent_tips", JSON.stringify(["tip-1"]))

    renderHome(["/?cat=cat-1"])

    expect(screen.queryByRole("region", { name: "最近浏览" })).not.toBeInTheDocument()
  })
})
