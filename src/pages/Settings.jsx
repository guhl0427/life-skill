import { useRef, useState } from "react"
import { useApp } from "../context/useApp"
import ConfirmDialog from "../components/ConfirmDialog"
import {
  buildBackup,
  parseBackup,
  mergeBackup,
  readSnapshot,
  saveSnapshot,
  SNAPSHOT_KEY,
} from "../utils/backup"
import { formatDate } from "../utils/format"
import { btnOutline, pageTitle } from "../components/ui"

export default function Settings() {
  const { tips, categories, tags, importData } = useApp()
  const [notice, setNotice] = useState("")
  const [pendingImport, setPendingImport] = useState(null)
  const [pendingSource, setPendingSource] = useState("file")
  const [hasSnapshot, setHasSnapshot] = useState(() => Boolean(localStorage.getItem(SNAPSHOT_KEY)))
  const fileRef = useRef(null)

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(buildBackup({ tips, categories, tags }), null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "lifeskill-" + formatDate(Date.now()).replaceAll("/", "-") + ".json"
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 0)
    setNotice(`已导出 ${tips.length} 条技巧、${categories.length} 个分类、${tags.length} 个标签`)
  }

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    try {
      setPendingSource("file")
      setPendingImport(parseBackup(await file.text()))
    } catch (err) {
      setNotice("导入失败：" + err.message)
    }
  }

  const handleSnapshotRestore = () => {
    const snapshot = readSnapshot()
    if (!snapshot) {
      setHasSnapshot(false)
      setNotice("没有可恢复的自动备份")
      return
    }
    setPendingSource("snapshot")
    setPendingImport(snapshot)
  }

  const handleConfirmImport = (mode = "overwrite") => {
    if (!pendingImport) return
    const current = { tips, categories, tags }
    const snapshotSaved = saveSnapshot(current)
    if (snapshotSaved) setHasSnapshot(true)

    const next = mode === "merge" ? mergeBackup(current, pendingImport) : pendingImport
    importData(next)

    const prefix = snapshotSaved ? "" : "自动备份失败。"
    if (mode === "merge") {
      setNotice(`${prefix}已合并导入 ${pendingImport.tips.length} 条技巧，当前共 ${next.tips.length} 条`)
    } else if (pendingSource === "snapshot") {
      setNotice(`${prefix}已恢复上次导入前的 ${next.tips.length} 条技巧`)
    } else {
      setNotice(`${prefix}已导入 ${pendingImport.tips.length} 条技巧，原有数据已被覆盖`)
    }
    setPendingImport(null)
  }

  return (
    <div>
      <h1 className={`${pageTitle} mb-6`}>
        <span className="hand-underline">设置</span>
      </h1>

      <div className="mx-auto max-w-[720px]">
        {notice && (
          <div
            role="status"
            className="mb-4 rounded-sketch border-2 border-primary bg-primary-light px-4 py-2.5 text-sm text-ink"
          >
            {notice}
          </div>
        )}

        <section className="rounded-sketch border-2 border-line bg-card p-5 shadow-ink">
          <h2 className="mb-1 font-display text-lg text-ink">数据备份</h2>
          <p className="mb-4 text-sm leading-relaxed text-ink-soft">
            导出全部技巧、分类和标签为 JSON 文件；导入时可选择覆盖或合并，导入前会自动保存一份当前数据的备份。
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btnOutline} onClick={handleExport}>
              导出备份
            </button>
            <button type="button" className={btnOutline} onClick={() => fileRef.current?.click()}>
              导入备份
            </button>
            {hasSnapshot && (
              <button type="button" className={btnOutline} onClick={handleSnapshotRestore}>
                恢复导入前备份
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImportFile}
          />
        </section>
      </div>

      {pendingImport && (
        <ConfirmDialog
          title={pendingSource === "snapshot" ? "恢复自动备份" : "导入备份"}
          message={
            pendingSource === "snapshot"
              ? `将把当前数据恢复为上次导入前的 ${pendingImport.tips.length} 条技巧；当前数据会先另存为新的自动备份。`
              : `当前数据（${tips.length} 条技巧、${categories.length} 个分类、${tags.length} 个标签）会先自动备份。覆盖导入会替换全部数据；合并导入会按 id 去重并保留更新时间较新的版本。`
          }
          confirmText={pendingSource === "snapshot" ? "恢复备份" : "覆盖并导入"}
          secondaryText={pendingSource === "snapshot" ? undefined : "合并导入"}
          onSecondary={pendingSource === "snapshot" ? undefined : () => handleConfirmImport("merge")}
          onConfirm={() => handleConfirmImport("overwrite")}
          onCancel={() => setPendingImport(null)}
        />
      )}
    </div>
  )
}
