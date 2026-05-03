import { db } from '@/lib/db'
import { getStoreId } from '@/lib/get-store-id'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const storeId = await getStoreId()

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  const [monthlySales, menus] = await Promise.all([
    db.dailySale.findMany({
      where: { storeId, date: { gte: monthStart, lt: monthEnd } },
    }),
    db.menu.findMany({
      where: { storeId, isActive: true },
      include: { menuIngredients: { include: { ingredient: true } } },
    }),
  ])

  const totalSales = monthlySales.reduce((s, d) => s + d.salesAmount, 0)
  const totalCost = monthlySales.reduce((s, d) => s + d.laborCost + d.otherCost, 0)
  const profitRate = totalSales > 0 ? ((totalSales - totalCost) / totalSales) * 100 : null

  const menusWithCostRate = menus
    .map((menu) => {
      const cost = menu.menuIngredients.reduce(
        (s, mi) => s + mi.ingredient.unitPrice * mi.quantity,
        0
      )
      return menu.sellingPrice > 0 ? (cost / menu.sellingPrice) * 100 : null
    })
    .filter((r): r is number => r !== null)

  const avgCostRate =
    menusWithCostRate.length > 0
      ? menusWithCostRate.reduce((s, r) => s + r, 0) / menusWithCostRate.length
      : null

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">ダッシュボード</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard
          label="今月の売上"
          value={totalSales > 0 ? `¥${totalSales.toLocaleString()}` : '—'}
        />
        <SummaryCard
          label="平均原価率"
          value={avgCostRate != null ? `${avgCostRate.toFixed(1)}%` : '—'}
          highlight={avgCostRate != null ? (avgCostRate > 35 ? 'red' : avgCostRate > 28 ? 'yellow' : 'green') : undefined}
        />
        <SummaryCard
          label="今月の利益率"
          value={profitRate != null ? `${profitRate.toFixed(1)}%` : '—'}
          highlight={profitRate != null ? (profitRate < 10 ? 'red' : profitRate < 20 ? 'yellow' : 'green') : undefined}
        />
        <SummaryCard
          label="登録メニュー数"
          value={menus.length > 0 ? `${menus.length}品` : '—'}
        />
      </div>

      <p className="text-sm text-gray-400">
        ※ 売上・原価データを登録すると自動で集計されます
      </p>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: 'red' | 'yellow' | 'green'
}) {
  const valueColor =
    highlight === 'red'
      ? 'text-red-600'
      : highlight === 'yellow'
      ? 'text-yellow-600'
      : highlight === 'green'
      ? 'text-green-600'
      : 'text-gray-800'

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
    </div>
  )
}
