import fs from 'fs'
import path from 'path'
import { kv } from '@vercel/kv'

const DATA_FILE = path.join(process.cwd(), 'data', 'orders.json')
const KV_KEY = 'orders'

// Check if we're in production (Vercel)
const isProduction = process.env.VERCEL === '1'

// Ensure data directory exists (for local development)
function ensureDataDir() {
  if (!isProduction) {
    const dataDir = path.dirname(DATA_FILE)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
  }
}

// Load orders from KV or file
export async function loadOrders(): Promise<any[]> {
  try {
    if (isProduction) {
      // Use Vercel KV in production
      const orders = await kv.get<any[]>(KV_KEY)
      return orders || []
    } else {
      // Use file storage in development
      ensureDataDir()
      if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf8')
        return JSON.parse(data)
      }
    }
  } catch (error) {
    console.error('Error loading orders:', error)
  }
  return []
}

// Save orders to KV or file
export async function saveOrders(orders: any[]): Promise<void> {
  try {
    if (isProduction) {
      // Use Vercel KV in production
      await kv.set(KV_KEY, orders)
    } else {
      // Use file storage in development
      ensureDataDir()
      fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2), 'utf8')
    }
  } catch (error) {
    console.error('Error saving orders:', error)
  }
}

// Synchronous version for backward compatibility (development only)
export function loadOrdersSync(): any[] {
  if (isProduction) {
    throw new Error('Use loadOrders() async function in production')
  }
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

// Get next order number
export async function getNextOrderNumber(): Promise<string> {
  const orders = await loadOrders()
  // Simply return the next sequential number based on count
  return (orders.length + 1).toString()
}

// Add a new order
export async function addOrder(order: any): Promise<void> {
  const orders = await loadOrders()
  orders.push(order)
  await saveOrders(orders)
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
export async function deleteOrder(orderId: string): Promise<boolean> {
  const orders = await loadOrders()
  const initialLength = orders.length
  const filteredOrders = orders.filter(order => order.id !== orderId)

  if (filteredOrders.length < initialLength) {
    // Renumber remaining orders sequentially
    const renumberedOrders = renumberOrders(filteredOrders)
    await saveOrders(renumberedOrders)
    return true
  }
  return false
}

// Update an order
export async function updateOrder(orderId: string, updates: any): Promise<boolean> {
  const orders = await loadOrders()
  const orderIndex = orders.findIndex(order => order.id === orderId)

  if (orderIndex !== -1) {
    orders[orderIndex] = { ...orders[orderIndex], ...updates }
    await saveOrders(orders)
    return true
  }
  return false
}