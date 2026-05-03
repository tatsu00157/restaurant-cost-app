import LoginForm from './_components/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-8">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-bold text-gray-800">原価管理システム</h1>
          <p className="text-sm text-gray-500 mt-1">ログイン</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
