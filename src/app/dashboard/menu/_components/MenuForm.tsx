'use client'

import { useActionState, useEffect, useRef } from 'react'
import { createMenu, updateMenu, type MenuFormState } from '@/app/actions/menu'
import type { Menu } from '@/generated/prisma/client'

type Props = {
  menu?: Menu
  onClose: () => void
}

export default function MenuForm({ menu, onClose }: Props) {
  const isEdit = !!menu

  const action = isEdit
    ? updateMenu.bind(null, menu.id)
    : createMenu

  const [state, formAction, pending] = useActionState<MenuFormState, FormData>(action, {})

  const wasSubmitting = useRef(false)

  useEffect(() => {
    if (pending) {
      wasSubmitting.current = true
    }
    if (wasSubmitting.current && !pending && !state.errors && !state.message) {
      onClose()
    }
  }, [state, pending, onClose])

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-5">
          {isEdit ? 'メニューを編集' : 'メニューを追加'}
        </h2>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              メニュー名<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              name="name"
              defaultValue={menu?.name}
              className="input"
              placeholder="例: から揚げ定食"
            />
            {state.errors?.name && (
              <p className="text-xs text-red-600 mt-1">{state.errors.name[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              販売価格（円）<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              name="selling_price"
              type="number"
              min="0"
              step="1"
              defaultValue={menu?.sellingPrice}
              className="input"
              placeholder="例: 950"
            />
            {state.errors?.sellingPrice && (
              <p className="text-xs text-red-600 mt-1">{state.errors.sellingPrice[0]}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">カテゴリ</label>
            <input
              name="category"
              defaultValue={menu?.category ?? ''}
              className="input"
              placeholder="例: 定食, ドリンク, デザート"
            />
          </div>

          {state.message && (
            <p className="text-sm text-red-600">{state.message}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 py-2 rounded-lg bg-blue-600 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {pending ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
