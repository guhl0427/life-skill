import { useState, useEffect, useRef } from "react"

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const serializedRef = useRef(localStorage.getItem(key))

  useEffect(() => {
    const serialized = JSON.stringify(value)
    if (serialized === serializedRef.current) return
    try {
      localStorage.setItem(key, serialized)
      serializedRef.current = serialized
    } catch (e) {
      console.error(`localStorage error [${key}]:`, e)
      window.dispatchEvent(new CustomEvent("ls-storage-error", { detail: { key } }))
    }
  }, [key, value])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== key || e.newValue === null) return
      if (e.newValue === serializedRef.current) return
      try {
        const next = JSON.parse(e.newValue)
        serializedRef.current = e.newValue
        setValue(next)
      } catch (err) {
        console.error(`localStorage sync error [${key}]:`, err)
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [key])

  return [value, setValue]
}
