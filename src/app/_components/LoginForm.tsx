'use client'

import { useActionState } from 'react'
import { login, type LoginFormState } from '@/app/actions/auth'

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginFormState, FormData>(login, {})

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-700 mb-1">メールアドレス</label>
        <input
          name="email"
          type="email"
          className="input"
          placeholder="example@email.com"
          autoComplete="email"
        />
        {state.errors?.email && (
          <p className="text-xs text-red-600 mt-1">{state.errors.email[0]}</p>
        )}
      </div>

      <div>
        <label className="block text-sm text-gray-700 mb-1">パスワード</label>
        <input
          name="password"
          type="password"
          className="input"
          placeholder="••••••••"
          autoComplete="current-password"
        />
        {state.errors?.password && (
          <p className="text-xs text-red-600 mt-1">{state.errors.password[0]}</p>
        )}
      </div>

      {state.message && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full py-2.5 rounded-lg bg-blue-600 text-sm text-white font-medium hover:bg-blue-700 disabled:opacity-50 mt-2"
      >
        {pending ? 'ログイン中...' : 'ログイン'}
      </button>
    </form>
  )
}
