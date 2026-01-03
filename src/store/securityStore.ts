import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ========== BANK-LEVEL SECURITY CONSTANTS ==========
const DEFAULT_SESSION_TIMEOUT = 15 * 60 * 1000 // 15 minutes
const LOCK_DURATION = 30 * 60 * 1000 // 30 minutes lockout
const TRANSACTION_LOCK_DURATION = 60 * 60 * 1000 // 1 hour for transaction PIN
const OTP_EXPIRY = 5 * 60 * 1000 // 5 minutes OTP validity
const MAX_LOGIN_ATTEMPTS = 3
const MAX_TRANSACTION_ATTEMPTS = 3
const MAX_SESSIONS = 3 // Max concurrent sessions
const SUSPICIOUS_ACTIVITY_THRESHOLD = 10 // Actions per minute to flag

// ========== INTERFACES ==========
export interface AuditEntry {
  id: string
  timestamp: string
  userId: string
  userName: string
  action: string
  details: string
  category: 'auth' | 'transaction' | 'settings' | 'access' | 'security' | 'financial' | 'member' | 'contribution' | 'loan' | 'meeting' | 'expense' | 'project' | 'fine'
  ipAddress?: string
  deviceInfo?: string
  location?: string
  riskLevel?: 'low' | 'medium' | 'high' | 'critical'
}

export interface ActiveSession {
  id: string
  deviceId: string
  deviceName: string
  browser: string
  ipAddress: string
  location: string
  createdAt: string
  lastActivity: string
  isCurrent: boolean
}

export interface SecurityAlert {
  id: string
  type: 'login_attempt' | 'suspicious_activity' | 'new_device' | 'location_change' | 'large_transaction' | 'permission_change'
  message: string
  timestamp: string
  isRead: boolean
  severity: 'info' | 'warning' | 'danger'
}

export interface OTPCode {
  code: string
  purpose: 'login' | 'transaction' | 'password_reset' | 'settings_change'
  expiresAt: number
  attempts: number
}

export interface TrustedDevice {
  id: string
  name: string
  browser: string
  addedAt: string
  lastUsed: string
}

export interface SecuritySettings {
  twoFactorEnabled: boolean
  transactionPinEnabled: boolean
  biometricEnabled: boolean
  loginNotifications: boolean
  transactionNotifications: boolean
  autoLockEnabled: boolean
  autoLockTimeout: number
  trustedDevicesOnly: boolean
  largeTransactionThreshold: number
  dailyTransactionLimit: number
  requirePinForViewing: boolean
}

interface SecurityState {
  // Login PIN
  pin: string | null
  isPinSet: boolean
  isPinVerified: boolean
  pinAttempts: number
  maxPinAttempts: number
  isLocked: boolean
  lockUntil: number | null
  
  // Transaction PIN (separate from login)
  transactionPin: string | null
  isTransactionPinSet: boolean
  transactionPinAttempts: number
  isTransactionLocked: boolean
  transactionLockUntil: number | null
  
  // 2FA
  twoFactorSecret: string | null
  isTwoFactorEnabled: boolean
  currentOTP: OTPCode | null
  
  // Session Management
  sessionId: string | null
  sessionTimeout: number
  lastActivity: number
  activeSessions: ActiveSession[]
  
  // Device & Access
  trustedDevices: TrustedDevice[]
  currentDeviceId: string | null
  
  // Security Alerts
  securityAlerts: SecurityAlert[]
  
  // Audit & Logging
  auditLog: AuditEntry[]
  
  // Settings
  securitySettings: SecuritySettings
  
  // Activity Monitoring
  recentActivityTimestamps: number[]
  
  // Actions - Login PIN
  setPin: (pin: string) => void
  verifyPin: (inputPin: string) => boolean
  resetPinVerification: () => void
  changePin: (oldPin: string, newPin: string) => boolean
  removePin: () => void
  
  // Actions - Transaction PIN
  setTransactionPin: (pin: string) => void
  verifyTransactionPin: (inputPin: string) => boolean
  changeTransactionPin: (oldPin: string, newPin: string) => boolean
  removeTransactionPin: () => void
  
