import 'server-only'
import { db } from '@/lib/db'

// TODO: 認証実装後はセッションからユーザーIDを取得し、
// store_membersテーブルからstore_idを引くように差し替える
export async function getStoreId(): Promise<string> {
  const storeId = process.env.DEV_STORE_ID
  if (!storeId) throw new Error('DEV_STORE_ID が .env.local に設定されていません')

  // 開発用店舗がなければ自動作成
  await db.store.upsert({
    where: { id: storeId },
    update: {},
    create: { id: storeId, name: 'テスト店舗' },
  })

  return storeId
}
