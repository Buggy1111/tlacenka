'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  Phone,
  User
} from 'lucide-react'
import SimpleCharts, { CHART_TYPES, ChartType } from '../../components/SimpleCharts'

// Constants from main app
const UNIT_PRICE_PER_PACKAGE_1KG = 90
const UNIT_PRICE_PER_PACKAGE_2KG = 175
const COST_PER_PACKAGE_1KG = 35
const COST_PER_PACKAGE_2KG = 90
const PACKAGE_WEIGHT_1KG = 1.0
const PACKAGE_WEIGHT_2KG = 2.0

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
type FilterPeriod = 'today' | 'week' | 'custom'
type FilterStatus = 'all' | OrderStatus

export default function AdminPage() {
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('today')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [chartType, setChartType] = useState<ChartType>(CHART_TYPES.PIE)

  // Calculate KPIs and filtered data
  const { filteredOrders, kpiData, chartData } = useMemo(() => {
    // Filter by period (simplified - in production would handle actual date filtering)
    let orders: Order[] = [] // mockOrders - temporarily disabled

    // Filter by status
    if (filterStatus !== 'all') {
      orders = orders.filter(order => order.status === filterStatus)
    }

    // Calculate KPIs
    const totalQuantity = orders.reduce((sum, order) => sum + order.quantity, 0)
    const totalWeight = orders.reduce((sum, order) => sum + (order.package_size === '1kg' ? order.quantity * 1 : order.quantity * 2), 0)
    const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, order) => sum + order.total_price, 0)
    const totalMargin = orders.filter(o => o.status !== 'cancelled').reduce((sum, order) => sum + (order.total_price - (order.package_size === '1kg' ? order.quantity * 35 : order.quantity * 90)), 0)

    // Chart data for status distribution
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const chartData = Object.entries(statusCounts).map(([status, count]) => ({
      name: STATUS_CONFIG[status as OrderStatus].label,
      value: count,
      color: status === 'pending' ? '#3B82F6' :
             status === 'confirmed' ? '#F97316' :
             status === 'completed' ? '#10B981' : '#EF4444',
      icon: '●'
    }))

    return {
      filteredOrders: orders,
      kpiData: { totalQuantity, totalWeight, totalRevenue, totalMargin },
      chartData
    }
  }, [filterPeriod, filterStatus])

  const handleExportCSV = () => {
    const csvContent = [
      ['ID', 'Datum', 'Zákazník', 'Telefon', 'Balení', 'Množství', 'Cena/ks', 'Celkem', 'Váha', 'Marže', 'Status'].join(','),
      ...filteredOrders.map(order => [
        order.id,
        new Date(order.created_at).toLocaleDateString('cs-CZ'),
        `${order.customer_name} ${order.customer_surname}`,
        'N/A', // phone not in current schema
        order.package_size,
        order.quantity,
        order.unit_price,
        order.total_price,
        order.package_size === '1kg' ? order.quantity * 1 : order.quantity * 2, // calculated weight
        order.total_price - (order.package_size === '1kg' ? order.quantity * 35 : order.quantity * 90), // calculated margin
        STATUS_CONFIG[order.status as OrderStatus].label
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `objednavky_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const getStatusAction = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return { label: 'Potvrdit', color: 'bg-orange-500 hover:bg-orange-600' }
      case 'confirmed': return { label: 'Dokončit', color: 'bg-green-500 hover:bg-green-600' }
      case 'completed': return { label: 'Hotovo', color: 'bg-gray-500 cursor-not-allowed', disabled: true }
      case 'cancelled': return { label: 'Zrušeno', color: 'bg-gray-500 cursor-not-allowed', disabled: true }
      default: return { label: 'Akce', color: 'bg-gray-500' }
    }
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-onyx via-slate-900 to-deep-blue">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-serif font-bold mb-2 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-white/60">Tlačenka Royale - Správa objednávek</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card mb-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-white/60" />

            {/* Period Filter */}
            <div className="flex gap-2">
              {[
                { key: 'today', label: 'Dnes' },
                { key: 'week', label: 'Týden' },
                { key: 'custom', label: 'Interval' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilterPeriod(key as FilterPeriod)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filterPeriod === key
                      ? 'bg-amber-600/20 text-amber-400 border border-amber-600/30'
                      : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {[
                { key: 'all', label: 'Vše' },
                { key: 'new', label: 'Nové' },
                { key: 'confirmed', label: 'Potvrzené' },
                { key: 'done', label: 'Dokončené' }
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilterStatus(key as FilterStatus)}
                  className={`px-3 py-1 rounded-lg text-sm transition-all ${
                    filterStatus === key
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'text-white/50 hover:text-white/70'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600/20 text-amber-400 border border-amber-600/30 rounded-xl font-medium hover:bg-amber-600/30 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </motion.button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: 'Kusy',
            value: kpiData.totalQuantity,
            suffix: 'ks',
            icon: Package,
            color: 'from-blue-500/20 to-blue-600/10 border-blue-500/20',
            iconColor: 'text-blue-400'
          },
          {
            title: 'Hmotnost',
            value: kpiData.totalWeight,
            suffix: 'kg',
            icon: TrendingUp,
            color: 'from-purple-500/20 to-purple-600/10 border-purple-500/20',
            iconColor: 'text-purple-400'
          },
          {
            title: 'Tržba',
            value: kpiData.totalRevenue,
            suffix: 'Kč',
            icon: DollarSign,
            color: 'from-amber-600/20 to-amber-600/10 border-amber-600/20',
            iconColor: 'text-amber-400',
            highlight: true
          },
          {
            title: 'Marže',
            value: kpiData.totalMargin,
            suffix: 'Kč',
            icon: Target,
            color: 'from-green-500/20 to-green-600/10 border-green-500/20',
            iconColor: 'text-green-400'
          }
        ].map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className={`glass-card bg-gradient-to-br ${kpi.color} ${
              kpi.highlight ? 'shadow-lg shadow-amber-600/10' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm font-medium mb-1">{kpi.title}</p>
                <p className={`text-2xl font-bold ${kpi.highlight ? 'text-amber-400' : 'text-white'}`}>
                  {kpi.value.toLocaleString('cs-CZ')} {kpi.suffix}
                </p>
              </div>
              <kpi.icon className={`w-8 h-8 ${kpi.iconColor}`} />
            </div>
            {kpi.highlight && (
              <div className="mt-2 h-0.5 bg-gradient-to-r from-amber-600 to-transparent rounded-full" />
            )}
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <SimpleCharts
          data={chartData}
          chartType={chartType}
          onChartTypeChange={setChartType}
          title="Distribuce objednávek podle stavu"
          subtitle="Aktuální přehled stavů objednávek"
          formatter={(value) => `${value} objednávek`}
          height={300}
        />
      </motion.div>

      {/* Orders Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-card"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-serif font-bold text-white">
            Objednávky ({filteredOrders.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-2 text-white/60 font-medium text-sm">ID</th>
                <th className="text-left py-3 px-2 text-white/60 font-medium text-sm">Čas</th>
                <th className="text-left py-3 px-2 text-white/60 font-medium text-sm">Zákazník</th>
                <th className="text-left py-3 px-2 text-white/60 font-medium text-sm">Objednávka</th>
                <th className="text-left py-3 px-2 text-white/60 font-medium text-sm">Cena</th>
                <th className="text-left py-3 px-2 text-white/60 font-medium text-sm">Marže</th>
                <th className="text-left py-3 px-2 text-white/60 font-medium text-sm">Status</th>
                <th className="text-left py-3 px-2 text-white/60 font-medium text-sm">Akce</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-2">
                    <code className="text-amber-400 text-sm font-mono">{order.id}</code>
                  </td>

                  <td className="py-4 px-2">
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                      <Calendar className="w-4 h-4 text-white/40" />
                      {new Date(order.created_at).toLocaleTimeString('cs-CZ', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>

                  <td className="py-4 px-2">
                    <div>
                      <div className="flex items-center gap-2 text-white font-medium">
                        <User className="w-4 h-4 text-white/40" />
                        {order.customer_name} {order.customer_surname}
                      </div>
                      <div className="flex items-center gap-2 text-white/50 text-sm mt-1">
                        <Phone className="w-3 h-3" />
                        N/A {/* phone not in current schema */}
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-2">
                    <div className="text-white">
                      {order.quantity}× {order.package_size}
                    </div>
                    <div className="text-white/50 text-sm">
                      {order.package_size === '1kg' ? order.quantity * 1 : order.quantity * 2} kg celkem
                    </div>
                  </td>

                  <td className="py-4 px-2">
                    <div className="text-amber-400 font-bold">
                      {order.total_price} Kč
                    </div>
                    <div className="text-white/50 text-sm">
                      {order.unit_price} Kč/ks
                    </div>
                  </td>

                  <td className="py-4 px-2">
                    <div className="text-green-400 font-medium">
                      {order.total_price - (order.package_size === '1kg' ? order.quantity * 35 : order.quantity * 90)} Kč
                    </div>
                  </td>

                  <td className="py-4 px-2">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${STATUS_CONFIG[order.status as OrderStatus].color}`}>
                      {(() => {
                        const Icon = STATUS_CONFIG[order.status as OrderStatus].icon
                        return <Icon className="w-4 h-4" />
                      })()}
                      {STATUS_CONFIG[order.status as OrderStatus].label}
                    </div>
                  </td>

                  <td className="py-4 px-2">
                    {(() => {
                      const action = getStatusAction(order.status as OrderStatus)
                      return (
                        <button
                          disabled={action.disabled}
                          className={`px-3 py-1 rounded-lg text-white text-sm font-medium transition-colors ${action.color}`}
                        >
                          {action.label}
                        </button>
                      )
                    })()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}