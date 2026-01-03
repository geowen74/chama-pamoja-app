import { useState } from 'react'
import { X, Shield } from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import { useNotificationStore, createActivityNotification } from '../../store/notificationStore'
import { useSecurityStore } from '../../store/securityStore'
import { useAuthStore } from '../../store/authStore'
import TransactionPinModal from './TransactionPinModal'

interface AddContributionModalProps {
  onClose: () => void
}

export default function AddContributionModal({ onClose }: AddContributionModalProps) {
  const { addContribution, members, contributionTypes } = useDataStore()
  const { addNotification } = useNotificationStore()
  const { requiresTransactionPin, logFinancialTransaction, isTransactionPinSet } = useSecurityStore()
  const { user } = useAuthStore()
  const [showPinModal, setShowPinModal] = useState(false)
  const [formData, setFormData] = useState({
    memberId: '',
    contributionTypeId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    method: 'mpesa' as const,
    reference: '',
    projectSource: '',
    depositorName: '',
  })

  const selectedMember = members.find(m => m.id === formData.memberId)
  const selectedType = contributionTypes.find(t => t.id === formData.contributionTypeId)

  const processContribution = () => {
    if (!selectedMember || !selectedType) return

    const memberName = `${selectedMember.firstName} ${selectedMember.lastName}`
    const amount = parseFloat(formData.amount)

    addContribution({
      memberId: formData.memberId,
      memberName,
      contributionTypeId: formData.contributionTypeId,
      contributionTypeName: selectedType.name,
      amount,
      date: formData.date,
      method: formData.method,
      reference: formData.reference || undefined,
      status: 'pending',
    })

    // Log financial transaction
    logFinancialTransaction(
      'CONTRIBUTION',
      amount,
      `Contribution recorded for ${memberName}`,
      user?.id || 'unknown',
      `${user?.firstName} ${user?.lastName}` || 'Unknown User'
    )

    // Add notification for pending contribution
    addNotification(createActivityNotification.contributionPending(memberName, amount))
    
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedMember || !selectedType) return

    const amount = parseFloat(formData.amount)

    // Validate minimum amount
    if (amount < 500) {
      alert('Minimum contribution amount is KES 500')
      return
    }

    // Check if transaction PIN verification is required for large amounts
    if (isTransactionPinSet && requiresTransactionPin(amount)) {
      setShowPinModal(true)
      return
    }

    processContribution()
  }

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-lg font-semibold text-gray-900">Record Contribution</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Security indicator for large transactions */}
          {isTransactionPinSet && parseFloat(formData.amount || '0') >= 50000 && (
            <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-xl text-sm text-purple-700">
              <Shield size={16} />
              <span>Transaction PIN required for amounts ≥ KES 50,000</span>
            </div>
          )}
          <div>
            <label className="label text-xs">Member</label>
            <select
              value={formData.memberId}
              onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
              className="input py-2 text-sm"
              required
            >
              <option value="">Select a member</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.firstName} {member.lastName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label text-xs">Contribution Type</label>
            <select
              value={formData.contributionTypeId}
              onChange={(e) => {
                const type = contributionTypes.find(t => t.id === e.target.value)
                setFormData({ 
                  ...formData, 
                  contributionTypeId: e.target.value,
                  amount: type ? type.amount.toString() : formData.amount
                })
              }}
              className="input py-2 text-sm"
              required
            >
              <option value="">Select type</option>
              {contributionTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} (KES {type.amount.toLocaleString()})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label text-xs">Amount (KES) <span className="text-gray-400">(Min: 500)</span></label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="input py-2 text-sm"
                placeholder="Min 500"
                min="500"
                required
              />
            </div>
            <div>
              <label className="label text-xs">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input py-2 text-sm"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label text-xs">Payment Method</label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value as typeof formData.method })}
                className="input py-2 text-sm"
              >
                <option value="mpesa">M-PESA</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label className="label text-xs">Reference</label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="input py-2 text-sm"
                placeholder="MPESA code"
              />
            </div>
          </div>
          <div>
            <label className="label text-xs">Daily Income / Project Source</label>
            <input
              type="text"
              value={formData.projectSource}
              onChange={(e) => setFormData({ ...formData, projectSource: e.target.value })}
              className="input py-2 text-sm"
              placeholder="e.g., Rental Income, Shop Sales"
            />
          </div>
          <div>
            <label className="label text-xs">Depositor Name</label>
            <input
              type="text"
              value={formData.depositorName}
              onChange={(e) => setFormData({ ...formData, depositorName: e.target.value })}
              className="input py-2 text-sm"
              placeholder="Name of person depositing"
            />
          </div>

          <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1 py-2 text-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1 py-2 text-sm">
              Record Contribution
            </button>
          </div>
        </form>
      </div>
    </div>

    {/* Transaction PIN Modal */}
    <TransactionPinModal
      isOpen={showPinModal}
      onClose={() => setShowPinModal(false)}
      onSuccess={processContribution}
      title="Authorize Contribution"
      description="Enter your Transaction PIN to authorize this large contribution"
      amount={parseFloat(formData.amount || '0')}
    />
    </>
  )
}
