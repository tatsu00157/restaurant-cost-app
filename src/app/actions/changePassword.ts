'use server'

import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

export async function changePassword(_: unknown, formData: FormData) {
  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: '全ての項目を入力してください' }
  }

  if (newPassword !== confirmPassword) {
    return { error: '新しいパスワードが一致しません' }
  }

  if (newPassword.length < 8) {
    return { error: 'パスワードは8文字以上にしてください' }
  }

  const cookieStore = await cookies()
  const token = cookieStore.get('session')?.value
  if (!token) {
    return { error: '認証エラーが発生しました' }
  }

  const secret = new TextEncoder().encode(process.env.SESSION_SECRET!)
  const { payload } = await jwtVerify(token, secret)
  const email = payload.email as string

  const res = await fetch(`${process.env.SALES_SITE_URL}/api/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, currentPassword, newPassword }),
  })

  if (!res.ok) {
    const { error } = await res.json()
    return { error }
  }

  return { success: true }
}
