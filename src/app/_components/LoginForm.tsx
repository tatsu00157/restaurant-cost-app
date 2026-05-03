'use client'

import { useActionState, useState } from 'react'
import { login } from '@/app/actions/auth'

type State = { error?: string } | undefined

type Props = {
  error?: string
}

export default function LoginForm({ error: initialError }: Props) {
  const [state, action, isPending] = useActionState<State, FormData>(login, undefined)
  const [showPassword, setShowPassword] = useState(false)
  const errorMessage = state?.error ?? initialError

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-900 mb-1">メールアドレス</label>
        <input
          name="email"
          type="email"
          className="input"
          placeholder="example@email.com"
          autoComplete="email"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-900 mb-1">パスワード</label>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? 'text' : 'password'}
            className="input pr-10"
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs"
          >
            {showPassword ? '非表示' : '表示'}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 rounded-lg bg-blue-600 text-sm text-white font-medium hover:bg-blue-700 mt-2 disabled:opacity-50"
      >
        {isPending ? 'ログイン中...' : 'ログイン'}
      </button>
    </form>
  )
}
