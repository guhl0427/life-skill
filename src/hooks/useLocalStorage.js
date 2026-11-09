import { useState, useEffect } from "react"

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.error(`localStorage error [${key}]:`, e)
      window.dispatchEvent(new CustomEvent("ls-storage-error", { detail: { key } }))
    }
  }, [key, value])

  return [value, setValue]
}
