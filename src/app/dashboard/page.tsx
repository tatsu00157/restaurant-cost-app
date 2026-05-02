export default function DashboardPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">ダッシュボード</h1>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <SummaryCard label="今月の売上" value="—" unit="円" />
        <SummaryCard label="平均原価率" value="—" unit="%" />
        <SummaryCard label="平均利益率" value="—" unit="%" />
        <SummaryCard label="登録メニュー数" value="—" unit="品" />
      </div>

      {/* 注意書き */}
      <p className="text-sm text-gray-400">
        ※ 売上・原価データを登録すると自動で集計されます
      </p>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  unit,
}: {
  label: string
  value: string
  unit: string
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-800">
        {value}
        <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
      </p>
    </div>
  )
}
