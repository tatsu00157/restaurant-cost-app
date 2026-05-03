'use client'

import { useActionState, useEffect, useRef } from 'react'
import { addOrderItem, type OrderFormState } from '@/app/actions/order'
import type { Ingredient } from '@/generated/prisma/client'

type Props = {
  orderId: string
  ingredients: Ingredient[]
  usedIngredientIds: string[]
  onClose: () => void
}

export default function OrderItemForm({ orderId, ingredients, usedIngredientIds, onClose }: Props) {
  const action = addOrderItem.bind(null, orderId)
  const [state, formAction, pending] = useActionState<OrderFormState, FormData>(action, {})
  const wasSubmitting = useRef(false)
  const selectRef = useRef<HTMLSelectElement>(null)

  useEffect(() => {
    if (pending) { wasSubmitting.current = true }
    if (wasSubmitting.current && !pending && !state.errors && !state.message) {
      onClose()
    }
  }, [state, pending, onClose])

  const available = ingredients.filter((i) => !usedIngredientIds.includes(i.id))

  const handleIngredientChange = () => {
    const selected = ingredients.find((i) => i.id === selectRef.current?.value)
    const form = selectRef.current?.closest('form')
    if (selected && form) {
      const priceInput = form.querySelector<HTMLInputElement>('[name="unit_price"]')
      if (priceInput) priceInput.value = String(selected.unitPrice)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-5">食材を追加</h2>

        {available.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">追加できる食材がありません</p>
            <button type="button" onClick={onClose}
              className="mt-4 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">
              閉じる
            </button>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                食材<span className="text-red-500 ml-0.5">*</span>
              </label>
              <select name="ingredient_id" ref={selectRef} onChange={handleIngredientChange} className="input">
                <option value="">選択してください</option>
                {available.map((ing) => (
                  <option key={ing.id} value={ing.id}>{ing.name}（{ing.unit}）</option>
                ))}
              </select>
              {state.errors?.ingredientId && (
                <p className="text-xs text-red-600 mt-1">{state.errors.ingredientId[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                発注数量<span className="text-red-500 ml-0.5">*</span>
              </label>
              <input name="quantity" type="number" min="0.001" step="0.001" className="input" placeholder="例: 5" />
              {state.errors?.quantity && (
                <p className="text-xs text-red-600 mt-1">{state.errors.quantity[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                発注単価（円）<span className="text-red-500 ml-0.5">*</span>
              </label>
              <input name="unit_price" type="number" min="0" step="0.01" className="input" placeholder="自動入力されます" />
              {state.errors?.unitPrice && (
                <p className="text-xs text-red-600 mt-1">{state.errors.unitPrice[0]}</p>
              )}
            </div>

            {state.message && <p className="text-sm text-red-600">{state.message}</p>}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">
                キャンセル
              </button>
              <button type="submit" disabled={pending}
                className="flex-1 py-2 rounded-lg bg-blue-600 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
                {pending ? '追加中...' : '追加'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