  // Actions - 2FA
  enableTwoFactor: () => string
  disableTwoFactor: (pin: string) => boolean
  generateOTP: (purpose: OTPCode['purpose']) => string
  verifyOTP: (code: string) => boolean
  
  // Actions - Session Management
  createSession: (deviceInfo: Partial<ActiveSession>) => void
  terminateSession: (sessionId: string) => void
  terminateAllOtherSessions: () => void
  updateLastActivity: () => void
  isSessionValid: () => boolean
  setSessionTimeout: (minutes: number) => void
  
  // Actions - Device Management
  addTrustedDevice: (device: Omit<TrustedDevice, 'id' | 'addedAt' | 'lastUsed'>) => void
  removeTrustedDevice: (deviceId: string) => void
  isDeviceTrusted: (deviceId: string) => boolean
  
  // Actions - Security Alerts
  addSecurityAlert: (alert: Omit<SecurityAlert, 'id' | 'timestamp' | 'isRead'>) => void
  markAlertAsRead: (alertId: string) => void
  clearAllAlerts: () => void
  getUnreadAlertsCount: () => number
  
  // Actions - Audit
  addAuditEntry: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void
  clearAuditLog: () => void
  getAuditLogByCategory: (category: AuditEntry['category']) => AuditEntry[]
  getAuditLogByUser: (userId: string) => AuditEntry[]
  
  // Actions - Settings
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => void
  
  // Actions - Account
  unlockAccount: () => void
  unlockTransactionPin: () => void
  
  // Utility Functions
  validatePassword: (password: string) => { isValid: boolean; errors: string[] }
  checkSuspiciousActivity: () => boolean
  encryptSensitiveData: (data: string) => string
  decryptSensitiveData: (encryptedData: string) => string
  generateSecureToken: () => string
  hashData: (data: string) => string
  
  // Transaction verification
  requiresTransactionPin: (amount: number) => boolean
  logFinancialTransaction: (type: string, amount: number, details: string, userId: string, userName: string) => void
}

