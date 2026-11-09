import { describe, expect, it, beforeEach } from "vitest"
import { act, renderHook } from "@testing-library/react"
import { useLocalStorage } from "./useLocalStorage"

beforeEach(() => {
  localStorage.clear()
})

describe("useLocalStorage", () => {
  it("状态变化时写入 localStorage", () => {
    const { result } = renderHook(() => useLocalStorage("ls_test", []))

    act(() => result.current[1]([{ id: 1 }]))

    expect(JSON.parse(localStorage.getItem("ls_test"))).toEqual([{ id: 1 }])
  })

  it("收到其他标签页的 storage 事件时更新状态", () => {
    const { result } = renderHook(() => useLocalStorage("ls_test", []))

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "ls_test",
          newValue: JSON.stringify([1, 2, 3]),
        })
      )
    })

    expect(result.current[0]).toEqual([1, 2, 3])
  })
})
