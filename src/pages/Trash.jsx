import { useMemo, useState } from "react"
import { useApp } from "../context/useApp"
import ConfirmDialog from "../components/ConfirmDialog"
import { formatDateTime } from "../utils/format"
import { btnOutline, btnDanger, btnSm, pageTitle, pageDesc } from "../components/ui"

export default function Trash() {
  const { tips, restoreTip, purgeTip, emptyTrash } = useApp()
  const [purgeId, setPurgeId] = useState(null)
  const [confirmEmpty, setConfirmEmpty] = useState(false)

  const trashed = useMemo(
    () => tips.filter((t) => t.deletedAt).sort((a, b) => b.deletedAt - a.deletedAt),
    [tips]
  )

  return (
    <div className="mx-auto max-w-[720px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className={pageTitle}><span className="hand-underline">回收站</span></h1>
          <p className={`${pageDesc} mb-0`}>删除的技巧会先放在这里，可随时恢复</p>
        </div>
        {trashed.length > 0 && (
          <button className={`${btnDanger} ${btnSm}`} onClick={() => setConfirmEmpty(true)}>
            清空回收站
          </button>
        )}
      </div>

      {trashed.length === 0 ? (
        <div className="px-5 py-16 text-center">
          <div className="mb-3 text-5xl">🗑️</div>
          <h3 className="mb-2 font-display text-xl text-ink">回收站是空的</h3>
          <p className="text-sm text-ink-soft">删除的技巧会出现在这里</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {trashed.map((tip) => (
            <div
              key={tip.id}
              className="rounded-sketch border-2 border-line bg-card p-4 shadow-ink"
            >
              <div className="mb-1 font-display text-[15px] text-ink">{tip.title}</div>
              <p className="mb-2 line-clamp-2 text-sm leading-relaxed text-ink-soft">{tip.content}</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-hand text-xs text-ink-faint">
                  删除于 {formatDateTime(tip.deletedAt)}
                </span>
                <div className="ml-auto flex gap-2">
                  <button className={`${btnOutline} ${btnSm}`} onClick={() => restoreTip(tip.id)}>
                    恢复
                  </button>
                  <button className={`${btnDanger} ${btnSm}`} onClick={() => setPurgeId(tip.id)}>
                    永久删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {purgeId && (
        <ConfirmDialog
          title="永久删除"
          message="这条技巧将被永久删除，无法恢复。"
          onConfirm={() => { purgeTip(purgeId); setPurgeId(null) }}
          onCancel={() => setPurgeId(null)}
        />
      )}

      {confirmEmpty && (
        <ConfirmDialog
          title="清空回收站"
          message={`将永久删除 ${trashed.length} 条技巧，无法恢复。`}
          confirmText="清空"
          onConfirm={() => { emptyTrash(); setConfirmEmpty(false) }}
          onCancel={() => setConfirmEmpty(false)}
        />
      )}
    </div>
  )
}
