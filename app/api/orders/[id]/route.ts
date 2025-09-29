import { NextRequest, NextResponse } from 'next/server'
import { deleteOrder, updateOrder, loadOrders } from '@/lib/storage'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteOrder(params.id)

    if (success) {
      return NextResponse.json({ message: 'Order deleted successfully' })
    } else {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error deleting order:', error)
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const success = await updateOrder(params.id, body)

    if (success) {
      // Return updated order
      const orders = await loadOrders()
      const updatedOrder = orders.find(order => order.id === params.id)
      return NextResponse.json({ order: updatedOrder })
    } else {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orders = await loadOrders()
    const order = orders.find(order => order.id === params.id)

    if (order) {
      return NextResponse.json({ order })
    } else {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    )
  }
}