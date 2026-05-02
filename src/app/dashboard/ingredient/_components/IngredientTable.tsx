'use client'

import { useState } from 'react'
import { deleteIngredient } from '@/app/actions/ingredient'
import IngredientForm from './IngredientForm'
import type { Ingredient } from '@/generated/prisma/client'

export default function IngredientTable({ ingredients }: { ingredients: Ingredient[] }) {
  const [editing, setEditing] = useState<Ingredient | null>(null)
  const [showForm, setShowForm] = useState(false)

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) return
    await deleteIngredient(id)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">食材マスタ</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          ＋ 新規追加
        </button>
      </div>

      {ingredients.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">食材が登録されていません</p>
          <button
            onClick={() => { setEditing(null); setShowForm(true) }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            最初の食材を追加する
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-gray-600 font-medium">食材名</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">単位</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">仕入れ単価</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">仕入れ先</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">アラート在庫</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ing) => (
                <tr key={ing.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{ing.name}</td>
                  <td className="px-4 py-3 text-gray-600">{ing.unit}</td>
                  <td className="px-4 py-3 text-right text-gray-800">
                    ¥{ing.unitPrice.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{ing.supplierName ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {ing.stockAlert != null ? `${ing.stockAlert} ${ing.unit}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => { setEditing(ing); setShowForm(true) }}
                        className="text-xs px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(ing.id, ing.name)}
                        className="text-xs px-3 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
                      >
                        削除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <IngredientForm
          ingredient={editing ?? undefined}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </>
  )
}
