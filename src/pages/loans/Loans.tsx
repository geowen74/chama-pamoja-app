import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useDataStore } from '../../store/dataStore'
import {
  Search,
  Plus,
  Filter,
  Download,
  HandCoins,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertCircle,
  Briefcase,
  UserCircle,
  FolderKanban,
} from 'lucide-react'

export default function Loans() {
  const { loans, loanTypes } = useDataStore()
  const [searchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Set filters from URL params
  useEffect(() => {
    const typeParam = searchParams.get('type')
    const statusParam = searchParams.get('status')
    if (typeParam === 'project' || typeParam === 'individual') {
      setCategoryFilter(typeParam)
    }
    if (statusParam) {
      setStatusFilter(statusParam)
    }
  }, [searchParams])

  const filteredLoans = loans.filter((loan) => {
    const matchesSearch = loan.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (loan.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter
    const matchesType = typeFilter === 'all' || loan.loanTypeId === typeFilter
    const matchesCategory = categoryFilter === 'all' || loan.loanCategory === categoryFilter
    return matchesSearch && matchesStatus && matchesType && matchesCategory
  })

  const totalDisbursed = loans
    .filter(l => ['disbursed', 'repaying', 'completed'].includes(l.status))
    .reduce((sum, l) => sum + l.principalAmount, 0)

  const totalOutstanding = loans
    .filter(l => ['disbursed', 'repaying'].includes(l.status))
    .reduce((sum, l) => sum + l.balance, 0)

  const pendingLoans = loans.filter(l => l.status === 'pending').length

  const statusConfig = {
    pending: { icon: Clock, color: 'bg-warning-100 text-warning-600' },
    approved: { icon: CheckCircle, color: 'bg-blue-100 text-blue-600' },
    disbursed: { icon: TrendingUp, color: 'bg-primary-100 text-primary-600' },
    repaying: { icon: TrendingUp, color: 'bg-primary-100 text-primary-600' },
    completed: { icon: CheckCircle, color: 'bg-success-100 text-success-600' },
    defaulted: { icon: AlertCircle, color: 'bg-danger-100 text-danger-600' },
    rejected: { icon: XCircle, color: 'bg-danger-100 text-danger-600' },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Loans</h1>
          <p className="text-gray-500 mt-1">Manage loan applications and repayments</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary flex items-center gap-2">
            <Download size={18} />
            Export
          </button>
          <Link to="/loans/apply" className="btn btn-primary flex items-center gap-2">
            <Plus size={18} />
            Apply for Loan
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Disbursed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                KES {totalDisbursed.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25">
              <HandCoins className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                KES {totalOutstanding.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{pendingLoans} loans</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Clock className="w-6 h-6 text-white" />
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
              placeholder="Search by member name..."
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
              <option value="disbursed">Disbursed</option>
              <option value="repaying">Repaying</option>
              <option value="completed">Completed</option>
              <option value="defaulted">Defaulted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="all">All Types</option>
            {loanTypes.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="all">All Categories</option>
            <option value="project">Project Loans</option>
            <option value="individual">Individual Loans</option>
          </select>
        </div>
      </div>

      {/* Loans list */}
      <div className="space-y-4">
        {filteredLoans.map((loan) => {
          const status = statusConfig[loan.status]
          const StatusIcon = status.icon
          const progress = loan.totalAmount > 0 ? (loan.amountPaid / loan.totalAmount) * 100 : 0
          const isProjectLoan = loan.loanCategory === 'project'

          return (
            <Link
              key={loan.id}
              to={`/loans/${loan.id}`}
              className="card block hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isProjectLoan ? 'bg-blue-100' : 'bg-primary-100'}`}>
                      {isProjectLoan ? (
                        <Briefcase size={20} className="text-blue-600" />
                      ) : (
                        <UserCircle size={20} className="text-primary-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{loan.memberName}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        {loan.loanTypeName}
                        {isProjectLoan && loan.projectName && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">
                            <FolderKanban size={12} />
                            {loan.projectName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <div className="text-xs text-gray-500">Principal</div>
                    <div className="font-semibold text-gray-900">
                      KES {loan.principalAmount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Total Amount</div>
                    <div className="font-semibold text-gray-900">
                      KES {loan.totalAmount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Balance</div>
                    <div className="font-semibold text-gray-900">
                      KES {loan.balance.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Duration</div>
                    <div className="font-semibold text-gray-900">{loan.duration} months</div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium capitalize ${status.color}`}>
                    <StatusIcon size={14} />
                    {loan.status}
                  </span>
                </div>
              </div>

              {['repaying', 'disbursed'].includes(loan.status) && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-500">Repayment Progress</span>
                    <span className="font-medium text-gray-900">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Paid: KES {loan.amountPaid.toLocaleString()}</span>
                    <span>Due: {loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              )}
            </Link>
          )
        })}
      </div>

      {filteredLoans.length === 0 && (
        <div className="card text-center py-12">
          <HandCoins size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No loans found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'No loan applications yet'}
          </p>
          <Link to="/loans/apply" className="btn btn-primary inline-flex items-center gap-2">
            <Plus size={18} />
            Apply for Loan
          </Link>
        </div>
      )}
    </div>
  )
}
