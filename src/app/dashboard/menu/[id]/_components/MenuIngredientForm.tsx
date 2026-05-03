'use client'

import { useActionState, useEffect, useRef } from 'react'
import { addMenuIngredient, type MenuIngredientFormState } from '@/app/actions/menu'
import type { Ingredient } from '@/generated/prisma/client'

type Props = {
  menuId: string
  ingredients: Ingredient[]
  usedIngredientIds: string[]
  onClose: () => void
}

export default function MenuIngredientForm({ menuId, ingredients, usedIngredientIds, onClose }: Props) {
  const action = addMenuIngredient.bind(null, menuId)
  const [state, formAction, pending] = useActionState<MenuIngredientFormState, FormData>(action, {})

  const wasSubmitting = useRef(false)

  useEffect(() => {
    if (pending) {
      wasSubmitting.current = true
    }
    if (wasSubmitting.current && !pending && !state.errors && !state.message) {
      onClose()
    }
  }, [state, pending, onClose])

  const available = ingredients.filter((i) => !usedIngredientIds.includes(i.id))

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-5">食材を追加</h2>

        {available.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">追加できる食材がありません</p>
            <p className="text-xs text-gray-400 mt-1">食材マスタで食材を登録してください</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50"
            >
              閉じる
            </button>
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                食材<span className="text-red-500 ml-0.5">*</span>
              </label>
              <select name="ingredient_id" className="input">
                <option value="">選択してください</option>
                {available.map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name}（{ing.unit} / ¥{ing.unitPrice.toLocaleString()}）
                  </option>
                ))}
              </select>
              {state.errors?.ingredientId && (
                <p className="text-xs text-red-600 mt-1">{state.errors.ingredientId[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                使用量<span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                name="quantity"
                type="number"
                min="0.001"
                step="0.001"
                className="input"
                placeholder="例: 0.2"
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
                {pending ? '追加中...' : '追加'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
