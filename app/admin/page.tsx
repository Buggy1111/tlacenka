'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Package,
  TrendingUp,
  DollarSign,
  Target,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  Loader,
  LogOut,
  Trash2,
  Edit,
  MoreVertical
} from 'lucide-react'
import SimpleCharts, { CHART_TYPES, ChartType } from '../../components/SimpleCharts'

// Types for real data
interface Order {
  id: string
  created_at: string
  customer_name: string
  customer_surname: string
  package_size: '1kg' | '2kg'
  quantity: number
  unit_price: number
  total_price: number
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled'
  order_number: string
  notes?: string
}

interface Stats {
  summary: {
    totalOrders: number
    totalQuantity: number
    totalWeight: number
    totalRevenue: number
    totalMargin: number
    averageOrderValue: number
  }
  charts: {
    packageSize: Array<{
      name: string
      value: number
      quantity: number
      orders: number
      color: string
      icon: string
    }>
    status: Array<{
      name: string
      value: number
      revenue: number
      color: string
      icon: string
    }>
  }
  period: string
}

// Status configurations
const STATUS_CONFIG = {
  pending: { label: 'Čekající', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Clock },
  confirmed: { label: 'Potvrzená', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: Eye },
  processing: { label: 'Zpracovává se', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Package },
  completed: { label: 'Dokončená', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle },
  cancelled: { label: 'Zrušená', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle }
} as const

type OrderStatus = keyof typeof STATUS_CONFIG

// Filter types
type FilterPeriod = 'today' | 'week' | 'month' | 'all'
type FilterStatus = 'all' | OrderStatus
type FilterPackageSize = 'all' | '1kg' | '2kg'