export const useSecurityStore = create<SecurityState>()(
  persist(
    (set, get) => ({
      // ========== INITIAL STATE ==========
      // Login PIN
      pin: null,
      isPinSet: false,
      isPinVerified: false,
      pinAttempts: 0,
      maxPinAttempts: MAX_LOGIN_ATTEMPTS,
      isLocked: false,
      lockUntil: null,
      
      // Transaction PIN
      transactionPin: null,
      isTransactionPinSet: false,
      transactionPinAttempts: 0,
      isTransactionLocked: false,
      transactionLockUntil: null,
      
      // 2FA
      twoFactorSecret: null,
      isTwoFactorEnabled: false,
      currentOTP: null,
      
      // Session
      sessionId: null,
      sessionTimeout: DEFAULT_SESSION_TIMEOUT,
      lastActivity: Date.now(),
      activeSessions: [],
      
      // Devices
      trustedDevices: [],
      currentDeviceId: null,
      
      // Alerts
      securityAlerts: [],
      
      // Audit
      auditLog: [],
      
      // Settings
      securitySettings: {
        twoFactorEnabled: false,
        transactionPinEnabled: true,
        biometricEnabled: false,
        loginNotifications: true,
        transactionNotifications: true,
        autoLockEnabled: true,
        autoLockTimeout: 15,
        trustedDevicesOnly: false,
        largeTransactionThreshold: 50000,
        dailyTransactionLimit: 1000000,
        requirePinForViewing: false,
      },
      
      // Activity Monitoring
      recentActivityTimestamps: [],

      // ========== LOGIN PIN ACTIONS ==========
      setPin: (pin: string) => {
        set({
          pin: hashPin(pin),
          isPinSet: true,
          isPinVerified: true,
          pinAttempts: 0,
        })
        
        get().addAuditEntry({
          userId: 'system',
          userName: 'System',
          action: 'LOGIN_PIN_SET',
          details: 'Security login PIN was configured',
          category: 'security',
          riskLevel: 'low',
        })
      },

      verifyPin: (inputPin: string) => {
        const state = get()
        
        if (state.isLocked && state.lockUntil) {
          if (Date.now() < state.lockUntil) {
            return false
          } else {
            set({ isLocked: false, lockUntil: null, pinAttempts: 0 })
          }
        }
        
        const hashedInput = hashPin(inputPin)
        
        if (hashedInput === state.pin) {
          set({ 
            isPinVerified: true, 
            pinAttempts: 0,
            lastActivity: Date.now(),
          })
          
          get().addAuditEntry({
            userId: 'system',
            userName: 'System',
            action: 'LOGIN_PIN_VERIFIED',
            details: 'Login PIN verification successful',
            category: 'auth',
            riskLevel: 'low',
          })
          
          return true
        } else {
          const newAttempts = state.pinAttempts + 1
          
          if (newAttempts >= state.maxPinAttempts) {
            set({
              pinAttempts: newAttempts,
              isLocked: true,
              lockUntil: Date.now() + LOCK_DURATION,
              isPinVerified: false,
            })
            
            get().addAuditEntry({
              userId: 'system',
              userName: 'System',
              action: 'ACCOUNT_LOCKED',
              details: `Account locked after ${newAttempts} failed login PIN attempts`,
              category: 'security',
              riskLevel: 'critical',
            })
            
            get().addSecurityAlert({
              type: 'login_attempt',
              message: `Account locked after ${newAttempts} failed login attempts`,
              severity: 'danger',
            })
          } else {
            set({ pinAttempts: newAttempts })
            
            get().addAuditEntry({
              userId: 'system',
              userName: 'System',
              action: 'LOGIN_PIN_FAILED',
              details: `Failed login PIN attempt (${newAttempts}/${state.maxPinAttempts})`,
              category: 'auth',
              riskLevel: 'medium',
            })
          }
          
          return false
        }
      },

      resetPinVerification: () => {
        set({ isPinVerified: false })
      },

      changePin: (oldPin: string, newPin: string) => {
        const state = get()
        const hashedOld = hashPin(oldPin)
        
        if (hashedOld === state.pin) {
          set({
            pin: hashPin(newPin),
            isPinVerified: true,
            pinAttempts: 0,
          })
          
          get().addAuditEntry({
            userId: 'system',
            userName: 'System',
            action: 'LOGIN_PIN_CHANGED',
            details: 'Security login PIN was changed',
            category: 'security',
            riskLevel: 'medium',
          })
          
          return true
        }
        
        return false
      },

      removePin: () => {
        set({
          pin: null,
          isPinSet: false,
          isPinVerified: false,
          pinAttempts: 0,
        })
        
        get().addAuditEntry({
          userId: 'system',
          userName: 'System',
          action: 'LOGIN_PIN_REMOVED',
          details: 'Security login PIN was removed',
          category: 'security',
          riskLevel: 'high',
        })
      },

      // ========== TRANSACTION PIN ACTIONS ==========
      setTransactionPin: (pin: string) => {
        set({
          transactionPin: hashPin(pin),
          isTransactionPinSet: true,
          transactionPinAttempts: 0,
        })
        
        get().addAuditEntry({
          userId: 'system',
          userName: 'System',
          action: 'TRANSACTION_PIN_SET',
          details: 'Transaction PIN was configured for financial operations',
          category: 'security',
          riskLevel: 'low',
        })
      },

      verifyTransactionPin: (inputPin: string) => {
        const state = get()
        
        if (state.isTransactionLocked && state.transactionLockUntil) {
          if (Date.now() < state.transactionLockUntil) {
            return false
          } else {
            set({ isTransactionLocked: false, transactionLockUntil: null, transactionPinAttempts: 0 })
          }
        }
        
        const hashedInput = hashPin(inputPin)
        
        if (hashedInput === state.transactionPin) {
          set({ 
            transactionPinAttempts: 0,
            lastActivity: Date.now(),
          })
          
          get().addAuditEntry({
            userId: 'system',
            userName: 'System',
            action: 'TRANSACTION_PIN_VERIFIED',
            details: 'Transaction PIN verification successful',
            category: 'financial',
            riskLevel: 'low',
          })
          
          return true
        } else {
          const newAttempts = state.transactionPinAttempts + 1
          
          if (newAttempts >= MAX_TRANSACTION_ATTEMPTS) {
            set({
              transactionPinAttempts: newAttempts,
              isTransactionLocked: true,
              transactionLockUntil: Date.now() + TRANSACTION_LOCK_DURATION,
            })
            
            get().addAuditEntry({
              userId: 'system',
              userName: 'System',
              action: 'TRANSACTION_PIN_LOCKED',
              details: `Transaction PIN locked after ${newAttempts} failed attempts`,
              category: 'security',
              riskLevel: 'critical',
            })
            
            get().addSecurityAlert({
              type: 'suspicious_activity',
              message: `Transaction PIN locked after ${newAttempts} failed attempts. Financial operations disabled for 1 hour.`,
              severity: 'danger',
            })
          } else {
            set({ transactionPinAttempts: newAttempts })
            
            get().addAuditEntry({
              userId: 'system',
              userName: 'System',
              action: 'TRANSACTION_PIN_FAILED',
              details: `Failed transaction PIN attempt (${newAttempts}/${MAX_TRANSACTION_ATTEMPTS})`,
              category: 'financial',
              riskLevel: 'high',
            })
          }
          
          return false
        }
      },

      changeTransactionPin: (oldPin: string, newPin: string) => {
        const state = get()
        const hashedOld = hashPin(oldPin)
        
        if (hashedOld === state.transactionPin) {
          set({
            transactionPin: hashPin(newPin),
            transactionPinAttempts: 0,
          })
          
          get().addAuditEntry({
            userId: 'system',
            userName: 'System',
            action: 'TRANSACTION_PIN_CHANGED',
            details: 'Transaction PIN was changed',
            category: 'security',
            riskLevel: 'medium',
          })
          
          return true
        }
        
        return false
      },

      removeTransactionPin: () => {
        set({
          transactionPin: null,
          isTransactionPinSet: false,
          transactionPinAttempts: 0,
        })
        
        get().addAuditEntry({
          userId: 'system',
          userName: 'System',
          action: 'TRANSACTION_PIN_REMOVED',
          details: 'Transaction PIN was removed',
          category: 'security',
          riskLevel: 'high',
        })
      },

      // ========== 2FA ACTIONS ==========
      enableTwoFactor: () => {
        const secret = generateSecret()
        set({
          twoFactorSecret: secret,
          isTwoFactorEnabled: true,
        })
        
        get().updateSecuritySettings({ twoFactorEnabled: true })
        
        get().addAuditEntry({
          userId: 'system',
          userName: 'System',
          action: 'TWO_FACTOR_ENABLED',
          details: 'Two-factor authentication was enabled',
          category: 'security',
          riskLevel: 'low',
        })
        
        get().addSecurityAlert({
          type: 'permission_change',
          message: 'Two-factor authentication has been enabled for your account',
          severity: 'info',
        })
        
        return secret
      },

      disableTwoFactor: (pin: string) => {
        const state = get()
        if (state.isPinSet && !get().verifyPin(pin)) {
          return false
        }
        
        set({
          twoFactorSecret: null,
          isTwoFactorEnabled: false,
          currentOTP: null,
        })
        
        get().updateSecuritySettings({ twoFactorEnabled: false })
        
        get().addAuditEntry({
          userId: 'system',
          userName: 'System',
          action: 'TWO_FACTOR_DISABLED',
          details: 'Two-factor authentication was disabled',
          category: 'security',
          riskLevel: 'high',
        })
        
        return true
      },

      generateOTP: (purpose) => {
        const code = Math.floor(100000 + Math.random() * 900000).toString()
        set({
          currentOTP: {
            code: hashPin(code),
            purpose,
            expiresAt: Date.now() + OTP_EXPIRY,
            attempts: 0,
          },
        })
        
        get().addAuditEntry({
          userId: 'system',
          userName: 'System',
          action: 'OTP_GENERATED',
          details: `OTP generated for ${purpose}`,
          category: 'auth',
          riskLevel: 'low',
        })
        
        return code
      },

      verifyOTP: (code: string) => {
        const state = get()
        const otp = state.currentOTP
        
        if (!otp) return false
        
        if (Date.now() > otp.expiresAt) {
          set({ currentOTP: null })
          return false
        }
        
        if (otp.attempts >= 3) {
          set({ currentOTP: null })
          return false
        }
        
        if (hashPin(code) === otp.code) {
          set({ currentOTP: null })
          
          get().addAuditEntry({
            userId: 'system',
            userName: 'System',
            action: 'OTP_VERIFIED',
            details: `OTP verification successful for ${otp.purpose}`,
            category: 'auth',
            riskLevel: 'low',
          })
          
          return true
        }
        
        set({
          currentOTP: { ...otp, attempts: otp.attempts + 1 },
        })
        
        return false
      },

      // ========== SESSION MANAGEMENT ==========
      createSession: (deviceInfo) => {
        const sessionId = generateSecureToken()
        const deviceId = deviceInfo.deviceId || generateSecureToken()
        
        const newSession: ActiveSession = {
          id: sessionId,
          deviceId,
          deviceName: deviceInfo.deviceName || 'Unknown Device',
          browser: deviceInfo.browser || detectBrowser(),
          ipAddress: deviceInfo.ipAddress || 'Unknown',
          location: deviceInfo.location || 'Unknown',
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          isCurrent: true,
        }
        
        set((state) => {
          const updatedSessions = state.activeSessions.map(s => ({ ...s, isCurrent: false }))
          
          if (updatedSessions.length >= MAX_SESSIONS) {
            updatedSessions.splice(0, updatedSessions.length - MAX_SESSIONS + 1)
          }
          
          return {
            sessionId,
            currentDeviceId: deviceId,
            activeSessions: [...updatedSessions, newSession],
            lastActivity: Date.now(),
          }
        })
        
        get().addAuditEntry({
          userId: 'system',
          userName: 'System',
          action: 'SESSION_CREATED',
          details: `New session created on ${newSession.deviceName}`,
          category: 'auth',
          deviceInfo: newSession.browser,
          riskLevel: 'low',
        })
        
        const state = get()
        if (!state.trustedDevices.some(d => d.id === deviceId)) {
          get().addSecurityAlert({
            type: 'new_device',
            message: `New device login: ${newSession.deviceName} (${newSession.browser})`,
            severity: 'warning',
          })
        }
      },

      terminateSession: (sessionId: string) => {
        set((state) => ({
          activeSessions: state.activeSessions.filter(s => s.id !== sessionId),
        }))
        
        get().addAuditEntry({
          userId: 'system',
          userName: 'System',
          action: 'SESSION_TERMINATED',
          details: 'Session was terminated',
          category: 'auth',
          riskLevel: 'low',
        })
      },

      terminateAllOtherSessions: () => {
        const state = get()
        set({
          activeSessions: state.activeSessions.filter(s => s.isCurrent),
        })
        
        get().addAuditEntry({
          userId: 'system',
          userName: 'System',
          action: 'ALL_SESSIONS_TERMINATED',
          details: 'All other sessions were terminated',
          category: 'security',
          riskLevel: 'medium',
        })
      },

      updateLastActivity: () => {
        const now = Date.now()
        set((state) => ({
          lastActivity: now,
          recentActivityTimestamps: [...state.recentActivityTimestamps.filter(t => t > now - 60000), now],
          activeSessions: state.activeSessions.map(s =>
            s.isCurrent ? { ...s, lastActivity: new Date().toISOString() } : s
          ),
        }))
      },

      isSessionValid: () => {
        const state = get()
        const timeSinceLastActivity = Date.now() - state.lastActivity
        return timeSinceLastActivity < state.sessionTimeout
      },

      setSessionTimeout: (minutes: number) => {
        set({ sessionTimeout: minutes * 60 * 1000 })
        get().updateSecuritySettings({ autoLockTimeout: minutes })
        
        get().addAuditEntry({
          userId: 'system',
          userName: 'System',
          action: 'SESSION_TIMEOUT_CHANGED',
          details: `Session timeout changed to ${minutes} minutes`,
          category: 'settings',
          riskLevel: 'low',
        })
      },

      // ========== DEVICE MANAGEMENT ==========
      addTrustedDevice: (device) => {
        const trustedDevice: TrustedDevice = {
          id: get().currentDeviceId || generateSecureToken(),
          name: device.name,
          browser: device.browser,
          addedAt: new Date().toISOString(),
          lastUsed: new Date().toISOString(),
        }
        
        set((state) => ({
          trustedDevices: [...state.trustedDevices, trustedDevice],
        }))
        
        get().addAuditEntry({
          userId: 'system',
          userName: 'System',
          action: 'TRUSTED_DEVICE_ADDED',
          details: `Device "${device.name}" added to trusted devices`,
          category: 'security',
          riskLevel: 'medium',
        })
      },

      removeTrustedDevice: (deviceId: string) => {
        set((state) => ({
          trustedDevices: state.trustedDevices.filter(d => d.id !== deviceId),
        }))
        
        get().addAuditEntry({
          userId: 'system',
          userName: 'System',
          action: 'TRUSTED_DEVICE_REMOVED',
          details: 'A trusted device was removed',
          category: 'security',
          riskLevel: 'medium',
        })
      },

      isDeviceTrusted: (deviceId: string) => {
        return get().trustedDevices.some(d => d.id === deviceId)
      },

      // ========== SECURITY ALERTS ==========
      addSecurityAlert: (alert) => {
        const newAlert: SecurityAlert = {
          ...alert,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
          isRead: false,
        }
        
        set((state) => ({
          securityAlerts: [newAlert, ...state.securityAlerts].slice(0, 100),
        }))
      },

      markAlertAsRead: (alertId: string) => {
        set((state) => ({
          securityAlerts: state.securityAlerts.map(a =>
            a.id === alertId ? { ...a, isRead: true } : a
          ),
        }))
      },

      clearAllAlerts: () => {
        set({ securityAlerts: [] })
      },

      getUnreadAlertsCount: () => {
        return get().securityAlerts.filter(a => !a.isRead).length
      },

      // ========== AUDIT LOG ==========
      addAuditEntry: (entry) => {
        const newEntry: AuditEntry = {
          ...entry,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toISOString(),
        }
        
        set((state) => ({
          auditLog: [newEntry, ...state.auditLog].slice(0, 5000),
        }))
      },

      clearAuditLog: () => {
        get().addAuditEntry({
          userId: 'system',
          userName: 'System',
          action: 'AUDIT_LOG_CLEARED',
          details: 'Audit log was cleared',
          category: 'settings',
          riskLevel: 'high',
        })
        
        set({ auditLog: [] })
      },

      getAuditLogByCategory: (category) => {
        return get().auditLog.filter(e => e.category === category)
      },

      getAuditLogByUser: (userId) => {
        return get().auditLog.filter(e => e.userId === userId)
      },

      // ========== SECURITY SETTINGS ==========
      updateSecuritySettings: (settings) => {
        set((state) => ({
          securitySettings: { ...state.securitySettings, ...settings },
        }))
        
        get().addAuditEntry({
          userId: 'system',
          userName: 'System',
          action: 'SECURITY_SETTINGS_UPDATED',
          details: `Security settings updated: ${Object.keys(settings).join(', ')}`,
          category: 'settings',
          riskLevel: 'medium',
        })
      },

      // ========== ACCOUNT UNLOCK ==========
      unlockAccount: () => {
        set({
          isLocked: false,
          lockUntil: null,
          pinAttempts: 0,
        })
        
        get().addAuditEntry({
          userId: 'system',
          userName: 'System',
          action: 'ACCOUNT_UNLOCKED',
          details: 'Account was manually unlocked',
          category: 'security',
          riskLevel: 'high',
        })
      },

      unlockTransactionPin: () => {
        set({
          isTransactionLocked: false,
          transactionLockUntil: null,
          transactionPinAttempts: 0,
        })
        
        get().addAuditEntry({
          userId: 'system',
          userName: 'System',
          action: 'TRANSACTION_PIN_UNLOCKED',
          details: 'Transaction PIN was manually unlocked',
          category: 'security',
          riskLevel: 'high',
        })
      },

      // ========== UTILITY FUNCTIONS ==========
      validatePassword: (password: string) => {
        const errors: string[] = []
        
        if (password.length < 8) {
          errors.push('Password must be at least 8 characters')
        }
        if (!/[A-Z]/.test(password)) {
          errors.push('Password must contain at least one uppercase letter')
        }
        if (!/[a-z]/.test(password)) {
          errors.push('Password must contain at least one lowercase letter')
        }
        if (!/\d/.test(password)) {
          errors.push('Password must contain at least one number')
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
          errors.push('Password must contain at least one special character')
        }
        
        return { isValid: errors.length === 0, errors }
      },

      checkSuspiciousActivity: () => {
        const state = get()
        const recentCount = state.recentActivityTimestamps.filter(
          t => t > Date.now() - 60000
        ).length
        
        if (recentCount > SUSPICIOUS_ACTIVITY_THRESHOLD) {
          get().addSecurityAlert({
            type: 'suspicious_activity',
            message: `Unusual activity detected: ${recentCount} actions in the last minute`,
            severity: 'warning',
          })
          
          get().addAuditEntry({
            userId: 'system',
            userName: 'System',
            action: 'SUSPICIOUS_ACTIVITY_DETECTED',
            details: `${recentCount} actions detected in the last minute`,
            category: 'security',
            riskLevel: 'high',
          })
          
          return true
        }
        
        return false
      },

      encryptSensitiveData: (data: string) => {
        return btoa(encodeURIComponent(data).split('').reverse().join(''))
      },

      decryptSensitiveData: (encryptedData: string) => {
        try {
          return decodeURIComponent(atob(encryptedData).split('').reverse().join(''))
        } catch {
          return ''
        }
      },

      generateSecureToken: () => {
        return generateSecureToken()
      },

      hashData: (data: string) => {
        return hashPin(data)
      },

      // ========== TRANSACTION VERIFICATION ==========
      requiresTransactionPin: (amount: number) => {
        const state = get()
        return state.isTransactionPinSet && amount >= state.securitySettings.largeTransactionThreshold
      },

      logFinancialTransaction: (type: string, amount: number, details: string, userId: string, userName: string) => {
        const state = get()
        
        get().addAuditEntry({
          userId,
          userName,
          action: `FINANCIAL_${type.toUpperCase()}`,
          details: `${details} - Amount: KES ${amount.toLocaleString()}`,
          category: 'financial',
          riskLevel: amount >= state.securitySettings.largeTransactionThreshold ? 'high' : 'low',
        })
        
        if (amount >= state.securitySettings.largeTransactionThreshold) {
          get().addSecurityAlert({
            type: 'large_transaction',
            message: `Large ${type} of KES ${amount.toLocaleString()} by ${userName}`,
            severity: 'warning',
          })
        }
      },
    }),
    {
      name: 'chama-security-storage',
      partialize: (state) => ({
        pin: state.pin,
        isPinSet: state.isPinSet,
        transactionPin: state.transactionPin,
        isTransactionPinSet: state.isTransactionPinSet,
        twoFactorSecret: state.twoFactorSecret,
        isTwoFactorEnabled: state.isTwoFactorEnabled,
        sessionTimeout: state.sessionTimeout,
        trustedDevices: state.trustedDevices,
        auditLog: state.auditLog,
        securitySettings: state.securitySettings,
        securityAlerts: state.securityAlerts,
      }),
    }
  )
)

// ========== HELPER FUNCTIONS ==========
function hashPin(pin: string): string {
  let hash = 0
  const salt = 'chama_secure_2024'
  const saltedPin = salt + pin + salt
  
  for (let i = 0; i < saltedPin.length; i++) {
    const char = saltedPin.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  
  const hash2 = Math.abs(hash).toString(16)
  const hash3 = btoa(hash2).replace(/=/g, '')
  
  return 'sec_' + hash3
}

function generateSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let secret = ''
  for (let i = 0; i < 16; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return secret
}

function generateSecureToken(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 12) + Math.random().toString(36).substr(2, 12)
}

function detectBrowser(): string {
  const ua = navigator.userAgent
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Safari')) return 'Safari'
  if (ua.includes('Edge')) return 'Edge'
  return 'Unknown Browser'
}
