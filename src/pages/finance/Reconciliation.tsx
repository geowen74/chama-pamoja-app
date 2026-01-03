import { useState } from 'react'
import { useDataStore } from '../../store/dataStore'
import {
  Calculator,
  Wallet,
  HandCoins,
  Receipt,
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle,
  Scale,
  Download,
  Filter,
  RefreshCw,
} from 'lucide-react'

export default function Reconciliation() {
  const { contributions, loans, expenses, fines } = useDataStore()
  const [dateRange, setDateRange] = useState('all')
  const [showBreakdown, setShowBreakdown] = useState(false)

  // Calculate totals
  const totalContributions = contributions
    .filter(c => c.status === 'confirmed')
    .reduce((sum, c) => sum + c.amount, 0)

  const totalFines = fines
    .filter(f => f.status === 'paid')
    .reduce((sum, f) => sum + f.amount, 0)

  const totalDeposits = totalContributions + totalFines

  // Withdrawals (Loans disbursed)
  const totalLoansDisbursed = loans
    .filter(l => l.status === 'disbursed' || l.status === 'repaying')
    .reduce((sum, l) => sum + l.principalAmount, 0)

  // Loan repayments received (money coming back)
  const totalLoanRepayments = loans.reduce((sum, loan) => {
    const repayments = loan.repayments?.reduce((r, rep) => r + rep.amount, 0) || 0
    return sum + repayments
  }, 0)

  // Total expenses
  const totalExpenses = expenses
    .filter(e => e.status === 'approved')
    .reduce((sum, e) => sum + e.amount, 0)

  const totalWithdrawals = totalLoansDisbursed + totalExpenses

  // Outstanding loans (money still owed to the group)
  const outstandingLoans = loans
    .filter(l => l.status === 'disbursed' || l.status === 'repaying')
    .reduce((sum, l) => {
      const repaid = l.repayments?.reduce((r, rep) => r + rep.amount, 0) || 0
      return sum + (l.principalAmount + (l.principalAmount * l.interestRate / 100) - repaid)
    }, 0)

  // Cash in hand = Deposits + Loan Repayments - Withdrawals
  const cashInHand = totalDeposits + totalLoanRepayments - totalWithdrawals

  // Total group wealth = Cash in hand + Outstanding loans (money owed)
  const totalGroupWealth = cashInHand + outstandingLoans

  // Pending items
  const pendingContributions = contributions.filter(c => c.status === 'pending').length
  const pendingLoans = loans.filter(l => l.status === 'pending').length
  const pendingExpenses = expenses.filter(e => e.status === 'pending').length
  const unpaidFines = fines.filter(f => f.status === 'pending').length

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reconciliation</h1>
          <p className="text-gray-500 mt-1">Overview of all group finances and cash position</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-field text-sm"
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="btn-secondary flex items-center gap-2">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Main Balance Card */}
      <div className="glass-card rounded-2xl p-8 bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl">
              <Scale size={28} />
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium">Total Group Wealth</p>
              <p className="text-xs text-white/60">Cash + Outstanding Loans</p>
            </div>
          </div>
          <button 
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
          >
            <RefreshCw size={20} />
          </button>
        </div>
        <div className="text-4xl font-bold mb-6">{formatCurrency(totalGroupWealth)}</div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
              <Wallet size={16} />
              Cash in Hand
            </div>
            <div className="text-xl font-bold">{formatCurrency(cashInHand)}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
              <HandCoins size={16} />
              Outstanding Loans
            </div>
            <div className="text-xl font-bold">{formatCurrency(outstandingLoans)}</div>
          </div>
        </div>
      </div>

      {/* Income vs Expenditure Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Money In */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30 flex items-center justify-center">
              <ArrowUpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Total Money In</h3>
              <p className="text-xs text-gray-500">All deposits received</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-emerald-600 mb-4">
            {formatCurrency(totalDeposits + totalLoanRepayments)}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-600">
                <Wallet size={16} className="text-violet-500" />
                <span className="text-sm">Contributions</span>
              </div>
              <span className="font-semibold text-gray-900">{formatCurrency(totalContributions)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-600">
                <AlertTriangle size={16} className="text-orange-500" />
                <span className="text-sm">Fines Collected</span>
              </div>
              <span className="font-semibold text-gray-900">{formatCurrency(totalFines)}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 text-gray-600">
                <HandCoins size={16} className="text-blue-500" />
                <span className="text-sm">Loan Repayments</span>
              </div>
              <span className="font-semibold text-gray-900">{formatCurrency(totalLoanRepayments)}</span>
            </div>
          </div>
        </div>

        {/* Money Out */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 shadow-lg shadow-rose-500/30 flex items-center justify-center">
              <ArrowDownCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Total Money Out</h3>
              <p className="text-xs text-gray-500">All withdrawals made</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-rose-600 mb-4">
            {formatCurrency(totalWithdrawals)}
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-600">
                <HandCoins size={16} className="text-blue-500" />
                <span className="text-sm">Loans Disbursed</span>
              </div>
              <span className="font-semibold text-gray-900">{formatCurrency(totalLoansDisbursed)}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 text-gray-600">
                <Receipt size={16} className="text-purple-500" />
                <span className="text-sm">Expenses</span>
              </div>
              <span className="font-semibold text-gray-900">{formatCurrency(totalExpenses)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Items */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30 flex items-center justify-center">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Pending Actions</h3>
            <p className="text-xs text-gray-500">Items awaiting approval or payment</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-violet-600">{pendingContributions}</div>
            <div className="text-xs text-gray-600 mt-1">Pending Contributions</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{pendingLoans}</div>
            <div className="text-xs text-gray-600 mt-1">Pending Loans</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{pendingExpenses}</div>
            <div className="text-xs text-gray-600 mt-1">Pending Expenses</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{unpaidFines}</div>
            <div className="text-xs text-gray-600 mt-1">Unpaid Fines</div>
          </div>
        </div>
      </div>

      {/* Financial Formula Explanation */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">How We Calculate</h3>
            <p className="text-xs text-gray-500">Understanding your group's finances</p>
          </div>
        </div>
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0">+</div>
            <div>
              <p className="text-sm font-medium text-gray-900">Money In (Deposits)</p>
              <p className="text-xs text-gray-600">Contributions + Fines + Loan Repayments</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold shrink-0">−</div>
            <div>
              <p className="text-sm font-medium text-gray-900">Money Out (Withdrawals)</p>
              <p className="text-xs text-gray-600">Loans Disbursed + Expenses</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-violet-500 text-white flex items-center justify-center text-xs font-bold shrink-0">=</div>
            <div>
              <p className="text-sm font-medium text-gray-900">Cash in Hand</p>
              <p className="text-xs text-gray-600">Money available for lending or investment</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0">+</div>
            <div>
              <p className="text-sm font-medium text-gray-900">Outstanding Loans</p>
              <p className="text-xs text-gray-600">Money owed to the group (principal + interest)</p>
            </div>
          </div>
          <div className="border-t border-purple-200 pt-3 mt-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white flex items-center justify-center text-xs font-bold shrink-0">Σ</div>
              <div>
                <p className="text-sm font-medium text-gray-900">Total Group Wealth</p>
                <p className="text-xs text-gray-600">Cash in Hand + Outstanding Loans = Total assets</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty state guide */}
      {totalDeposits === 0 && totalWithdrawals === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30 flex items-center justify-center mx-auto mb-4">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Financial Data Yet</h3>
            <p className="text-gray-500 mb-6">Start recording your group's financial transactions to see the reconciliation.</p>
            <div className="text-left bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 mb-3">📊 How to use Reconciliation:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">1.</span>
                  <span>Record member contributions under Deposits → Contributions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">2.</span>
                  <span>Process loan applications under Withdrawals → Loans</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">3.</span>
                  <span>Track group spending under Withdrawals → Expenses</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600">4.</span>
                  <span>This page automatically calculates your group's financial position</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
