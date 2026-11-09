import { beforeEach, describe, expect, it } from "vitest"
import { act, render } from "@testing-library/react"
import { useEffect } from "react"
import { AppProvider } from "./AppContext"
import { useApp } from "./useApp"

let api

function Probe() {
  const app = useApp()
  useEffect(() => {
    api = app
  }, [app])
  return null
}

function renderApp() {
  return render(
    <AppProvider>
      <Probe />
    </AppProvider>
  )
}

beforeEach(() => {
  localStorage.clear()
  api = undefined
})

describe("AppProvider", () => {
  it("删除分类时将关联技巧的 categoryId 置空", () => {
    renderApp()
    expect(api.tips.some((t) => t.categoryId === "cat-1")).toBe(true)

    act(() => api.deleteCategory("cat-1"))

    expect(api.categories.some((c) => c.id === "cat-1")).toBe(false)
    expect(api.tips.every((t) => t.categoryId !== "cat-1")).toBe(true)
  })

  it("删除标签时从所有技巧的 tagIds 中移除", () => {
    renderApp()
    expect(api.tips.some((t) => t.tagIds.includes("tag-1"))).toBe(true)

    act(() => api.deleteTag("tag-1"))

    expect(api.tags.some((t) => t.id === "tag-1")).toBe(false)
    expect(api.tips.every((t) => !t.tagIds.includes("tag-1"))).toBe(true)
  })

  it("切换收藏状态", () => {
    renderApp()
    const before = api.tips.find((t) => t.id === "tip-1").starred

    act(() => api.toggleStar("tip-1"))

    expect(api.tips.find((t) => t.id === "tip-1").starred).toBe(!before)
  })

  it("新增技巧时生成 id、时间戳与默认收藏状态", () => {
    renderApp()

    act(() => api.addTip({ title: "测试技巧", content: "内容", categoryId: "", tagIds: [] }))

    const created = api.tips[0]
    expect(created.id).toBeTruthy()
    expect(created.title).toBe("测试技巧")
    expect(created.starred).toBe(false)
    expect(created.createdAt).toBeGreaterThan(0)
    expect(created.updatedAt).toBeGreaterThan(0)
  })

  it("删除为软删除，可恢复或永久删除", () => {
    renderApp()

    act(() => api.deleteTip("tip-1"))
    expect(api.tips.find((t) => t.id === "tip-1").deletedAt).toBeGreaterThan(0)
    expect(api.getTip("tip-1")).toBeUndefined()

    act(() => api.restoreTip("tip-1"))
    expect(api.tips.find((t) => t.id === "tip-1").deletedAt).toBeNull()
    expect(api.getTip("tip-1")).toBeTruthy()

    act(() => {
      api.deleteTip("tip-1")
      api.purgeTip("tip-1")
    })
    expect(api.tips.some((t) => t.id === "tip-1")).toBe(false)
  })

  it("清空回收站只移除已删除的技巧", () => {
    renderApp()

    act(() => {
      api.deleteTip("tip-1")
      api.deleteTip("tip-2")
      api.emptyTrash()
    })

    expect(api.tips.some((t) => t.id === "tip-1")).toBe(false)
    expect(api.tips.some((t) => t.id === "tip-2")).toBe(false)
    expect(api.tips.some((t) => t.id === "tip-3")).toBe(true)
  })

  it("标记使用会累加次数且不改变更新时间", () => {
    renderApp()
    const before = api.tips.find((t) => t.id === "tip-1")

    act(() => api.markUsed("tip-1"))

    const after = api.tips.find((t) => t.id === "tip-1")
    expect(after.usageCount).toBe((before.usageCount || 0) + 1)
    expect(after.lastUsedAt).toBeGreaterThan(0)
    expect(after.updatedAt).toBe(before.updatedAt)
  })

  it("新建分类与标签时返回带 id 的对象", () => {
    renderApp()

    let category
    let tag
    act(() => {
      category = api.addCategory({ name: "返回测试分类", emoji: "📌", color: "#7EB8A0" })
      tag = api.addTag({ name: "返回测试标签" })
    })

    expect(category.id).toBeTruthy()
    expect(api.categories.some((c) => c.id === category.id)).toBe(true)
    expect(tag.id).toBeTruthy()
    expect(api.tags.some((t) => t.id === tag.id)).toBe(true)
  })

  it("导入备份时整体替换三类数据", () => {
    renderApp()

    act(() => api.importData({ tips: [], categories: [], tags: [] }))

    expect(api.tips).toEqual([])
    expect(api.categories).toEqual([])
    expect(api.tags).toEqual([])
  })
})
