import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Member, Contribution, Loan, Meeting, Expense, ContributionType, LoanType, Project, Fine, FineType } from '../types'

// Empty initial data - will be populated by user
const initialMembers: Member[] = []

// Default contribution types - can be customized (set your own amount)
const initialContributionTypes: ContributionType[] = [
  { id: '1', name: 'Monthly Contribution', description: 'Regular monthly savings', amount: 0, frequency: 'monthly', isRequired: true },
]

// Empty initial contributions
const initialContributions: Contribution[] = []

// Default loan types - customize with your group's rates and limits
const initialLoanTypes: LoanType[] = [
  { id: '1', name: 'Standard Loan', description: 'Regular member loans', interestRate: 0, interestType: 'simple', maxAmount: 0, maxDuration: 0, processingFee: 0, requiresGuarantor: false, minGuarantors: 0 },
]

// Empty initial loans
const initialLoans: Loan[] = []

// Sample meeting templates - customize with your group's details
const initialMeetings: Meeting[] = [
  {
    id: '1',
    title: '[Your Group Name] Monthly Meeting',
    description: 'Enter meeting description here...',
    date: '', // Set your meeting date (YYYY-MM-DD)
    time: '', // Set your meeting time (HH:MM)
    venue: 'Enter venue location...',
    type: 'regular',
    status: 'scheduled',
    agenda: [
      'Opening Prayer and Preliminaries',
      'Reading and Confirmation of Previous Minutes',
      'Matters Arising from Previous Meeting',
      'Financial Report by Treasurer',
      'Loan Applications Review',
      'New Member Applications',
      'Investment Updates',
      'Any Other Business (AOB)',
      'Closing Remarks'
    ],
    attendees: [],
    createdBy: ''
  }
]

// Empty initial expenses
const initialExpenses: Expense[] = []

// Empty initial projects
const initialProjects: Project[] = []

// Default fine types - set your own amounts
const initialFineTypes: FineType[] = [
  { id: '1', name: 'Late Contribution', description: 'Fine for late contribution payment', amount: 0 },
  { id: '2', name: 'Meeting Absence', description: 'Fine for missing a meeting without apology', amount: 0 },
  { id: '3', name: 'Late Loan Repayment', description: 'Fine for late loan repayment', amount: 0 },
  { id: '4', name: 'Other', description: 'Other fines as per group constitution', amount: 0 },
]

// Empty initial fines
const initialFines: Fine[] = []

interface DataState {
  members: Member[]
  contributionTypes: ContributionType[]
  contributions: Contribution[]
  loanTypes: LoanType[]
  loans: Loan[]
  meetings: Meeting[]
  expenses: Expense[]
  projects: Project[]
  fineTypes: FineType[]
  fines: Fine[]
  
  // Member actions
  addMember: (member: Omit<Member, 'id'>) => void
  updateMember: (id: string, data: Partial<Member>) => void
  removeMember: (id: string) => void
  
  // Contribution actions
  addContribution: (contribution: Omit<Contribution, 'id'>) => void
  updateContribution: (id: string, data: Partial<Contribution>) => void
  confirmContribution: (id: string, confirmedBy: string) => void
  
  // Loan actions
  addLoan: (loan: Omit<Loan, 'id'>) => void
  updateLoan: (id: string, data: Partial<Loan>) => void
  approveLoan: (id: string, approvedBy: string) => void
  rejectLoan: (id: string, reason: string) => void
  addLoanRepayment: (loanId: string, repayment: Omit<Loan['repayments'][0], 'id' | 'loanId'>) => void
  
  // Meeting actions
  addMeeting: (meeting: Omit<Meeting, 'id'>) => void
  updateMeeting: (id: string, data: Partial<Meeting>) => void
  
  // Expense actions
  addExpense: (expense: Omit<Expense, 'id'>) => void
  updateExpense: (id: string, data: Partial<Expense>) => void
  approveExpense: (id: string, approvedBy: string, approvedByName: string) => void
  
  // Project actions
  addProject: (project: Omit<Project, 'id'>) => void
  updateProject: (id: string, data: Partial<Project>) => void
  deleteProject: (id: string) => void
  
  // Fine actions
  addFine: (fine: Omit<Fine, 'id'>) => void
  updateFine: (id: string, data: Partial<Fine>) => void
  deleteFine: (id: string) => void
}

