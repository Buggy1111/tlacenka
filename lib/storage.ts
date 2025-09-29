import { db } from './firebase'
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where
} from 'firebase/firestore'

const COLLECTION_NAME = 'orders'

// Load all orders from Firebase
export async function loadOrders(): Promise<any[]> {
  try {
    const ordersRef = collection(db, COLLECTION_NAME)
    const q = query(ordersRef, orderBy('created_at', 'asc'))
    const snapshot = await getDocs(q)

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error loading orders from Firebase:', error)
    return []
  }
}

// Get next order number
export async function getNextOrderNumber(): Promise<string> {
  const orders = await loadOrders()
  return (orders.length + 1).toString()
}

// Add a new order to Firebase
export async function addOrder(order: any): Promise<void> {
  try {
    const ordersRef = collection(db, COLLECTION_NAME)
    const { id, ...orderData } = order // Remove the id field, Firestore will generate it
    await addDoc(ordersRef, orderData)
  } catch (error) {
    console.error('Error adding order to Firebase:', error)
  }
}

// Update an order in Firebase
export async function updateOrder(orderId: string, updates: any): Promise<boolean> {
  try {
    const orderRef = doc(db, COLLECTION_NAME, orderId)
    await updateDoc(orderRef, updates)
    return true
  } catch (error) {
    console.error('Error updating order in Firebase:', error)
    return false
  }
}

// Delete an order from Firebase
export async function deleteOrder(orderId: string): Promise<boolean> {
  try {
    const orderRef = doc(db, COLLECTION_NAME, orderId)
    await deleteDoc(orderRef)

    // After deletion, renumber all remaining orders
    await renumberAllOrders()
    return true
  } catch (error) {
    console.error('Error deleting order from Firebase:', error)
    return false
  }
}

// Renumber all orders sequentially
async function renumberAllOrders(): Promise<void> {
  try {
    const orders = await loadOrders()
    const sortedOrders = orders.sort((a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    // Update each order with new sequential number
    const updatePromises = sortedOrders.map((order, index) => {
      const orderRef = doc(db, COLLECTION_NAME, order.id)
      return updateDoc(orderRef, { order_number: (index + 1).toString() })
    })

    await Promise.all(updatePromises)
  } catch (error) {
    console.error('Error renumbering orders:', error)
  }
}