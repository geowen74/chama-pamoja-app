import { useState, useRef } from 'react'
import { X, Upload, FileText, Image, Trash2, Shield } from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import { useAuthStore } from '../../store/authStore'
import { useNotificationStore, createActivityNotification } from '../../store/notificationStore'
import { useSecurityStore } from '../../store/securityStore'
import TransactionPinModal from './TransactionPinModal'

interface UploadedFile {
  name: string
  size: number
  type: string
  dataUrl: string
}

interface AddExpenseModalProps {
  onClose: () => void
}

export default function AddExpenseModal({ onClose }: AddExpenseModalProps) {
  const { addExpense } = useDataStore()
  const { user } = useAuthStore()
  const { addNotification } = useNotificationStore()
  const { requiresTransactionPin, logFinancialTransaction, isTransactionPinSet } = useSecurityStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showPinModal, setShowPinModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Operations',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  })
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)

  const categories = ['Banking', 'Operations', 'Events', 'Welfare', 'Other']

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB

    Array.from(files).forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        alert(`File type not supported: ${file.name}. Please upload images or PDFs.`)
        return
      }
      if (file.size > maxSize) {
        alert(`File too large: ${file.name}. Maximum size is 5MB.`)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedFiles(prev => [...prev, {
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl: e.target?.result as string
        }])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const processExpense = () => {
    const amount = parseFloat(formData.amount)
    const addedBy = `${user?.firstName} ${user?.lastName}`

    addExpense({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      amount,
      date: formData.date,
      paidBy: user?.id || '1',
      paidByName: addedBy,
      status: 'pending',
      documents: uploadedFiles.length > 0 ? uploadedFiles : undefined,
    })

    // Log financial transaction
    logFinancialTransaction(
      'EXPENSE',
      amount,
      `Expense recorded: ${formData.title}`,
      user?.id || 'unknown',
      addedBy
    )

    // Add notification for new expense
    addNotification(createActivityNotification.expenseAdded(formData.title, amount, addedBy))
    
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const amount = parseFloat(formData.amount)

    // Check if transaction PIN verification is required for large amounts
    if (isTransactionPinSet && requiresTransactionPin(amount)) {
      setShowPinModal(true)
      return
    }

    processExpense()
  }

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Record Expense</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Expense Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder="e.g., Meeting Venue"
              required
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input min-h-[80px]"
              placeholder="e.g., Rental fee for community hall used during December monthly meeting."
            />
          </div>
          <div>
            <label className="label">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input"
            >
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Amount (KES)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="input"
              placeholder="e.g., 15000"
              required
            />
          </div>
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="input"
              required
            />
          </div>

          {/* Document Upload Section */}
          <div>
            <label className="label">Supporting Documents</label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                dragActive 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary-600 font-medium hover:text-primary-700"
                  >
                    Click to upload
                  </button>
                  <span className="text-gray-500"> or drag and drop</span>
                </div>
                <p className="text-xs text-gray-400">
                  PNG, JPG, GIF or PDF (max 5MB each)
                </p>
              </div>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      file.type.startsWith('image/') 
                        ? 'bg-blue-100' 
                        : 'bg-red-100'
                    }`}>
                      {file.type.startsWith('image/') ? (
                        <Image className="w-5 h-5 text-blue-600" />
                      ) : (
                        <FileText className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="p-2 hover:bg-red-100 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Security indicator for large transactions */}
          {isTransactionPinSet && parseFloat(formData.amount || '0') >= 50000 && (
            <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-xl text-sm text-purple-700">
              <Shield size={16} />
              <span>Transaction PIN required for amounts ≥ KES 50,000</span>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              Record Expense
            </button>
          </div>
        </form>
      </div>
    </div>

    {/* Transaction PIN Modal */}
    <TransactionPinModal
      isOpen={showPinModal}
      onClose={() => setShowPinModal(false)}
      onSuccess={processExpense}
      title="Authorize Expense"
      description="Enter your Transaction PIN to authorize this large expense"
      amount={parseFloat(formData.amount || '0')}
    />
    </>
  )
}
