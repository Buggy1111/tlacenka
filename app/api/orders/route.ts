import { NextRequest, NextResponse } from 'next/server'
import { loadOrders, addOrder, getNextOrderNumber } from '@/lib/storage'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const period = searchParams.get('period')
    const packageSize = searchParams.get('packageSize')

    // Load orders from file storage
    let orders = loadOrders()

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

    // Generate simple chronological order number
    const orderNumber = getNextOrderNumber()

    const order = {
      id: `order_${Date.now()}`,
      customer_name: body.customerName,
      customer_surname: body.customerSurname,
      package_size: body.packageSize,
      quantity: body.quantity,
      unit_price: body.unitPrice,
      total_price: body.totalPrice,
      status: 'pending',
      notes: body.notes || null,
      created_at: new Date().toISOString(),
      order_number: orderNumber
    }

    // Add to persistent storage
    addOrder(order)
    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}