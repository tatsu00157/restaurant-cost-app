import { db } from '@/lib/db'
import { getStoreId } from '@/lib/get-store-id'
import IngredientTable from './_components/IngredientTable'

export const dynamic = 'force-dynamic'

export default async function IngredientPage() {
  const storeId = await getStoreId()

  const ingredients = await db.ingredient.findMany({
    where: { storeId },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="p-8">
      <IngredientTable ingredients={ingredients} />
    </div>
  )
}
