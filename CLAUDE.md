@AGENTS.md

# 飲食店向け原価計算・発注管理システム — 開発ガイド

## 開発ルール

- **変更前に必ず確認する**: コードの修正・削除・リファクタリングを行う前に、ユーザーに内容を説明して承認を得てから実施する
- **CLAUDE.md を常に最新に保つ**: 変更を加えた後は、このファイルに反映が必要な情報（画面追加・DB変更・ルール追加など）があれば必ず更新する
- **コード修正後は必ず CLAUDE.md更新 → git commit → git push の順で行う**: 少しずつ確実に状態を保存しながら進める
- **機密情報をチャットに出力しない**: `.env.local`の内容・APIキー・シークレット等はチャット上に表示しない。ファイルの読み書きはツールで直接行う
- **できないことをできると言わない**: デプロイ前・未実装の機能について「できます」と言わない。現時点で実際に動作する状態かどうかを正確に伝える

---

## 進捗状況

### 完了済み
- [x] プロジェクト概要・設計をCLAUDE.mdに整理
- [x] フォルダ構成の作成
- [x] GitHubリポジトリ作成・初回プッシュ済み（https://github.com/tatsu00157/restaurant-cost-app.git）
- [x] ダッシュボードレイアウト・サイドバー骨格
- [x] ダッシュボードトップ（/dashboard）実データ接続済み
- [x] Supabaseを全廃・PrismaによるSQLite移行完了
- [x] 食材マスタ管理ページ（/dashboard/ingredient）

### 次にやること
- [x] **DBをSupabaseからSQLiteに移行**（アーキテクチャ変更）
- [x] 購入者DB自動生成API（/api/users/create）
- [x] メニュー原価計算ページ（/dashboard/menu, /dashboard/menu/[id]）
- [x] 棚卸し管理ページ（/dashboard/inventory）
- [x] 発注管理ページ（/dashboard/order）
- [x] 売上・コスト分析ページ（/dashboard/sales）

### 最後にやること（フェーズ4）
- [x] ログイン画面（/）
- [x] セッション管理（src/lib/session.ts）
- [x] ルート保護（src/proxy.ts）
- [x] DAL（src/lib/dal.ts）

---

## プロジェクト概要

個人経営〜中規模の飲食店向けの原価計算・仕入れ・発注管理Webアプリ。
メニューごとの原価率を把握し、利益管理と発注業務を効率化する。
**販売サイトで購入した人だけが使用できる**有料SaaSとして提供する。

### ターゲットユーザー

| ロール | 利用方法 |
|--------|----------|
| オーナー | Web管理画面・LINE 両方を使用 |
| 店長 | Web管理画面・LINE 両方を使用 |
| スタッフ | LINEから棚卸し入力・発注依頼のみ |

---

## 技術スタック

| 役割 | 技術 | 状態 |
|------|------|------|
| フロントエンド | Next.js 16 (App Router)、TypeScript、Tailwind CSS | ✅ |
| システムDB | SQLite（購入者ごとに1ファイル）+ Prisma 7 + libsql | ✅ |
| 認証 | 販売サイト側で管理・このシステムはログインUI のみ | 最後に実装 |
| バリデーション | Zod | ✅ |
| 状態管理 | Zustand | ✅ |
| セッション | jose | ✅ |
| LINE連携 | LINE Messaging API、@line/bot-sdk | 未 |
| グラフ | Recharts | 未 |
| PDF出力 | pdf-lib | 未 |
| ホスティング | VPS（SQLiteのためVercelは使用不可） | 未 |

### Next.js 16 の注意点
- `middleware.ts` は**廃止**。代わりに `src/proxy.ts` を使用する
- ルート保護は `src/proxy.ts` に `proxy` 関数をエクスポートして実装する

---

## アーキテクチャ設計

### DB構成
- **認証**: 販売サイト側で管理。このシステムはログインUIのみ持つ
- **SQLite**: システム本体のデータ管理
  - 購入者1人につき1つの`.db`ファイルをVPS上に生成
  - 外部サービスの制限に縛られない
  - 1店舗あたり数MB程度なので容量の心配なし
  - 複数プロジェクトを運営しても影響し合わない

### DBファイルの命名ルール
購入順がわかるよう連番で管理する。

```
prisma/data/
├── dev.db        ← 開発用（固定）
├── user_0001.db  ← 1人目の購入者
├── user_0002.db  ← 2人目の購入者
├── user_0003.db  ← 3人目の購入者
└── ...
```

- 番号は4桁ゼロ埋め（`0001`〜）で購入順がひと目でわかるようにする
- 新規購入時に現在の最大番号+1のファイルを自動生成する
- `src/lib/db.ts`の`createPrismaClient()`がユーザーIDからファイルパスを解決する

### ホスティング
- VPS（メモリ1GB・CPU2コア・容量100GB）
- 静的サイト・Python API等と同居
- SQLiteはファイルベースのため軽量・同居に適している

