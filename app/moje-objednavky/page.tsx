'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Package, Clock, X, CheckCircle } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'

interface Order {
  id: string
  customer_name: string
  customer_surname: string
  package_size: string
  quantity: number
  unit_price: number
  total_price: number
  status: string
  created_at: string
  order_number: string
}

export default function MyOrdersPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Zadejte prosím jméno i příjmení')
      return
    }

    setIsSearching(true)
    setHasSearched(true)

    try {
      // Search orders by customer name
      const response = await fetch('/api/orders/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim()
        })
      })

      if (!response.ok) {
        throw new Error('Chyba při načítání objednávek')
      }

      const data = await response.json()
      setOrders(data.orders || [])

    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Nepodařilo se načíst objednávky')
      setOrders([])
    } finally {
      setIsSearching(false)
    }
  }

  const canCancelOrder = (createdAt: string): boolean => {
    const orderTime = new Date(createdAt).getTime()
    const now = new Date().getTime()
    const diffMinutes = (now - orderTime) / (1000 * 60)
    return diffMinutes <= 15
  }

  const handleCancelOrder = (order: Order) => {
    setOrderToCancel(order)
    setShowCancelModal(true)
  }

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return

    setShowCancelModal(false)

    try {
      const response = await fetch(`/api/orders/${orderToCancel.id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Chyba při stornování objednávky')
      }

      // Update local state
      setOrders(orders.map(order =>
        order.id === orderToCancel.id
          ? { ...order, status: 'cancelled' }
          : order
      ))

      toast.success(`Objednávka č. ${orderToCancel.order_number} byla stornována`)

    } catch (error) {
      console.error('Error cancelling order:', error)
      toast.error('Nepodařilo se stornovat objednávku')
    } finally {
      setOrderToCancel(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10'
      case 'confirmed': return 'text-green-400 bg-green-400/10'
      case 'cancelled': return 'text-red-400 bg-red-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Čeká na potvrzení'
      case 'confirmed': return 'Potvrzeno'
      case 'cancelled': return 'Stornováno'
      default: return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('cs-CZ')
  }

  const getTimeSinceOrder = (createdAt: string) => {
    const orderTime = new Date(createdAt).getTime()
    const now = new Date().getTime()
    const diffMinutes = Math.floor((now - orderTime) / (1000 * 60))

    if (diffMinutes < 1) return 'Právě teď'
    if (diffMinutes < 60) return `před ${diffMinutes} min`
    if (diffMinutes < 1440) return `před ${Math.floor(diffMinutes / 60)} h`
    return `před ${Math.floor(diffMinutes / 1440)} dny`
  }

  return (
    <>
      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && orderToCancel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowCancelModal(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm sm:max-w-md mx-auto"
            >
              <div className="glass-card">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-serif font-bold text-white">
                    Stornovat objednávku
                  </h2>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowCancelModal(false)}
                    className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Order Summary */}
                <div className="space-y-4 mb-8">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/80">Zákazník:</span>
                      <span className="text-white font-semibold">{orderToCancel.customer_name} {orderToCancel.customer_surname}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/80">Objednávka:</span>
                      <span className="text-white">č. {orderToCancel.order_number}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/80">Balení:</span>
                      <span className="text-white">{orderToCancel.quantity}× {orderToCancel.package_size}</span>
                    </div>
                    <div className="h-px bg-white/10 my-3"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80 font-medium">Celková cena:</span>
                      <span className="text-yellow-400 text-xl font-bold">{orderToCancel.total_price} Kč</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-red-600/10 border border-red-600/20">
                    <div className="flex items-center gap-2 text-red-300 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Opravdu chcete stornovat tuto objednávku?</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCancelModal(false)}
                    className="px-6 py-3 rounded-2xl bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition-colors"
                  >
                    Zpět
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmCancelOrder}
                    className="px-6 py-3 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-300 font-medium hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    <span>Stornovat</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#1a1f2e',
            color: '#fff',
            border: '1px solid rgba(198, 161, 91, 0.3)',
            borderRadius: '16px',
          },
        }}
      />

      <main className="min-h-screen px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-block mb-4 text-amber-400 hover:text-amber-300 transition-colors">
            ← Zpět na objednávky
          </Link>
          <h1 className="text-3xl xs:text-4xl md:text-5xl font-serif font-bold mb-3 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 bg-clip-text text-transparent">
            Moje objednávky
          </h1>
          <p className="text-white/60 text-base xs:text-lg">Kontrola a storno objednávek</p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="max-w-md mx-auto w-full mb-8"
        >
          <form onSubmit={handleSearch} className="glass-card">
            <div className="mb-6">
              <h2 className="text-xl font-serif font-bold text-white mb-4 flex items-center gap-2">
                <Search className="w-5 h-5 text-amber-400" />
                Vyhledat objednávky
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label htmlFor="firstName" className="text-white/80 text-sm font-medium mb-2 block">
                    Jméno
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jan"
                    className="input-premium"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="text-white/80 text-sm font-medium mb-2 block">
                    Příjmení
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Novák"
                    className="input-premium"
                    required
                  />
                </div>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isSearching}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-premium text-lg h-12 flex items-center justify-center gap-2"
            >
              {isSearching ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-onyx/30 border-t-onyx rounded-full animate-spin" />
                  <span>Hledám...</span>
                </div>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Vyhledat objednávky</span>
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Results */}
        <AnimatePresence>
          {hasSearched && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl mx-auto px-2"
            >
              {orders.length === 0 ? (
                <div className="glass-card text-center">
                  <Package className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Žádné objednávky</h3>
                  <p className="text-white/60">
                    Pro {firstName} {lastName} nebyly nalezeny žádné objednávky.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Nalezeno {orders.length} objednávek pro {firstName} {lastName}
                  </h3>

                  {orders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="glass-card"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-white">
                            Objednávka č. {order.order_number}
                          </h4>
                          <p className="text-white/60 text-sm">
                            {formatDate(order.created_at)} • {getTimeSinceOrder(order.created_at)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-white/60 text-sm">Balení</p>
                          <p className="text-white font-medium">{order.quantity}× {order.package_size}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">Celková cena</p>
                          <p className="text-yellow-400 font-bold">{order.total_price} Kč</p>
                        </div>
                      </div>

                      {order.status !== 'cancelled' && canCancelOrder(order.created_at) && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleCancelOrder(order)}
                          className="w-full px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl font-medium hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Stornovat objednávku
                        </motion.button>
                      )}

                      {order.status !== 'cancelled' && !canCancelOrder(order.created_at) && (
                        <div className="w-full px-4 py-2 bg-gray-500/20 border border-gray-500/30 text-gray-400 rounded-xl font-medium text-center flex items-center justify-center gap-2">
                          <Clock className="w-4 h-4" />
                          Storno možné pouze do 15 minut
                        </div>
                      )}

                      {order.status === 'cancelled' && (
                        <div className="w-full px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl font-medium text-center flex items-center justify-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Objednávka stornována
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8 text-sm max-w-md mx-auto"
        >
          <div className="glass-card">
            <h4 className="text-white font-medium mb-2">ℹ️ Informace o stornování</h4>
            <p className="text-white/60 text-xs leading-relaxed">
              Objednávky lze stornovat pouze do 15 minut od vytvoření.
              Po této době kontaktujte výrobce přímo.
            </p>
          </div>
        </motion.div>
      </main>
    </>
  )
}