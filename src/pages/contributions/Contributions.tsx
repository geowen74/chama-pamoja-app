import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDataStore } from '../../store/dataStore'
import { useAuthStore } from '../../store/authStore'
import { usePermission } from '../../utils/permissions'
import { useNotificationStore, createActivityNotification } from '../../store/notificationStore'
import {
  Search,
  Plus,
  Filter,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  ShieldCheck,
} from 'lucide-react'
import AddContributionModal from '../../components/modals/AddContributionModal'

export default function Contributions() {
  const { contributions, contributionTypes, confirmContribution } = useDataStore()
  const { user } = useAuthStore()
  const { addNotification } = useNotificationStore()
  const canAddContributions = usePermission('add_contributions')
  const canConfirmContributions = usePermission('confirm_contributions')
  const [searchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  // Update filter when URL params change
  useEffect(() => {
    const status = searchParams.get('status')
    if (status) {
      setStatusFilter(status)
    }
  }, [searchParams])

  const filteredContributions = contributions.filter((contribution) => {
    const matchesSearch = contribution.memberName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || contribution.status === statusFilter
    const matchesType = typeFilter === 'all' || contribution.contributionTypeId === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const totalConfirmed = filteredContributions
    .filter(c => c.status === 'confirmed')
    .reduce((sum, c) => sum + c.amount, 0)

  const totalPending = filteredContributions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + c.amount, 0)

  const statusIcons = {
    confirmed: <CheckCircle size={16} className="text-success-600" />,
    pending: <Clock size={16} className="text-warning-600" />,
    rejected: <XCircle size={16} className="text-danger-600" />,
  }

  const statusColors = {
    confirmed: 'bg-success-100 text-success-600',
    pending: 'bg-warning-100 text-warning-600',
    rejected: 'bg-danger-100 text-danger-600',
  }

  const handleConfirm = (id: string) => {
    if (canConfirmContributions) {
      const contribution = contributions.find(c => c.id === id)
      if (contribution) {
        confirmContribution(id, `${user?.firstName} ${user?.lastName}`)
        // Send notification to the member that their contribution was confirmed
        addNotification(createActivityNotification.contributionConfirmed(
          contribution.memberName,
          contribution.amount,
          contribution.memberId
        ))
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contributions</h1>
          <p className="text-gray-500 mt-1">Manage member contributions</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary flex items-center gap-2">
            <Download size={18} />
            Export
          </button>
          {canAddContributions && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              Record Contribution
            </button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                KES {totalConfirmed.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                KES {totalPending.toLocaleString()}
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
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {filteredContributions.length} contributions
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Calendar className="w-6 h-6 text-white" />
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
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="all">All Types</option>
            {contributionTypes.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Contributions table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header px-6 py-4">Member</th>
                <th className="table-header px-6 py-4">Type</th>
                <th className="table-header px-6 py-4">Amount</th>
                <th className="table-header px-6 py-4">Date</th>
                <th className="table-header px-6 py-4">Method</th>
                <th className="table-header px-6 py-4">Reference</th>
                <th className="table-header px-6 py-4">Status</th>
                <th className="table-header px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredContributions.map((contribution) => (
                <tr key={contribution.id} className="hover:bg-gray-50">
                  <td className="table-cell font-medium text-gray-900">
                    {contribution.memberName}
                  </td>
                  <td className="table-cell text-gray-600">
                    {contribution.contributionTypeName}
                  </td>
                  <td className="table-cell font-semibold text-gray-900">
                    KES {contribution.amount.toLocaleString()}
                  </td>
                  <td className="table-cell text-gray-600">
                    {new Date(contribution.date).toLocaleDateString()}
                  </td>
                  <td className="table-cell text-gray-600 capitalize">
                    {contribution.method.replace('_', ' ')}
                  </td>
                  <td className="table-cell text-gray-600">
                    {contribution.reference || '-'}
                  </td>
                  <td className="table-cell">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                      statusColors[contribution.status]
                    }`}>
                      {statusIcons[contribution.status]}
                      {contribution.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    {contribution.status === 'pending' && canConfirmContributions && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleConfirm(contribution.id)}
                          className="text-success-600 hover:text-success-700 text-sm font-medium flex items-center gap-1"
                        >
                          <ShieldCheck size={14} />
                          Confirm
                        </button>
                        <button className="text-danger-600 hover:text-danger-700 text-sm font-medium">
                          Reject
                        </button>
                      </div>
                    )}
                    {contribution.status === 'pending' && !canConfirmContributions && (
                      <span className="text-xs text-gray-500 italic">
                        Awaiting approval
                      </span>
                    )}
                    {contribution.status === 'confirmed' && (
                      <span className="text-xs text-gray-500">
                        By {contribution.confirmedBy}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredContributions.length === 0 && (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contributions found</h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Record your first contribution'}
            </p>
          </div>
        )}
      </div>

      {/* Add Contribution Modal */}
      {showAddModal && (
        <AddContributionModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  )
}