### 購入者ごとのDB分離フロー
```
販売サイトで購入完了
  ↓
POST /api/users/create  { email }  ※ x-api-key ヘッダー必須
  ↓
src/lib/registry.ts が連番採番（prisma/data/registry.json を更新）
  ↓
user_XXXX.db を生成してマイグレーションSQL実行
  ↓
購入者がこのシステムにログイン
  ↓
認証成功後、自分の user_XXXX.db に接続してシステムを使用
```

### /api/users/create の仕様
- **メソッド**: POST
- **認証**: `x-api-key` ヘッダーに `API_SECRET_KEY` を付与（販売サイト・このシステム双方に同じ値を設定）
- **リクエストボディ**: `{ "email": "user@example.com" }`
- **レスポンス**: `{ "userNumber": "0001", "created": true }`
- すでに登録済みのメールは再生成せず既存の番号を返す

---

## フォルダ構成

```
src/
├── app/
│   ├── page.tsx                  # ログイン画面（最後に実装）
│   ├── layout.tsx
│   ├── actions/
│   │   ├── auth.ts               # ログイン・ログアウトServer Action（最後に実装）
│   │   └── ingredient.ts         # 食材CRUD
│   └── dashboard/
│       ├── layout.tsx            # ダッシュボード共通レイアウト
│       ├── page.tsx              # トップ（原価率・利益サマリー）
│       ├── menu/
│       │   ├── page.tsx          # メニュー一覧
│       │   └── [id]/page.tsx     # メニュー詳細・食材登録
│       ├── ingredient/
│       │   └── page.tsx          # 食材マスタ管理
│       ├── inventory/
│       │   └── page.tsx          # 棚卸し管理
│       ├── order/
│       │   └── page.tsx          # 発注管理
│       └── sales/
│           └── page.tsx          # 売上・コスト分析
├── components/
│   └── ui/                       # 共通UIコンポーネント
├── lib/
│   ├── supabase/
│   │   ├── server.ts             # Supabaseクライアント（認証用）
│   │   └── client.ts             # Supabaseブラウザクライアント（認証用）
│   ├── db.ts                     # SQLiteクライアント（移行後に作成）
│   ├── get-store-id.ts           # store_id取得ヘルパー（認証実装後に差し替え）
│   ├── session.ts                # セッション暗号化・復号化（最後に実装）
│   └── dal.ts                    # データアクセス層・認証確認（最後に実装）
├── types/
│   └── database.ts               # DB型定義
└── proxy.ts                      # ルート保護（最後に実装）
```

---

## ユーザーロールと権限

| ロール | 権限 |
|--------|------|
| オーナー | 全機能・全データ・売上閲覧 |
| 店長 | 原価管理・発注管理・在庫管理 |
| スタッフ | 棚卸し入力・発注依頼（LINE経由） |

---

## 画面構成

| パス | 内容 | 実装状況 |
|------|------|---------|
| `/` | ログイン（エントリーポイント） | ✅ 完了 |
| `/dashboard` | トップ（原価率・利益サマリー） | ✅ 骨格完了 |
| `/dashboard/menu` | メニュー一覧・原価計算 | ✅ 完了 |
| `/dashboard/menu/[id]` | メニュー詳細・食材登録 | ✅ 完了 |
| `/dashboard/ingredient` | 食材マスタ管理 | ✅ 完了（SQLite移行予定） |
| `/dashboard/inventory` | 棚卸し管理 | ✅ 完了 |
| `/dashboard/order` | 発注管理 | ✅ 完了 |
| `/dashboard/sales` | 売上・コスト分析 | ✅ 完了 |

---

## DBスキーマ（SQLite移行後も同じ構造）

| テーブル | 概要 |
|---------|------|
| `stores` | 店舗情報 |
| `store_members` | 店舗ごとのユーザーロール |
| `ingredients` | 食材マスタ |
| `menus` | メニュー |
| `menu_ingredients` | メニューと食材の中間テーブル |
| `inventory` | 現在の実在庫 |
| `inventory_logs` | 棚卸し履歴 |
| `suppliers` | 仕入れ先 |
| `orders` | 発注 |
| `order_items` | 発注明細 |
| `daily_sales` | 日次売上 |

---

## 認証・アクセス制御

### 方針
- このシステムは**販売サイトで購入した人だけ**が使用できる
- アカウント登録（メール＋パスワード）は販売サイト側で行う
- このシステムはログインのみ提供する（サインアップ機能なし）

### 動作仕様
- `/` がログイン画面（エントリーポイント）
- ログイン成功 → `/dashboard` へリダイレクト
- 未ログインで `/dashboard/*` へアクセス → `/` へリダイレクト
- ログイン済みで `/` へアクセス → `/dashboard` へリダイレクト
- **未登録メールアドレスでログイン試行 → リダイレクトなし、その場でエラーメッセージ表示**

### 実装方針
- 認証：Supabase Auth（メール＋パスワード）
- セッション：JWTをHTTP-onlyクッキーに保存（`jose`使用）
- ルート保護：`src/proxy.ts`
- **ログイン機能は最後に実装する**

