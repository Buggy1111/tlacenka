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

// Add a new order
export function addOrder(order: any): void {
  const orders = loadOrders()
  orders.push(order)
  saveOrders(orders)
}