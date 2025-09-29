export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          customer_name: string
          customer_surname: string
          package_size: '1kg' | '2kg'
          quantity: number
          unit_price: number
          total_price: number
          status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled'
          notes?: string
          order_number: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          customer_name: string
          customer_surname: string
          package_size: '1kg' | '2kg'
          quantity: number
          unit_price: number
          total_price: number
          status?: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled'
          notes?: string
          order_number?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          customer_name?: string
          customer_surname?: string
          package_size?: '1kg' | '2kg'
          quantity?: number
          unit_price?: number
          total_price?: number
          status?: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled'
          notes?: string
          order_number?: string
        }
      }
      products: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          size: '1kg' | '2kg'
          base_price: number
          bulk_price?: number
          bulk_threshold?: number
          description?: string
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          size: '1kg' | '2kg'
          base_price: number
          bulk_price?: number
          bulk_threshold?: number
          description?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          size?: '1kg' | '2kg'
          base_price?: number
          bulk_price?: number
          bulk_threshold?: number
          description?: string
          is_active?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      package_size: '1kg' | '2kg'
      order_status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled'
    }
  }
}

// Helper types for easier usage
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderInsert = Database['public']['Tables']['orders']['Insert']
export type OrderUpdate = Database['public']['Tables']['orders']['Update']

export type Product = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']

export type PackageSize = Database['public']['Enums']['package_size']
export type OrderStatus = Database['public']['Enums']['order_status']