// User Types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  avatar?: string
  role: 'chairman' | 'vice_chairman' | 'treasurer' | 'vice_treasurer' | 'secretary' | 'vice_secretary' | 'admin' | 'member'
  joinedAt: string
}
export interface Project {
  id: string
  name: string
  // ...other fields...
  loanAmount?: number
  dailyIncome?: { date: string; amount: number }[]
}

// Next of Kin Types
export interface NextOfKin {
  fullName: string
  relationship: string
  phone: string
  email?: string
  address?: string
  idNumber?: string
}

// Member Types
export interface Member {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar?: string
  idNumber?: string
  address?: string
  dateOfBirth?: string
  occupation?: string
  role: 'chairman' | 'vice_chairman' | 'treasurer' | 'vice_treasurer' | 'secretary' | 'vice_secretary' | 'admin' | 'member'
  status: 'active' | 'inactive' | 'suspended'
  joinedAt: string
  totalContributions: number
  totalLoans: number
  outstandingLoans: number
  shares: number
  nextOfKin?: NextOfKin
}

// Group Types
export interface Group {
  id: string
  name: string
  description: string
  logo?: string
  currency: string
  contributionAmount: number
  contributionFrequency: 'weekly' | 'biweekly' | 'monthly'
  loanInterestRate: number
  maxLoanMultiplier: number
  createdAt: string
  totalMembers: number
  totalContributions: number
  totalLoans: number
  availableBalance: number
}

// Contribution Types
export interface ContributionType {
  id: string
  name: string
  description: string
  amount: number
  frequency: 'one-time' | 'weekly' | 'biweekly' | 'monthly'
  isRequired: boolean
}

export interface Contribution {
  id: string
  memberId: string
  memberName: string
  contributionTypeId: string
  contributionTypeName: string
  amount: number
  date: string
  method: 'cash' | 'mpesa' | 'bank_transfer' | 'cheque'
  reference?: string
  status: 'pending' | 'confirmed' | 'rejected'
  confirmedBy?: string
  confirmedAt?: string
  notes?: string
}

// Loan Types
export interface LoanType {
  id: string
  name: string
  description: string
  interestRate: number
  interestType: 'simple' | 'compound' | 'reducing_balance'
  maxAmount: number
  maxDuration: number // in months
  processingFee: number
  requiresGuarantor: boolean
  minGuarantors: number
}

export interface Loan {
  id: string
  memberId: string
  memberName: string
  loanTypeId: string
  loanTypeName: string
  loanCategory: 'individual' | 'project' // New field
  projectId?: string // Link to project if it's a project loan
  projectName?: string // Project name for display
  principalAmount: number
  interestRate: number
  interestAmount: number
  totalAmount: number
  amountPaid: number
  balance: number
  duration: number
  monthlyPayment: number
  disbursementDate: string
  dueDate: string
  status: 'pending' | 'approved' | 'disbursed' | 'repaying' | 'completed' | 'defaulted' | 'rejected'
  guarantors: LoanGuarantor[]
  repayments: LoanRepayment[]
  applicationDate: string
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
  notes?: string
}

export interface LoanGuarantor {
  id: string
  loanId: string
  memberId: string
  memberName: string
  guaranteedAmount: number
  status: 'pending' | 'accepted' | 'declined'
}

export interface LoanRepayment {
  id: string
  loanId: string
  amount: number
  date: string
  method: 'cash' | 'mpesa' | 'bank_transfer' | 'cheque'
  reference?: string
  receivedBy: string
}

// Meeting Types
export interface MeetingDocument {
  id: string
  name: string
  size: number
  type: string
  dataUrl: string
  uploadedAt: string
  uploadedBy: string
  category: 'minutes' | 'attendance' | 'resolution' | 'financial_report' | 'agenda' | 'other'
  analyzed: boolean
  extractedText?: string
  analysisResult?: DocumentAnalysis
}

export interface DocumentAnalysis {
  documentType: string
  confidence: number
  extractedData: {
    title?: string
    date?: string
    attendees?: string[]
    decisions?: string[]
    actionItems?: string[]
    amounts?: { description: string; amount: number }[]
    signatures?: string[]
    keyPoints?: string[]
  }
  suggestedCategory: 'minutes' | 'attendance' | 'resolution' | 'financial_report' | 'agenda' | 'other'
}

