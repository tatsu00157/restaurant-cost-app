import { db } from '@/lib/db'
import { getStoreId } from '@/lib/get-store-id'
import MenuList from './_components/MenuList'

export const dynamic = 'force-dynamic'

export default async function MenuPage() {
  const storeId = await getStoreId()

  const menus = await db.menu.findMany({
    where: { storeId },
    orderBy: { name: 'asc' },
    include: {
      menuIngredients: {
        include: { ingredient: true },
      },
    },
  })

  const menusWithCost = menus.map((menu) => {
    const cost = menu.menuIngredients.reduce(
      (sum, mi) => sum + mi.ingredient.unitPrice * mi.quantity,
      0
    )
    const costRate = menu.sellingPrice > 0 ? (cost / menu.sellingPrice) * 100 : null
    return { ...menu, cost, costRate }
  })

  return (
    <div className="p-8">
      <MenuList menus={menusWithCost} />
    </div>
  )
}
