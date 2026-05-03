'use client'

import { useState } from 'react'
import { deleteOrder, removeOrderItem, updateOrderStatus } from '@/app/actions/order'
import OrderItemForm from './OrderItemForm'
import type { Order, OrderItem, Ingredient } from '@/generated/prisma/client'

type OrderItemWithIngredient = OrderItem & { ingredient: Ingredient }
type OrderWithItems = Order & { orderItems: OrderItemWithIngredient[] }

type Props = {
  orders: OrderWithItems[]
  ingredients: Ingredient[]
}

const STATUS_LABEL: Record<string, string> = {
  draft: '下書き',
  ordered: '発注済み',
  received: '受領済み',
}

const STATUS_COLOR: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  ordered: 'bg-blue-100 text-blue-700',
  received: 'bg-green-100 text-green-700',
}

export default function OrderList({ orders, ingredients }: Props) {
  const [addingTo, setAddingTo] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('この発注を削除しますか？')) return
    await deleteOrder(id)
  }

  const handleRemoveItem = async (id: string, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) return
    await removeOrderItem(id)
  }

  const addingOrder = orders.find((o) => o.id === addingTo)

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">発注管理</h1>
        <form action={async (formData) => {
          const { createOrder } = await import('@/app/actions/order')
          await createOrder({}, formData)
        }}>
          <button type="submit"
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
            ＋ 新規発注
          </button>
        </form>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-400 text-sm">発注がありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const total = order.orderItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
            const isDraft = order.status === 'draft'
            const isOrdered = order.status === 'ordered'

            return (
              <div key={order.id} className="bg-white rounded-lg border border-gray-200">
                {/* ヘッダー */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[order.status]}`}>
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      作成日: {new Date(order.createdAt).toLocaleDateString('ja-JP')}
                    </span>
                    {order.orderedAt && (
                      <span className="text-sm text-gray-500">
                        発注日: {new Date(order.orderedAt).toLocaleDateString('ja-JP')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isDraft && (
                      <>
                        <button onClick={() => setAddingTo(order.id)}
                          className="text-xs px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-50">
                          食材追加
                        </button>
                        <button onClick={() => updateOrderStatus(order.id, 'ordered')}
                          className="text-xs px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">
                          発注確定
                        </button>
                        <button onClick={() => handleDelete(order.id)}
                          className="text-xs px-3 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50">
                          削除
                        </button>
                      </>
                    )}
                    {isOrdered && (
                      <button onClick={() => updateOrderStatus(order.id, 'received')}
                        className="text-xs px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700">
                        受領済みにする
                      </button>
                    )}
                  </div>
                </div>

                {/* 明細 */}
                {order.orderItems.length === 0 ? (
                  <div className="px-6 py-4 text-sm text-gray-400">食材が追加されていません</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-50 bg-gray-50">
                        <th className="text-left px-6 py-2 text-gray-500 font-medium">食材</th>
                        <th className="text-right px-4 py-2 text-gray-500 font-medium">数量</th>
                        <th className="text-left px-4 py-2 text-gray-500 font-medium">単位</th>
                        <th className="text-right px-4 py-2 text-gray-500 font-medium">単価</th>
                        <th className="text-right px-4 py-2 text-gray-500 font-medium">小計</th>
                        {isDraft && <th className="px-4 py-2"></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {order.orderItems.map((item) => (
                        <tr key={item.id} className="border-b border-gray-50">
                          <td className="px-6 py-2 text-gray-800">{item.ingredient.name}</td>
                          <td className="px-4 py-2 text-right text-gray-700">{item.quantity}</td>
                          <td className="px-4 py-2 text-gray-500">{item.ingredient.unit}</td>
                          <td className="px-4 py-2 text-right text-gray-600">¥{item.unitPrice.toLocaleString()}</td>
                          <td className="px-4 py-2 text-right font-medium text-gray-800">
                            ¥{(item.unitPrice * item.quantity).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </td>
                          {isDraft && (
                            <td className="px-4 py-2 text-right">
                              <button onClick={() => handleRemoveItem(item.id, item.ingredient.name)}
                                className="text-xs px-2 py-0.5 border border-red-200 text-red-600 rounded hover:bg-red-50">
                                削除
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={isDraft ? 4 : 4} className="px-6 py-3 text-right text-sm text-gray-500 font-medium">合計</td>
                        <td className="px-4 py-3 text-right font-bold text-gray-800">
                          ¥{total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </td>
                        {isDraft && <td />}
                      </tr>
                    </tfoot>
                  </table>
                )}

                {order.note && (
                  <div className="px-6 py-3 border-t border-gray-100 text-sm text-gray-500">
                    メモ: {order.note}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {addingTo && addingOrder && (
        <OrderItemForm
          orderId={addingTo}
          ingredients={ingredients}
          usedIngredientIds={addingOrder.orderItems.map((i) => i.ingredientId)}
          onClose={() => setAddingTo(null)}
        />
      )}
    </>
  )
}
