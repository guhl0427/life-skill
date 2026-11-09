import { describe, expect, it } from "vitest"
import { getKeywords, getSnippet, matchesTip, splitByKeywords } from "./search"

const categoryMap = new Map([["cat-1", { id: "cat-1", name: "清洁妙招" }]])
const tagMap = new Map([["tag-1", { id: "tag-1", name: "省钱" }]])
const tip = {
  id: "tip-1",
  title: "厨房收纳",
  content: "用旧盒子整理抽屉",
  categoryId: "cat-1",
  tagIds: ["tag-1"],
}

describe("getKeywords", () => {
  it("按空白拆分并忽略大小写", () => {
    expect(getKeywords("  厨房  DIY ")).toEqual(["厨房", "diy"])
    expect(getKeywords("   ")).toEqual([])
  })
})

describe("matchesTip", () => {
  it("多个关键词需要全部命中，且可跨标题、分类和标签匹配", () => {
    expect(matchesTip(tip, "厨房 省钱", categoryMap, tagMap)).toBe(true)
    expect(matchesTip(tip, "清洁妙招", categoryMap, tagMap)).toBe(true)
    expect(matchesTip(tip, "厨房 环保", categoryMap, tagMap)).toBe(false)
  })
})

describe("getSnippet", () => {
  it("截取命中位置附近的正文并加省略号", () => {
    const text = "前".repeat(100) + "关键词" + "后".repeat(100)
    const snippet = getSnippet(text, "关键词", 60)

    expect(snippet).toContain("关键词")
    expect(snippet.startsWith("…")).toBe(true)
    expect(snippet.endsWith("…")).toBe(true)
    expect(snippet.length).toBeLessThanOrEqual(62)
  })

  it("没有命中或文本较短时原样返回", () => {
    expect(getSnippet("短文本", "关键词")).toBe("短文本")
    expect(getSnippet("一段没有命中的文字", "关键词")).toBe("一段没有命中的文字")
  })
})

describe("splitByKeywords", () => {
  it("同时标记多个关键词且不丢失原文", () => {
    const parts = splitByKeywords("厨房与省钱", "厨房 省钱")
    const matches = parts.filter((part) => part.match).map((part) => part.text)

    expect(matches).toEqual(["厨房", "省钱"])
    expect(parts.map((part) => part.text).join("")).toBe("厨房与省钱")
  })
})
