import { beforeEach, describe, expect, it } from "vitest"
import {
  buildBackup,
  mergeBackup,
  parseBackup,
  readSnapshot,
  saveSnapshot,
  SNAPSHOT_KEY,
} from "./backup"

beforeEach(() => {
  localStorage.clear()
})

describe("parseBackup", () => {
  it("清理失效的引用并补齐缺失字段", () => {
    const result = parseBackup(
      JSON.stringify({
        tips: [
          {
            id: "tip-1",
            title: "标题",
            content: "内容",
            categoryId: "missing-cat",
            tagIds: ["tag-1", "missing-tag"],
            starred: 1,
          },
        ],
        categories: [{ id: "cat-1", name: "分类" }],
        tags: [{ id: "tag-1", name: "标签" }],
      })
    )

    expect(result.tips[0].categoryId).toBe(null)
    expect(result.tips[0].tagIds).toEqual(["tag-1"])
    expect(result.tips[0].starred).toBe(true)
    expect(result.categories[0].emoji).toBe("📌")
    expect(result.categories[0].color).toBeTruthy()
  })

  it("保留使用记录、步骤与回收站状态", () => {
    const result = parseBackup(
      JSON.stringify({
        tips: [
          {
            id: "tip-1",
            title: "标题",
            content: "内容",
            steps: ["第一步", " ", "第二步"],
            usageCount: 3,
            lastUsedAt: 1234,
            deletedAt: 5678,
          },
        ],
        categories: [],
        tags: [],
      })
    )

    expect(result.tips[0].steps).toEqual(["第一步", "第二步"])
    expect(result.tips[0].usageCount).toBe(3)
    expect(result.tips[0].lastUsedAt).toBe(1234)
    expect(result.tips[0].deletedAt).toBe(5678)
  })

  it("拒绝非法内容", () => {
    expect(() => parseBackup("not json")).toThrow("合法的 JSON")
    expect(() => parseBackup(JSON.stringify({ tips: [] }))).toThrow("格式不正确")
    expect(() =>
      parseBackup(JSON.stringify({ tips: [], categories: [], tags: [] }))
    ).toThrow("没有可导入的数据")
  })
})

describe("mergeBackup", () => {
  const tip = (id, title, updatedAt) => ({
    id,
    title,
    content: "",
    categoryId: null,
    tagIds: [],
    starred: false,
    createdAt: updatedAt,
    updatedAt,
  })

  it("按 id 去重，技巧保留更新时间较新的版本", () => {
    const merged = mergeBackup(
      {
        categories: [{ id: "cat-1", name: "本地分类" }],
        tags: [{ id: "tag-1", name: "本地标签" }],
        tips: [tip("tip-1", "本地旧标题", 1), tip("tip-local", "本地独有", 10)],
      },
      {
        categories: [{ id: "cat-1", name: "导入分类" }, { id: "cat-3", name: "导入分类3" }],
        tags: [{ id: "tag-1", name: "导入标签" }, { id: "tag-2", name: "导入标签2" }],
        tips: [tip("tip-1", "导入新标题", 5), tip("tip-2", "导入独有", 20)],
      }
    )

    expect(merged.tips).toHaveLength(3)
    expect(merged.tips.find((t) => t.id === "tip-1").title).toBe("导入新标题")
    expect(merged.tips.find((t) => t.id === "tip-local")).toBeTruthy()
    expect(merged.tips.find((t) => t.id === "tip-2")).toBeTruthy()
    expect(merged.categories.map((c) => c.name)).toEqual(["本地分类", "导入分类3"])
    expect(merged.tags.map((t) => t.name)).toEqual(["本地标签", "导入标签2"])
  })

  it("导入版本较旧时保留本地技巧", () => {
    const merged = mergeBackup(
      { categories: [], tags: [], tips: [tip("tip-1", "本地版本", 10)] },
      { categories: [], tags: [], tips: [tip("tip-1", "导入旧版本", 1)] }
    )

    expect(merged.tips).toHaveLength(1)
    expect(merged.tips[0].title).toBe("本地版本")
  })
})

describe("自动备份快照", () => {
  it("保存后可读取，损坏时返回 null", () => {
    expect(readSnapshot()).toBeNull()

    expect(
      saveSnapshot({
        categories: [],
        tags: [],
        tips: [
          {
            id: "tip-1",
            title: "快照技巧",
            content: "",
            categoryId: null,
            tagIds: [],
            starred: false,
            createdAt: 1,
            updatedAt: 1,
          },
        ],
      })
    ).toBe(true)

    expect(localStorage.getItem(SNAPSHOT_KEY)).toContain("lifeskill")
    expect(readSnapshot().tips[0].title).toBe("快照技巧")

    localStorage.setItem(SNAPSHOT_KEY, "not json")
    expect(readSnapshot()).toBeNull()
  })
})

describe("buildBackup", () => {
  it("包含数据与版本信息", () => {
    const data = buildBackup({ tips: [], categories: [], tags: [] })
    expect(data.app).toBe("lifeskill")
    expect(data.version).toBe(1)
    expect(typeof data.exportedAt).toBe("string")
  })
})
