'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteMenu } from '@/app/actions/menu'
import MenuForm from './MenuForm'
import type { Menu } from '@/generated/prisma/client'

type MenuWithCost = Menu & {
  cost: number
  costRate: number | null
}

export default function MenuList({ menus }: { menus: MenuWithCost[] }) {
  const [editing, setEditing] = useState<Menu | null>(null)
  const [showForm, setShowForm] = useState(false)
  const router = useRouter()

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) return
    await deleteMenu(id)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">メニュー原価</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          ＋ 新規追加
        </button>
      </div>

      {menus.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">メニューが登録されていません</p>
          <button
            onClick={() => { setEditing(null); setShowForm(true) }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            最初のメニューを追加する
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-gray-600 font-medium">メニュー名</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">カテゴリ</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">販売価格</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">原価</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">原価率</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {menus.map((menu) => (
                <tr
                  key={menu.id}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/dashboard/menu/${menu.id}`)}
                >
                  <td className="px-4 py-3 font-medium text-gray-800">{menu.name}</td>
                  <td className="px-4 py-3 text-gray-600">{menu.category ?? '—'}</td>
                  <td className="px-4 py-3 text-right text-gray-800">
                    ¥{menu.sellingPrice.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-800">
                    ¥{menu.cost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {menu.costRate != null ? (
                      <span className={`font-medium ${menu.costRate > 35 ? 'text-red-600' : menu.costRate > 28 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {menu.costRate.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => { setEditing(menu); setShowForm(true) }}
                        className="text-xs px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDelete(menu.id, menu.name)}
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
        <MenuForm
          menu={editing ?? undefined}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </>
  )
}
