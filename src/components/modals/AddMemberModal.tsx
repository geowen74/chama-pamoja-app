import { useState } from 'react'
import { X, User, UserPlus, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import { useNotificationStore, createActivityNotification } from '../../store/notificationStore'

interface AddMemberModalProps {
  onClose: () => void
}

type Step = 1 | 2 | 3

export default function AddMemberModal({ onClose }: AddMemberModalProps) {
  const { addMember } = useDataStore()
  const { addNotification } = useNotificationStore()
  const [currentStep, setCurrentStep] = useState<Step>(1)
  
  // Personal Information
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    idNumber: '',
    address: '',
    dateOfBirth: '',
    occupation: '',
    role: 'member' as const,
  })

  // Next of Kin Information
  const [nextOfKin, setNextOfKin] = useState({
    fullName: '',
    relationship: '',
    phone: '',
    email: '',
    address: '',
    idNumber: '',
  })

  const steps = [
    { number: 1, title: 'Personal Info', icon: User },
    { number: 2, title: 'Next of Kin', icon: UserPlus },
    { number: 3, title: 'Confirm', icon: Check },
  ]

  const relationships = [
    'Spouse',
    'Parent',
    'Child',
    'Sibling',
    'Guardian',
    'Friend',
    'Other'
  ]

  const validateStep1 = () => {
    return formData.firstName && formData.lastName && formData.email && formData.phone
  }

  const validateStep2 = () => {
    return nextOfKin.fullName && nextOfKin.relationship && nextOfKin.phone
  }

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2)
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const memberName = `${formData.firstName} ${formData.lastName}`

    addMember({
      userId: Date.now().toString(),
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      idNumber: formData.idNumber || undefined,
      address: formData.address || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
      occupation: formData.occupation || undefined,
      role: formData.role,
      status: 'active',
      joinedAt: new Date().toISOString().split('T')[0],
      totalContributions: 0,
      totalLoans: 0,
      outstandingLoans: 0,
      shares: 0,
      nextOfKin: {
        fullName: nextOfKin.fullName,
        relationship: nextOfKin.relationship,
        phone: nextOfKin.phone,
        email: nextOfKin.email || undefined,
        address: nextOfKin.address || undefined,
        idNumber: nextOfKin.idNumber || undefined,
      },
    })

    // Add notification for new member
    addNotification(createActivityNotification.memberAdded(memberName))
    
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Add New Member</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${
                      currentStep >= step.number
                        ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <step.icon size={20} />
                  </div>
                  <span className={`text-xs mt-1 font-medium ${
                    currentStep >= step.number ? 'text-violet-600' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 rounded-full ${
                    currentStep > step.number ? 'bg-violet-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="input"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label className="label">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="input"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                  placeholder="john.doe@example.com"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Phone Number *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input"
                    placeholder="+254 712 345 678"
                    required
                  />
                </div>
                <div>
                  <label className="label">ID Number</label>
                  <input
                    type="text"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    className="input"
                    placeholder="12345678"
                  />
                </div>
              </div>
              <div>
                <label className="label">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input"
                  placeholder="123 Main Street, Nairobi"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Occupation</label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="input"
                    placeholder="Business Owner"
                  />
                </div>
              </div>
              <div>
                <label className="label">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as typeof formData.role })}
                  className="input"
                >
                  <option value="member">Member</option>
                  <option value="chairman">Chairman</option>
                  <option value="vice_chairman">Vice Chairman</option>
                  <option value="treasurer">Treasurer</option>
                  <option value="vice_treasurer">Vice Treasurer</option>
                  <option value="secretary">Secretary</option>
                  <option value="vice_secretary">Vice Secretary</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Next of Kin */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> Next of Kin information is required for emergency contacts and beneficiary purposes.
                </p>
              </div>
              <div>
                <label className="label">Full Name *</label>
                <input
                  type="text"
                  value={nextOfKin.fullName}
                  onChange={(e) => setNextOfKin({ ...nextOfKin, fullName: e.target.value })}
                  className="input"
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Relationship *</label>
                  <select
                    value={nextOfKin.relationship}
                    onChange={(e) => setNextOfKin({ ...nextOfKin, relationship: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Select relationship</option>
                    {relationships.map((rel) => (
                      <option key={rel} value={rel}>{rel}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Phone Number *</label>
                  <input
                    type="tel"
                    value={nextOfKin.phone}
                    onChange={(e) => setNextOfKin({ ...nextOfKin, phone: e.target.value })}
                    className="input"
                    placeholder="+254 712 345 678"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  value={nextOfKin.email}
                  onChange={(e) => setNextOfKin({ ...nextOfKin, email: e.target.value })}
                  className="input"
                  placeholder="jane.doe@example.com"
                />
              </div>
              <div>
                <label className="label">Address</label>
                <input
                  type="text"
                  value={nextOfKin.address}
                  onChange={(e) => setNextOfKin({ ...nextOfKin, address: e.target.value })}
                  className="input"
                  placeholder="456 Other Street, Nairobi"
                />
              </div>
              <div>
                <label className="label">ID Number</label>
                <input
                  type="text"
                  value={nextOfKin.idNumber}
                  onChange={(e) => setNextOfKin({ ...nextOfKin, idNumber: e.target.value })}
                  className="input"
                  placeholder="87654321"
                />
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Member Summary */}
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User size={18} className="text-violet-600" />
                  Member Information
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <p className="font-medium text-gray-900">{formData.firstName} {formData.lastName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <p className="font-medium text-gray-900">{formData.phone}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="font-medium text-gray-900">{formData.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Role:</span>
                    <p className="font-medium text-gray-900 capitalize">{formData.role.replace('_', ' ')}</p>
                  </div>
                  {formData.idNumber && (
                    <div>
                      <span className="text-gray-500">ID Number:</span>
                      <p className="font-medium text-gray-900">{formData.idNumber}</p>
                    </div>
                  )}
                  {formData.occupation && (
                    <div>
                      <span className="text-gray-500">Occupation:</span>
                      <p className="font-medium text-gray-900">{formData.occupation}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Next of Kin Summary */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <UserPlus size={18} className="text-amber-600" />
                  Next of Kin
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <p className="font-medium text-gray-900">{nextOfKin.fullName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Relationship:</span>
                    <p className="font-medium text-gray-900">{nextOfKin.relationship}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <p className="font-medium text-gray-900">{nextOfKin.phone}</p>
                  </div>
                  {nextOfKin.email && (
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <p className="font-medium text-gray-900">{nextOfKin.email}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-6">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <ChevronLeft size={18} />
                Back
              </button>
            ) : (
              <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
                Cancel
              </button>
            )}
            
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={currentStep === 1 ? !validateStep1() : !validateStep2()}
                className="btn btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight size={18} />
              </button>
            ) : (
              <button type="submit" className="btn btn-primary flex-1 flex items-center justify-center gap-2">
                <Check size={18} />
                Add Member
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
