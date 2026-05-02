@AGENTS.md

# 飲食店向け原価計算・発注管理システム — 開発ガイド

## 開発ルール

- **変更前に必ず確認する**: コードの修正・削除・リファクタリングを行う前に、ユーザーに内容を説明して承認を得てから実施する
- **CLAUDE.md を常に最新に保つ**: 変更を加えた後は、このファイルに反映が必要な情報（画面追加・DB変更・ルール追加など）があれば必ず更新する
- **コード修正後は必ず CLAUDE.md更新 → git commit → git push の順で行う**: 少しずつ確実に状態を保存しながら進める

---

## 進捗状況

### 完了済み
- [x] プロジェクト概要・設計をCLAUDE.mdに整理
- [x] 必要パッケージのインストール（@supabase/supabase-js, @supabase/ssr, zod, zustand, jose, server-only）
- [x] フォルダ構成の作成（src/lib/, src/components/, src/types/, src/app/dashboard/ など）
- [x] DBスキーマ作成（supabase/schema.sql）
- [x] Supabaseプロジェクト作成・スキーマ実行済み
- [x] .env.local に環境変数を設定済み（SUPABASE_URL, ANON_KEY, SERVICE_ROLE_KEY, SESSION_SECRET）
- [x] GitHubリポジトリ作成・初回プッシュ済み（https://github.com/tatsu00157/restaurant-cost-app.git）

### 次にやること（フェーズ3）
- [x] Supabaseクライアント設定（src/lib/supabase/server.ts, client.ts）
- [x] DB型定義（src/types/database.ts）
- [x] ダッシュボードレイアウト・サイドバー骨格
- [x] ダッシュボードトップ（/dashboard）
- [x] 食材マスタ管理ページ（/dashboard/ingredient）
- [ ] メニュー原価計算ページ（/dashboard/menu, /dashboard/menu/[id]）
- [ ] 棚卸し管理ページ（/dashboard/inventory）
- [ ] 発注管理ページ（/dashboard/order）
- [ ] 売上・コスト分析ページ（/dashboard/sales）

### 最後にやること（フェーズ4）
- [ ] ログイン画面（/）
- [ ] セッション管理（src/lib/session.ts）
- [ ] ルート保護（src/proxy.ts）
- [ ] DAL（src/lib/dal.ts）

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

| 役割 | 技術 | インストール済み |
|------|------|----------------|
| フロントエンド | Next.js 16 (App Router)、TypeScript、Tailwind CSS | ✅ |
| データベース | Supabase (PostgreSQL) | ✅ |
| 認証 | Supabase Auth | ✅ |
| バリデーション | Zod | ✅ |
| 状態管理 | Zustand | ✅ |
| セッション | jose | ✅ |
| LINE連携 | LINE Messaging API、@line/bot-sdk | 未 |
| グラフ | Recharts | 未 |
| PDF出力 | pdf-lib | 未 |
| ホスティング | Vercel | 未 |

### Next.js 16 の注意点
- `middleware.ts` は**廃止**。代わりに `src/proxy.ts` を使用する
- ルート保護は `src/proxy.ts` に `proxy` 関数をエクスポートして実装する

---

## フォルダ構成

```
src/
├── app/
│   ├── page.tsx                  # ログイン画面（最後に実装）
│   ├── layout.tsx
│   ├── actions/
│   │   └── auth.ts               # ログイン・ログアウトServer Action（最後に実装）
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
│   │   ├── server.ts             # Supabaseサーバークライアント
│   │   └── client.ts             # Supabaseブラウザクライアント
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
| `/` | ログイン（エントリーポイント） | 最後に実装 |
| `/dashboard` | トップ（原価率・利益サマリー） | ✅ 骨格完了 |
| `/dashboard/menu` | メニュー一覧・原価計算 | 未 |
| `/dashboard/menu/[id]` | メニュー詳細・食材登録 | 未 |
| `/dashboard/ingredient` | 食材マスタ管理 | ✅ 完了 |
| `/dashboard/inventory` | 棚卸し管理 | 未 |
| `/dashboard/order` | 発注管理 | 未 |
| `/dashboard/sales` | 売上・コスト分析 | 未 |

---

## DBスキーマ（supabase/schema.sql）

### テーブル一覧

| テーブル | 概要 |
|---------|------|
| `stores` | 店舗（マルチテナント） |
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

- 全テーブルにRLS（Row Level Security）設定済み
- `updated_at`自動更新トリガー設定済み

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
- **未登録メールアドレスでログイン試行 → リダイレクトなし、その場でエラーメッセージ表示**（「このメールアドレスは認証されていません」など）

### 実装方針
- 認証：Supabase Auth（メール＋パスワード）
- セッション：JWTをHTTP-onlyクッキーに保存（`jose`使用）
- ルート保護：`src/proxy.ts`（Next.js 16では`middleware.ts`が廃止され`proxy.ts`に変更）
- **ログイン機能は最後に実装する**

---

## 環境変数（.env.local）

```env
NEXT_PUBLIC_SUPABASE_URL=        # 設定済み
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # 設定済み
SUPABASE_SERVICE_ROLE_KEY=       # 設定済み
SESSION_SECRET=                  # 設定済み
LINE_CHANNEL_ACCESS_TOKEN=       # 未設定（LINE連携実装時に設定）
LINE_CHANNEL_SECRET=             # 未設定（LINE連携実装時に設定）
```

---

## マルチテナント設計

- 全テーブルに `store_id` カラムを持たせる
- 店舗ごとにデータを完全に分離する
- RLS（Row Level Security）をSupabaseで設定し、他店舗のデータにはアクセス不可にする

---

## LINE連携フロー

```
スタッフ（LINE）
  ↓ 棚卸し結果 or 発注依頼を送信
LINE公式アカウント
  ↓ Webhook
Next.js API (/api/line)
  ↓ データ保存・在庫更新
Supabase
  ↓ 在庫アラート or 発注提案を通知
LINE公式アカウント
  ↓
オーナー・店長（LINE）
```

---

## GitHubリポジトリ

- URL: https://github.com/tatsu00157/restaurant-cost-app.git
- ブランチ: main

---

## 今後の拡張予定

- POSレジとのAPI連携（Square・Airレジなど）
- AIによる発注数量の自動最適化
- restaurant-shift-appと連携（人件費の自動取り込み）
