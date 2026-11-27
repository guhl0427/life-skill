import { describe, expect, it } from "vitest"
import { buildTipMarkdown, buildTipsMarkdown } from "./exportTip"

const categoryMap = new Map([
  ["cat-1", { id: "cat-1", name: "厨房清洁", emoji: "🧼" }],
])
const tagMap = new Map([
  ["tag-1", { id: "tag-1", name: "省钱" }],
])

const tips = [
  {
    id: "t1",
    title: "柠檬除水垢",
    content: "用柠檬酸浸泡水壶。",
    categoryId: "cat-1",
    tagIds: ["tag-1", "missing-tag"],
    duration: "10 分钟",
    difficulty: "简单",
    scenario: "厨房清洁",
    materials: ["柠檬"],
    steps: ["切片", "浸泡"],
    notes: "不要用热水。",
  },
  {
    id: "t2",
    title: "香蕉保鲜法",
    content: "包裹香蕉把柄。",
    categoryId: null,
    tagIds: [],
  },
]

describe("buildTipMarkdown", () => {
  it("输出标题、元信息、材料、步骤与标签", () => {
    const markdown = buildTipMarkdown(tips[0], categoryMap.get("cat-1"), [
      tagMap.get("tag-1"),
    ])

    expect(markdown).toContain("# 柠檬除水垢")
    expect(markdown).toContain("分类：🧼 厨房清洁 · 耗时：10 分钟 · 难度：简单")
    expect(markdown).toContain("**适用场景**：厨房清洁")
    expect(markdown).toContain("- 柠檬")
    expect(markdown).toContain("1. 切片")
    expect(markdown).toContain("## 注意事项")
    expect(markdown).toContain("#省钱")
    expect(markdown).toContain("来自 LifeSkill")
  })
})

describe("buildTipsMarkdown", () => {
  it("空列表返回空字符串", () => {
    expect(buildTipsMarkdown([], categoryMap, tagMap)).toBe("")
  })

  it("将筛选结果按顺序导出为带编号的合集", () => {
    const markdown = buildTipsMarkdown(tips, categoryMap, tagMap)

    expect(markdown).toContain("# LifeSkill 技巧集")
    expect(markdown).toContain("共 2 条技巧")
    expect(markdown).toContain("## 1. 柠檬除水垢")
    expect(markdown).toContain("## 2. 香蕉保鲜法")
    expect(markdown).toContain("分类：🧼 厨房清洁")
    expect(markdown).toContain("#省钱")
  })

  it("忽略失效的分类与标签引用，且不重复单条页脚", () => {
    const markdown = buildTipsMarkdown(tips, categoryMap, tagMap)

    expect(markdown).not.toContain("missing-tag")
    expect(markdown).not.toContain("来自 LifeSkill")
  })
})
