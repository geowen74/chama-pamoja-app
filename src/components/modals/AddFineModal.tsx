import { useState } from 'react'
import { X, AlertTriangle, User, DollarSign, Calendar, CreditCard, FileText, Hash } from 'lucide-react'
import { useDataStore } from '@/store/dataStore'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore, createActivityNotification } from '@/store/notificationStore'

interface AddFineModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddFineModal({ isOpen, onClose }: AddFineModalProps) {
  const { members, fineTypes, addFine } = useDataStore()
  const { user } = useAuthStore()
  const { addNotification } = useNotificationStore()
  
  const [formData, setFormData] = useState({
    memberId: '',
    fineTypeId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    method: 'cash' as 'cash' | 'mpesa' | 'bank_transfer' | 'cheque',
    reference: '',
    notes: '',
    status: 'pending' as 'paid' | 'pending' | 'waived'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const selectedFineType = fineTypes.find(t => t.id === formData.fineTypeId)

  // Update amount when fine type changes
  const handleFineTypeChange = (fineTypeId: string) => {
    const fineType = fineTypes.find(t => t.id === fineTypeId)
    setFormData(prev => ({
      ...prev,
      fineTypeId,
      amount: fineType?.amount ? fineType.amount.toString() : prev.amount
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.memberId) {
      newErrors.memberId = 'Please select a member'
    }
    if (!formData.fineTypeId) {
      newErrors.fineTypeId = 'Please select a fine type'
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount'
    }
    if (!formData.date) {
      newErrors.date = 'Please select a date'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const member = members.find(m => m.id === formData.memberId)
    const fineType = fineTypes.find(t => t.id === formData.fineTypeId)

    if (!member || !fineType) return

    const memberName = `${member.firstName} ${member.lastName}`
    const amount = parseFloat(formData.amount)

    addFine({
      memberId: formData.memberId,
      memberName,
      fineTypeId: formData.fineTypeId,
      fineTypeName: fineType.name,
      amount,
      date: formData.date,
      method: formData.method,
      reference: formData.reference || undefined,
      notes: formData.notes || undefined,
      status: formData.status,
      recordedBy: user?.id || '',
      recordedAt: new Date().toISOString()
    })

    // Add notification for fine
    addNotification(createActivityNotification.fineAdded(memberName, amount, fineType.name, formData.memberId))

    // Reset form
    setFormData({
      memberId: '',
      fineTypeId: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      method: 'cash',
      reference: '',
      notes: '',
      status: 'pending'
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Record Fine</h2>
              <p className="text-sm text-gray-500">Add a new fine payment record</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Member Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Member *
              </div>
            </label>
            <select
              value={formData.memberId}
              onChange={(e) => setFormData(prev => ({ ...prev, memberId: e.target.value }))}
              className={`w-full px-4 py-3 border ${errors.memberId ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white appearance-none`}
            >
              <option value="">Select a member</option>
              {members.filter(m => m.status === 'active').map(member => (
                <option key={member.id} value={member.id}>
                  {member.firstName} {member.lastName}
                </option>
              ))}
            </select>
            {errors.memberId && (
              <p className="mt-1 text-sm text-red-600">{errors.memberId}</p>
            )}
          </div>

          {/* Fine Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Fine Type *
              </div>
            </label>
            <select
              value={formData.fineTypeId}
              onChange={(e) => handleFineTypeChange(e.target.value)}
              className={`w-full px-4 py-3 border ${errors.fineTypeId ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white appearance-none`}
            >
              <option value="">Select fine type</option>
              {fineTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name} {type.amount > 0 && `(KES ${type.amount})`}
                </option>
              ))}
            </select>
            {errors.fineTypeId && (
              <p className="mt-1 text-sm text-red-600">{errors.fineTypeId}</p>
            )}
            {selectedFineType && selectedFineType.description && (
              <p className="mt-1 text-sm text-gray-500">{selectedFineType.description}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Amount (KES) *
              </div>
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className={`w-full px-4 py-3 border ${errors.amount ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
              placeholder="e.g., 500"
              min="0"
              step="0.01"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Payment Date *
              </div>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className={`w-full px-4 py-3 border ${errors.date ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date}</p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment Method
              </div>
            </label>
            <select
              value={formData.method}
              onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value as typeof formData.method }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-white appearance-none"
            >
              <option value="cash">Cash</option>
              <option value="mpesa">M-Pesa</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>

          {/* Reference/Receipt Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Reference/Receipt Number
              </div>
            </label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              placeholder="e.g., RCT-001 or M-PESA code"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Status
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="paid"
                  checked={formData.status === 'paid'}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'paid' }))}
                  className="w-4 h-4 text-violet-600 focus:ring-violet-500"
                />
                <span className="text-sm text-gray-700">Paid</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="pending"
                  checked={formData.status === 'pending'}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'pending' }))}
                  className="w-4 h-4 text-violet-600 focus:ring-violet-500"
                />
                <span className="text-sm text-gray-700">Pending</span>
              </label>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notes/Description
              </div>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="e.g., Late by 5 days for January contribution"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/25 font-medium"
            >
              Record Fine
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
