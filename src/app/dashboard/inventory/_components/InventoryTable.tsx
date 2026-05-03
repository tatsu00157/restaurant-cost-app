'use client'

import { useState } from 'react'
import InventoryForm from './InventoryForm'
import type { Ingredient, Inventory } from '@/generated/prisma/client'

type Row = {
  ingredient: Ingredient
  inventory: Inventory | null
}

export default function InventoryTable({ rows }: { rows: Row[] }) {
  const [editing, setEditing] = useState<Row | null>(null)

  const alertRows = rows.filter(
    (r) =>
      r.ingredient.stockAlert != null &&
      (r.inventory?.quantity ?? 0) < r.ingredient.stockAlert
  )

  return (
    <>
      {alertRows.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-red-700 mb-2">在庫アラート</p>
          <ul className="space-y-1">
            {alertRows.map((r) => (
              <li key={r.ingredient.id} className="text-sm text-red-600">
                {r.ingredient.name}：現在 {r.inventory?.quantity ?? 0} {r.ingredient.unit}
                （アラート基準: {r.ingredient.stockAlert} {r.ingredient.unit}）
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">棚卸し</h1>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">食材マスタに食材を登録してください</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-gray-600 font-medium">食材名</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">現在の在庫</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">単位</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">アラート基準</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">状態</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const qty = row.inventory?.quantity ?? 0
                const alert = row.ingredient.stockAlert
                const isAlert = alert != null && qty < alert

                return (
                  <tr key={row.ingredient.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{row.ingredient.name}</td>
                    <td className="px-4 py-3 text-right text-gray-800 font-medium">{qty}</td>
                    <td className="px-4 py-3 text-gray-500">{row.ingredient.unit}</td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {alert != null ? alert : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {isAlert ? (
                        <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                          要補充
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                          正常
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setEditing(row)}
                        className="text-xs px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
                      >
                        更新
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <InventoryForm
          ingredient={editing.ingredient}
          currentQuantity={editing.inventory?.quantity ?? 0}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  )
}
