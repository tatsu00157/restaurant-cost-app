import { db } from '@/lib/db'
import { getStoreId } from '@/lib/get-store-id'
import { notFound } from 'next/navigation'
import MenuDetail from './_components/MenuDetail'

export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ id: string }>
}

export default async function MenuDetailPage({ params }: Props) {
  const { id } = await params
  const storeId = await getStoreId()

  const [menu, allIngredients] = await Promise.all([
    db.menu.findFirst({
      where: { id, storeId },
      include: {
        menuIngredients: {
          include: { ingredient: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    }),
    db.ingredient.findMany({
      where: { storeId },
      orderBy: { name: 'asc' },
    }),
  ])

  if (!menu) notFound()

  return (
    <div className="p-8">
      <MenuDetail
        menu={menu}
        menuIngredients={menu.menuIngredients}
        allIngredients={allIngredients}
      />
    </div>
  )
}
