# 飲食店向け原価計算・発注管理システム

## 概要

個人経営〜中規模の飲食店向けの原価計算・仕入れ・発注管理Webアプリ。
メニューごとの原価率を把握し、利益管理と発注業務を効率化する。

## ターゲットユーザー

- 個人経営〜従業員30人規模の飲食店
- オーナー・店長（Web管理画面・LINE両方を使用）
- 仕入れ担当スタッフ（LINEから発注依頼）

## 主要機能

### 1. メニュー原価計算
- メニューごとに使用食材・分量を登録
- 食材の仕入れ単価から原価を自動計算
- 原価率・利益率をリアルタイム表示
- 仕入れ単価変更時に原価率を自動更新

### 2. 食材・在庫管理
- 食材マスタの登録（名前・単位・仕入れ先・単価）
- 棚卸し結果をWeb画面 or LINEから入力
- 理論在庫と実在庫の差異（ロス）を可視化
- 在庫が少なくなったらLINEで自動アラート

### 3. 発注管理
- 在庫状況をもとに発注数量を自動提案
- 発注書の作成・PDF出力
- 仕入れ先ごとの発注履歴管理
- 担当スタッフがLINEで発注依頼を送信

### 4. 売上・コスト分析
- 日次売上の入力（POSレジとの手動連携）
- 食材コスト・人件費コストの入力
- 売上・原価率・利益の推移グラフ表示
- 月次レポートのエクスポート（CSV）

## 技術スタック

| 役割 | 技術 |
|------|------|
| フロントエンド | Next.js（App Router）、TypeScript、Tailwind CSS |
| バックエンド | Next.js API Routes、Node.js |
| データベース | Supabase（PostgreSQL） |
| 認証 | Supabase Auth |
| LINE連携 | LINE Messaging API、@line/bot-sdk |
| グラフ表示 | Recharts |
| PDF出力 | pdf-lib |
| ホスティング | Vercel |
| バリデーション | Zod |
| 状態管理 | Zustand |

## ユーザーロール

| ロール | 権限 |
|--------|------|
| オーナー | 全機能・全データへのアクセス・売上閲覧 |
| 店長 | 原価管理・発注管理・在庫管理 |
| スタッフ | 棚卸し入力・発注依頼（LINE経由） |

## LINE連携フロー

```
スタッフ（LINE）
  ↓ 棚卸し結果 or 発注依頼を送信
LINE公式アカウント
  ↓ Webhook
Next.js API（/api/line）
  ↓ データ保存・在庫更新
Supabase
  ↓ 在庫アラート or 発注提案を通知
LINE公式アカウント
  ↓
オーナー・店長（LINE）
```

## 画面構成（Web管理画面）

- `/login` — ログイン
- `/dashboard` — トップ（原価率・利益サマリー）
- `/dashboard/menu` — メニュー一覧・原価計算
- `/dashboard/menu/[id]` — メニュー詳細・食材登録
- `/dashboard/ingredient` — 食材マスタ管理
- `/dashboard/inventory` — 棚卸し管理
- `/dashboard/order` — 発注管理
- `/dashboard/sales` — 売上・コスト分析

## 環境変数

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
LINE_CHANNEL_ACCESS_TOKEN=
LINE_CHANNEL_SECRET=
```

## マルチテナント設計

複数の店舗が同じシステムを使えるよう、全テーブルに`store_id`を持たせる。
店舗ごとにデータが完全に分離される設計にする。

## 今後の拡張予定

- POSレジとのAPI連携（Square・Airレジなど）
- AIによる発注数量の自動最適化
- restaurant-shift-appと連携（人件費の自動取り込み）
