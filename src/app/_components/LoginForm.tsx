'use client'

export default function LoginForm() {
  return (
    <form className="space-y-4">
      <div>
        <label className="block text-sm text-gray-700 mb-1">メールアドレス</label>
        <input
          name="email"
          type="email"
          className="input"
          placeholder="example@email.com"
          autoComplete="email"
        />
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
      </div>

      <button
        type="submit"
        className="w-full py-2.5 rounded-lg bg-blue-600 text-sm text-white font-medium hover:bg-blue-700 mt-2"
      >
        ログイン
      </button>
    </form>
  )
}