export const useDataStore = create<DataState>()(
  persist(
    (set) => ({
      members: initialMembers,
      contributionTypes: initialContributionTypes,
      contributions: initialContributions,
      loanTypes: initialLoanTypes,
      loans: initialLoans,
      meetings: initialMeetings,
      expenses: initialExpenses,
      projects: initialProjects,
      fineTypes: initialFineTypes,
      fines: initialFines,

  // Member actions
  addMember: (member) => set((state) => ({
    members: [...state.members, { ...member, id: Date.now().toString() }],
  })),
  
  updateMember: (id, data) => set((state) => ({
    members: state.members.map((m) => m.id === id ? { ...m, ...data } : m),
  })),
  
  removeMember: (id) => set((state) => ({
    members: state.members.filter((m) => m.id !== id),
  })),

  // Contribution actions
  addContribution: (contribution) => set((state) => ({
    contributions: [...state.contributions, { ...contribution, id: Date.now().toString() }],
  })),
  
  updateContribution: (id, data) => set((state) => ({
    contributions: state.contributions.map((c) => c.id === id ? { ...c, ...data } : c),
  })),
  
  confirmContribution: (id, confirmedBy) => set((state) => ({
    contributions: state.contributions.map((c) => 
      c.id === id ? { ...c, status: 'confirmed' as const, confirmedBy, confirmedAt: new Date().toISOString() } : c
    ),
  })),

  // Loan actions
  addLoan: (loan) => set((state) => ({
    loans: [...state.loans, { ...loan, id: Date.now().toString() }],
  })),
  
  updateLoan: (id, data) => set((state) => ({
    loans: state.loans.map((l) => l.id === id ? { ...l, ...data } : l),
  })),
  
  approveLoan: (id, approvedBy) => set((state) => ({
    loans: state.loans.map((l) => 
      l.id === id ? { 
        ...l, 
        status: 'approved' as const, 
        approvedBy, 
        approvedAt: new Date().toISOString() 
      } : l
    ),
  })),
  
  rejectLoan: (id, reason) => set((state) => ({
    loans: state.loans.map((l) => 
      l.id === id ? { ...l, status: 'rejected' as const, rejectionReason: reason } : l
    ),
  })),
  
  addLoanRepayment: (loanId, repayment) => set((state) => ({
    loans: state.loans.map((l) => {
      if (l.id === loanId) {
        const newRepayment = { ...repayment, id: Date.now().toString(), loanId }
        const newAmountPaid = l.amountPaid + repayment.amount
        const newBalance = l.totalAmount - newAmountPaid
        return {
          ...l,
          repayments: [...l.repayments, newRepayment],
          amountPaid: newAmountPaid,
          balance: newBalance,
          status: newBalance <= 0 ? 'completed' as const : l.status,
        }
      }
      return l
    }),
  })),

  // Meeting actions
  addMeeting: (meeting) => set((state) => ({
    meetings: [...state.meetings, { ...meeting, id: Date.now().toString() }],
  })),
  
  updateMeeting: (id, data) => set((state) => ({
    meetings: state.meetings.map((m) => m.id === id ? { ...m, ...data } : m),
  })),

  // Expense actions
  addExpense: (expense) => set((state) => ({
    expenses: [...state.expenses, { ...expense, id: Date.now().toString() }],
  })),
  
  updateExpense: (id, data) => set((state) => ({
    expenses: state.expenses.map((e) => e.id === id ? { ...e, ...data } : e),
  })),
  
  approveExpense: (id, approvedBy, approvedByName) => set((state) => ({
    expenses: state.expenses.map((e) => 
      e.id === id ? { ...e, status: 'approved' as const, approvedBy, approvedByName } : e
    ),
  })),

  // Project actions
  addProject: (project) => set((state) => ({
    projects: [...state.projects, { ...project, id: Date.now().toString() }],
  })),
  
  updateProject: (id, data) => set((state) => ({
    projects: state.projects.map((p) => p.id === id ? { ...p, ...data } : p),
  })),
  
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter((p) => p.id !== id),
  })),

  // Fine actions
  addFine: (fine) => set((state) => ({
    fines: [...state.fines, { ...fine, id: Date.now().toString() }],
  })),
  
  updateFine: (id, data) => set((state) => ({
    fines: state.fines.map((f) => f.id === id ? { ...f, ...data } : f),
  })),
  
  deleteFine: (id) => set((state) => ({
    fines: state.fines.filter((f) => f.id !== id),
  })),
}),
    {
      name: 'chama-data-storage',
      merge: (persistedState, currentState) => {
        // Properly merge persisted data with current state, preserving user data
        const persisted = persistedState as Partial<DataState> | undefined
        return {
          ...currentState,
          // Preserve user-added data from localStorage
          members: persisted?.members?.length ? persisted.members : currentState.members,
          contributions: persisted?.contributions?.length ? persisted.contributions : currentState.contributions,
          loans: persisted?.loans?.length ? persisted.loans : currentState.loans,
          meetings: persisted?.meetings?.length ? persisted.meetings : currentState.meetings,
          expenses: persisted?.expenses?.length ? persisted.expenses : currentState.expenses,
          projects: persisted?.projects?.length ? persisted.projects : currentState.projects,
          fines: persisted?.fines?.length ? persisted.fines : currentState.fines,
          // Preserve customized types
          contributionTypes: persisted?.contributionTypes?.length ? persisted.contributionTypes : currentState.contributionTypes,
          loanTypes: persisted?.loanTypes?.length ? persisted.loanTypes : currentState.loanTypes,
          fineTypes: persisted?.fineTypes?.length ? persisted.fineTypes : currentState.fineTypes,
        }
      },
    }
  )
)
