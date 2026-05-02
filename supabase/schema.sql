-- ============================================================
-- 飲食店向け原価計算・発注管理システム DBスキーマ
-- ============================================================

-- ユーザーは Supabase Auth (auth.users) を使用


-- ------------------------------------------------------------
-- 店舗テーブル（マルチテナント）
-- ------------------------------------------------------------
CREATE TABLE stores (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- ユーザーロールテーブル（店舗ごとのロール管理）
-- ------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'staff');

CREATE TABLE store_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id   UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       user_role NOT NULL DEFAULT 'staff',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (store_id, user_id)
);

-- ------------------------------------------------------------
-- 食材マスタ
-- ------------------------------------------------------------
CREATE TABLE ingredients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id      UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  unit          TEXT NOT NULL,               -- 例: kg, g, 本, 個
  unit_price    NUMERIC(10, 2) NOT NULL DEFAULT 0,  -- 仕入れ単価
  supplier_name TEXT,                        -- 仕入れ先名
  stock_alert   NUMERIC(10, 3),             -- アラート在庫量
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- メニューテーブル
-- ------------------------------------------------------------
CREATE TABLE menus (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id     UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  selling_price NUMERIC(10, 2) NOT NULL DEFAULT 0,  -- 販売価格
  category     TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- メニュー食材（メニューと食材の中間テーブル）
-- ------------------------------------------------------------
CREATE TABLE menu_ingredients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id       UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity      NUMERIC(10, 3) NOT NULL,   -- 使用量（単位はingredients.unitに準ずる）
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (menu_id, ingredient_id)
);

-- ------------------------------------------------------------
-- 在庫テーブル（現在の実在庫）
-- ------------------------------------------------------------
CREATE TABLE inventory (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id      UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity      NUMERIC(10, 3) NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (store_id, ingredient_id)
);

-- ------------------------------------------------------------
-- 棚卸し履歴
-- ------------------------------------------------------------
CREATE TABLE inventory_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id      UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity      NUMERIC(10, 3) NOT NULL,
  input_by      UUID REFERENCES auth.users(id),
  source        TEXT NOT NULL DEFAULT 'web',  -- 'web' or 'line'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 仕入れ先テーブル
-- ------------------------------------------------------------
CREATE TABLE suppliers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id   UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  contact    TEXT,
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 発注テーブル
-- ------------------------------------------------------------
CREATE TYPE order_status AS ENUM ('draft', 'sent', 'received', 'cancelled');

CREATE TABLE orders (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id     UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  supplier_id  UUID REFERENCES suppliers(id),
  status       order_status NOT NULL DEFAULT 'draft',
  ordered_at   TIMESTAMPTZ,
  received_at  TIMESTAMPTZ,
  note         TEXT,
  created_by   UUID REFERENCES auth.users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 発注明細テーブル
-- ------------------------------------------------------------
CREATE TABLE order_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id),
  quantity      NUMERIC(10, 3) NOT NULL,
  unit_price    NUMERIC(10, 2) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 売上テーブル（日次）
-- ------------------------------------------------------------
CREATE TABLE daily_sales (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id        UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  sales_amount    NUMERIC(12, 2) NOT NULL DEFAULT 0,  -- 売上金額
  labor_cost      NUMERIC(12, 2) NOT NULL DEFAULT 0,  -- 人件費
  other_cost      NUMERIC(12, 2) NOT NULL DEFAULT 0,  -- その他コスト
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (store_id, date)
);

-- ============================================================
-- RLS（Row Level Security）設定
-- ============================================================

ALTER TABLE stores          ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_members   ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients     ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus           ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory       ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers       ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders          ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_sales     ENABLE ROW LEVEL SECURITY;

-- ヘルパー関数: 認証ユーザーが指定store_idのメンバーか確認
CREATE OR REPLACE FUNCTION is_store_member(p_store_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM store_members
    WHERE store_id = p_store_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- stores ポリシー
CREATE POLICY "stores: メンバーのみ参照" ON stores
  FOR SELECT USING (is_store_member(id));

CREATE POLICY "stores: ownerのみ作成" ON stores
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- store_members ポリシー
CREATE POLICY "store_members: メンバーのみ参照" ON store_members
  FOR SELECT USING (is_store_member(store_id));

-- store_idを持つテーブルの共通ポリシー（メンバーのみ全操作可）
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'ingredients', 'menus', 'inventory',
    'inventory_logs', 'suppliers', 'orders', 'daily_sales'
  ]
  LOOP
    EXECUTE format(
      'CREATE POLICY "%s: メンバーのみ操作" ON %s USING (is_store_member(store_id))',
      t, t
    );
  END LOOP;
END $$;

-- menu_ingredients: store_idなし → menuを経由して確認
CREATE POLICY "menu_ingredients: メンバーのみ操作" ON menu_ingredients
  USING (
    EXISTS (
      SELECT 1 FROM menus
      WHERE menus.id = menu_ingredients.menu_id
        AND is_store_member(menus.store_id)
    )
  );

-- order_items: store_idなし → ordersを経由して確認
CREATE POLICY "order_items: メンバーのみ操作" ON order_items
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND is_store_member(orders.store_id)
    )
  );

-- ============================================================
-- updated_at 自動更新トリガー
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'ingredients', 'menus', 'inventory', 'orders', 'daily_sales'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at
       BEFORE UPDATE ON %s
       FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      t, t
    );
  END LOOP;
END $$;
