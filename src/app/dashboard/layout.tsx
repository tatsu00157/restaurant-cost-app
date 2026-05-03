import Link from 'next/link'
import { ReactNode } from 'react'
import { logout } from '@/app/actions/auth'

const navItems = [
  { href: '/dashboard', label: 'ダッシュボード', icon: '📊' },
  { href: '/dashboard/menu', label: 'メニュー原価', icon: '🍽️' },
  { href: '/dashboard/ingredient', label: '食材マスタ', icon: '🥬' },
  { href: '/dashboard/inventory', label: '棚卸し', icon: '📦' },
  { href: '/dashboard/order', label: '発注管理', icon: '🛒' },
  { href: '/dashboard/sales', label: '売上分析', icon: '💰' },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* サイドバー */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="font-bold text-gray-800 text-sm leading-tight">
            原価管理<br />システム
          </span>
        </div>
        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-6 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <form action={logout}>
            <button type="submit" className="w-full text-sm text-gray-500 hover:text-gray-700 py-2">
              ログアウト
            </button>
          </form>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
