'use client'

import { useActionState, useEffect, useRef } from 'react'
import { createIngredient, updateIngredient, type IngredientFormState } from '@/app/actions/ingredient'
import type { Ingredient } from '@/generated/prisma/client'

type Props = {
  ingredient?: Ingredient
  onClose: () => void
}

export default function IngredientForm({ ingredient, onClose }: Props) {
  const isEdit = !!ingredient

  const action = isEdit
    ? updateIngredient.bind(null, ingredient.id)
    : createIngredient

  const [state, formAction, pending] = useActionState<IngredientFormState, FormData>(
    action,
    {}
  )

  const formRef = useRef<HTMLFormElement>(null)
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
          {isEdit ? '食材を編集' : '食材を追加'}
        </h2>

        <form ref={formRef} action={formAction} className="space-y-4">
          <Field label="食材名" required>
            <input
              name="name"
              defaultValue={ingredient?.name}
              className="input"
              placeholder="例: 鶏もも肉"
            />
            {state.errors?.name && <Error messages={state.errors.name} />}
          </Field>

          <Field label="単位" required>
            <input
              name="unit"
              defaultValue={ingredient?.unit}
              className="input"
              placeholder="例: kg, g, 個, 本"
            />
            {state.errors?.unit && <Error messages={state.errors.unit} />}
          </Field>

          <Field label="仕入れ単価（円）" required>
            <input
              name="unit_price"
              type="number"
              min="0"
              step="0.01"
              defaultValue={ingredient?.unitPrice}
              className="input"
              placeholder="例: 450"
            />
            {state.errors?.unitPrice && <Error messages={state.errors.unitPrice} />}
          </Field>

          <Field label="仕入れ先">
            <input
              name="supplier_name"
              defaultValue={ingredient?.supplierName ?? ''}
              className="input"
              placeholder="例: ○○食品"
            />
          </Field>

          <Field label="アラート在庫量">
            <input
              name="stock_alert"
              type="number"
              min="0"
              step="0.001"
              defaultValue={ingredient?.stockAlert ?? ''}
              className="input"
              placeholder="この量を下回ったら通知"
            />
          </Field>

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

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function Error({ messages }: { messages: string[] }) {
  return <p className="text-xs text-red-600 mt-1">{messages[0]}</p>
}
