import { describe, expect, it } from "vitest"
import { formatDate, formatDateTime } from "./format"

const timestamp = new Date(2024, 0, 5, 9, 7).getTime()

describe("formatDate", () => {
  it("输出 yyyy/MM/dd", () => {
    expect(formatDate(timestamp)).toBe("2024/01/05")
  })
})

describe("formatDateTime", () => {
  it("输出 yyyy/MM/dd HH:mm", () => {
    expect(formatDateTime(timestamp)).toBe("2024/01/05 09:07")
  })
})