export interface Meeting {
  id: string
  title: string
  description: string
  date: string
  time: string
  venue: string
  type: 'regular' | 'special' | 'agm'
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  agenda: string[]
  attendees: MeetingAttendee[]
  minutes?: string
  createdBy: string
  documents?: MeetingDocument[]
}

export interface MeetingAttendee {
  memberId: string
  memberName: string
  status: 'present' | 'absent' | 'excused'
  arrivalTime?: string
}

// Document Types
export interface UploadedDocument {
  name: string
  size: number
  type: string
  dataUrl: string
}

// Expense Types
export interface Expense {
  id: string
  title: string
  description: string
  category: string
  amount: number
  date: string
  paidBy: string
  paidByName: string
  approvedBy?: string
  approvedByName?: string
  status: 'pending' | 'approved' | 'rejected' | 'paid'
  receipt?: string
  notes?: string
  documents?: UploadedDocument[]
}

// Report Types
export interface FinancialSummary {
  totalContributions: number
  totalLoansIssued: number
  totalLoansRepaid: number
  totalExpenses: number
  availableBalance: number
  pendingContributions: number
  outstandingLoans: number
}

export interface MemberStatement {
  memberId: string
  memberName: string
  transactions: Transaction[]
  totalContributions: number
  totalLoansReceived: number
  totalLoansRepaid: number
  currentBalance: number
}

export interface Transaction {
  id: string
  type: 'contribution' | 'loan_disbursement' | 'loan_repayment' | 'expense' | 'penalty'
  description: string
  amount: number
  date: string
  balance: number
}

// Project Types
export interface Project {
  id: string
  name: string
  description: string
  category: 'real_estate' | 'agriculture' | 'business' | 'stocks' | 'savings' | 'other'
  status: 'planning' | 'active' | 'completed' | 'on_hold' | 'cancelled'
  startDate: string
  endDate?: string
  totalInvestment: number
  totalBorrowed: number // Total amount borrowed to finance the project
  currentValue: number
  expectedIncome: number
  actualIncome: number
  roi: number
  members: ProjectMember[]
  milestones: ProjectMilestone[]
  transactions: ProjectTransaction[]
  createdBy: string
  createdAt: string
}

export interface ProjectMember {
  memberId: string
  memberName: string
  investmentAmount: number
  sharePercentage: number
  joinedAt: string
}

export interface ProjectMilestone {
  id: string
  title: string
  description: string
  dueDate: string
  completedDate?: string
  status: 'pending' | 'in_progress' | 'completed'
}

export interface ProjectTransaction {
  id: string
  type: 'investment' | 'expense' | 'income' | 'withdrawal'
  amount: number
  description: string
  date: string
  recordedBy: string
}

// Notification Types
export type UserRoleType = 'chairman' | 'vice_chairman' | 'treasurer' | 'vice_treasurer' | 'secretary' | 'vice_secretary' | 'admin' | 'member'

export interface Notification {
  id: string
  type: 'contribution_pending' | 'contribution_confirmed' | 'loan_application' | 'loan_approved' | 'loan_rejected' | 'loan_disbursed' | 'meeting_scheduled' | 'expense_added' | 'member_added' | 'fine_added' | 'general'
  title: string
  message: string
  read: boolean
  createdAt: string
  // Role-based visibility
  targetRoles: readonly UserRoleType[] | UserRoleType[]
  // Optional: specific member IDs who should see this notification
  targetMemberIds?: string[]
  // Link to navigate to
  link?: string
}

// Fine Types
export interface FineType {
  id: string
  name: string
  description: string
  amount: number
}

export interface Fine {
  id: string
  memberId: string
  memberName: string
  fineTypeId: string
  fineTypeName: string
  amount: number
  date: string
  method: 'cash' | 'mpesa' | 'bank_transfer' | 'cheque'
  reference?: string
  notes?: string
  status: 'paid' | 'pending' | 'waived'
  recordedBy: string
  recordedAt: string
}
