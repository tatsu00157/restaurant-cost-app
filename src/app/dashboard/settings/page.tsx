'use client'

import { useActionState } from 'react'
import { changePassword } from '@/app/actions/changePassword'

type State = { error?: string; success?: boolean } | undefined

export default function SettingsPage() {
  const [state, action, isPending] = useActionState<State, FormData>(changePassword, undefined)

  return (
    <div className="p-8 max-w-md">
      <h1 className="text-xl font-bold text-gray-800 mb-6">設定</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">パスワード変更</h2>

        <form action={action} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">現在のパスワード</label>
            <input
              name="currentPassword"
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="current-password"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">新しいパスワード（8文字以上）</label>
            <input
              name="newPassword"
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">新しいパスワード（確認）</label>
            <input
              name="confirmPassword"
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="new-password"
            />
          </div>

          {state?.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{state.error}</p>
            </div>
          )}

          {state?.success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700">パスワードを変更しました</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 rounded-lg bg-blue-600 text-sm text-white font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending ? '変更中...' : 'パスワードを変更する'}
          </button>
        </form>
      </div>
    </div>
  )
}
