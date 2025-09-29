// This is the original Firebase version - backed up
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore'
import { Order, OrderInput } from '@/lib/firebase-types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const period = searchParams.get('period')

    // Base query
    let ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))

    // Filter by status if provided
    if (status && status !== 'all') {
      ordersQuery = query(collection(db, 'orders'), where('status', '==', status), orderBy('createdAt', 'desc'))
    }

    const querySnapshot = await getDocs(ordersQuery)
    let orders: Order[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[]

    // Filter by period if provided (client-side filtering for simplicity)
    if (period && period !== 'all') {
      const now = new Date()
      let startDate: Date

      switch (period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        default:
          startDate = new Date(0)
      }

      orders = orders.filter(order => {
        const orderDate = new Date(order.createdAt)
        return orderDate >= startDate
      })
    }

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ['customerName', 'customerSurname', 'packageSize', 'quantity', 'unitPrice', 'totalPrice']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Generate order number
    const orderNumber = `TLR-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    const orderData: OrderInput = {
      customerName: body.customerName,
      customerSurname: body.customerSurname,
      packageSize: body.packageSize,
      quantity: body.quantity,
      unitPrice: body.unitPrice,
      totalPrice: body.totalPrice,
      status: 'pending',
      notes: body.notes || null
    }

    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: new Date().toISOString(),
      orderNumber
    })

    const order = {
      id: docRef.id,
      ...orderData,
      createdAt: new Date().toISOString(),
      orderNumber
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}