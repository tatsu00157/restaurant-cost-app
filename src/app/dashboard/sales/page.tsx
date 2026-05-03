import { db } from '@/lib/db'
import { getStoreId } from '@/lib/get-store-id'
import SalesDashboard from './_components/SalesDashboard'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{ month?: string }>
}

export default async function SalesPage({ searchParams }: Props) {
  const { month } = await searchParams
  const storeId = await getStoreId()

  const targetMonth = month ?? new Date().toISOString().slice(0, 7)
  const [year, mon] = targetMonth.split('-').map(Number)

  const from = new Date(year, mon - 1, 1)
  const to = new Date(year, mon, 1)

  const sales = await db.dailySale.findMany({
    where: {
      storeId,
      date: { gte: from, lt: to },
    },
    orderBy: { date: 'asc' },
  })

  return (
    <div className="p-8">
      <SalesDashboard sales={sales} month={targetMonth} />
    </div>
  )
}
