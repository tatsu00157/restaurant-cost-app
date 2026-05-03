import 'server-only'
import { getSession } from './session'
import { getUserNumber } from './registry'
import { redirect } from 'next/navigation'

export async function requireAuth() {
  const session = await getSession()
  if (!session) redirect('/')

  const userNumber = getUserNumber(session.email)
  if (!userNumber) redirect('/')

  return { email: session.email, userNumber }
}
