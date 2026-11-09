import { describe, expect, it } from "vitest"
import { buildBackup, parseBackup } from "./backup"

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

  it("拒绝非法内容", () => {
    expect(() => parseBackup("not json")).toThrow("合法的 JSON")
    expect(() => parseBackup(JSON.stringify({ tips: [] }))).toThrow("格式不正确")
    expect(() =>
      parseBackup(JSON.stringify({ tips: [], categories: [], tags: [] }))
    ).toThrow("没有可导入的数据")
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
