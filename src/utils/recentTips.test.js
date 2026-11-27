import { beforeEach, describe, expect, it } from "vitest"
import {
  clearRecentTips,
  readRecentTipIds,
  rememberRecentTip,
  RECENT_LIMIT,
} from "./recentTips"

beforeEach(() => {
  localStorage.clear()
})

describe("recentTips", () => {
  it("按浏览顺序记录，最近浏览的排在最前", () => {
    rememberRecentTip("tip-1")
    rememberRecentTip("tip-2")

    expect(readRecentTipIds()).toEqual(["tip-2", "tip-1"])
  })

  it("重复浏览同一技巧时去重并前移", () => {
    rememberRecentTip("tip-1")
    rememberRecentTip("tip-2")
    rememberRecentTip("tip-1")

    expect(readRecentTipIds()).toEqual(["tip-1", "tip-2"])
  })

  it("超过上限时丢弃最旧的记录", () => {
    for (let i = 1; i <= RECENT_LIMIT + 2; i++) {
      rememberRecentTip("tip-" + i)
    }

    const ids = readRecentTipIds()
    expect(ids).toHaveLength(RECENT_LIMIT)
    expect(ids[0]).toBe("tip-" + (RECENT_LIMIT + 2))
    expect(ids).not.toContain("tip-1")
  })

  it("读取时过滤非字符串、空值与重复项", () => {
    localStorage.setItem(
      "ls_recent_tips",
      JSON.stringify(["a", 1, null, "", "a", "b"])
    )

    expect(readRecentTipIds()).toEqual(["a", "b"])
  })

  it("数据损坏或格式不正确时返回空数组", () => {
    localStorage.setItem("ls_recent_tips", "{not-json")
    expect(readRecentTipIds()).toEqual([])

    localStorage.setItem("ls_recent_tips", JSON.stringify({ id: "tip-1" }))
    expect(readRecentTipIds()).toEqual([])
  })

  it("清空后不再返回记录", () => {
    rememberRecentTip("tip-1")
    clearRecentTips()

    expect(readRecentTipIds()).toEqual([])
    expect(localStorage.getItem("ls_recent_tips")).toBeNull()
  })
})
