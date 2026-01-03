import { useState } from 'react'
import { X } from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import { useAuthStore } from '../../store/authStore'

interface AddProjectModalProps {
  onClose: () => void
}

export default function AddProjectModal({ onClose }: AddProjectModalProps) {
  const { addProject } = useDataStore()
  const { user } = useAuthStore()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'business' as const,
    status: 'planning' as const,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    totalInvestment: '',
    expectedIncome: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const investment = parseFloat(formData.totalInvestment) || 0
    const expected = parseFloat(formData.expectedIncome) || 0
    const roi = investment > 0 ? ((expected - investment) / investment) * 100 : 0
    
    addProject({
      name: formData.name,
      description: formData.description,
      category: formData.category,
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      totalInvestment: investment,
      totalBorrowed: 0,
      currentValue: investment,
      expectedIncome: expected,
      actualIncome: 0,
      roi: roi,
      members: [],
      milestones: [],
      transactions: [],
      createdBy: `${user?.firstName} ${user?.lastName}`,
      createdAt: new Date().toISOString(),
    })
    
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Create New Project</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Project Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="e.g., Land Investment - Kitengela"
              required
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input min-h-[100px]"
              placeholder="e.g., Group investment in a quarter-acre plot in Kitengela for appreciation and potential development. Expected to yield 50% returns within 2 years."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as typeof formData.category })}
                className="input"
              >
                <option value="real_estate">Real Estate</option>
                <option value="agriculture">Agriculture</option>
                <option value="business">Business</option>
                <option value="stocks">Stocks & Shares</option>
                <option value="savings">Savings</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as typeof formData.status })}
                className="input"
              >
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">End Date (Optional)</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Total Investment (KES)</label>
            <input
              type="number"
              value={formData.totalInvestment}
              onChange={(e) => setFormData({ ...formData, totalInvestment: e.target.value })}
              className="input"
              placeholder="e.g., 500000"
              required
            />
          </div>

          <div>
            <label className="label">Expected Income (KES)</label>
            <input
              type="number"
              value={formData.expectedIncome}
              onChange={(e) => setFormData({ ...formData, expectedIncome: e.target.value })}
              className="input"
              placeholder="e.g., 750000"
              required
            />
          </div>

          {formData.totalInvestment && formData.expectedIncome && (
            <div className="p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl">
              <div className="text-sm text-gray-600 mb-1">Projected ROI</div>
              <div className={`text-2xl font-bold ${
                parseFloat(formData.expectedIncome) >= parseFloat(formData.totalInvestment) 
                  ? 'text-success-600' 
                  : 'text-danger-600'
              }`}>
                {parseFloat(formData.totalInvestment) > 0 
                  ? (((parseFloat(formData.expectedIncome) - parseFloat(formData.totalInvestment)) / parseFloat(formData.totalInvestment)) * 100).toFixed(1)
                  : 0}%
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
