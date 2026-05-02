export type UserRole = 'owner' | 'manager' | 'staff'
export type OrderStatus = 'draft' | 'sent' | 'received' | 'cancelled'

type Table<Row, Insert, Update> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: '12'
  }
  public: {
    Tables: {
      stores: Table<
        {
          id: string
          name: string
          owner_id: string
          created_at: string
        },
        {
          id?: string
          name: string
          owner_id: string
          created_at?: string
        },
        {
          id?: string
          name?: string
          owner_id?: string
          created_at?: string
        }
      >
      store_members: Table<
        {
          id: string
          store_id: string
          user_id: string
          role: UserRole
          created_at: string
        },
        {
          id?: string
          store_id: string
          user_id: string
          role?: UserRole
          created_at?: string
        },
        {
          id?: string
          store_id?: string
          user_id?: string
          role?: UserRole
          created_at?: string
        }
      >
      ingredients: Table<
        {
          id: string
          store_id: string
          name: string
          unit: string
          unit_price: number
          supplier_name: string | null
          stock_alert: number | null
          created_at: string
          updated_at: string
        },
        {
          id?: string
          store_id: string
          name: string
          unit: string
          unit_price?: number
          supplier_name?: string | null
          stock_alert?: number | null
          created_at?: string
          updated_at?: string
        },
        {
          id?: string
          store_id?: string
          name?: string
          unit?: string
          unit_price?: number
          supplier_name?: string | null
          stock_alert?: number | null
          created_at?: string
          updated_at?: string
        }
      >
      menus: Table<
        {
          id: string
          store_id: string
          name: string
          selling_price: number
          category: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        },
        {
          id?: string
          store_id: string
          name: string
          selling_price?: number
          category?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        },
        {
          id?: string
          store_id?: string
          name?: string
          selling_price?: number
          category?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      >
      menu_ingredients: Table<
        {
          id: string
          menu_id: string
          ingredient_id: string
          quantity: number
          created_at: string
        },
        {
          id?: string
          menu_id: string
          ingredient_id: string
          quantity: number
          created_at?: string
        },
        {
          id?: string
          menu_id?: string
          ingredient_id?: string
          quantity?: number
          created_at?: string
        }
      >
      inventory: Table<
        {
          id: string
          store_id: string
          ingredient_id: string
          quantity: number
          updated_at: string
        },
        {
          id?: string
          store_id: string
          ingredient_id: string
          quantity?: number
          updated_at?: string
        },
        {
          id?: string
          store_id?: string
          ingredient_id?: string
          quantity?: number
          updated_at?: string
        }
      >
      inventory_logs: Table<
        {
          id: string
          store_id: string
          ingredient_id: string
          quantity: number
          input_by: string | null
          source: string
          created_at: string
        },
        {
          id?: string
          store_id: string
          ingredient_id: string
          quantity: number
          input_by?: string | null
          source?: string
          created_at?: string
        },
        {
          id?: string
          store_id?: string
          ingredient_id?: string
          quantity?: number
          input_by?: string | null
          source?: string
          created_at?: string
        }
      >
      suppliers: Table<
        {
          id: string
          store_id: string
          name: string
          contact: string | null
          note: string | null
          created_at: string
        },
        {
          id?: string
          store_id: string
          name: string
          contact?: string | null
          note?: string | null
          created_at?: string
        },
        {
          id?: string
          store_id?: string
          name?: string
          contact?: string | null
          note?: string | null
          created_at?: string
        }
      >
      orders: Table<
        {
          id: string
          store_id: string
          supplier_id: string | null
          status: OrderStatus
          ordered_at: string | null
          received_at: string | null
          note: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        },
        {
          id?: string
          store_id: string
          supplier_id?: string | null
          status?: OrderStatus
          ordered_at?: string | null
          received_at?: string | null
          note?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        },
        {
          id?: string
          store_id?: string
          supplier_id?: string | null
          status?: OrderStatus
          ordered_at?: string | null
          received_at?: string | null
          note?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      >
      order_items: Table<
        {
          id: string
          order_id: string
          ingredient_id: string
          quantity: number
          unit_price: number
          created_at: string
        },
        {
          id?: string
          order_id: string
          ingredient_id: string
          quantity: number
          unit_price: number
          created_at?: string
        },
        {
          id?: string
          order_id?: string
          ingredient_id?: string
          quantity?: number
          unit_price?: number
          created_at?: string
        }
      >
      daily_sales: Table<
        {
          id: string
          store_id: string
          date: string
          sales_amount: number
          labor_cost: number
          other_cost: number
          note: string | null
          created_at: string
          updated_at: string
        },
        {
          id?: string
          store_id: string
          date: string
          sales_amount?: number
          labor_cost?: number
          other_cost?: number
          note?: string | null
          created_at?: string
          updated_at?: string
        },
        {
          id?: string
          store_id?: string
          date?: string
          sales_amount?: number
          labor_cost?: number
          other_cost?: number
          note?: string | null
          created_at?: string
          updated_at?: string
        }
      >
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}
