'use client'

import { useState } from 'react'
import SalesForm from './SalesForm'
import type { DailySale } from '@/generated/prisma/client'

type Props = {
  sales: DailySale[]
  month: string // "YYYY-MM"
}

export default function SalesDashboard({ sales, month }: Props) {
  const [editing, setEditing] = useState<DailySale | null>(null)
  const [showForm, setShowForm] = useState(false)

  const totalSales = sales.reduce((s, d) => s + d.salesAmount, 0)
  const totalLabor = sales.reduce((s, d) => s + d.laborCost, 0)
  const totalOther = sales.reduce((s, d) => s + d.otherCost, 0)
  const totalCost = totalLabor + totalOther
  const profit = totalSales - totalCost
  const profitRate = totalSales > 0 ? (profit / totalSales) * 100 : null

  const [year, mon] = month.split('-')
  const monthLabel = `${year}年${parseInt(mon)}月`

  const handlePrevMonth = () => {
    const d = new Date(`${month}-01`)
    d.setMonth(d.getMonth() - 1)
    window.location.href = `/dashboard/sales?month=${d.toISOString().slice(0, 7)}`
  }

  const handleNextMonth = () => {
    const d = new Date(`${month}-01`)
    d.setMonth(d.getMonth() + 1)
    window.location.href = `/dashboard/sales?month=${d.toISOString().slice(0, 7)}`
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">売上分析</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          ＋ 売上を入力
        </button>
      </div>

      {/* 月切り替え */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={handlePrevMonth}
          className="text-sm px-3 py-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-50">
          ← 前月
        </button>
        <span className="font-semibold text-gray-800">{monthLabel}</span>
        <button onClick={handleNextMonth}
          className="text-sm px-3 py-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-50">
          次月 →
        </button>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">売上合計</p>
          <p className="text-xl font-bold text-gray-800">¥{totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">人件費合計</p>
          <p className="text-xl font-bold text-gray-700">¥{totalLabor.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">その他コスト</p>
          <p className="text-xl font-bold text-gray-700">¥{totalOther.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">粗利</p>
          <p className={`text-xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ¥{profit.toLocaleString()}
          </p>
          {profitRate != null && (
            <p className="text-xs text-gray-400 mt-0.5">利益率 {profitRate.toFixed(1)}%</p>
          )}
        </div>
      </div>

      {/* 日次テーブル */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">日次売上</h2>
        </div>

        {sales.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 text-sm">この月の売上データがありません</p>
            <button onClick={() => { setEditing(null); setShowForm(true) }}
              className="mt-4 text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              売上を入力する
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-gray-600 font-medium">日付</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">売上</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">人件費</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">その他</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">粗利</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">メモ</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {sales.map((d) => {
                const cost = d.laborCost + d.otherCost
                const p = d.salesAmount - cost
                return (
                  <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-800">
                      {new Date(d.date).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-800">¥{d.salesAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-gray-600">¥{d.laborCost.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-gray-600">¥{d.otherCost.toLocaleString()}</td>
                    <td className={`px-4 py-3 text-right font-medium ${p >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ¥{p.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{d.note ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => { setEditing(d); setShowForm(true) }}
                        className="text-xs px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100">
                        編集
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <SalesForm
          existing={editing ?? undefined}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </>
  )
}
