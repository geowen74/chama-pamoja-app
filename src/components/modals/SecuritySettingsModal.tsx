import { useState } from 'react'
import { 
  X, Shield, Lock, Smartphone, Bell, 
  AlertTriangle, ChevronRight, Fingerprint, Key,
  Monitor, Trash2, LogOut
} from 'lucide-react'
import { useSecurityStore } from '../../store/securityStore'

interface SecuritySettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

type SettingsTab = 'overview' | 'login-pin' | 'transaction-pin' | '2fa' | 'sessions' | 'devices' | 'alerts'

export default function SecuritySettingsModal({ isOpen, onClose }: SecuritySettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('overview')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [currentPin, setCurrentPin] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const {
    isPinSet,
    isTransactionPinSet,
    isTwoFactorEnabled,
    activeSessions,
    trustedDevices,
    securityAlerts,
    setPin,
    setTransactionPin,
    changePin,
    changeTransactionPin,
    removePin,
    removeTransactionPin,
    enableTwoFactor,
    disableTwoFactor,
    terminateSession,
    terminateAllOtherSessions,
    removeTrustedDevice,
    addTrustedDevice,
    markAlertAsRead,
    clearAllAlerts,
    getUnreadAlertsCount,
  } = useSecurityStore()

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const handleSetLoginPin = () => {
    clearMessages()
    
    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      setError('PIN must be exactly 6 digits')
      return
    }
    
    if (newPin !== confirmPin) {
      setError('PINs do not match')
      return
    }
    
    if (isPinSet && currentPin) {
      const changed = changePin(currentPin, newPin)
      if (!changed) {
        setError('Current PIN is incorrect')
        return
      }
    } else {
      setPin(newPin)
    }
    
    setSuccess('Login PIN updated successfully!')
    setNewPin('')
    setConfirmPin('')
    setCurrentPin('')
    // setShowSetPinForm(false) // removed unused state
  }

  const handleSetTransactionPin = () => {
    clearMessages()
    
    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      setError('PIN must be exactly 6 digits')
      return
    }
    
    if (newPin !== confirmPin) {
      setError('PINs do not match')
      return
    }
    
    if (isTransactionPinSet && currentPin) {
      const changed = changeTransactionPin(currentPin, newPin)
      if (!changed) {
        setError('Current PIN is incorrect')
        return
      }
    } else {
      setTransactionPin(newPin)
    }
    
    setSuccess('Transaction PIN updated successfully!')
    setNewPin('')
    setConfirmPin('')
    setCurrentPin('')
  }

  const handleToggle2FA = () => {
    if (isTwoFactorEnabled) {
      const pin = prompt('Enter your Login PIN to disable 2FA:')
      if (pin) {
        disableTwoFactor(pin)
      }
    } else {
      const secret = enableTwoFactor()
      alert(`Your 2FA Secret Key:\n\n${secret}\n\nSave this key securely! You'll need it for your authenticator app.`)
    }
  }

  const renderSecurityScore = () => {
    let score = 0
    if (isPinSet) score += 25
    if (isTransactionPinSet) score += 25
    if (isTwoFactorEnabled) score += 30
    if (trustedDevices.length > 0) score += 20
    
    const getScoreColor = () => {
      if (score >= 80) return 'text-green-500'
      if (score >= 50) return 'text-yellow-500'
      return 'text-red-500'
    }
    
    const getScoreLabel = () => {
      if (score >= 80) return 'Excellent'
      if (score >= 50) return 'Good'
      if (score >= 25) return 'Fair'
      return 'Weak'
    }
    
    return (
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Security Score</h3>
          <span className={`text-3xl font-bold ${getScoreColor()}`}>{score}%</span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-3 mb-3">
          <div 
            className={`h-3 rounded-full transition-all ${score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <p className={`text-sm ${getScoreColor()}`}>Security Level: {getScoreLabel()}</p>
      </div>
    )
  }

  const renderOverview = () => (
    <div className="space-y-4">
      {renderSecurityScore()}
      
      <div className="space-y-3">
        <SecurityOption
          icon={<Lock className="w-5 h-5" />}
          title="Login PIN"
          description={isPinSet ? 'Enabled - Protects app access' : 'Not set - Click to enable'}
          status={isPinSet ? 'enabled' : 'disabled'}
          onClick={() => setActiveTab('login-pin')}
        />
        
        <SecurityOption
          icon={<Key className="w-5 h-5" />}
          title="Transaction PIN"
          description={isTransactionPinSet ? 'Enabled - Protects financial operations' : 'Not set - Click to enable'}
          status={isTransactionPinSet ? 'enabled' : 'disabled'}
          onClick={() => setActiveTab('transaction-pin')}
        />
        
        <SecurityOption
          icon={<Smartphone className="w-5 h-5" />}
          title="Two-Factor Authentication"
          description={isTwoFactorEnabled ? 'Enabled - Extra layer of security' : 'Disabled - Click to enable'}
          status={isTwoFactorEnabled ? 'enabled' : 'disabled'}
          onClick={() => setActiveTab('2fa')}
        />
        
        <SecurityOption
          icon={<Monitor className="w-5 h-5" />}
          title="Active Sessions"
          description={`${activeSessions.length} active session(s)`}
          onClick={() => setActiveTab('sessions')}
        />
        
        <SecurityOption
          icon={<Fingerprint className="w-5 h-5" />}
          title="Trusted Devices"
          description={`${trustedDevices.length} trusted device(s)`}
          onClick={() => setActiveTab('devices')}
        />
        
        <SecurityOption
          icon={<Bell className="w-5 h-5" />}
          title="Security Alerts"
          description={`${getUnreadAlertsCount()} unread alert(s)`}
          badge={getUnreadAlertsCount() > 0 ? getUnreadAlertsCount() : undefined}
          onClick={() => setActiveTab('alerts')}
        />
      </div>
    </div>
  )

  const renderPinForm = (type: 'login' | 'transaction') => {
    const isLogin = type === 'login'
    const isSet = isLogin ? isPinSet : isTransactionPinSet
    const handleSubmit = isLogin ? handleSetLoginPin : handleSetTransactionPin
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setActiveTab('overview')} className="text-gray-400 hover:text-white">
            ← Back
          </button>
          <h3 className="text-lg font-semibold text-white">
            {isLogin ? 'Login PIN' : 'Transaction PIN'}
          </h3>
        </div>
        
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-4">
          <p className="text-sm text-gray-300">
            {isLogin 
              ? 'Your Login PIN protects access to the app. You\'ll need to enter it each time you open the app.'
              : 'Your Transaction PIN is required for all financial operations like contributions, loans, and expenses.'}
          </p>
        </div>
        
        {isSet && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current PIN
            </label>
            <input
              type="password"
              value={currentPin}
              onChange={e => { setCurrentPin(e.target.value); clearMessages() }}
              placeholder="Enter current PIN"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              maxLength={6}
              inputMode="numeric"
            />
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            New PIN (6 digits)
          </label>
          <input
            type="password"
            value={newPin}
            onChange={e => { setNewPin(e.target.value); clearMessages() }}
            placeholder="Enter new 6-digit PIN"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            maxLength={6}
            inputMode="numeric"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Confirm PIN
          </label>
          <input
            type="password"
            value={confirmPin}
            onChange={e => { setConfirmPin(e.target.value); clearMessages() }}
            placeholder="Confirm your PIN"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            maxLength={6}
            inputMode="numeric"
          />
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 mb-4">
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}
        
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
        >
          {isSet ? 'Update PIN' : 'Set PIN'}
        </button>
        
        {isSet && (
          <button
            onClick={() => {
              if (confirm('Are you sure you want to remove this PIN?')) {
                isLogin ? removePin() : removeTransactionPin()
                setSuccess('PIN removed successfully')
              }
            }}
            className="w-full py-3 border border-red-500/50 text-red-400 rounded-xl hover:bg-red-500/10 transition-all"
          >
            Remove PIN
          </button>
        )}
      </div>
    )
  }

  const renderSessions = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setActiveTab('overview')} className="text-gray-400 hover:text-white">
          ← Back
        </button>
        <h3 className="text-lg font-semibold text-white">Active Sessions</h3>
      </div>
      
      {activeSessions.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Monitor className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No active sessions</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div key={session.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Monitor className="w-5 h-5 text-purple-400 mt-1" />
                    <div>
                      <p className="text-white font-medium flex items-center gap-2">
                        {session.deviceName}
                        {session.isCurrent && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                            Current
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-400">{session.browser}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Last active: {new Date(session.lastActivity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <button
                      onClick={() => terminateSession(session.id)}
                      className="text-red-400 hover:text-red-300 p-2"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {activeSessions.length > 1 && (
            <button
              onClick={() => {
                if (confirm('This will log out all other devices. Continue?')) {
                  terminateAllOtherSessions()
                }
              }}
              className="w-full py-3 border border-red-500/50 text-red-400 rounded-xl hover:bg-red-500/10 transition-all"
            >
              Log Out All Other Sessions
            </button>
          )}
        </>
      )}
    </div>
  )

  const renderDevices = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setActiveTab('overview')} className="text-gray-400 hover:text-white">
          ← Back
        </button>
        <h3 className="text-lg font-semibold text-white">Trusted Devices</h3>
      </div>
      
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-4">
        <p className="text-sm text-gray-300">
          Trusted devices won't trigger security alerts when logging in. Only add devices you personally use.
        </p>
      </div>
      
      {trustedDevices.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Fingerprint className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No trusted devices</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trustedDevices.map((device) => (
            <div key={device.id} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-purple-400 mt-1" />
                  <div>
                    <p className="text-white font-medium">{device.name}</p>
                    <p className="text-sm text-gray-400">{device.browser}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Added: {new Date(device.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Remove this trusted device?')) {
                      removeTrustedDevice(device.id)
                    }
                  }}
                  className="text-red-400 hover:text-red-300 p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <button
        onClick={() => {
          const name = prompt('Enter a name for this device:')
          if (name) {
            addTrustedDevice({ name, browser: navigator.userAgent.split(' ').pop() || 'Unknown' })
          }
        }}
        className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
      >
        Trust This Device
      </button>
    </div>
  )

  const renderAlerts = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveTab('overview')} className="text-gray-400 hover:text-white">
            ← Back
          </button>
          <h3 className="text-lg font-semibold text-white">Security Alerts</h3>
        </div>
        {securityAlerts.length > 0 && (
          <button
            onClick={() => clearAllAlerts()}
            className="text-sm text-gray-400 hover:text-white"
          >
            Clear All
          </button>
        )}
      </div>
      
      {securityAlerts.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No security alerts</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {securityAlerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`bg-white/5 border rounded-xl p-4 ${
                !alert.isRead ? 'border-purple-500/50' : 'border-white/10'
              }`}
              onClick={() => markAlertAsRead(alert.id)}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                  alert.severity === 'danger' ? 'text-red-500' :
                  alert.severity === 'warning' ? 'text-yellow-500' :
                  'text-blue-500'
                }`} />
                <div className="flex-1">
                  <p className="text-white text-sm">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
                {!alert.isRead && (
                  <span className="w-2 h-2 bg-purple-500 rounded-full" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const render2FA = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setActiveTab('overview')} className="text-gray-400 hover:text-white">
          ← Back
        </button>
        <h3 className="text-lg font-semibold text-white">Two-Factor Authentication</h3>
      </div>
      
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-4">
        <p className="text-sm text-gray-300">
          Two-factor authentication adds an extra layer of security by requiring a one-time code from your authenticator app.
        </p>
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
          isTwoFactorEnabled ? 'bg-green-500/20' : 'bg-gray-500/20'
        }`}>
          <Smartphone className={`w-8 h-8 ${isTwoFactorEnabled ? 'text-green-500' : 'text-gray-500'}`} />
        </div>
        <h4 className="text-white font-semibold mb-2">
          {isTwoFactorEnabled ? '2FA is Enabled' : '2FA is Disabled'}
        </h4>
        <p className="text-sm text-gray-400 mb-4">
          {isTwoFactorEnabled 
            ? 'Your account has an extra layer of protection.'
            : 'Enable 2FA to protect your account with an authenticator app.'}
        </p>
        <button
          onClick={handleToggle2FA}
          className={`px-6 py-2 rounded-xl font-medium transition-all ${
            isTwoFactorEnabled 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
          }`}
        >
          {isTwoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
        </button>
      </div>
    </div>
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Security Center</h2>
              <p className="text-sm text-gray-400">Bank-Level Protection</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'login-pin' && renderPinForm('login')}
        {activeTab === 'transaction-pin' && renderPinForm('transaction')}
        {activeTab === '2fa' && render2FA()}
        {activeTab === 'sessions' && renderSessions()}
        {activeTab === 'devices' && renderDevices()}
        {activeTab === 'alerts' && renderAlerts()}
      </div>
    </div>
  )
}

// Security Option Component
function SecurityOption({ 
  icon, 
  title, 
  description, 
  status, 
  badge,
  onClick 
}: {
  icon: React.ReactNode
  title: string
  description: string
  status?: 'enabled' | 'disabled'
  badge?: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:bg-white/10 transition-all text-left"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
        status === 'enabled' ? 'bg-green-500/20 text-green-500' :
        status === 'disabled' ? 'bg-gray-500/20 text-gray-500' :
        'bg-purple-500/20 text-purple-400'
      }`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-white font-medium flex items-center gap-2">
          {title}
          {badge && (
            <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </p>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      {status && (
        <div className={`text-xs px-2 py-1 rounded-full ${
          status === 'enabled' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
        }`}>
          {status === 'enabled' ? 'ON' : 'OFF'}
        </div>
      )}
      <ChevronRight className="w-5 h-5 text-gray-500" />
    </button>
  )
}
