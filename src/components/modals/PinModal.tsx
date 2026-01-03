import { useState, useEffect, useRef } from 'react'
import { X, Lock, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { useSecurityStore } from '../../store/securityStore'

interface PinModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  title?: string
  description?: string
  mode?: 'verify' | 'setup' | 'change'
}

export default function PinModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  title = 'Enter PIN',
  description = 'Enter your 4-digit security PIN to continue',
  mode = 'verify'
}: PinModalProps) {
  const [pin, setPin] = useState(['', '', '', ''])
  const [confirmPin, setConfirmPin] = useState(['', '', '', ''])
  const [oldPin, setOldPin] = useState(['', '', '', ''])
  const [step, setStep] = useState<'enter' | 'confirm' | 'old'>('enter')
  const [error, setError] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const confirmInputRefs = useRef<(HTMLInputElement | null)[]>([])
  const oldInputRefs = useRef<(HTMLInputElement | null)[]>([])
  
  const { 
    verifyPin, 
    setPin: savePin, 
    changePin,
    pinAttempts, 
    maxPinAttempts,
    isLocked,
    lockUntil 
  } = useSecurityStore()

  useEffect(() => {
    if (isOpen) {
      setPin(['', '', '', ''])
      setConfirmPin(['', '', '', ''])
      setOldPin(['', '', '', ''])
      setError('')
      setIsSuccess(false)
      
      if (mode === 'change') {
        setStep('old')
        setTimeout(() => oldInputRefs.current[0]?.focus(), 100)
      } else if (mode === 'setup') {
        setStep('enter')
        setTimeout(() => inputRefs.current[0]?.focus(), 100)
      } else {
        setStep('enter')
        setTimeout(() => inputRefs.current[0]?.focus(), 100)
      }
    }
  }, [isOpen, mode])

  const handlePinChange = (index: number, value: string, type: 'pin' | 'confirm' | 'old') => {
    if (!/^\d*$/.test(value)) return // Only allow digits
    
    const newValue = value.slice(-1) // Only take last character
    
    if (type === 'pin') {
      const newPin = [...pin]
      newPin[index] = newValue
      setPin(newPin)
      
      if (newValue && index < 3) {
        inputRefs.current[index + 1]?.focus()
      }
      
      // Auto-submit when all digits entered
      if (newValue && index === 3) {
        const fullPin = [...newPin.slice(0, 3), newValue].join('')
        handleSubmitPin(fullPin, type)
      }
    } else if (type === 'confirm') {
      const newPin = [...confirmPin]
      newPin[index] = newValue
      setConfirmPin(newPin)
      
      if (newValue && index < 3) {
        confirmInputRefs.current[index + 1]?.focus()
      }
      
      if (newValue && index === 3) {
        const fullPin = [...newPin.slice(0, 3), newValue].join('')
        handleSubmitPin(fullPin, type)
      }
    } else {
      const newPin = [...oldPin]
      newPin[index] = newValue
      setOldPin(newPin)
      
      if (newValue && index < 3) {
        oldInputRefs.current[index + 1]?.focus()
      }
      
      if (newValue && index === 3) {
        const fullPin = [...newPin.slice(0, 3), newValue].join('')
        handleSubmitPin(fullPin, type)
      }
    }
    
    setError('')
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent, type: 'pin' | 'confirm' | 'old') => {
    const refs = type === 'pin' ? inputRefs : type === 'confirm' ? confirmInputRefs : oldInputRefs
    const values = type === 'pin' ? pin : type === 'confirm' ? confirmPin : oldPin
    
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      refs.current[index - 1]?.focus()
    }
  }

  const handleSubmitPin = (fullPin: string, type: 'pin' | 'confirm' | 'old') => {
    if (fullPin.length !== 4) return

    if (mode === 'verify') {
      if (verifyPin(fullPin)) {
        setIsSuccess(true)
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 500)
      } else {
        setError(`Incorrect PIN. ${maxPinAttempts - pinAttempts - 1} attempts remaining.`)
        setPin(['', '', '', ''])
        setTimeout(() => inputRefs.current[0]?.focus(), 100)
      }
    } else if (mode === 'setup') {
      if (step === 'enter') {
        setStep('confirm')
        setTimeout(() => confirmInputRefs.current[0]?.focus(), 100)
      } else if (type === 'confirm') {
        const enteredPin = pin.join('')
        if (fullPin === enteredPin) {
          savePin(fullPin)
          setIsSuccess(true)
          setTimeout(() => {
            onSuccess()
            onClose()
          }, 500)
        } else {
          setError('PINs do not match. Please try again.')
          setConfirmPin(['', '', '', ''])
          setTimeout(() => confirmInputRefs.current[0]?.focus(), 100)
        }
      }
    } else if (mode === 'change') {
      if (step === 'old') {
        if (verifyPin(fullPin)) {
          setStep('enter')
          setTimeout(() => inputRefs.current[0]?.focus(), 100)
        } else {
          setError('Incorrect current PIN')
          setOldPin(['', '', '', ''])
          setTimeout(() => oldInputRefs.current[0]?.focus(), 100)
        }
      } else if (step === 'enter') {
        setStep('confirm')
        setTimeout(() => confirmInputRefs.current[0]?.focus(), 100)
      } else if (type === 'confirm') {
        const enteredPin = pin.join('')
        const oldPinValue = oldPin.join('')
        if (fullPin === enteredPin) {
          if (changePin(oldPinValue, fullPin)) {
            setIsSuccess(true)
            setTimeout(() => {
              onSuccess()
              onClose()
            }, 500)
          }
        } else {
          setError('PINs do not match. Please try again.')
          setConfirmPin(['', '', '', ''])
          setTimeout(() => confirmInputRefs.current[0]?.focus(), 100)
        }
      }
    }
  }

  const getRemainingLockTime = () => {
    if (!lockUntil) return ''
    const remaining = Math.max(0, lockUntil - Date.now())
    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  const currentTitle = mode === 'setup' 
    ? (step === 'confirm' ? 'Confirm PIN' : 'Set Up PIN')
    : mode === 'change'
    ? (step === 'old' ? 'Enter Current PIN' : step === 'confirm' ? 'Confirm New PIN' : 'Enter New PIN')
    : title

  const currentDescription = mode === 'setup'
    ? (step === 'confirm' ? 'Re-enter your PIN to confirm' : 'Create a 4-digit security PIN')
    : mode === 'change'
    ? (step === 'old' ? 'Enter your current PIN' : step === 'confirm' ? 'Re-enter your new PIN to confirm' : 'Enter your new 4-digit PIN')
    : description

  const currentRefs = step === 'old' ? oldInputRefs : step === 'confirm' ? confirmInputRefs : inputRefs
  const currentValues = step === 'old' ? oldPin : step === 'confirm' ? confirmPin : pin
  const currentType = step === 'old' ? 'old' : step === 'confirm' ? 'confirm' : 'pin'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-violet-600 to-purple-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              {isSuccess ? (
                <CheckCircle size={24} />
              ) : isLocked ? (
                <AlertTriangle size={24} />
              ) : (
                <Lock size={24} />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{currentTitle}</h2>
              <p className="text-sm text-white/80">{currentDescription}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLocked ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-danger-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Locked</h3>
              <p className="text-gray-600 mb-4">
                Too many failed attempts. Please try again in:
              </p>
              <div className="text-3xl font-bold text-danger-600 mb-4">
                {getRemainingLockTime()}
              </div>
            </div>
          ) : isSuccess ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-success-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {mode === 'setup' ? 'PIN Set Successfully!' : mode === 'change' ? 'PIN Changed!' : 'Verified!'}
              </h3>
            </div>
          ) : (
            <>
              {/* PIN Input */}
              <div className="flex justify-center gap-3 mb-6">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    ref={(el) => (currentRefs.current[index] = el)}
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={1}
                    value={currentValues[index]}
                    onChange={(e) => handlePinChange(index, e.target.value, currentType as 'pin' | 'confirm' | 'old')}
                    onKeyDown={(e) => handleKeyDown(index, e, currentType as 'pin' | 'confirm' | 'old')}
                    className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all"
                  />
                ))}
              </div>

              {/* Show/Hide PIN */}
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="flex items-center gap-2 mx-auto text-sm text-gray-500 hover:text-gray-700 mb-4"
              >
                {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                {showPin ? 'Hide PIN' : 'Show PIN'}
              </button>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-danger-50 text-danger-700 rounded-lg text-sm mb-4">
                  <AlertTriangle size={16} />
                  {error}
                </div>
              )}

              {/* Attempts indicator */}
              {mode === 'verify' && pinAttempts > 0 && (
                <div className="text-center text-sm text-gray-500">
                  {maxPinAttempts - pinAttempts} attempts remaining
                </div>
              )}

              {/* Step indicator for setup/change */}
              {(mode === 'setup' || mode === 'change') && (
                <div className="flex justify-center gap-2 mt-4">
                  {mode === 'change' && (
                    <div className={`w-2 h-2 rounded-full ${step === 'old' ? 'bg-violet-600' : 'bg-gray-300'}`} />
                  )}
                  <div className={`w-2 h-2 rounded-full ${step === 'enter' ? 'bg-violet-600' : 'bg-gray-300'}`} />
                  <div className={`w-2 h-2 rounded-full ${step === 'confirm' ? 'bg-violet-600' : 'bg-gray-300'}`} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
