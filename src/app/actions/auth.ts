'use server'

import { createSession, deleteSession } from '@/lib/session'
import { getUserNumber } from '@/lib/registry'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email('正しいメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
})

export type LoginFormState = {
  errors?: {
    email?: string[]
    password?: string[]
  }
  message?: string
}

export async function login(
  _prev: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  const { email, password } = parsed.data

  // 購入者として登録済みか確認
  const userNumber = getUserNumber(email)
  if (!userNumber) {
    return { message: 'このメールアドレスは登録されていません。ご購入をご確認ください。' }
  }

  // 販売サイトでパスワード検証
  const salesSiteUrl = process.env.SALES_SITE_URL
  const apiKey = process.env.API_SECRET_KEY

  if (!salesSiteUrl || !apiKey) {
    return { message: 'サーバー設定エラーが発生しました。' }
  }

  let verifyOk = false
  try {
    const res = await fetch(`${salesSiteUrl}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    verifyOk = data.ok === true
  } catch {
    return { message: '認証サーバーに接続できませんでした。しばらくしてからお試しください。' }
  }

  if (!verifyOk) {
    return { message: 'メールアドレスまたはパスワードが正しくありません。' }
  }

  await createSession({ email, userNumber })
  redirect('/dashboard')
}

export async function logout(): Promise<void> {
  await deleteSession()
  redirect('/')
}
