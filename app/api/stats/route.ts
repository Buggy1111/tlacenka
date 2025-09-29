import { NextRequest, NextResponse } from 'next/server'
import { loadOrders } from '@/lib/storage'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'all'

    // Get current orders directly from storage
    const orders = await loadOrders()

    // Calculate date range
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

    // Filter by period if needed
    let filteredOrders = orders
    if (period !== 'all') {
      filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.created_at)
        return orderDate >= startDate
      })
    }

    // Calculate statistics
    const totalOrders = filteredOrders.length
    const totalQuantity = filteredOrders.reduce((sum, order) => sum + order.quantity, 0)
    const totalWeight = filteredOrders.reduce((sum, order) => {
      const weight = order.package_size === '1kg' ? 1 : 2
      return sum + (order.quantity * weight)
    }, 0)
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total_price, 0)

    // Calculate margins (using cost from constants)
    const totalCosts = filteredOrders.reduce((sum, order) => {
      const costPerItem = order.package_size === '1kg' ? 35 : 90
      return sum + (order.quantity * costPerItem)
    }, 0)
    const totalMargin = totalRevenue - totalCosts

    // Group by package size for charts
    const packageStats = filteredOrders.reduce((acc, order) => {
      const size = order.package_size
      if (!acc[size]) {
        acc[size] = { quantity: 0, revenue: 0, orders: 0 }
      }
      acc[size].quantity += order.quantity
      acc[size].revenue += order.total_price
      acc[size].orders += 1
      return acc
    }, {} as Record<string, { quantity: number; revenue: number; orders: number }>)

    // Group by status for charts
    const statusStats = filteredOrders.reduce((acc, order) => {
      const status = order.status
      if (!acc[status]) {
        acc[status] = { count: 0, revenue: 0 }
      }
      acc[status].count += 1
      acc[status].revenue += order.total_price
      return acc
    }, {} as Record<string, { count: number; revenue: number }>)

    const stats = {
      summary: {
        totalOrders,
        totalQuantity,
        totalWeight,
        totalRevenue,
        totalMargin,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
      },
      charts: {
        packageSize: Object.entries(packageStats).map(([size, data]) => ({
          name: size,
          value: (data as { quantity: number; revenue: number; orders: number }).revenue,
          quantity: (data as { quantity: number; revenue: number; orders: number }).quantity,
          orders: (data as { quantity: number; revenue: number; orders: number }).orders,
          color: size === '1kg' ? '#F59E0B' : '#D97706',
          icon: '📦'
        })),
        status: Object.entries(statusStats).map(([status, data]) => ({
          name: status,
          value: (data as { count: number; revenue: number }).count,
          revenue: (data as { count: number; revenue: number }).revenue,
          color: getStatusColor(status),
          icon: getStatusIcon(status)
        }))
      },
      period
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error calculating stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'pending': return '#F59E0B'
    case 'confirmed': return '#10B981'
    case 'processing': return '#3B82F6'
    case 'completed': return '#059669'
    case 'cancelled': return '#EF4444'
    default: return '#6B7280'
  }
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'pending': return '⏳'
    case 'confirmed': return '✅'
    case 'processing': return '🔄'
    case 'completed': return '🎉'
    case 'cancelled': return '❌'
    default: return '📄'
  }
}