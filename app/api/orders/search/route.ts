import { NextRequest, NextResponse } from 'next/server'
import { loadOrders } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName } = body

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      )
    }

    // Load all orders
    const allOrders = await loadOrders()

    // Filter by customer name (case insensitive)
    const customerOrders = allOrders.filter((order: any) =>
      order.customer_name.toLowerCase().trim() === firstName.toLowerCase().trim() &&
      order.customer_surname.toLowerCase().trim() === lastName.toLowerCase().trim()
    )

    // Sort by creation date (newest first)
    const sortedOrders = customerOrders.sort((a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return NextResponse.json({
      orders: sortedOrders,
      count: sortedOrders.length
    })

  } catch (error) {
    console.error('Error searching orders:', error)
    return NextResponse.json(
      { error: 'Failed to search orders' },
      { status: 500 }
    )
  }
}