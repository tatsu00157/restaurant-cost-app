import { db } from '@/lib/db'
import { getStoreId } from '@/lib/get-store-id'
import OrderList from './_components/OrderList'

export const dynamic = 'force-dynamic'

export default async function OrderPage() {
  const storeId = await getStoreId()

  const [orders, ingredients] = await Promise.all([
    db.order.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      include: {
        orderItems: {
          include: { ingredient: true },
        },
      },
    }),
    db.ingredient.findMany({
      where: { storeId },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <div className="p-8">
      <OrderList orders={orders} ingredients={ingredients} />
    </div>
  )
}
