import { NextRequest, NextResponse } from 'next/server'
import { updateOrder, loadOrders } from '@/lib/storage'
import { sendTelegramNotification, formatCancellationNotification } from '@/lib/telegram'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Load orders to get the current order
    const orders = await loadOrders()
    const order = orders.find(order => order.id === params.id)

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Check if order is already cancelled
    if (order.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Order is already cancelled' },
        { status: 400 }
      )
    }

    // Check if order can be cancelled (within 15 minutes)
    const orderTime = new Date(order.created_at).getTime()
    const now = new Date().getTime()
    const diffMinutes = (now - orderTime) / (1000 * 60)

    if (diffMinutes > 15) {
      return NextResponse.json(
        { error: 'Order can only be cancelled within 15 minutes of creation' },
        { status: 400 }
      )
    }

    // Update order status to cancelled
    const success = await updateOrder(params.id, { status: 'cancelled' })

    if (success) {
      // Get updated order
      const updatedOrders = await loadOrders()
      const updatedOrder = updatedOrders.find(o => o.id === params.id)

      // Send Telegram notification about cancellation
      if (updatedOrder) {
        const message = formatCancellationNotification(updatedOrder)
        await sendTelegramNotification(message)
      }

      return NextResponse.json({
        order: updatedOrder,
        message: 'Order cancelled successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to cancel order' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error cancelling order:', error)
    return NextResponse.json(
      { error: 'Failed to cancel order' },
      { status: 500 }
    )
  }
}