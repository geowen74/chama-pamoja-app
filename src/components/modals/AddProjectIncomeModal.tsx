import { useState } from 'react'
import { X } from 'lucide-react'
import { useDataStore } from '../../store/dataStore'

interface AddProjectIncomeModalProps {
  onClose: () => void
}

export default function AddProjectIncomeModal({ onClose }: AddProjectIncomeModalProps) {
  const { addProjectIncome, projects } = useDataStore()
  const [formData, setFormData] = useState({
    projectId: '',
    depositor: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    method: 'cash' as const,
    reference: '',
  })

  const selectedProject = projects?.find(p => p.id === formData.projectId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProject || !formData.depositor) return
    const amount = parseFloat(formData.amount)
    if (amount <= 0) {
      alert('Amount must be greater than 0')
      return
    }
    addProjectIncome && addProjectIncome({
      projectId: formData.projectId,
      depositor: formData.depositor,
      amount,
      date: formData.date,
      method: formData.method,
      reference: formData.reference || undefined,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-lg font-semibold text-gray-900">Record Project Income</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="label text-xs">Project</label>
            <select
              value={formData.projectId}
              onChange={e => setFormData({ ...formData, projectId: e.target.value })}
              className="input py-2 text-sm"
              required
            >
              <option value="">Select a project</option>
              {projects?.map((project: any) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label text-xs">Depositor Name</label>
            <input
              type="text"
              value={formData.depositor}
              onChange={e => setFormData({ ...formData, depositor: e.target.value })}
              className="input py-2 text-sm"
              placeholder="Person depositing money"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label text-xs">Amount (KES)</label>
              <input
                type="number"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                className="input py-2 text-sm"
                min="1"
                required
              />
            </div>
            <div>
              <label className="label text-xs">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="input py-2 text-sm"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label text-xs">Transaction Method</label>
              <select
                value={formData.method}
                onChange={e => setFormData({ ...formData, method: e.target.value as typeof formData.method })}
                className="input py-2 text-sm"
              >
                <option value="cash">Cash</option>
                <option value="mobile_transfer">Mobile Transfer</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="label text-xs">Reference</label>
              <input
                type="text"
                value={formData.reference}
                onChange={e => setFormData({ ...formData, reference: e.target.value })}
                className="input py-2 text-sm"
                placeholder="Transaction reference (optional)"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-2">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1 py-2 text-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1 py-2 text-sm">
              Record Income
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
