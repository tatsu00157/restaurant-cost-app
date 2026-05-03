'use client'

import { useState } from 'react'
import { removeMenuIngredient } from '@/app/actions/menu'
import MenuForm from '../../_components/MenuForm'
import MenuIngredientForm from './MenuIngredientForm'
import type { Menu, MenuIngredient, Ingredient } from '@/generated/prisma/client'

type MenuIngredientWithIngredient = MenuIngredient & {
  ingredient: Ingredient
}

type Props = {
  menu: Menu
  menuIngredients: MenuIngredientWithIngredient[]
  allIngredients: Ingredient[]
}

export default function MenuDetail({ menu, menuIngredients, allIngredients }: Props) {
  const [showMenuForm, setShowMenuForm] = useState(false)
  const [showIngredientForm, setShowIngredientForm] = useState(false)

  const cost = menuIngredients.reduce(
    (sum, mi) => sum + mi.ingredient.unitPrice * mi.quantity,
    0
  )
  const costRate = menu.sellingPrice > 0 ? (cost / menu.sellingPrice) * 100 : null
  const profit = menu.sellingPrice - cost

  const handleRemove = async (id: string, name: string) => {
    if (!confirm(`「${name}」をこのメニューから削除しますか？`)) return
    await removeMenuIngredient(id, menu.id)
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <a href="/dashboard/menu" className="text-sm text-gray-400 hover:text-gray-600">
            メニュー原価
          </a>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-600">{menu.name}</span>
        </div>
      </div>

      {/* メニュー情報 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{menu.name}</h1>
            {menu.category && (
              <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                {menu.category}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowMenuForm(true)}
            className="text-sm px-3 py-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            編集
          </button>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">販売価格</p>
            <p className="text-xl font-bold text-gray-800">
              ¥{menu.sellingPrice.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">原価合計</p>
            <p className="text-xl font-bold text-gray-800">
              ¥{cost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-500 mb-1">原価率</p>
            <p className={`text-xl font-bold ${
              costRate == null ? 'text-gray-400' :
              costRate > 35 ? 'text-red-600' :
              costRate > 28 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {costRate != null ? `${costRate.toFixed(1)}%` : '—'}
            </p>
          </div>
        </div>

        {menu.sellingPrice > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-gray-500">粗利:</span>
            <span className={`text-sm font-medium ${profit >= 0 ? 'text-gray-700' : 'text-red-600'}`}>
              ¥{profit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>

      {/* 食材リスト */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">使用食材</h2>
          <button
            onClick={() => setShowIngredientForm(true)}
            className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ＋ 食材を追加
          </button>
        </div>

        {menuIngredients.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm">食材が登録されていません</p>
            <button
              onClick={() => setShowIngredientForm(true)}
              className="mt-4 text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              食材を追加する
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-gray-600 font-medium">食材名</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">使用量</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">単位</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">単価</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">原価</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {menuIngredients.map((mi) => {
                const lineCost = mi.ingredient.unitPrice * mi.quantity
                return (
                  <tr key={mi.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-800">{mi.ingredient.name}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{mi.quantity}</td>
                    <td className="px-4 py-3 text-gray-500">{mi.ingredient.unit}</td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      ¥{mi.ingredient.unitPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-800 font-medium">
                      ¥{lineCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleRemove(mi.id, mi.ingredient.name)}
                        className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {showMenuForm && (
        <MenuForm
          menu={menu}
          onClose={() => setShowMenuForm(false)}
        />
      )}

      {showIngredientForm && (
        <MenuIngredientForm
          menuId={menu.id}
          ingredients={allIngredients}
          usedIngredientIds={menuIngredients.map((mi) => mi.ingredientId)}
          onClose={() => setShowIngredientForm(false)}
        />
      )}
    </>
  )
}
