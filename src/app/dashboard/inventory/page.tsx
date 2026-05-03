import { db } from '@/lib/db'
import { getStoreId } from '@/lib/get-store-id'
import InventoryTable from './_components/InventoryTable'

export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
  const storeId = await getStoreId()

  const ingredients = await db.ingredient.findMany({
    where: { storeId },
    orderBy: { name: 'asc' },
    include: {
      inventory: {
        where: { storeId },
      },
    },
  })

  const rows = ingredients.map((ing) => ({
    ingredient: ing,
    inventory: ing.inventory[0] ?? null,
  }))

  return (
    <div className="p-8">
      <InventoryTable rows={rows} />
    </div>
  )
}
