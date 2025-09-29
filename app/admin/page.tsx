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
  LogOut
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

export default function AdminPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('today')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [chartType, setChartType] = useState<ChartType>(CHART_TYPES.PIE)

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
          fetch(`/api/orders?period=${filterPeriod}&status=${filterStatus}`),
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
  }, [filterPeriod, filterStatus, initialLoad])

  // Reset initial load when filters change
  useEffect(() => {
    setInitialLoad(true)
  }, [filterPeriod, filterStatus])

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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h1 className="text-4xl font-serif font-bold text-white mb-2">
                Admin Dashboard
              </h1>
              <p className="text-white/60">
                Přehled objednávek systému Tlačenka Royale
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value as FilterPeriod)}
                className="glass-input text-sm"
              >
                <option value="today">Dnes</option>
                <option value="week">Tento týden</option>
                <option value="month">Tento měsíc</option>
                <option value="all">Vše</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="glass-input text-sm"
              >
                <option value="all">Všechny stavy</option>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>

              <button
                onClick={handleExportCSV}
                className="glass-button text-sm"
                disabled={!orders.length}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>

              <button
                onClick={handleLogout}
                className="glass-button text-sm bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Odhlásit</span>
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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="glass-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium">Objednávky</p>
                  <p className="text-2xl font-bold text-white">{stats.summary.totalOrders}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Package className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="glass-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium">Množství</p>
                  <p className="text-2xl font-bold text-white">{stats.summary.totalQuantity} ks</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>

            <div className="glass-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium">Obrat</p>
                  <p className="text-2xl font-bold text-white">{stats.summary.totalRevenue.toLocaleString('cs-CZ')} Kč</p>
                </div>
                <div className="p-3 bg-amber-500/20 rounded-xl">
                  <DollarSign className="w-6 h-6 text-amber-400" />
                </div>
              </div>
            </div>

            <div className="glass-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm font-medium">Marže</p>
                  <p className="text-2xl font-bold text-white">{stats.summary.totalMargin.toLocaleString('cs-CZ')} Kč</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Target className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Charts */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 mb-8"
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

        {/* Orders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card overflow-hidden"
        >
          <div className="p-6 border-b border-white/10">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Objednávky ({orders.length})
            </h3>
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
                      <span className={`px-3 py-1 rounded-full text-xs border ${STATUS_CONFIG[order.status].color}`}>
                        {STATUS_CONFIG[order.status].label}
                      </span>
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
      </div>
    </div>
  )
}