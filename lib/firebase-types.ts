export interface Order {
  id: string
  createdAt: string
  customerName: string
  customerSurname: string
  packageSize: '1kg' | '2kg'
  quantity: number
  unitPrice: number
  totalPrice: number
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled'
  orderNumber: string
  notes?: string | null
}

export interface OrderInput {
  customerName: string
  customerSurname: string
  packageSize: '1kg' | '2kg'
  quantity: number
  unitPrice: number
  totalPrice: number
  status?: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled'
  notes?: string | null
}