### ⚠️ 開発中の一時対応（認証実装時に差し替え）
- `src/lib/get-store-id.ts` が `DEV_STORE_ID` 環境変数を使用中
- 認証実装後はセッションからユーザーIDを取得してstore_idを解決する形に差し替える

---

## 環境変数（.env.local）

```env
DATABASE_URL=                    # 設定済み（SQLiteファイルパス・開発用）
SESSION_SECRET=                  # 設定済み（チャットに出さない・漏洩時はopenssl rand -base64 32で再生成）
API_SECRET_KEY=                  # 設定済み（販売サイト側にも同じ値を設定すること・チャットに出さない）
DEV_STORE_ID=                    # 設定済み（開発中のみ・認証実装後削除）
SALES_SITE_URL=                  # 設定済み（開発中はhttp://localhost:3001、本番はVPSのURLに変更）
LINE_CHANNEL_ACCESS_TOKEN=       # 未設定（LINE連携実装時に設定）
LINE_CHANNEL_SECRET=             # 未設定（LINE連携実装時に設定）
```

---

## LINE連携フロー

```
スタッフ（LINE）
  ↓ 棚卸し結果 or 発注依頼を送信
LINE公式アカウント
  ↓ Webhook
Next.js API (/api/line)
  ↓ データ保存・在庫更新
SQLite（購入者のDBファイル）
  ↓ 在庫アラート or 発注提案を通知
LINE公式アカウント
  ↓
オーナー・店長（LINE）
```

---

## 販売サイトとの連携

### 販売サイト概要（/Users/Karinadmin/Dev/Web/my-shop）

| 項目 | 内容 |
|------|------|
| フレームワーク | Next.js 16 + TypeScript |
| 認証 | NextAuth（メール+パスワードのみ。GoogleOAuthは管理者自身のみ） |
| DB | Supabase（PostgreSQL） |
| 決済 | Stripe（Webhook で購入完了を検知） |
| メール | Resend |
| パスワード | bcryptjs でハッシュ化（salt rounds: 12） |

### 前提
- このシステムをVPSにデプロイしてから連携できる（ローカル開発中は不可）
- `API_SECRET_KEY` を販売サイト側の環境変数にも同じ値を設定する（値はチャットに出さず `.env.local` を直接確認すること）
- 販売サイト側にも `RESTAURANT_APP_API_KEY`（= このシステムの `API_SECRET_KEY`）と `RESTAURANT_APP_URL` を環境変数として追加する

### 連携フロー全体

```
1. 購入者が販売サイトでメール+パスワードで会員登録・購入
      ↓
2. Stripe Webhook（checkout.session.completed）
      ↓
3. 販売サイト /app/api/webhooks/stripe/route.ts に追加：
   POST このシステム/api/users/create { email }
      ↓
4. user_XXXX.db が自動生成される
      ↓
5. 購入完了メールにこのシステムのログインURLを記載（sendAccessGrantedEmail に追記）
      ↓
6. 購入者がこのシステムの / にアクセスしてメール+パスワードを入力
      ↓
7. このシステムが 販売サイト/api/auth/verify を呼んでパスワード検証
      ↓
8. 検証OK → JWTセッション発行 → /dashboard へ
```

### 販売サイト側に追加実装が必要なもの（デプロイ後）

#### ① Stripe Webhook に `/api/users/create` 呼び出しを追加
- ファイル: `/app/api/webhooks/stripe/route.ts`
- `checkout.session.completed` イベント処理内に追記
- 対象商品（restaurant-cost-app の productId）のみ呼ぶ条件分岐を入れる

#### ② 認証確認APIエンドポイントを新規追加
- ファイル: `/app/api/auth/verify/route.ts`（新規作成）
- メソッド: POST
- 認証: `x-api-key` ヘッダーで保護
- 処理: Supabase の `users` テーブルから email でユーザー取得 → bcrypt でパスワード検証
- レスポンス: `{ ok: true }` or `{ ok: false }`

```ts
// リクエスト
POST /api/auth/verify
Headers: x-api-key: [API_SECRET_KEYの値]
Body: { "email": "...", "password": "..." }

// レスポンス
{ "ok": true }  // 認証成功
{ "ok": false } // メールなし or パスワード不一致
```

### このシステム側のログイン実装方針（フェーズ4）
- `/` のログインフォームでメール+パスワードを受け取る
- `registry.json` に登録済みか確認（未登録 → 「ご購入をお確かめください」エラー）
- 登録済み → 販売サイトの `/api/auth/verify` を呼んでパスワード検証
- 検証OK → `jose` でJWT生成 → HTTP-onlyクッキーに保存 → `/dashboard` へ
- 検証NG → その場でエラーメッセージ表示（リダイレクトなし）

---

## GitHubリポジトリ

- URL: https://github.com/tatsu00157/restaurant-cost-app.git
- ブランチ: main

---

## 今後の拡張予定

- POSレジとのAPI連携（Square・Airレジなど）
- AIによる発注数量の自動最適化
- restaurant-shift-appと連携（人件費の自動取り込み）
