import LoginForm from './_components/LoginForm'

type Props = {
  searchParams: Promise<{ error?: string }>
}

const ERROR_MESSAGES: Record<string, string> = {
  invalid: 'メールアドレスまたはパスワードが正しくありません。ご購入がお済みでない場合は、販売サイトよりご購入ください。',
  unauthorized: 'このメールアドレスは登録されていません。ご購入後にご利用いただけます。',
}

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? ERROR_MESSAGES.invalid) : undefined

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-8">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-bold text-gray-800">原価管理システム</h1>
          <p className="text-sm text-gray-500 mt-1">ログイン</p>
        </div>
        <LoginForm error={errorMessage} />
      </div>
    </div>
  )
}
