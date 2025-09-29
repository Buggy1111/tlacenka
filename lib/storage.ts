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
  if (orders.length === 0) {
    return "1"
  }

  // Find the highest existing order number
  const highestNumber = orders.reduce((max, order) => {
    const orderNum = parseInt(order.order_number) || 0
    return Math.max(max, orderNum)
  }, 0)

  return (highestNumber + 1).toString()
}

// Add a new order
export function addOrder(order: any): void {
  const orders = loadOrders()
  orders.push(order)
  saveOrders(orders)
}

// Delete an order by ID
export function deleteOrder(orderId: string): boolean {
  const orders = loadOrders()
  const initialLength = orders.length
  const filteredOrders = orders.filter(order => order.id !== orderId)

  if (filteredOrders.length < initialLength) {
    saveOrders(filteredOrders)
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