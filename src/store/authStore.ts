import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Group } from '../types'

interface AuthState {
  user: User | null
  group: Group | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  updateUser: (user: Partial<User>) => void
  updateGroup: (group: Partial<Group>) => void
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  groupName?: string
  joinCode?: string
}

// Default empty group template
const defaultGroup: Group = {
  id: '',
  name: '',
  description: '',
  currency: 'KES',
  contributionAmount: 0,
  contributionFrequency: 'monthly',
  loanInterestRate: 10,
  maxLoanMultiplier: 3,
  createdAt: '',
  totalMembers: 0,
  totalContributions: 0,
  totalLoans: 0,
  availableBalance: 0,
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      group: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, _password: string) => {
        set({ isLoading: true })
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Create user from login credentials
        const newUser: User = {
          id: Date.now().toString(),
          email,
          firstName: '',
          lastName: '',
          phone: '',
          role: 'admin',
          joinedAt: new Date().toISOString().split('T')[0],
        }
        
        set({
          user: newUser,
          group: { ...defaultGroup, id: Date.now().toString(), createdAt: new Date().toISOString().split('T')[0] },
          token: 'mock-jwt-token',
          isAuthenticated: true,
          isLoading: false,
        })
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true })
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const newUser: User = {
          id: Date.now().toString(),
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          role: 'member',
          joinedAt: new Date().toISOString(),
        }
        
        const newGroup: Group = {
          ...defaultGroup,
          id: Date.now().toString(),
          name: data.groupName || 'My Chama Group',
          createdAt: new Date().toISOString().split('T')[0],
          totalMembers: 1,
        }
        
        set({
          user: newUser,
          group: newGroup,
          token: 'mock-jwt-token',
          isAuthenticated: true,
          isLoading: false,
        })
      },

      logout: () => {
        set({
          user: null,
          group: null,
          token: null,
          isAuthenticated: false,
        })
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }))
      },

      updateGroup: (groupData) => {
        set((state) => ({
          group: state.group ? { ...state.group, ...groupData } : null,
        }))
      },
    }),
    {
      name: 'chama-auth',
    }
  )
)
