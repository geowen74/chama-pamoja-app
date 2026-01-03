import { useState, useRef, useEffect } from 'react'
import { X, Lock, Shield, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { useSecurityStore } from '../../store/securityStore'

interface TransactionPinModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  title?: string
  description?: string
  amount?: number
}

export default function TransactionPinModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'Transaction Authorization',
  description = 'Enter your Transaction PIN to authorize this operation',
  amount,
}: TransactionPinModalProps) {
  const [pin, setPin] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  
  const {
    verifyTransactionPin,
    isTransactionPinSet,
    isTransactionLocked,
    transactionLockUntil,
    transactionPinAttempts,
  } = useSecurityStore()

  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      inputRefs.current[0]?.focus()
      setPin(['', '', '', '', '', ''])
      setError('')
    }
  }, [isOpen])

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    
    const newPin = [...pin]
    newPin[index] = value.slice(-1)
    setPin(newPin)
    setError('')
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
    
    // Auto-submit when all digits entered
    if (newPin.every(digit => digit !== '') && newPin.join('').length === 6) {
      handleVerify(newPin.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async (pinCode?: string) => {
    const pinToVerify = pinCode || pin.join('')
    
    if (pinToVerify.length !== 6) {
      setError('Please enter all 6 digits')
      return
    }

    setIsVerifying(true)
    
    // Simulate verification delay for security
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (verifyTransactionPin(pinToVerify)) {
      onSuccess()
      onClose()
    } else {
      setError('Incorrect PIN. Please try again.')
      setPin(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    }
    
    setIsVerifying(false)
  }

  const getRemainingLockTime = () => {
    if (!transactionLockUntil) return ''
    const remaining = Math.max(0, transactionLockUntil - Date.now())
    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card p-6 w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{title}</h2>
              <p className="text-sm text-gray-400">Bank-Level Security</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Amount Display */}
        {amount && (
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-400 mb-1">Transaction Amount</p>
            <p className="text-2xl font-bold text-white">
              KES {amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}
            </p>
          </div>
        )}

        {/* Transaction PIN Not Set Warning */}
        {!isTransactionPinSet ? (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-500 font-medium">Transaction PIN Not Set</p>
                <p className="text-sm text-gray-400 mt-1">
                  Please set up a Transaction PIN in Security Settings to authorize financial operations.
                </p>
              </div>
            </div>
          </div>
        ) : isTransactionLocked ? (
          /* Account Locked Warning */
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-500 font-medium">Transaction PIN Locked</p>
                <p className="text-sm text-gray-400 mt-1">
                  Too many failed attempts. Please wait {getRemainingLockTime()} before trying again.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Description */}
            <p className="text-gray-400 mb-6 text-center">{description}</p>

            {/* PIN Input */}
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type={showPin ? 'text' : 'password'}
                    value={digit}
                    onChange={e => handlePinChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all"
                    maxLength={1}
                    disabled={isVerifying}
                    inputMode="numeric"
                    autoComplete="off"
                  />
                ))}
              </div>

              {/* Show/Hide PIN Toggle */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showPin ? 'Hide PIN' : 'Show PIN'}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-6">
                <p className="text-red-400 text-sm text-center">{error}</p>
                {transactionPinAttempts > 0 && (
                  <p className="text-gray-500 text-xs text-center mt-1">
                    {3 - transactionPinAttempts} attempts remaining
                  </p>
                )}
              </div>
            )}

            {/* Verify Button */}
            <button
              onClick={() => handleVerify()}
              disabled={isVerifying || pin.some(d => d === '')}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isVerifying ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Authorize Transaction
                </>
              )}
            </button>
          </>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <Lock className="w-3 h-3" />
            <span>Protected by bank-level encryption</span>
          </div>
        </div>
      </div>
    </div>
  )
}
