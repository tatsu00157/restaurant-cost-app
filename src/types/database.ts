export type UserRole = 'owner' | 'manager' | 'staff'
export type OrderStatus = 'draft' | 'sent' | 'received' | 'cancelled'

export interface Database {
  public: {
    Tables: {
      stores: {
        Row: {
          id: string
          name: string
          owner_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          owner_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          owner_id?: string
          created_at?: string
        }
      }
      store_members: {
        Row: {
          id: string
          store_id: string
          user_id: string
          role: UserRole
          created_at: string
        }
        Insert: {
          id?: string
          store_id: string
          user_id: string
          role?: UserRole
          created_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          user_id?: string
          role?: UserRole
          created_at?: string
        }
      }
      ingredients: {
        Row: {
          id: string
          store_id: string
          name: string
          unit: string
          unit_price: number
          supplier_name: string | null
          stock_alert: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          unit: string
          unit_price?: number
          supplier_name?: string | null
          stock_alert?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
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
      }
      menus: {
        Row: {
          id: string
          store_id: string
          name: string
          selling_price: number
          category: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          selling_price?: number
          category?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          name?: string
          selling_price?: number
          category?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      menu_ingredients: {
        Row: {
          id: string
          menu_id: string
          ingredient_id: string
          quantity: number
          created_at: string
        }
        Insert: {
          id?: string
          menu_id: string
          ingredient_id: string
          quantity: number
          created_at?: string
        }
        Update: {
          id?: string
          menu_id?: string
          ingredient_id?: string
          quantity?: number
          created_at?: string
        }
      }
      inventory: {
        Row: {
          id: string
          store_id: string
          ingredient_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          ingredient_id: string
          quantity?: number
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          ingredient_id?: string
          quantity?: number
          updated_at?: string
        }
      }
      inventory_logs: {
        Row: {
          id: string
          store_id: string
          ingredient_id: string
          quantity: number
          input_by: string | null
          source: string
          created_at: string
        }
        Insert: {
          id?: string
          store_id: string
          ingredient_id: string
          quantity: number
          input_by?: string | null
          source?: string
          created_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          ingredient_id?: string
          quantity?: number
          input_by?: string | null
          source?: string
          created_at?: string
        }
      }
      suppliers: {
        Row: {
          id: string
          store_id: string
          name: string
          contact: string | null
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          contact?: string | null
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          name?: string
          contact?: string | null
          note?: string | null
          created_at?: string
        }
      }
      orders: {
        Row: {
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
        }
        Insert: {
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
        }
        Update: {
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
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          ingredient_id: string
          quantity: number
          unit_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          ingredient_id: string
          quantity: number
          unit_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          ingredient_id?: string
          quantity?: number
          unit_price?: number
          created_at?: string
        }
      }
      daily_sales: {
        Row: {
          id: string
          store_id: string
          date: string
          sales_amount: number
          labor_cost: number
          other_cost: number
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          date: string
          sales_amount?: number
          labor_cost?: number
          other_cost?: number
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
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
      }
    }
  }
}
