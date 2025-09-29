import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'orders.json')

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.dirname(DATA_FILE)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Load orders from file
export function loadOrders(): any[] {
  try {
    ensureDataDir()
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error loading orders:', error)
  }
  return []
}

// Save orders to file
export function saveOrders(orders: any[]): void {
  try {
    ensureDataDir()
    fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2), 'utf8')
  } catch (error) {
    console.error('Error saving orders:', error)
  }
}

// Get next order number
export function getNextOrderNumber(): string {
  const orders = loadOrders()
  // Simply return the next sequential number based on count
  return (orders.length + 1).toString()
}

// Add a new order
export function addOrder(order: any): void {
  const orders = loadOrders()
  orders.push(order)
  saveOrders(orders)
}

// Renumber all orders sequentially
function renumberOrders(orders: any[]): any[] {
  // Sort by creation date to maintain chronological order
  const sortedOrders = orders.sort((a, b) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  // Renumber sequentially starting from 1
  return sortedOrders.map((order, index) => ({
    ...order,
    order_number: (index + 1).toString()
  }))
}

// Delete an order by ID
export function deleteOrder(orderId: string): boolean {
  const orders = loadOrders()
  const initialLength = orders.length
  const filteredOrders = orders.filter(order => order.id !== orderId)

  if (filteredOrders.length < initialLength) {
    // Renumber remaining orders sequentially
    const renumberedOrders = renumberOrders(filteredOrders)
    saveOrders(renumberedOrders)
    return true
  }
  return false
}

// Update an order
export function updateOrder(orderId: string, updates: any): boolean {
  const orders = loadOrders()
  const orderIndex = orders.findIndex(order => order.id === orderId)

  if (orderIndex !== -1) {
    orders[orderIndex] = { ...orders[orderIndex], ...updates }
    saveOrders(orders)
    return true
  }
  return false
}