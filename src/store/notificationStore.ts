import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Notification } from '../types'

interface NotificationState {
  notifications: Notification[]
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  clearAllNotifications: () => void
  getUnreadCount: (userRole: string, userId?: string) => number
  getNotificationsForUser: (userRole: string, userId?: string) => Notification[]
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          read: false,
        }
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 100), // Keep last 100 notifications
        }))
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }))
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }))
      },

      deleteNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      },

      clearAllNotifications: () => {
        set({ notifications: [] })
      },

      getUnreadCount: (userRole, userId) => {
        const { notifications } = get()
        return notifications.filter((n) => {
          if (n.read) return false
          // Check if user's role is in target roles
          const roleMatch = n.targetRoles.includes(userRole as any)
          // Check if user is specifically targeted (if targetMemberIds exists)
          const memberMatch = !n.targetMemberIds || n.targetMemberIds.includes(userId || '')
          return roleMatch && memberMatch
        }).length
      },

      getNotificationsForUser: (userRole, userId) => {
        const { notifications } = get()
        return notifications.filter((n) => {
          // Check if user's role is in target roles
          const roleMatch = n.targetRoles.includes(userRole as any)
          // Check if user is specifically targeted (if targetMemberIds exists)
          const memberMatch = !n.targetMemberIds || n.targetMemberIds.includes(userId || '')
          return roleMatch && memberMatch
        })
      },
    }),
    {
      name: 'chama-notifications',
    }
  )
)

// Helper function to create notifications for different activities
export const createActivityNotification = {
  // Contribution notifications
  contributionPending: (memberName: string, amount: number, _contributionId?: string) => ({
    type: 'contribution_pending' as const,
    title: '⏳ Contribution Pending Approval',
    message: `${memberName} has submitted a contribution of KES ${amount.toLocaleString()} awaiting your confirmation.`,
    targetRoles: ['chairman', 'treasurer', 'secretary', 'admin'] as const,
    link: '/contributions?status=pending',
  }),

  contributionConfirmed: (_memberName: string, amount: number, memberId: string) => ({
    type: 'contribution_confirmed' as const,
    title: '✅ Contribution Confirmed',
    message: `Your contribution of KES ${amount.toLocaleString()} has been confirmed.`,
    targetRoles: ['chairman', 'vice_chairman', 'treasurer', 'vice_treasurer', 'secretary', 'vice_secretary', 'admin', 'member'] as const,
    targetMemberIds: [memberId],
    link: '/contributions',
  }),

  // Loan notifications
  loanApplication: (memberName: string, amount: number, loanId?: string) => ({
    type: 'loan_application' as const,
    title: '📋 Loan Application Pending',
    message: `${memberName} has applied for a loan of KES ${amount.toLocaleString()}. Review and approve/reject.`,
    targetRoles: ['chairman', 'treasurer', 'secretary', 'admin'] as const,
    link: loanId ? `/loans/${loanId}` : '/loans?status=pending',
  }),

  loanApproved: (_memberName: string, amount: number, memberId: string) => ({
    type: 'loan_approved' as const,
    title: '✅ Loan Approved',
    message: `Your loan application for KES ${amount.toLocaleString()} has been approved.`,
    targetRoles: ['chairman', 'vice_chairman', 'treasurer', 'vice_treasurer', 'secretary', 'vice_secretary', 'admin', 'member'] as const,
    targetMemberIds: [memberId],
    link: '/loans',
  }),

  loanRejected: (_memberName: string, amount: number, memberId: string, reason?: string) => ({
    type: 'loan_rejected' as const,
    title: 'Loan Application Rejected',
    message: `Your loan application for KES ${amount.toLocaleString()} has been rejected.${reason ? ` Reason: ${reason}` : ''}`,
    targetRoles: ['chairman', 'vice_chairman', 'treasurer', 'vice_treasurer', 'secretary', 'vice_secretary', 'admin', 'member'] as const,
    targetMemberIds: [memberId],
    link: '/loans',
  }),

  loanDisbursed: (_memberName: string, amount: number, memberId: string) => ({
    type: 'loan_disbursed' as const,
    title: 'Loan Disbursed',
    message: `Your loan of KES ${amount.toLocaleString()} has been disbursed.`,
    targetRoles: ['chairman', 'vice_chairman', 'treasurer', 'vice_treasurer', 'secretary', 'vice_secretary', 'admin', 'member'] as const,
    targetMemberIds: [memberId],
    link: '/loans',
  }),

  // Meeting notifications
  meetingScheduled: (title: string, date: string, time: string) => ({
    type: 'meeting_scheduled' as const,
    title: 'New Meeting Scheduled',
    message: `${title} scheduled for ${date} at ${time}.`,
    targetRoles: ['chairman', 'vice_chairman', 'treasurer', 'vice_treasurer', 'secretary', 'vice_secretary', 'admin', 'member'] as const,
    link: '/governance/meetings',
  }),

  // Expense notifications
  expenseAdded: (description: string, amount: number, addedBy: string) => ({
    type: 'expense_added' as const,
    title: 'New Expense Recorded',
    message: `${addedBy} recorded an expense of KES ${amount.toLocaleString()} for "${description}".`,
    targetRoles: ['chairman', 'vice_chairman', 'treasurer', 'vice_treasurer', 'admin'] as const,
    link: '/expenses',
  }),

  // Member notifications
  memberAdded: (memberName: string) => ({
    type: 'member_added' as const,
    title: 'New Member Added',
    message: `${memberName} has been added to the group.`,
    targetRoles: ['chairman', 'vice_chairman', 'treasurer', 'vice_treasurer', 'secretary', 'vice_secretary', 'admin'] as const,
    link: '/governance/members',
  }),

  // Fine notifications
  fineAdded: (memberName: string, amount: number, reason: string, memberId: string) => ({
    type: 'fine_added' as const,
    title: 'Fine Issued',
    message: `A fine of KES ${amount.toLocaleString()} has been issued to ${memberName} for "${reason}".`,
    targetRoles: ['chairman', 'vice_chairman', 'treasurer', 'vice_treasurer', 'secretary', 'vice_secretary', 'admin', 'member'] as const,
    targetMemberIds: [memberId],
    link: '/fines',
  }),

  // General notification
  general: (title: string, message: string, targetRoles: Notification['targetRoles']) => ({
    type: 'general' as const,
    title,
    message,
    targetRoles,
  }),
}
