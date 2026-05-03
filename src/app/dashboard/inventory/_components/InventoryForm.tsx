'use client'

import { useActionState, useEffect, useRef } from 'react'
import { updateInventory, type InventoryFormState } from '@/app/actions/inventory'
import type { Ingredient } from '@/generated/prisma/client'

type Props = {
  ingredient: Ingredient
  currentQuantity: number
  onClose: () => void
}

export default function InventoryForm({ ingredient, currentQuantity, onClose }: Props) {
  const [state, formAction, pending] = useActionState<InventoryFormState, FormData>(
    updateInventory,
    {}
  )

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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-1">在庫を更新</h2>
        <p className="text-sm text-gray-500 mb-5">{ingredient.name}</p>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="ingredient_id" value={ingredient.id} />

          <div>
            <label className="block text-sm text-gray-700 mb-1">
              実在庫数（{ingredient.unit}）<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              name="quantity"
              type="number"
              min="0"
              step="0.001"
              defaultValue={currentQuantity}
              className="input"
              autoFocus
            />
            {state.errors?.quantity && (
              <p className="text-xs text-red-600 mt-1">{state.errors.quantity[0]}</p>
            )}
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
              {pending ? '更新中...' : '更新'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
