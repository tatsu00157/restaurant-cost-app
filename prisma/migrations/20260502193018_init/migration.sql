-- CreateTable
CREATE TABLE "stores" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "store_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "store_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'staff',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "store_members_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ingredients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "store_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "unit_price" REAL NOT NULL DEFAULT 0,
    "supplier_name" TEXT,
    "stock_alert" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "ingredients_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "menus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "store_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "selling_price" REAL NOT NULL DEFAULT 0,
    "category" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "menus_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "menu_ingredients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "menu_id" TEXT NOT NULL,
    "ingredient_id" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "menu_ingredients_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "menu_ingredients_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "store_id" TEXT NOT NULL,
    "ingredient_id" TEXT NOT NULL,
    "quantity" REAL NOT NULL DEFAULT 0,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "inventory_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "inventory_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "inventory_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "store_id" TEXT NOT NULL,
    "ingredient_id" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "input_by" TEXT,
    "source" TEXT NOT NULL DEFAULT 'web',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inventory_logs_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "inventory_logs_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "store_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT,
    "note" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "suppliers_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "store_id" TEXT NOT NULL,
    "supplier_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "ordered_at" DATETIME,
    "received_at" DATETIME,
    "note" TEXT,
    "created_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "orders_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "orders_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order_id" TEXT NOT NULL,
    "ingredient_id" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unit_price" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "order_items_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "daily_sales" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "store_id" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "sales_amount" REAL NOT NULL DEFAULT 0,
    "labor_cost" REAL NOT NULL DEFAULT 0,
    "other_cost" REAL NOT NULL DEFAULT 0,
    "note" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "daily_sales_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "store_members_store_id_user_id_key" ON "store_members"("store_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "menu_ingredients_menu_id_ingredient_id_key" ON "menu_ingredients"("menu_id", "ingredient_id");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_store_id_ingredient_id_key" ON "inventory"("store_id", "ingredient_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_sales_store_id_date_key" ON "daily_sales"("store_id", "date");