export default function AdminPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('today')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterPackageSize, setFilterPackageSize] = useState<FilterPackageSize>('all')
  const [chartType, setChartType] = useState<ChartType>(CHART_TYPES.PIE)

  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Only show loading on initial load or filter changes
        if (initialLoad) {
          setLoading(true)
        }
        setError(null)

        // Fetch orders and stats in parallel
        const [ordersRes, statsRes] = await Promise.all([
          fetch(`/api/orders?period=${filterPeriod}&status=${filterStatus}&packageSize=${filterPackageSize}`),
          fetch(`/api/stats?period=${filterPeriod}`)
        ])

        if (!ordersRes.ok || !statsRes.ok) {
          throw new Error('Chyba při načítání dat')
        }

        const ordersData = await ordersRes.json()
        const statsData = await statsRes.json()

        setOrders(ordersData.orders || [])
        setStats(statsData.stats)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'Neočekávaná chyba')
      } finally {
        if (initialLoad) {
          setLoading(false)
          setInitialLoad(false)
        }
      }
    }

    // Initial fetch
    fetchData()

    // Set up auto-refresh every 1 second
    const interval = setInterval(fetchData, 1000)

    // Cleanup interval on unmount or dependency change
    return () => clearInterval(interval)
  }, [filterPeriod, filterStatus, filterPackageSize, initialLoad])

  // Reset initial load when filters change
  useEffect(() => {
    setInitialLoad(true)
  }, [filterPeriod, filterStatus, filterPackageSize])

  const handleExportCSV = () => {
    if (!orders.length) return

    const csvContent = [
      ['Číslo objednávky', 'Datum', 'Zákazník', 'Balení', 'Množství', 'Cena/ks', 'Celkem', 'Status'].join(','),
      ...orders.map(order => [
        order.order_number,
        new Date(order.created_at).toLocaleDateString('cs-CZ'),
        `${order.customer_name} ${order.customer_surname}`,
        order.package_size,
        order.quantity,
        order.unit_price,
        order.total_price,
        STATUS_CONFIG[order.status].label
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `objednavky-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Order management functions
  const handleDeleteOrder = async (orderId: string) => {
    setActionLoading(orderId)
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Chyba při mazání objednávky')
      }

      // Refresh data
      setOrders(prev => prev.filter(order => order.id !== orderId))
      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('Delete error:', error)
      setError(error instanceof Error ? error.message : 'Chyba při mazání')
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setActionLoading(orderId)
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Chyba při aktualizaci statusu')
      }

      const data = await response.json()

      // Update local state
      setOrders(prev => prev.map(order =>
        order.id === orderId ? data.order : order
      ))
    } catch (error) {
      console.error('Update error:', error)
      setError(error instanceof Error ? error.message : 'Chyba při aktualizaci')
    } finally {
      setActionLoading(null)
    }
  }

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order)
  }

  const handleSaveEdit = async (updatedOrder: Order) => {
    setActionLoading(updatedOrder.id)
    try {
      const response = await fetch(`/api/orders/${updatedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: updatedOrder.customer_name,
          customer_surname: updatedOrder.customer_surname,
          package_size: updatedOrder.package_size,
          quantity: updatedOrder.quantity,
          unit_price: updatedOrder.unit_price,
          total_price: updatedOrder.total_price,
          notes: updatedOrder.notes,
          status: updatedOrder.status
        })
      })

      if (!response.ok) {
        throw new Error('Chyba při úpravě objednávky')
      }

      const data = await response.json()

      // Update local state
      setOrders(prev => prev.map(order =>
        order.id === updatedOrder.id ? data.order : order
      ))
      setEditingOrder(null)
    } catch (error) {
      console.error('Edit error:', error)
      setError(error instanceof Error ? error.message : 'Chyba při úpravě')
    } finally {
      setActionLoading(null)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/admin', { method: 'DELETE' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/admin/login')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-4" />
          <p className="text-white/60">Načítám data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-4">Chyba při načítání dat</p>
          <p className="text-white/60">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-serif font-bold text-white mb-2">
                Admin Dashboard
              </h1>
              <p className="text-white/60 text-sm">
                Přehled objednávek systému Tlačenka Royale
              </p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10">
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value as FilterPeriod)}
                className="bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-400 min-w-20"
              >
                <option value="today" className="bg-slate-800">Dnes</option>
                <option value="week" className="bg-slate-800">Týden</option>
                <option value="month" className="bg-slate-800">Měsíc</option>
                <option value="all" className="bg-slate-800">Vše</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-400 min-w-24"
              >
                <option value="all" className="bg-slate-800">Všechny</option>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key} className="bg-slate-800">{config.label}</option>
                ))}
              </select>

              <select
                value={filterPackageSize}
                onChange={(e) => setFilterPackageSize(e.target.value as FilterPackageSize)}
                className="bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-400 min-w-16"
              >
                <option value="all" className="bg-slate-800">Vše</option>
                <option value="1kg" className="bg-slate-800">1kg</option>
                <option value="2kg" className="bg-slate-800">2kg</option>
              </select>

              <div className="w-px h-6 bg-white/20"></div>

              <button
                onClick={handleExportCSV}
                className="bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white hover:bg-white/20 transition-colors flex items-center gap-1"
                disabled={!orders.length}
                title="Export CSV"
              >
                <Download className="w-3 h-3" />
                <span className="hidden md:inline">CSV</span>
              </button>

              <button
                onClick={handleLogout}
                className="bg-red-500/20 border border-red-500/30 rounded px-2 py-1 text-xs text-red-400 hover:bg-red-500/30 transition-colors flex items-center gap-1"
                title="Odhlásit se"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden md:inline">Odhlásit</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8"
          >
            <div className="glass-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Package className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Objednávky</p>
                  <p className="text-xl font-bold text-white">{stats.summary.totalOrders}</p>
                </div>
              </div>
              <div className="text-xs text-white/50">
                {filterPeriod === 'today' ? 'Dnes' :
                 filterPeriod === 'week' ? 'Tento týden' :
                 filterPeriod === 'month' ? 'Tento měsíc' : 'Celkem'}
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Množství</p>
                  <p className="text-xl font-bold text-white">{stats.summary.totalQuantity}<span className="text-sm text-white/60 ml-1">ks</span></p>
                </div>
              </div>
              <div className="text-xs text-white/50">
                {stats.summary.totalWeight} kg celkem
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Obrat</p>
                  <p className="text-xl font-bold text-white">{stats.summary.totalRevenue.toLocaleString('cs-CZ')}<span className="text-sm text-white/60 ml-1">Kč</span></p>
                </div>
              </div>
              <div className="text-xs text-white/50">
                Ø {stats.summary.averageOrderValue.toLocaleString('cs-CZ')} Kč/obj.
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Target className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-white/60 text-xs font-medium uppercase tracking-wide">Marže</p>
                  <p className="text-xl font-bold text-white">{stats.summary.totalMargin.toLocaleString('cs-CZ')}<span className="text-sm text-white/60 ml-1">Kč</span></p>
                </div>
              </div>
              <div className="text-xs text-white/50">
                {stats.summary.totalRevenue > 0 ? Math.round((stats.summary.totalMargin / stats.summary.totalRevenue) * 100) : 0}% zisk
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Package className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="text-white/60 text-xs font-medium uppercase tracking-wide">1kg balení</p>
                  <p className="text-xl font-bold text-white">{stats.charts.packageSize.find(p => p.name === '1kg')?.quantity || 0}<span className="text-sm text-white/60 ml-1">ks</span></p>
                </div>
              </div>
              <div className="text-xs text-white/50">
                {stats.charts.packageSize.find(p => p.name === '1kg')?.value.toLocaleString('cs-CZ') || 0} Kč
              </div>
            </div>

            <div className="glass-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Package className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-white/60 text-xs font-medium uppercase tracking-wide">2kg balení</p>
                  <p className="text-xl font-bold text-white">{stats.charts.packageSize.find(p => p.name === '2kg')?.quantity || 0}<span className="text-sm text-white/60 ml-1">ks</span></p>
                </div>
              </div>
              <div className="text-xs text-white/50">
                {stats.charts.packageSize.find(p => p.name === '2kg')?.value.toLocaleString('cs-CZ') || 0} Kč
              </div>
            </div>
          </motion.div>
        )}

        {/* Charts Section */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8"
          >
            <SimpleCharts
              data={stats.charts.status}
              title="Stavy objednávek"
              subtitle="Distribuce podle stavu"
              chartType={chartType}
              onChartTypeChange={setChartType}
              className="min-h-96"
              height={380}
            />

            <SimpleCharts
              data={stats.charts.packageSize}
              title="Velikosti balení"
              subtitle="Obrat podle velikosti"
              chartType={chartType}
              onChartTypeChange={setChartType}
              className="min-h-96"
              height={380}
            />
          </motion.div>
        )}

        {/* Recent Orders Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card mb-8"
        >
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Nejnovější objednávky
            </h3>
            <p className="text-white/60 text-sm mt-1">Posledních 5 objednávek</p>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {orders.slice(0, 5).map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center">
                      <span className="text-blue-400 font-bold text-xs">#{order.order_number}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${STATUS_CONFIG[order.status].color}`}>
                      {STATUS_CONFIG[order.status].label}
                    </span>
                  </div>
                  <p className="text-white text-sm font-medium mb-1">
                    {order.customer_name} {order.customer_surname}
                  </p>
                  <p className="text-white/60 text-xs mb-2">
                    {order.quantity}× {order.package_size}
                  </p>
                  <p className="text-white font-bold text-sm">
                    {order.total_price.toLocaleString('cs-CZ')} Kč
                  </p>
                </motion.div>
              ))}

              {orders.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <Package className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/60 text-sm">Žádné objednávky</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Orders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card overflow-hidden"
        >
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Objednávky
                </h3>
                <p className="text-white/60 text-sm mt-1">
                  {orders.length} {orders.length === 1 ? 'objednávka' : orders.length < 5 ? 'objednávky' : 'objednávek'} •
                  {filterPeriod === 'today' ? ' Dnešní' :
                   filterPeriod === 'week' ? ' Týdenní' :
                   filterPeriod === 'month' ? ' Měsíční' : ' Všechny'} zobrazení
                  {filterStatus !== 'all' && ` • ${STATUS_CONFIG[filterStatus as OrderStatus].label}`}
                  {filterPackageSize !== 'all' && ` • ${filterPackageSize} balení`}
                </p>
              </div>

              {orders.length > 0 && (
                <div className="text-right">
                  <p className="text-white/80 text-sm">Celkový obrat</p>
                  <p className="text-white font-bold text-lg">
                    {orders.reduce((sum, order) => sum + order.total_price, 0).toLocaleString('cs-CZ')} Kč
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-4 text-white/80 font-medium">Číslo</th>
                  <th className="text-left p-4 text-white/80 font-medium">Datum</th>
                  <th className="text-left p-4 text-white/80 font-medium">Zákazník</th>
                  <th className="text-left p-4 text-white/80 font-medium">Balení</th>
                  <th className="text-left p-4 text-white/80 font-medium">Množství</th>
                  <th className="text-left p-4 text-white/80 font-medium">Celkem</th>
                  <th className="text-left p-4 text-white/80 font-medium">Stav</th>
                  <th className="text-right p-4 text-white/80 font-medium">Akce</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-white/10 hover:bg-white/5"
                  >
                    <td className="p-4 text-white font-mono text-sm">
                      {order.order_number}
                    </td>
                    <td className="p-4 text-white/80">
                      {new Date(order.created_at).toLocaleDateString('cs-CZ')}
                      <div className="text-xs text-white/60">
                        {new Date(order.created_at).toLocaleTimeString('cs-CZ')}
                      </div>
                    </td>
                    <td className="p-4 text-white">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-white/40" />
                        {order.customer_name} {order.customer_surname}
                      </div>
                    </td>
                    <td className="p-4 text-white">
                      <span className="px-2 py-1 bg-white/10 rounded text-sm">
                        {order.package_size}
                      </span>
                    </td>
                    <td className="p-4 text-white font-medium">
                      {order.quantity}×
                    </td>
                    <td className="p-4 text-white font-bold">
                      {order.total_price.toLocaleString('cs-CZ')} Kč
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                          disabled={actionLoading === order.id}
                          className="bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-400"
                        >
                          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                            <option key={key} value={key} className="bg-slate-800">
                              {config.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditOrder(order)}
                          disabled={actionLoading === order.id}
                          className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded transition-colors"
                          title="Upravit objednávku"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {showDeleteConfirm === order.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              disabled={actionLoading === order.id}
                              className="px-2 py-1 bg-red-500/20 border border-red-500/30 text-red-400 text-xs rounded hover:bg-red-500/30 transition-colors"
                            >
                              {actionLoading === order.id ? (
                                <Loader className="w-3 h-3 animate-spin" />
                              ) : (
                                'Ano'
                              )}
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="px-2 py-1 bg-white/10 border border-white/20 text-white/60 text-xs rounded hover:bg-white/20 transition-colors"
                            >
                              Ne
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowDeleteConfirm(order.id)}
                            disabled={actionLoading === order.id}
                            className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                            title="Smazat objednávku"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {orders.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60">Žádné objednávky pro vybrané filtry</p>
            </div>
          )}
        </motion.div>

        {/* Edit Order Modal */}
        {editingOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800 rounded-lg p-6 w-full max-w-md border border-white/10"
            >
              <h3 className="text-xl font-bold text-white mb-4">Upravit objednávku #{editingOrder.order_number}</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Jméno</label>
                    <input
                      type="text"
                      value={editingOrder.customer_name}
                      onChange={(e) => setEditingOrder(prev => prev ? {...prev, customer_name: e.target.value} : null)}
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Příjmení</label>
                    <input
                      type="text"
                      value={editingOrder.customer_surname}
                      onChange={(e) => setEditingOrder(prev => prev ? {...prev, customer_surname: e.target.value} : null)}
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Balení</label>
                    <select
                      value={editingOrder.package_size}
                      onChange={(e) => {
                        const newSize = e.target.value as '1kg' | '2kg'
                        const newUnitPrice = newSize === '1kg' ? 90 : 175
                        setEditingOrder(prev => prev ? {
                          ...prev,
                          package_size: newSize,
                          unit_price: newUnitPrice,
                          total_price: newUnitPrice * prev.quantity
                        } : null)
                      }}
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400"
                    >
                      <option value="1kg" className="bg-slate-800">1kg</option>
                      <option value="2kg" className="bg-slate-800">2kg</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Množství</label>
                    <input
                      type="number"
                      min="1"
                      value={editingOrder.quantity}
                      onChange={(e) => {
                        const newQuantity = parseInt(e.target.value) || 1
                        setEditingOrder(prev => prev ? {
                          ...prev,
                          quantity: newQuantity,
                          total_price: prev.unit_price * newQuantity
                        } : null)
                      }}
                      className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">Status</label>
                  <select
                    value={editingOrder.status}
                    onChange={(e) => setEditingOrder(prev => prev ? {...prev, status: e.target.value as OrderStatus} : null)}
                    className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400"
                  >
                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                      <option key={key} value={key} className="bg-slate-800">
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">Poznámky</label>
                  <textarea
                    value={editingOrder.notes || ''}
                    onChange={(e) => setEditingOrder(prev => prev ? {...prev, notes: e.target.value} : null)}
                    className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-400 h-20"
                    placeholder="Volitelné poznámky..."
                  />
                </div>

                <div className="text-right text-white/80 text-sm">
                  <strong>Celková cena: {editingOrder.total_price.toLocaleString('cs-CZ')} Kč</strong>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingOrder(null)}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 text-white/80 rounded hover:bg-white/20 transition-colors"
                >
                  Zrušit
                </button>
                <button
                  onClick={() => editingOrder && handleSaveEdit(editingOrder)}
                  disabled={actionLoading === editingOrder.id}
                  className="flex-1 px-4 py-2 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded hover:bg-amber-500/30 transition-colors disabled:opacity-50"
                >
                  {actionLoading === editingOrder.id ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      Ukládám...
                    </div>
                  ) : (
                    'Uložit'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}