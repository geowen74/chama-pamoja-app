import { useParams, useNavigate } from 'react-router-dom'
import { useDataStore } from '../../store/dataStore'
import { useAuthStore } from '../../store/authStore'
import { useNotificationStore, createActivityNotification } from '../../store/notificationStore'
import {
  ArrowLeft,
  HandCoins,
  User,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertCircle,
  Plus,
} from 'lucide-react'
import { useState } from 'react'

export default function LoanDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { loans, approveLoan, rejectLoan, addLoanRepayment } = useDataStore()
  const { user } = useAuthStore()
  const { addNotification } = useNotificationStore()
  const [showRepaymentModal, setShowRepaymentModal] = useState(false)
  const [repaymentAmount, setRepaymentAmount] = useState('')
  const [repaymentMethod, setRepaymentMethod] = useState('mpesa')
  const [repaymentReference, setRepaymentReference] = useState('')

  const loan = loans.find((l) => l.id === id)

  if (!loan) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Loan not found</h2>
        <button onClick={() => navigate('/loans')} className="btn btn-primary mt-4">
          Back to Loans
        </button>
      </div>
    )
  }

  const handleApprove = () => {
    approveLoan(loan.id, user?.firstName + ' ' + user?.lastName || 'Admin')
    // Notify the member that their loan was approved
    addNotification(createActivityNotification.loanApproved(
      loan.memberName,
      loan.principalAmount,
      loan.memberId
    ))
  }

  const handleReject = () => {
    const reason = prompt('Enter rejection reason:')
    if (reason) {
      rejectLoan(loan.id, reason)
      // Notify the member that their loan was rejected
      addNotification(createActivityNotification.loanRejected(
        loan.memberName,
        loan.principalAmount,
        loan.memberId,
        reason
      ))
    }
  }

  const handleAddRepayment = () => {
    if (!repaymentAmount || parseFloat(repaymentAmount) <= 0) return
    
    addLoanRepayment(loan.id, {
      amount: parseFloat(repaymentAmount),
      date: new Date().toISOString().split('T')[0],
      method: repaymentMethod as 'cash' | 'mpesa' | 'bank_transfer' | 'cheque',
      reference: repaymentReference || undefined,
      receivedBy: user?.firstName + ' ' + user?.lastName || 'Admin',
    })
    
    setShowRepaymentModal(false)
    setRepaymentAmount('')
    setRepaymentReference('')
  }

  const statusConfig = {
    pending: { icon: Clock, color: 'bg-warning-100 text-warning-600', label: 'Pending Approval' },
    approved: { icon: CheckCircle, color: 'bg-blue-100 text-blue-600', label: 'Approved' },
    disbursed: { icon: TrendingUp, color: 'bg-primary-100 text-primary-600', label: 'Disbursed' },
    repaying: { icon: TrendingUp, color: 'bg-primary-100 text-primary-600', label: 'Repaying' },
    completed: { icon: CheckCircle, color: 'bg-success-100 text-success-600', label: 'Completed' },
    defaulted: { icon: AlertCircle, color: 'bg-danger-100 text-danger-600', label: 'Defaulted' },
    rejected: { icon: XCircle, color: 'bg-danger-100 text-danger-600', label: 'Rejected' },
  }

  const status = statusConfig[loan.status]
  const StatusIcon = status.icon
  const progress = loan.totalAmount > 0 ? (loan.amountPaid / loan.totalAmount) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/loans')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Loan Details</h1>
            <p className="text-gray-500">Application #{loan.id}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${status.color}`}>
          <StatusIcon size={18} />
          {status.label}
        </span>
      </div>

      {/* Loan summary */}
      <div className="card">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-primary-100 rounded-xl">
            <HandCoins size={32} className="text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{loan.loanTypeName}</h2>
            <p className="text-gray-500">Applied by {loan.memberName}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-gray-500">Principal Amount</div>
            <div className="text-xl font-bold text-gray-900">
              KES {loan.principalAmount.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Interest ({loan.interestRate}%)</div>
            <div className="text-xl font-bold text-gray-900">
              KES {loan.interestAmount.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Total Amount</div>
            <div className="text-xl font-bold text-gray-900">
              KES {loan.totalAmount.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Monthly Payment</div>
            <div className="text-xl font-bold text-gray-900">
              KES {loan.monthlyPayment.toLocaleString()}
            </div>
          </div>
        </div>

        {['repaying', 'disbursed', 'completed'].includes(loan.status) && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Repayment Progress</span>
              <span className="font-semibold text-gray-900">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-success-600">Paid: KES {loan.amountPaid.toLocaleString()}</span>
              <span className="text-warning-600">Balance: KES {loan.balance.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loan details */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Information</h3>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Application Date</span>
              <span className="font-medium text-gray-900">
                {new Date(loan.applicationDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Duration</span>
              <span className="font-medium text-gray-900">{loan.duration} months</span>
            </div>
            {loan.disbursementDate && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Disbursement Date</span>
                <span className="font-medium text-gray-900">
                  {new Date(loan.disbursementDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {loan.dueDate && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Due Date</span>
                <span className="font-medium text-gray-900">
                  {new Date(loan.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {loan.approvedBy && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Approved By</span>
                <span className="font-medium text-gray-900">{loan.approvedBy}</span>
              </div>
            )}
            {loan.rejectionReason && (
              <div className="py-2">
                <span className="text-gray-500">Rejection Reason</span>
                <p className="font-medium text-danger-600 mt-1">{loan.rejectionReason}</p>
              </div>
            )}
          </div>
        </div>

        {/* Guarantors */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Guarantors</h3>
          {loan.guarantors.length > 0 ? (
            <div className="space-y-3">
              {loan.guarantors.map((guarantor) => (
                <div key={guarantor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <User size={18} className="text-primary-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{guarantor.memberName}</div>
                      <div className="text-sm text-gray-500">
                        Guaranteeing KES {guarantor.guaranteedAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                    guarantor.status === 'accepted' ? 'bg-success-100 text-success-600' :
                    guarantor.status === 'pending' ? 'bg-warning-100 text-warning-600' :
                    'bg-danger-100 text-danger-600'
                  }`}>
                    {guarantor.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No guarantors required</p>
          )}
        </div>
      </div>

      {/* Repayments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Repayment History</h3>
          {['repaying', 'disbursed'].includes(loan.status) && (
            <button
              onClick={() => setShowRepaymentModal(true)}
              className="btn btn-primary btn-sm flex items-center gap-2"
            >
              <Plus size={16} />
              Record Repayment
            </button>
          )}
        </div>
        {loan.repayments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header px-4 py-3">Date</th>
                  <th className="table-header px-4 py-3">Amount</th>
                  <th className="table-header px-4 py-3">Method</th>
                  <th className="table-header px-4 py-3">Reference</th>
                  <th className="table-header px-4 py-3">Received By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loan.repayments.map((repayment) => (
                  <tr key={repayment.id}>
                    <td className="table-cell text-gray-900">
                      {new Date(repayment.date).toLocaleDateString()}
                    </td>
                    <td className="table-cell font-semibold text-gray-900">
                      KES {repayment.amount.toLocaleString()}
                    </td>
                    <td className="table-cell text-gray-600 capitalize">
                      {repayment.method.replace('_', ' ')}
                    </td>
                    <td className="table-cell text-gray-600">{repayment.reference || '-'}</td>
                    <td className="table-cell text-gray-600">{repayment.receivedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No repayments recorded yet</p>
        )}
      </div>

      {/* Action buttons */}
      {loan.status === 'pending' && (
        <div className="card flex gap-4">
          <button onClick={handleApprove} className="btn btn-success flex-1">
            <CheckCircle size={18} className="mr-2" />
            Approve Loan
          </button>
          <button onClick={handleReject} className="btn btn-danger flex-1">
            <XCircle size={18} className="mr-2" />
            Reject Loan
          </button>
        </div>
      )}

      {/* Repayment Modal */}
      {showRepaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Record Repayment</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Amount (KES)</label>
                <input
                  type="number"
                  value={repaymentAmount}
                  onChange={(e) => setRepaymentAmount(e.target.value)}
                  className="input"
                  placeholder="Enter amount"
                  max={loan.balance}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Outstanding: KES {loan.balance.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="label">Payment Method</label>
                <select
                  value={repaymentMethod}
                  onChange={(e) => setRepaymentMethod(e.target.value)}
                  className="input"
                >
                  <option value="mpesa">M-PESA</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="label">Reference (Optional)</label>
                <input
                  type="text"
                  value={repaymentReference}
                  onChange={(e) => setRepaymentReference(e.target.value)}
                  className="input"
                  placeholder="e.g., MPESA code"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRepaymentModal(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button onClick={handleAddRepayment} className="btn btn-primary flex-1">
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
