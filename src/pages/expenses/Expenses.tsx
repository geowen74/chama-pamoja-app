import { useState } from 'react'
import { useDataStore } from '../../store/dataStore'
import { useAuthStore } from '../../store/authStore'
import { usePermission } from '../../utils/permissions'
import {
  Search,
  Plus,
  Filter,
  Download,
  Receipt,
  CheckCircle,
  Clock,
  XCircle,
  ShieldCheck,
} from 'lucide-react'
import AddExpenseModal from '../../components/modals/AddExpenseModal'

export default function Expenses() {
  const { expenses, approveExpense } = useDataStore()
  const { user } = useAuthStore()
  const canAddExpenses = usePermission('add_expenses')
  const canApproveExpenses = usePermission('approve_expenses')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
  const pendingExpenses = filteredExpenses.filter(e => e.status === 'pending')
  const approvedExpenses = filteredExpenses.filter(e => e.status === 'approved' || e.status === 'paid')

  const handleApprove = (id: string) => {
    if (canApproveExpenses) {
      approveExpense(id, user?.id || '1', `${user?.firstName} ${user?.lastName}`)
    }
  }

  const statusConfig = {
    pending: { icon: Clock, color: 'bg-warning-100 text-warning-600' },
    approved: { icon: CheckCircle, color: 'bg-blue-100 text-blue-600' },
    rejected: { icon: XCircle, color: 'bg-danger-100 text-danger-600' },
    paid: { icon: CheckCircle, color: 'bg-success-100 text-success-600' },
  }

  const categoryColors: Record<string, string> = {
    'Banking': 'bg-blue-100 text-blue-600',
    'Operations': 'bg-purple-100 text-purple-600',
    'Events': 'bg-orange-100 text-orange-600',
    'Welfare': 'bg-green-100 text-green-600',
    'Other': 'bg-gray-100 text-gray-600',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-500 mt-1">Track and manage group expenses</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary flex items-center gap-2">
            <Download size={18} />
            Export
          </button>
          {canAddExpenses && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              Record Expense
            </button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                KES {totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Receipt className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {pendingExpenses.length} expenses
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved/Paid</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                KES {approvedExpenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-auto"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Expenses table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header px-6 py-4">Expense</th>
                <th className="table-header px-6 py-4">Category</th>
                <th className="table-header px-6 py-4">Amount</th>
                <th className="table-header px-6 py-4">Date</th>
                <th className="table-header px-6 py-4">Paid By</th>
                <th className="table-header px-6 py-4">Status</th>
                <th className="table-header px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredExpenses.map((expense) => {
                const status = statusConfig[expense.status]
                const StatusIcon = status.icon
                return (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="font-medium text-gray-900">{expense.title}</div>
                      <div className="text-xs text-gray-500">{expense.description}</div>
                    </td>
                    <td className="table-cell">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        categoryColors[expense.category] || categoryColors['Other']
                      }`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="table-cell font-semibold text-gray-900">
                      KES {expense.amount.toLocaleString()}
                    </td>
                    <td className="table-cell text-gray-600">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="table-cell text-gray-600">{expense.paidByName}</td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${status.color}`}>
                        <StatusIcon size={14} />
                        {expense.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      {expense.status === 'pending' && canApproveExpenses && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(expense.id)}
                            className="text-success-600 hover:text-success-700 text-sm font-medium flex items-center gap-1"
                          >
                            <ShieldCheck size={14} />
                            Approve
                          </button>
                          <button className="text-danger-600 hover:text-danger-700 text-sm font-medium">
                            Reject
                          </button>
                        </div>
                      )}
                      {expense.status === 'pending' && !canApproveExpenses && (
                        <span className="text-xs text-gray-500 italic">
                          Awaiting approval
                        </span>
                      )}
                      {expense.approvedByName && (
                        <span className="text-xs text-gray-500">
                          By {expense.approvedByName}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredExpenses.length === 0 && (
          <div className="text-center py-12">
            <Receipt size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Record your first expense'}
            </p>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <AddExpenseModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  )
}
