'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Minus, Plus, ShoppingBag, Clock, Package, X, Check } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

// Package options - 1kg and 2kg
const PACKAGES = {
  small: {
    id: 'small',
    weight: 1,
    price: 90,
    bulkPrice: 88, // Sleva při 2+ kusech
    label: '1 kg',
    description: 'Ideální porce pro 2-3 osoby',
    emoji: '📦'
  },
  large: {
    id: 'large',
    weight: 2,
    price: 175,
    bulkPrice: 175, // Žádná sleva pro 2kg
    label: '2 kg',
    description: 'Rodinné balení pro 4-6 osob',
    emoji: '📦📦'
  }
}

export default function HomePage() {
  const [selectedPackage, setSelectedPackage] = useState<'small' | 'large'>('small')
  const [quantity, setQuantity] = useState(1)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isOrdering, setIsOrdering] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  const currentPackage = PACKAGES[selectedPackage]
  const totalWeight = currentPackage.weight * quantity

  // Bulk pricing logic
  const unitPrice = quantity >= 2 ? currentPackage.bulkPrice : currentPackage.price
  const totalPrice = unitPrice * quantity
  const isBulkDiscount = quantity >= 2 && currentPackage.bulkPrice < currentPackage.price

  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(20, quantity + delta))
    setQuantity(newQuantity)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName || !lastName) {
      toast.error('Zadejte prosím jméno a příjmení')
      return
    }

    // Show confirmation modal instead of directly ordering
    setShowConfirmModal(true)
  }

  const confirmOrder = async () => {
    setShowConfirmModal(false)
    setIsOrdering(true)

    try {
      const orderData = {
        customerName: firstName,
        customerSurname: lastName,
        packageSize: currentPackage.weight === 1 ? '1kg' : '2kg',
        quantity: quantity,
        unitPrice: unitPrice,
        totalPrice: totalPrice
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        throw new Error('Chyba při vytváření objednávky')
      }

      const { order } = await response.json()

      toast.success(
        <div>
          <strong>Objednávka přijata! 🎉</strong>
          <br />
          Číslo: {order.order_number}
          <br />
          {firstName} {lastName}: {quantity}× {currentPackage.label} ({totalWeight} kg) za {totalPrice} Kč
        </div>,
        { duration: 5000 }
      )

      // Reset form
      setQuantity(1)
      setFirstName('')
      setLastName('')
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Došlo k chybě při vytváření objednávky. Zkuste to prosím znovu.')
    } finally {
      setIsOrdering(false)
    }
  }

  return (
    <>
      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
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
              onClick={() => setShowConfirmModal(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm xs:max-w-md mx-auto"
            >
              <div className="glass-card">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-serif font-bold text-white">
                    Potvrdit objednávku
                  </h2>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowConfirmModal(false)}
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
                      <span className="text-white font-semibold">{firstName} {lastName}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/80">Objednávka:</span>
                      <span className="text-white">
                        {quantity}× {currentPackage.label}
                        {isBulkDiscount && (
                          <span className="text-green-400 text-sm ml-2">(sleva)</span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/80">Celková váha:</span>
                      <span className="text-white">{totalWeight} kg</span>
                    </div>
                    {isBulkDiscount && (
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-white/60 text-sm">Jednotková cena:</span>
                        <span className="text-green-400 text-sm">{unitPrice} Kč/ks</span>
                      </div>
                    )}
                    <div className="h-px bg-white/10 my-3"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/80 font-medium">Celková cena:</span>
                      <span className="text-yellow-400 text-xl font-bold">{totalPrice} Kč</span>
                    </div>
                    {isBulkDiscount && (
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-green-400 text-xs">Ušetříte:</span>
                        <span className="text-green-400 text-xs">
                          {((currentPackage.price - unitPrice) * quantity)} Kč
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-amber-600/10 border border-amber-600/20">
                    <div className="flex items-center gap-2 text-amber-300 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Zrušení možné do 15 minut po objednání</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowConfirmModal(false)}
                    className="px-6 py-3 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-300 font-medium hover:bg-red-500/30 transition-colors"
                  >
                    Zrušit
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmOrder}
                    className="btn-premium flex items-center justify-center gap-2"
                  >
                    <Check className="w-5 h-5" />
                    <span>Potvrdit</span>
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

      <main className="min-h-screen px-3 sm:px-4 py-4 sm:py-8 safe-top safe-bottom">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl xs:text-4xl md:text-6xl font-serif font-bold mb-3 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 bg-clip-text text-transparent">
            Tlačenka Royale
          </h1>
          <p className="text-white/60 text-base xs:text-lg">Premium domácí výroba • Tradiční recept</p>
        </motion.div>

        {/* Order Form Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="max-w-sm xs:max-w-md mx-auto w-full"
        >
          <form onSubmit={handleSubmit} className="glass-card">
            {/* Package Selection */}
            <div className="mb-8">
              <label className="text-white/80 text-sm font-medium mb-4 block">
                Vyberte velikost balení
              </label>

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                {Object.entries(PACKAGES).map(([key, pkg]) => (
                  <motion.button
                    key={key}
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedPackage(key as 'small' | 'large')}
                    className={`p-4 rounded-2xl border-2 transition-all ${
                      selectedPackage === key
                        ? 'bg-amber-600/20 border-amber-600 shadow-lg shadow-amber-600/20'
                        : 'bg-white/10 border-white/20 hover:border-white/40'
                    }`}
                  >
                    <div className="text-2xl mb-1">{pkg.emoji}</div>
                    <div className="font-semibold text-white">{pkg.label}</div>
                    <div className="text-yellow-400 text-lg font-bold">{pkg.price} Kč</div>
                    {pkg.bulkPrice < pkg.price && (
                      <div className="text-green-400 text-xs">2+ ks: {pkg.bulkPrice} Kč/ks</div>
                    )}
                    <div className="text-white/50 text-xs mt-1">{pkg.description}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="text-white/80 text-sm font-medium mb-4 block">
                Počet balení
              </label>

              <div className="flex items-center justify-between bg-white/10 border border-white/20 rounded-2xl p-2">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleQuantityChange(-1)}
                  className="stepper-btn"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-6 h-6 mx-auto" />
                </motion.button>

                <motion.div
                  key={quantity}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-4xl font-bold tabular-nums text-white"
                >
                  {quantity}
                </motion.div>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleQuantityChange(1)}
                  className="stepper-btn"
                  disabled={quantity >= 20}
                >
                  <Plus className="w-6 h-6 mx-auto" />
                </motion.button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-2xl bg-white/10 border border-white/20"
              >
                <Package className="w-5 h-5 text-white/60 mb-1" />
                <div className="text-white/60 text-sm">Celkem</div>
                <div className="text-xl font-bold text-white">{totalWeight} kg</div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-2xl bg-gradient-to-br from-amber-600/20 to-amber-600/10 border border-amber-600/30"
              >
                <ShoppingBag className="w-5 h-5 text-yellow-400 mb-1" />
                <div className="text-yellow-400 text-sm">Cena</div>
                <div className="text-xl font-bold text-yellow-400">{totalPrice} Kč</div>
                {isBulkDiscount && (
                  <div className="text-green-400 text-xs mt-1">
                    💰 Sleva: {unitPrice} Kč/ks
                  </div>
                )}
              </motion.div>
            </div>

            {/* Name Inputs */}
            <div className="mb-4 grid grid-cols-1 xs:grid-cols-2 gap-3">
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

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isOrdering}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-premium text-lg h-14 flex items-center justify-center gap-2"
            >
              {isOrdering ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-onyx/30 border-t-onyx rounded-full animate-spin" />
                  <span>Odesílám...</span>
                </div>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  <span>Objednat za {totalPrice} Kč</span>
                </>
              )}
            </motion.button>

            {/* Info */}
            <div className="mt-4 flex items-center justify-center gap-2 text-white/50 text-sm">
              <Clock className="w-4 h-4" />
              <span>Zrušení možné do 15 minut po objednání</span>
            </div>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8 text-sm"
        >
          <p className="text-red-400 font-medium">⚠️ Vysoce návykové s cibulí a chlebem</p>
        </motion.div>
      </main>
    </>
  )
}