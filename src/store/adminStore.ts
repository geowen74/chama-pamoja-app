import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// User credential type
export interface UserCredential {
  id: string
  email: string
  passwordHash: string
  mustChangePassword: boolean
  lastPasswordChange: string
  failedAttempts: number
  isLocked: boolean
  lockUntil: string | null
  createdAt: string
  updatedAt: string
}

// Admin settings type
export interface AdminSettings {
  // Group settings
  groupName: string
  groupLogo: string | null
  groupDescription: string
  currency: string
  timezone: string
  
  // Contribution settings
  defaultContributionAmount: number
  contributionFrequency: 'weekly' | 'biweekly' | 'monthly'
  contributionDueDay: number
  lateContributionPenalty: number
  
  // Loan settings
  defaultInterestRate: number
  maxLoanMultiplier: number
  loanProcessingFee: number
  maxLoanDuration: number
  requireGuarantors: boolean
  minGuarantors: number
  
  // Fine settings
  lateMeetingFine: number
  lateContributionFine: number
  lateLoanRepaymentFine: number
  
  // Security settings
  sessionTimeout: number // minutes
  maxLoginAttempts: number
  lockoutDuration: number // minutes
  requirePinForSensitiveActions: boolean
  passwordMinLength: number
  passwordRequireUppercase: boolean
  passwordRequireNumbers: boolean
  passwordRequireSpecial: boolean
  passwordExpiryDays: number
  
  // Notification settings
  emailNotifications: boolean
  smsNotifications: boolean
  reminderDaysBefore: number
}

interface AdminStoreState {
  // User credentials storage
  userCredentials: UserCredential[]
  
  // Admin settings
  settings: AdminSettings
  
  // Default admin password (for first-time setup)
  defaultAdminPassword: string
  isFirstTimeSetup: boolean
  
  // Actions
  // Password management
  createUserCredential: (email: string, password: string, mustChangePassword?: boolean) => void
  updatePassword: (userId: string, newPassword: string) => boolean
  verifyPassword: (email: string, password: string) => { success: boolean; userId?: string; mustChangePassword?: boolean; error?: string }
  resetPassword: (userId: string) => string // Returns temporary password
  forcePasswordChange: (userId: string) => void
  lockUser: (userId: string) => void
  unlockUser: (userId: string) => void
  deleteUserCredential: (userId: string) => void
  
  // Admin settings
  updateSettings: (settings: Partial<AdminSettings>) => void
  resetToDefaults: () => void
  
  // Setup
  completeFirstTimeSetup: (adminPassword: string) => void
  changeAdminPassword: (oldPassword: string, newPassword: string) => boolean
}

// Default admin settings
const defaultSettings: AdminSettings = {
  // Group settings
  groupName: 'My Chama Group',
  groupLogo: null,
  groupDescription: '',
  currency: 'KES',
  timezone: 'Africa/Nairobi',
  
  // Contribution settings
  defaultContributionAmount: 1000,
  contributionFrequency: 'monthly',
  contributionDueDay: 5,
  lateContributionPenalty: 10,
  
  // Loan settings
  defaultInterestRate: 10,
  maxLoanMultiplier: 3,
  loanProcessingFee: 500,
  maxLoanDuration: 12,
  requireGuarantors: false,
  minGuarantors: 2,
  
  // Fine settings
  lateMeetingFine: 200,
  lateContributionFine: 100,
  lateLoanRepaymentFine: 150,
  
  // Security settings
  sessionTimeout: 15,
  maxLoginAttempts: 3,
  lockoutDuration: 30,
  requirePinForSensitiveActions: true,
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireNumbers: true,
  passwordRequireSpecial: false,
  passwordExpiryDays: 90,
  
  // Notification settings
  emailNotifications: true,
  smsNotifications: false,
  reminderDaysBefore: 3,
}

// Simple hash function (in production, use bcrypt or similar)
function hashPassword(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return 'pwd_' + Math.abs(hash).toString(36) + '_' + password.length
}

