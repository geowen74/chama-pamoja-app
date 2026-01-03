import { useState, useMemo } from 'react'
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  DollarSign,
  Clock,
  CheckCircle,
  Calendar,
  MoreVertical,
  Eye,
  Trash2
} from 'lucide-react'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { usePermission } from '@/utils/permissions'
import AddFineModal from '@/components/modals/AddFineModal'
import { format, isThisMonth } from 'date-fns'

export default function Fines() {
  const { fines, fineTypes, deleteFine, updateFine } = useDataStore()
  useAuthStore()
  const canAddFines = usePermission('add_fines')
  const canWaiveFines = usePermission('waive_fines')
  const canDeleteFines = usePermission('delete_fines')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedFine, setSelectedFine] = useState<string | null>(null)

  // Calculate stats
  const stats = useMemo(() => {
    const totalFinesPaid = fines
      .filter(f => f.status === 'paid')
      .reduce((sum, f) => sum + f.amount, 0)
    
    const outstandingFines = fines
      .filter(f => f.status === 'pending')
      .reduce((sum, f) => sum + f.amount, 0)
    
    const thisMonthFines = fines
      .filter(f => isThisMonth(new Date(f.date)))
      .reduce((sum, f) => sum + f.amount, 0)
    
    const paymentCount = fines.filter(f => f.status === 'paid').length

    return {
      totalFinesPaid,
      outstandingFines,
      thisMonthFines,
      paymentCount
    }
  }, [fines])

  // Filter fines
  const filteredFines = useMemo(() => {
    return fines.filter(fine => {
      const matchesSearch = fine.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fine.fineTypeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (fine.reference && fine.reference.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesStatus = statusFilter === 'all' || fine.status === statusFilter
      const matchesType = typeFilter === 'all' || fine.fineTypeId === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [fines, searchTerm, statusFilter, typeFilter])

  const handleMarkAsPaid = (fineId: string) => {
    updateFine(fineId, { status: 'paid' })
    setSelectedFine(null)
  }

  const handleWaiveFine = (fineId: string) => {
    updateFine(fineId, { status: 'waived' })
    setSelectedFine(null)
  }

  const handleDeleteFine = (fineId: string) => {
    if (window.confirm('Are you sure you want to delete this fine record?')) {
      deleteFine(fineId)
      setSelectedFine(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Paid
          </span>
        )
      case 'pending':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        )
      case 'waived':
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Waived
          </span>
        )
      default:
        return null
    }
  }

  const getMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      'cash': 'bg-blue-100 text-blue-700',
      'mpesa': 'bg-green-100 text-green-700',
      'bank_transfer': 'bg-purple-100 text-purple-700',
      'cheque': 'bg-orange-100 text-orange-700'
    }
    const labels: Record<string, string> = {
      'cash': 'Cash',
      'mpesa': 'M-Pesa',
      'bank_transfer': 'Bank Transfer',
      'cheque': 'Cheque'
    }
    return (
      <span className={`px-2 py-1 ${colors[method] || 'bg-gray-100 text-gray-700'} rounded-full text-xs font-medium`}>
        {labels[method] || method}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fines</h1>
          <p className="text-gray-600">Record and manage member fines</p>
        </div>
        {canAddFines && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25"
          >
            <Plus className="w-5 h-5" />
            Record Fine
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Fines Paid</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                KES {stats.totalFinesPaid.toLocaleString()}
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
              <p className="text-sm font-medium text-gray-600">Outstanding Fines</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                KES {stats.outstandingFines.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                KES {stats.thisMonthFines.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Payment Count</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.paymentCount}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by member name, fine type, or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="waived">Waived</option>
              </select>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Types</option>
              {fineTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Fines Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Fine Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFines.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <AlertTriangle className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-gray-500 font-medium">No fines recorded yet</p>
                      <p className="text-gray-400 text-sm">Fine records will appear here</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFines.map((fine) => (
                  <tr key={fine.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-medium">
                          {fine.memberName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{fine.memberName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{fine.fineTypeName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">
                        KES {fine.amount.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600">
                        {format(new Date(fine.date), 'MMM dd, yyyy')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getMethodBadge(fine.method)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(fine.status)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600 text-sm">
                        {fine.reference || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative">
                        <button
                          onClick={() => setSelectedFine(selectedFine === fine.id ? null : fine.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-500" />
                        </button>
                        
                        {selectedFine === fine.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-10">
                            {fine.notes && (
                              <button
                                onClick={() => {
                                  alert(`Notes: ${fine.notes}`)
                                  setSelectedFine(null)
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Eye className="w-4 h-4" />
                                View Notes
                              </button>
                            )}
                            {canWaiveFines && fine.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleMarkAsPaid(fine.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-green-600 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Mark as Paid
                                </button>
                                <button
                                  onClick={() => handleWaiveFine(fine.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-yellow-600 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <AlertTriangle className="w-4 h-4" />
                                  Waive Fine
                                </button>
                              </>
                            )}
                            {canDeleteFines && (
                              <button
                                onClick={() => handleDeleteFine(fine.id)}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Fine Modal */}
      <AddFineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  )
}
