'use client'

import { useActionState, useEffect, useRef } from 'react'
import { upsertDailySales, type SalesFormState } from '@/app/actions/sales'
import type { DailySale } from '@/generated/prisma/client'

type Props = {
  existing?: DailySale
  defaultDate?: string
  onClose: () => void
}

export default function SalesForm({ existing, defaultDate, onClose }: Props) {
  const [state, formAction, pending] = useActionState<SalesFormState, FormData>(
    upsertDailySales,
    {}
  )
  const wasSubmitting = useRef(false)

  useEffect(() => {
    if (pending) { wasSubmitting.current = true }
    if (wasSubmitting.current && !pending && !state.errors && !state.message) {
      onClose()
    }
  }, [state, pending, onClose])

  const existingDate = existing
    ? new Date(existing.date).toISOString().split('T')[0]
    : defaultDate ?? new Date().toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-5">
          {existing ? '売上を編集' : '売上を入力'}
        </h2>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              日付<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input name="date" type="date" defaultValue={existingDate} className="input" />
            {state.errors?.date && (
              <p className="text-xs text-red-600 mt-1">{state.errors.date[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              売上（円）<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input name="sales_amount" type="number" min="0" step="1"
              defaultValue={existing?.salesAmount ?? ''} className="input" placeholder="例: 85000" />
            {state.errors?.salesAmount && (
              <p className="text-xs text-red-600 mt-1">{state.errors.salesAmount[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">人件費（円）</label>
            <input name="labor_cost" type="number" min="0" step="1"
              defaultValue={existing?.laborCost ?? ''} className="input" placeholder="例: 20000" />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">その他コスト（円）</label>
            <input name="other_cost" type="number" min="0" step="1"
              defaultValue={existing?.otherCost ?? ''} className="input" placeholder="例: 5000" />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">メモ</label>
            <input name="note" defaultValue={existing?.note ?? ''} className="input" placeholder="例: 雨天・イベントあり" />
          </div>

          {state.message && <p className="text-sm text-red-600">{state.message}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">
              キャンセル
            </button>
            <button type="submit" disabled={pending}
              className="flex-1 py-2 rounded-lg bg-blue-600 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
              {pending ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
