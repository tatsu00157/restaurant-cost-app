import 'server-only'
import fs from 'node:fs'
import path from 'node:path'

const REGISTRY_PATH = path.resolve('./prisma/data/registry.json')

type Registry = {
  // メールアドレス → ユーザー番号（例: "0001"）
  [email: string]: string
}

function readRegistry(): Registry {
  if (!fs.existsSync(REGISTRY_PATH)) return {}
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'))
}

function writeRegistry(registry: Registry): void {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8')
}

// 次の連番を採番して登録する（例: "0001", "0002", ...）
export function registerUser(email: string): string {
  const registry = readRegistry()

  // すでに登録済み
  if (registry[email]) return registry[email]

  const maxNum = Object.values(registry)
    .map((n) => parseInt(n, 10))
    .reduce((max, n) => Math.max(max, n), 0)

  const newNum = String(maxNum + 1).padStart(4, '0')
  registry[email] = newNum
  writeRegistry(registry)
  return newNum
}

// メールアドレスからユーザー番号を取得
export function getUserNumber(email: string): string | null {
  const registry = readRegistry()
  return registry[email] ?? null
}

// ユーザー番号からDBファイルパスを返す
export function getDbPath(userNumber: string): string {
  return path.resolve(`./prisma/data/user_${userNumber}.db`)
}
