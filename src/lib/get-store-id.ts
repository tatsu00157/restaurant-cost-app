import 'server-only'

// TODO: 認証実装後はセッションからユーザーIDを取得し、
// store_membersテーブルからstore_idを引くように差し替える
export async function getStoreId(): Promise<string> {
  const storeId = process.env.DEV_STORE_ID
  if (!storeId) {
    throw new Error('DEV_STORE_ID が .env.local に設定されていません')
  }
  return storeId
}
