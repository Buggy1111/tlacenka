import { NextRequest, NextResponse } from 'next/server'
import { loadOrders, addOrder, getNextOrderNumber } from '@/lib/storage'
import { sendTelegramNotification, formatOrderNotification } from '@/lib/telegram'
import { verifyAdminAuth, createUnauthorizedResponse } from '@/lib/auth'
import { validateOrderInput } from '@/lib/validation'

export async function GET(request: NextRequest) {
  // Verify admin authentication
  if (!verifyAdminAuth(request)) {
    return createUnauthorizedResponse()
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const period = searchParams.get('period')
    const packageSize = searchParams.get('packageSize')

    // Load orders from storage
    let orders = await loadOrders()

    // Filter by status if provided
    if (status && status !== 'all') {
      orders = orders.filter(order => order.status === status)
    }

    // Filter by package size if provided
    if (packageSize && packageSize !== 'all') {
      orders = orders.filter(order => order.package_size === packageSize)
    }

    // Filter by period if provided
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
        const orderDate = new Date(order.created_at)
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

    // Validate and sanitize input
    const validation = validateOrderInput(body)
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Invalid input data',
          details: validation.errors
        },
        { status: 400 }
      )
    }

    const sanitizedData = validation.sanitizedData!

    // Generate simple chronological order number
    const orderNumber = await getNextOrderNumber()

    const order = {
      id: `order_${Date.now()}`,
      customer_name: sanitizedData.customerName,
      customer_surname: sanitizedData.customerSurname,
      package_size: sanitizedData.packageSize,
      quantity: sanitizedData.quantity,
      unit_price: sanitizedData.unitPrice,
      total_price: sanitizedData.totalPrice,
      status: 'pending',
      notes: sanitizedData.notes || null,
      created_at: new Date().toISOString(),
      order_number: orderNumber
    }

    // Add to persistent storage
    const firebaseId = await addOrder(order)

    if (!firebaseId) {
      return NextResponse.json(
        { error: 'Failed to save order' },
        { status: 500 }
      )
    }

    // Update order with correct Firebase ID
    const finalOrder = { ...order, id: firebaseId }

    // Send Telegram notification
    try {
      const notification = formatOrderNotification(finalOrder)
      await sendTelegramNotification(notification)
    } catch (error) {
      console.error('Failed to send Telegram notification:', error)
      // Don't fail the order if notification fails
    }

    return NextResponse.json({ order: finalOrder }, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}