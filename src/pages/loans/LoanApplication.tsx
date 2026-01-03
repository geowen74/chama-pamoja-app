import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDataStore } from '../../store/dataStore'
import { useAuthStore } from '../../store/authStore'
import { useNotificationStore, createActivityNotification } from '../../store/notificationStore'
import { ArrowLeft, Calculator, Info, Briefcase, UserCircle, FolderKanban } from 'lucide-react'

export default function LoanApplication() {
  const navigate = useNavigate()
  const { loanTypes, members, projects, addLoan } = useDataStore()
  const { user } = useAuthStore()
  const { addNotification } = useNotificationStore()
  
  const [formData, setFormData] = useState({
    loanTypeId: '',
    loanCategory: 'individual' as 'individual' | 'project',
    projectId: '',
    principalAmount: '',
    duration: '',
    purpose: '',
    guarantor1: '',
    guarantor2: '',
  })

  const selectedLoanType = loanTypes.find(t => t.id === formData.loanTypeId)
  const selectedProject = projects.find(p => p.id === formData.projectId)
  const otherMembers = members.filter(m => m.userId !== user?.id)

  // Calculate loan details
  const principal = parseFloat(formData.principalAmount) || 0
  const duration = parseInt(formData.duration) || 0
  const interestRate = selectedLoanType?.interestRate || 0
  const interestAmount = (principal * interestRate) / 100
  const totalAmount = principal + interestAmount
  const monthlyPayment = duration > 0 ? totalAmount / duration : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.loanTypeId || !formData.principalAmount || !formData.duration) {
      alert('Please fill in all required fields')
      return
    }

    const guarantors = []
    if (formData.guarantor1) {
      const g1 = members.find(m => m.id === formData.guarantor1)
      if (g1) {
        guarantors.push({
          id: Date.now().toString(),
          loanId: '',
          memberId: g1.id,
          memberName: `${g1.firstName} ${g1.lastName}`,
          guaranteedAmount: totalAmount / 2,
          status: 'pending' as const,
        })
      }
    }
    if (formData.guarantor2) {
      const g2 = members.find(m => m.id === formData.guarantor2)
      if (g2) {
        guarantors.push({
          id: (Date.now() + 1).toString(),
          loanId: '',
          memberId: g2.id,
          memberName: `${g2.firstName} ${g2.lastName}`,
          guaranteedAmount: totalAmount / 2,
          status: 'pending' as const,
        })
      }
    }

    addLoan({
      memberId: user?.id || '1',
      memberName: `${user?.firstName} ${user?.lastName}`,
      loanTypeId: formData.loanTypeId,
      loanTypeName: selectedLoanType?.name || '',
      loanCategory: formData.loanCategory,
      projectId: formData.loanCategory === 'project' ? formData.projectId : undefined,
      projectName: formData.loanCategory === 'project' ? selectedProject?.name : undefined,
      principalAmount: principal,
      interestRate,
      interestAmount,
      totalAmount,
      amountPaid: 0,
      balance: totalAmount,
      duration,
      monthlyPayment,
      disbursementDate: '',
      dueDate: '',
      status: 'pending',
      guarantors,
      repayments: [],
      applicationDate: new Date().toISOString().split('T')[0],
      notes: formData.purpose,
    })

    // Notify authorities about new loan application
    const applicantName = `${user?.firstName} ${user?.lastName}`
    addNotification(createActivityNotification.loanApplication(applicantName, principal))

    navigate('/loans')
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/loans')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Apply for Loan</h1>
          <p className="text-gray-500">Fill in the details below to submit your application</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Loan Category */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label
              className={`cursor-pointer p-4 border-2 rounded-xl transition flex items-center gap-4 ${
                formData.loanCategory === 'individual'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="loanCategory"
                value="individual"
                checked={formData.loanCategory === 'individual'}
                onChange={() => setFormData({ ...formData, loanCategory: 'individual', projectId: '' })}
                className="sr-only"
              />
              <div className="p-3 bg-violet-100 rounded-xl">
                <UserCircle size={24} className="text-violet-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Individual Loan</div>
                <div className="text-sm text-gray-500">Personal loan for member use</div>
              </div>
            </label>
            <label
              className={`cursor-pointer p-4 border-2 rounded-xl transition flex items-center gap-4 ${
                formData.loanCategory === 'project'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="loanCategory"
                value="project"
                checked={formData.loanCategory === 'project'}
                onChange={() => setFormData({ ...formData, loanCategory: 'project' })}
                className="sr-only"
              />
              <div className="p-3 bg-blue-100 rounded-xl">
                <Briefcase size={24} className="text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Project Loan</div>
                <div className="text-sm text-gray-500">Loan to finance a group project</div>
              </div>
            </label>
          </div>

          {/* Project Selection */}
          {formData.loanCategory === 'project' && (
            <div className="mt-4">
              <label className="label">Select Project</label>
              <select
                value={formData.projectId}
                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                className="input"
                required={formData.loanCategory === 'project'}
              >
                <option value="">Choose a project to finance...</option>
                {projects.filter(p => p.status !== 'completed' && p.status !== 'cancelled').map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} - {project.category.replace('_', ' ')}
                  </option>
                ))}
              </select>
              {selectedProject && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg flex items-start gap-3">
                  <FolderKanban size={20} className="text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">{selectedProject.name}</div>
                    <div className="text-sm text-gray-600">{selectedProject.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Current Investment: KES {selectedProject.totalInvestment.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Loan type selection */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Loan Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {loanTypes.map((type) => (
              <label
                key={type.id}
                className={`cursor-pointer p-4 border-2 rounded-xl transition ${
                  formData.loanTypeId === type.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="loanType"
                  value={type.id}
                  checked={formData.loanTypeId === type.id}
                  onChange={(e) => setFormData({ ...formData, loanTypeId: e.target.value })}
                  className="sr-only"
                />
                <div className="font-semibold text-gray-900">{type.name}</div>
                <div className="text-sm text-gray-500 mt-1">{type.description}</div>
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Interest Rate</span>
                    <span className="font-medium text-gray-900">{type.interestRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Max Amount</span>
                    <span className="font-medium text-gray-900">
                      KES {type.maxAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Max Duration</span>
                    <span className="font-medium text-gray-900">{type.maxDuration} months</span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Loan details */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Loan Amount (KES)</label>
              <input
                type="number"
                value={formData.principalAmount}
                onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
                className="input"
                placeholder="e.g., 50000"
                max={selectedLoanType?.maxAmount}
              />
              {selectedLoanType && (
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: KES {selectedLoanType.maxAmount.toLocaleString()}
                </p>
              )}
            </div>
            <div>
              <label className="label">Repayment Period (Months)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="input"
                placeholder="e.g., 6"
                max={selectedLoanType?.maxDuration}
              />
              {selectedLoanType && (
                <p className="text-xs text-gray-500 mt-1">
                  Maximum: {selectedLoanType.maxDuration} months
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="label">Purpose of Loan</label>
              <textarea
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="input min-h-[100px]"
                placeholder="e.g., Business expansion - purchasing inventory for my retail shop"
              />
            </div>
          </div>
        </div>

        {/* Guarantors */}
        {selectedLoanType?.requiresGuarantor && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Guarantors
              <span className="text-sm font-normal text-gray-500 ml-2">
                (Minimum {selectedLoanType.minGuarantors} required)
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Guarantor 1</label>
                <select
                  value={formData.guarantor1}
                  onChange={(e) => setFormData({ ...formData, guarantor1: e.target.value })}
                  className="input"
                >
                  <option value="">Select a member</option>
                  {otherMembers
                    .filter(m => m.id !== formData.guarantor2)
                    .map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.firstName} {member.lastName}
                      </option>
                    ))}
                </select>
              </div>
              {selectedLoanType.minGuarantors >= 2 && (
                <div>
                  <label className="label">Guarantor 2</label>
                  <select
                    value={formData.guarantor2}
                    onChange={(e) => setFormData({ ...formData, guarantor2: e.target.value })}
                    className="input"
                  >
                    <option value="">Select a member</option>
                    {otherMembers
                      .filter(m => m.id !== formData.guarantor1)
                      .map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.firstName} {member.lastName}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex items-start gap-2 mt-4 p-3 bg-blue-50 rounded-lg">
              <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                Guarantors will be notified and must accept before the loan can be approved.
                Each guarantor will guarantee 50% of the total loan amount.
              </p>
            </div>
          </div>
        )}

        {/* Loan summary */}
        {formData.principalAmount && formData.duration && selectedLoanType && (
          <div className="card bg-gray-50">
            <div className="flex items-center gap-2 mb-4">
              <Calculator size={20} className="text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-900">Loan Summary</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-500">Principal</div>
                <div className="text-lg font-bold text-gray-900">
                  KES {principal.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Interest ({interestRate}%)</div>
                <div className="text-lg font-bold text-gray-900">
                  KES {interestAmount.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Amount</div>
                <div className="text-lg font-bold text-primary-600">
                  KES {totalAmount.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Monthly Payment</div>
                <div className="text-lg font-bold text-gray-900">
                  KES {monthlyPayment.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/loans')}
            className="btn btn-secondary flex-1"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary flex-1">
            Submit Application
          </button>
        </div>
      </form>
    </div>
  )
}
