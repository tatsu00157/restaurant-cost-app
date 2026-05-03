'use client'

import { useActionState, useState } from 'react'
import { changePassword } from '@/app/actions/changePassword'

type State = { error?: string; success?: boolean } | undefined

function PasswordInput({ name, label, autoComplete }: { name: string; label: string; autoComplete: string }) {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label className="block text-sm text-gray-900 mb-1">{label}</label>
      <div className="relative">
        <input
          name={name}
          type={show ? 'text' : 'password'}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs"
        >
          {show ? '非表示' : '表示'}
        </button>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [state, action, isPending] = useActionState<State, FormData>(changePassword, undefined)

  return (
    <div className="p-8 max-w-md">
      <h1 className="text-xl font-bold text-gray-900 mb-6">設定</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">パスワード変更</h2>

        <form action={action} className="space-y-4">
          <PasswordInput name="currentPassword" label="現在のパスワード" autoComplete="current-password" />
          <PasswordInput name="newPassword" label="新しいパスワード（8文字以上）" autoComplete="new-password" />
          <PasswordInput name="confirmPassword" label="新しいパスワード（確認）" autoComplete="new-password" />

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