// Generate random password
function generateRandomPassword(length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export const useAdminStore = create<AdminStoreState>()(
  persist(
    (set, get) => ({
      userCredentials: [],
      settings: defaultSettings,
      defaultAdminPassword: 'Admin@123',
      isFirstTimeSetup: true,

      createUserCredential: (email, password, mustChangePassword = false) => {
        const now = new Date().toISOString()
        const newCredential: UserCredential = {
          id: Date.now().toString(),
          email: email.toLowerCase(),
          passwordHash: hashPassword(password),
          mustChangePassword,
          lastPasswordChange: now,
          failedAttempts: 0,
          isLocked: false,
          lockUntil: null,
          createdAt: now,
          updatedAt: now,
        }
        
        set((state) => ({
          userCredentials: [...state.userCredentials, newCredential],
        }))
      },

      updatePassword: (userId, newPassword) => {
        const state = get()
        const credential = state.userCredentials.find(c => c.id === userId)
        
        if (!credential) return false
        
        set((state) => ({
          userCredentials: state.userCredentials.map(c =>
            c.id === userId
              ? {
                  ...c,
                  passwordHash: hashPassword(newPassword),
                  mustChangePassword: false,
                  lastPasswordChange: new Date().toISOString(),
                  failedAttempts: 0,
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        }))
        
        return true
      },

      verifyPassword: (email, password) => {
        const state = get()
        const credential = state.userCredentials.find(
          c => c.email.toLowerCase() === email.toLowerCase()
        )
        
        if (!credential) {
          return { success: false, error: 'User not found' }
        }
        
        if (credential.isLocked) {
          if (credential.lockUntil && new Date(credential.lockUntil) > new Date()) {
            return { success: false, error: 'Account is locked. Try again later.' }
          } else {
            // Lock expired, unlock the account
            set((state) => ({
              userCredentials: state.userCredentials.map(c =>
                c.id === credential.id
                  ? { ...c, isLocked: false, lockUntil: null, failedAttempts: 0 }
                  : c
              ),
            }))
          }
        }
        
        const hashedInput = hashPassword(password)
        
        if (hashedInput === credential.passwordHash) {
          // Reset failed attempts on successful login
          set((state) => ({
            userCredentials: state.userCredentials.map(c =>
              c.id === credential.id
                ? { ...c, failedAttempts: 0 }
                : c
            ),
          }))
          
          return {
            success: true,
            userId: credential.id,
            mustChangePassword: credential.mustChangePassword,
          }
        } else {
          // Increment failed attempts
          const newFailedAttempts = credential.failedAttempts + 1
          const settings = state.settings
          
          set((state) => ({
            userCredentials: state.userCredentials.map(c =>
              c.id === credential.id
                ? {
                    ...c,
                    failedAttempts: newFailedAttempts,
                    isLocked: newFailedAttempts >= settings.maxLoginAttempts,
                    lockUntil: newFailedAttempts >= settings.maxLoginAttempts
                      ? new Date(Date.now() + settings.lockoutDuration * 60 * 1000).toISOString()
                      : null,
                  }
                : c
            ),
          }))
          
          if (newFailedAttempts >= settings.maxLoginAttempts) {
            return { success: false, error: 'Account locked due to too many failed attempts' }
          }
          
          return {
            success: false,
            error: `Invalid password. ${settings.maxLoginAttempts - newFailedAttempts} attempts remaining.`,
          }
        }
      },

      resetPassword: (userId) => {
        const tempPassword = generateRandomPassword()
        
        set((state) => ({
          userCredentials: state.userCredentials.map(c =>
            c.id === userId
              ? {
                  ...c,
                  passwordHash: hashPassword(tempPassword),
                  mustChangePassword: true,
                  failedAttempts: 0,
                  isLocked: false,
                  lockUntil: null,
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        }))
        
        return tempPassword
      },

      forcePasswordChange: (userId) => {
        set((state) => ({
          userCredentials: state.userCredentials.map(c =>
            c.id === userId
              ? { ...c, mustChangePassword: true, updatedAt: new Date().toISOString() }
              : c
          ),
        }))
      },

      lockUser: (userId) => {
        set((state) => ({
          userCredentials: state.userCredentials.map(c =>
            c.id === userId
              ? {
                  ...c,
                  isLocked: true,
                  lockUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Lock for a year
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        }))
      },

      unlockUser: (userId) => {
        set((state) => ({
          userCredentials: state.userCredentials.map(c =>
            c.id === userId
              ? {
                  ...c,
                  isLocked: false,
                  lockUntil: null,
                  failedAttempts: 0,
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        }))
      },

      deleteUserCredential: (userId) => {
        set((state) => ({
          userCredentials: state.userCredentials.filter(c => c.id !== userId),
        }))
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }))
      },

      resetToDefaults: () => {
        set({ settings: defaultSettings })
      },

      completeFirstTimeSetup: (adminPassword) => {
        set({
          defaultAdminPassword: hashPassword(adminPassword),
          isFirstTimeSetup: false,
        })
      },

      changeAdminPassword: (oldPassword, newPassword) => {
        const state = get()
        const hashedOld = hashPassword(oldPassword)
        
        // Check if it matches the stored admin password hash
        // or the default password if it hasn't been changed
        if (
          hashedOld === state.defaultAdminPassword ||
          (state.isFirstTimeSetup && oldPassword === 'Admin@123')
        ) {
          set({
            defaultAdminPassword: hashPassword(newPassword),
            isFirstTimeSetup: false,
          })
          return true
        }
        
        return false
      },
    }),
    {
      name: 'chama-admin-storage',
    }
  )
)

// Password validation helper
export function validatePassword(password: string, settings: AdminSettings): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (password.length < settings.passwordMinLength) {
    errors.push(`Password must be at least ${settings.passwordMinLength} characters`)
  }
  
  if (settings.passwordRequireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (settings.passwordRequireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (settings.passwordRequireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}
