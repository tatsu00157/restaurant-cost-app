import { NextRequest, NextResponse } from 'next/server'
import { registerUser, getDbPath } from '@/lib/registry'
import { createClient } from '@libsql/client'
import fs from 'node:fs'
import path from 'node:path'
import { z } from 'zod'

const RequestSchema = z.object({
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  // APIキー認証
  const apiKey = req.headers.get('x-api-key')
  if (!apiKey || apiKey !== process.env.API_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { email } = parsed.data

  // 採番・登録
  const userNumber = registerUser(email)
  const dbPath = getDbPath(userNumber)

  // すでにDBが存在する場合はそのまま返す
  if (fs.existsSync(dbPath)) {
    return NextResponse.json({ userNumber, dbPath, created: false })
  }

  // マイグレーションSQLを読み込んでDBを初期化
  const migrationSql = fs.readFileSync(
    path.resolve('./prisma/migrations/20260502193018_init/migration.sql'),
    'utf-8'
  )

  const db = createClient({ url: `file:${dbPath}` })

  // SQLを文単位に分割して順番に実行
  const statements = migrationSql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  for (const statement of statements) {
    await db.execute(statement)
  }

  db.close()

  return NextResponse.json({ userNumber, created: true }, { status: 201 })
}
