import { useState } from 'react'
import { useAdminStore, validatePassword } from '../../store/adminStore'
import { useDataStore } from '../../store/dataStore'
import { usePermission } from '../../utils/permissions'
import {
  Settings,
  Shield,
  DollarSign,
  Lock,
  Bell,
  Key,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Unlock,
  Trash2,
} from 'lucide-react'

type TabType = 'general' | 'contributions' | 'loans' | 'fines' | 'security' | 'passwords' | 'notifications'

export default function AdminSettings() {
  const canEditSettings = usePermission('edit_settings')
  const { settings, updateSettings, resetToDefaults, userCredentials, resetPassword, lockUser, unlockUser, deleteUserCredential, changeAdminPassword } = useAdminStore()
  const { members } = useDataStore()
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const [showSuccess, setShowSuccess] = useState(false)
  const [showAdminPasswordModal, setShowAdminPasswordModal] = useState(false)
  const [tempPasswords, setTempPasswords] = useState<Record<string, string>>({})

  // Form states
  const [formData, setFormData] = useState(settings)
  
  // Admin password change state
  const [adminPasswordData, setAdminPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [passwordError, setPasswordError] = useState('')

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'contributions', label: 'Contributions', icon: DollarSign },
    { id: 'loans', label: 'Loans', icon: DollarSign },
    { id: 'fines', label: 'Fines', icon: AlertTriangle },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'passwords', label: 'User Passwords', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  const handleSave = () => {
    updateSettings(formData)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      resetToDefaults()
      setFormData(settings)
    }
  }

  const handleResetUserPassword = (userId: string, email: string) => {
    if (confirm(`Reset password for ${email}? They will receive a temporary password.`)) {
      const tempPassword = resetPassword(userId)
      setTempPasswords(prev => ({ ...prev, [userId]: tempPassword }))
    }
  }

  const handleLockUser = (userId: string, email: string) => {
    if (confirm(`Lock account for ${email}? They will not be able to login.`)) {
      lockUser(userId)
    }
  }

  const handleUnlockUser = (userId: string) => {
    unlockUser(userId)
  }

  const handleDeleteCredential = (userId: string, email: string) => {
    if (confirm(`Delete login credentials for ${email}? This cannot be undone.`)) {
      deleteUserCredential(userId)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const handleChangeAdminPassword = () => {
    setPasswordError('')
    
    if (adminPasswordData.newPassword !== adminPasswordData.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }
    
    const validation = validatePassword(adminPasswordData.newPassword, settings)
    if (!validation.isValid) {
      setPasswordError(validation.errors.join('. '))
      return
    }
    
    const success = changeAdminPassword(adminPasswordData.currentPassword, adminPasswordData.newPassword)
    if (success) {
      setShowAdminPasswordModal(false)
      setAdminPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      alert('Admin password changed successfully!')
    } else {
      setPasswordError('Current password is incorrect')
    }
  }

  if (!canEditSettings) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Lock size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500">You don't have permission to access admin settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-gray-500 mt-1">Manage system-wide settings and configurations</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="btn btn-secondary flex items-center gap-2"
          >
            <RotateCcw size={18} />
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary flex items-center gap-2"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>

      {/* Success message */}
      {showSuccess && (
        <div className="flex items-center gap-2 p-4 bg-success-50 text-success-700 rounded-xl border border-success-200">
          <CheckCircle size={20} />
          Settings saved successfully!
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <div className="card p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon size={20} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">General Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="label">Group Name</label>
                  <input
                    type="text"
                    value={formData.groupName}
                    onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea
                    value={formData.groupDescription}
                    onChange={(e) => setFormData({ ...formData, groupDescription: e.target.value })}
                    className="input min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Currency</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="input"
                    >
                      <option value="KES">KES - Kenyan Shilling</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="TZS">TZS - Tanzanian Shilling</option>
                      <option value="UGX">UGX - Ugandan Shilling</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Timezone</label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                      className="input"
                    >
                      <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                      <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                      <option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contribution Settings */}
          {activeTab === 'contributions' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Contribution Settings</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Default Contribution Amount ({formData.currency})</label>
                    <input
                      type="number"
                      value={formData.defaultContributionAmount}
                      onChange={(e) => setFormData({ ...formData, defaultContributionAmount: parseInt(e.target.value) || 0 })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Contribution Frequency</label>
                    <select
                      value={formData.contributionFrequency}
                      onChange={(e) => setFormData({ ...formData, contributionFrequency: e.target.value as 'weekly' | 'biweekly' | 'monthly' })}
                      className="input"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Due Day of Month</label>
                    <input
                      type="number"
                      min="1"
                      max="28"
                      value={formData.contributionDueDay}
                      onChange={(e) => setFormData({ ...formData, contributionDueDay: parseInt(e.target.value) || 1 })}
                      className="input"
                    />
                    <p className="text-xs text-gray-500 mt-1">Day of month when contributions are due (1-28)</p>
                  </div>
                  <div>
                    <label className="label">Late Contribution Penalty (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.lateContributionPenalty}
                      onChange={(e) => setFormData({ ...formData, lateContributionPenalty: parseInt(e.target.value) || 0 })}
                      className="input"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loan Settings */}
          {activeTab === 'loans' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Loan Settings</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Default Interest Rate (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.defaultInterestRate}
                      onChange={(e) => setFormData({ ...formData, defaultInterestRate: parseInt(e.target.value) || 0 })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Max Loan Multiplier</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      step="0.5"
                      value={formData.maxLoanMultiplier}
                      onChange={(e) => setFormData({ ...formData, maxLoanMultiplier: parseFloat(e.target.value) || 1 })}
                      className="input"
                    />
                    <p className="text-xs text-gray-500 mt-1">Max loan = member's contributions × this value</p>
                  </div>
                  <div>
                    <label className="label">Processing Fee ({formData.currency})</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.loanProcessingFee}
                      onChange={(e) => setFormData({ ...formData, loanProcessingFee: parseInt(e.target.value) || 0 })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Max Loan Duration (months)</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={formData.maxLoanDuration}
                      onChange={(e) => setFormData({ ...formData, maxLoanDuration: parseInt(e.target.value) || 1 })}
                      className="input"
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requireGuarantors}
                      onChange={(e) => setFormData({ ...formData, requireGuarantors: e.target.checked })}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <div>
                      <div className="font-medium text-gray-700">Require Guarantors</div>
                      <div className="text-sm text-gray-500">Loans must have guarantors before approval</div>
                    </div>
                  </label>
                  
                  {formData.requireGuarantors && (
                    <div className="mt-4 ml-8">
                      <label className="label">Minimum Guarantors Required</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={formData.minGuarantors}
                        onChange={(e) => setFormData({ ...formData, minGuarantors: parseInt(e.target.value) || 1 })}
                        className="input w-32"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Fine Settings */}
          {activeTab === 'fines' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Fine Settings</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Late Meeting Fine ({formData.currency})</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.lateMeetingFine}
                      onChange={(e) => setFormData({ ...formData, lateMeetingFine: parseInt(e.target.value) || 0 })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Late Contribution Fine ({formData.currency})</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.lateContributionFine}
                      onChange={(e) => setFormData({ ...formData, lateContributionFine: parseInt(e.target.value) || 0 })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Late Loan Repayment Fine ({formData.currency})</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.lateLoanRepaymentFine}
                      onChange={(e) => setFormData({ ...formData, lateLoanRepaymentFine: parseInt(e.target.value) || 0 })}
                      className="input"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Admin Password */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Admin Password</h2>
                  <button
                    onClick={() => setShowAdminPasswordModal(true)}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Key size={18} />
                    Change Admin Password
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  The admin password is used for sensitive system operations. 
                  Default password is <code className="bg-gray-100 px-2 py-1 rounded">Admin@123</code>
                </p>
              </div>

              {/* Session Settings */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Session & Lockout Settings</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="label">Session Timeout (minutes)</label>
                      <input
                        type="number"
                        min="5"
                        max="120"
                        value={formData.sessionTimeout}
                        onChange={(e) => setFormData({ ...formData, sessionTimeout: parseInt(e.target.value) || 15 })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label">Max Login Attempts</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.maxLoginAttempts}
                        onChange={(e) => setFormData({ ...formData, maxLoginAttempts: parseInt(e.target.value) || 3 })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label">Lockout Duration (minutes)</label>
                      <input
                        type="number"
                        min="5"
                        max="1440"
                        value={formData.lockoutDuration}
                        onChange={(e) => setFormData({ ...formData, lockoutDuration: parseInt(e.target.value) || 30 })}
                        className="input"
                      />
                    </div>
                  </div>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.requirePinForSensitiveActions}
                      onChange={(e) => setFormData({ ...formData, requirePinForSensitiveActions: e.target.checked })}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <div>
                      <div className="font-medium text-gray-700">Require PIN for Sensitive Actions</div>
                      <div className="text-sm text-gray-500">PIN verification for loan approvals, deletions, etc.</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Password Policy */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Password Policy</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Minimum Password Length</label>
                      <input
                        type="number"
                        min="6"
                        max="32"
                        value={formData.passwordMinLength}
                        onChange={(e) => setFormData({ ...formData, passwordMinLength: parseInt(e.target.value) || 8 })}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label">Password Expiry (days)</label>
                      <input
                        type="number"
                        min="0"
                        max="365"
                        value={formData.passwordExpiryDays}
                        onChange={(e) => setFormData({ ...formData, passwordExpiryDays: parseInt(e.target.value) || 90 })}
                        className="input"
                      />
                      <p className="text-xs text-gray-500 mt-1">0 = never expires</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.passwordRequireUppercase}
                        onChange={(e) => setFormData({ ...formData, passwordRequireUppercase: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-gray-700">Require uppercase letter</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.passwordRequireNumbers}
                        onChange={(e) => setFormData({ ...formData, passwordRequireNumbers: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-gray-700">Require numbers</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.passwordRequireSpecial}
                        onChange={(e) => setFormData({ ...formData, passwordRequireSpecial: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-gray-700">Require special characters (!@#$%^&*)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* User Passwords */}
          {activeTab === 'passwords' && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">User Password Management</h2>
                  <p className="text-sm text-gray-500 mt-1">Manage login credentials for all members</p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Last Password Change</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Temp Password</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {members.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                          No members found. Add members first to manage their passwords.
                        </td>
                      </tr>
                    ) : (
                      members.map((member) => {
                        const credential = userCredentials.find(c => c.email.toLowerCase() === member.email.toLowerCase())
                        return (
                          <tr key={member.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                                  {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{member.firstName} {member.lastName}</div>
                                  <div className="text-sm text-gray-500">{member.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {credential ? (
                                credential.isLocked ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-danger-100 text-danger-700 rounded-full text-xs font-medium">
                                    <Lock size={12} />
                                    Locked
                                  </span>
                                ) : credential.mustChangePassword ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-warning-100 text-warning-700 rounded-full text-xs font-medium">
                                    <AlertTriangle size={12} />
                                    Must Change
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-success-100 text-success-700 rounded-full text-xs font-medium">
                                    <CheckCircle size={12} />
                                    Active
                                  </span>
                                )
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                  No Login
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {credential ? new Date(credential.lastPasswordChange).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-4 py-3">
                              {tempPasswords[credential?.id || ''] && (
                                <div className="flex items-center gap-2">
                                  <code className="bg-yellow-50 text-yellow-800 px-2 py-1 rounded text-sm font-mono">
                                    {tempPasswords[credential?.id || '']}
                                  </code>
                                  <button
                                    onClick={() => copyToClipboard(tempPasswords[credential?.id || ''])}
                                    className="p-1 hover:bg-gray-100 rounded"
                                    title="Copy password"
                                  >
                                    <Copy size={14} className="text-gray-500" />
                                  </button>
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                {credential ? (
                                  <>
                                    <button
                                      onClick={() => handleResetUserPassword(credential.id, member.email)}
                                      className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg"
                                      title="Reset Password"
                                    >
                                      <RefreshCw size={16} />
                                    </button>
                                    {credential.isLocked ? (
                                      <button
                                        onClick={() => handleUnlockUser(credential.id)}
                                        className="p-2 hover:bg-success-50 text-success-600 rounded-lg"
                                        title="Unlock Account"
                                      >
                                        <Unlock size={16} />
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleLockUser(credential.id, member.email)}
                                        className="p-2 hover:bg-warning-50 text-warning-600 rounded-lg"
                                        title="Lock Account"
                                      >
                                        <Lock size={16} />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDeleteCredential(credential.id, member.email)}
                                      className="p-2 hover:bg-danger-50 text-danger-600 rounded-lg"
                                      title="Delete Credentials"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </>
                                ) : (
                                  <span className="text-xs text-gray-400">No credentials</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h2>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-medium text-gray-700">Email Notifications</div>
                    <div className="text-sm text-gray-500">Send notifications via email</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.emailNotifications}
                    onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                </label>
                
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-medium text-gray-700">SMS Notifications</div>
                    <div className="text-sm text-gray-500">Send notifications via SMS</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.smsNotifications}
                    onChange={(e) => setFormData({ ...formData, smsNotifications: e.target.checked })}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                </label>
                
                <div className="pt-4 border-t border-gray-100">
                  <label className="label">Reminder Days Before Due Date</label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={formData.reminderDaysBefore}
                    onChange={(e) => setFormData({ ...formData, reminderDaysBefore: parseInt(e.target.value) || 3 })}
                    className="input w-32"
                  />
                  <p className="text-xs text-gray-500 mt-1">Send reminders this many days before contributions/repayments are due</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Password Modal */}
      {showAdminPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Change Admin Password</h3>
            </div>
            
            <div className="p-6 space-y-4">
              {passwordError && (
                <div className="flex items-center gap-2 p-3 bg-danger-50 text-danger-700 rounded-lg text-sm">
                  <AlertTriangle size={16} />
                  {passwordError}
                </div>
              )}
              
              <div>
                <label className="label">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={adminPasswordData.currentPassword}
                    onChange={(e) => setAdminPasswordData({ ...adminPasswordData, currentPassword: e.target.value })}
                    className="input pr-10"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="label">New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={adminPasswordData.newPassword}
                    onChange={(e) => setAdminPasswordData({ ...adminPasswordData, newPassword: e.target.value })}
                    className="input pr-10"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="label">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={adminPasswordData.confirmPassword}
                    onChange={(e) => setAdminPasswordData({ ...adminPasswordData, confirmPassword: e.target.value })}
                    className="input pr-10"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => {
                  setShowAdminPasswordModal(false)
                  setAdminPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                  setPasswordError('')
                }}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeAdminPassword}
                className="btn btn-primary flex-1"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
