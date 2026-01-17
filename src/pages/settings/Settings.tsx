import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { useSecurityStore } from '../../store/securityStore'
import { useUserRole, ROLE_DESCRIPTIONS } from '../../utils/permissions'
import RoleBadge from '../../components/RoleBadge'
import PinModal from '../../components/modals/PinModal'
import {
  User,
  Building,
  Bell,
  Shield,
  CreditCard,
  Save,
  Camera,
  Lock,
  Key,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trash2,
} from 'lucide-react'

type TabType = 'profile' | 'group' | 'notifications' | 'security' | 'billing'

export default function Settings() {
  const { user, group, updateUser, updateGroup } = useAuthStore()
  const { 
    isPinSet, 
    sessionTimeout, 
    setSessionTimeout, 
    auditLog, 
    removePin,
    clearAuditLog 
  } = useSecurityStore()
  const userRole = useUserRole()
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinModalMode, setPinModalMode] = useState<'setup' | 'change' | 'verify'>('setup')
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const [groupData, setGroupData] = useState({
    name: group?.name || '',
    description: group?.description || '',
    contributionAmount: group?.contributionAmount || 0,
    contributionFrequency: group?.contributionFrequency || 'monthly',
    loanInterestRate: group?.loanInterestRate || 0,
    maxLoanMultiplier: group?.maxLoanMultiplier || 0,
  })
  const [notifications, setNotifications] = useState({
    emailContributions: true,
    emailLoans: true,
    emailMeetings: true,
    smsReminders: false,
    pushNotifications: true,
  })

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'group', label: 'Group Settings', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ]

  // Load profile info from backend on mount
  useEffect(() => {
    fetch('http://localhost:4000/api/user')
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setProfileData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
          });
          updateUser(data);
        }
      });
    fetch('http://localhost:4000/api/group')
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setGroupData({
            name: data.name || '',
            description: data.description || '',
            contributionAmount: data.contributionAmount || 0,
            contributionFrequency: data.contributionFrequency || 'monthly',
            loanInterestRate: data.loanInterestRate || 0,
            maxLoanMultiplier: data.maxLoanMultiplier || 0,
          });
          updateGroup(data);
        }
      });
  }, []);

  const handleSaveProfile = async () => {
    updateUser(profileData);
    await fetch('http://localhost:4000/api/user', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData),
    });
    alert('Profile updated successfully!');
  };

  const handleSaveGroup = async () => {
    updateGroup(groupData);
    await fetch('http://localhost:4000/api/group', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(groupData),
    });
    alert('Group settings updated successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and group preferences</p>
      </div>

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
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
              
              {/* Avatar */}
              <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-100">
                <div className="relative">
                  <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                    <User size={40} className="text-primary-600" />
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-primary-600 rounded-full text-white hover:bg-primary-700">
                    <Camera size={16} />
                  </button>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Profile Photo</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    JPG, GIF or PNG. Max size 2MB
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name</label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
                <button onClick={handleSaveProfile} className="btn btn-primary flex items-center gap-2">
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Group Settings */}
          {activeTab === 'group' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Group Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="label">Group Name</label>
                  <input
                    type="text"
                    value={groupData.name}
                    onChange={(e) => setGroupData({ ...groupData, name: e.target.value })}
                    className="input"
                    placeholder="e.g., Umoja Investment Group"
                  />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea
                    value={groupData.description}
                    onChange={(e) => setGroupData({ ...groupData, description: e.target.value })}
                    className="input min-h-[100px]"
                    placeholder="e.g., A savings and investment group for professionals established in 2020 to promote financial growth among members."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Contribution Amount (KES)</label>
                    <input
                      type="number"
                      value={groupData.contributionAmount}
                      onChange={(e) => setGroupData({ ...groupData, contributionAmount: parseInt(e.target.value) })}
                      className="input"
                      placeholder="e.g., 5000"
                    />
                  </div>
                  <div>
                    <label className="label">Contribution Frequency</label>
                    <select
                      value={groupData.contributionFrequency}
                      onChange={(e) => setGroupData({ ...groupData, contributionFrequency: e.target.value as 'weekly' | 'biweekly' | 'monthly' })}
                      className="input"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Loan Interest Rate (%)</label>
                    <input
                      type="number"
                      value={groupData.loanInterestRate}
                      onChange={(e) => setGroupData({ ...groupData, loanInterestRate: parseInt(e.target.value) })}
                      className="input"
                      placeholder="e.g., 10"
                    />
                  </div>
                  <div>
                    <label className="label">Max Loan Multiplier</label>
                    <input
                      type="number"
                      value={groupData.maxLoanMultiplier}
                      onChange={(e) => setGroupData({ ...groupData, maxLoanMultiplier: parseInt(e.target.value) })}
                      className="input"
                      placeholder="e.g., 3"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum loan = contributions × this multiplier
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
                <button onClick={handleSaveGroup} className="btn btn-primary flex items-center gap-2">
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-4">Email Notifications</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-700">Contribution Updates</div>
                        <div className="text-sm text-gray-500">Get notified when contributions are recorded</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.emailContributions}
                        onChange={(e) => setNotifications({ ...notifications, emailContributions: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-700">Loan Updates</div>
                        <div className="text-sm text-gray-500">Get notified about loan applications and approvals</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.emailLoans}
                        onChange={(e) => setNotifications({ ...notifications, emailLoans: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-700">Meeting Reminders</div>
                        <div className="text-sm text-gray-500">Get reminded about upcoming meetings</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.emailMeetings}
                        onChange={(e) => setNotifications({ ...notifications, emailMeetings: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h3 className="font-medium text-gray-900 mb-4">Other Notifications</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-700">SMS Reminders</div>
                        <div className="text-sm text-gray-500">Receive important updates via SMS</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.smsReminders}
                        onChange={(e) => setNotifications({ ...notifications, smsReminders: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-700">Push Notifications</div>
                        <div className="text-sm text-gray-500">Receive push notifications on your device</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.pushNotifications}
                        onChange={(e) => setNotifications({ ...notifications, pushNotifications: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
                <button className="btn btn-primary flex items-center gap-2">
                  <Save size={18} />
                  Save Preferences
                </button>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Role & Permissions Card */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Your Role & Permissions</h2>
                
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl">
                    <Shield size={24} className="text-violet-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-gray-900">Current Role:</span>
                      {userRole && <RoleBadge role={userRole} size="md" />}
                    </div>
                    <p className="text-sm text-gray-600">
                      {userRole && ROLE_DESCRIPTIONS[userRole]}
                    </p>
                  </div>
                </div>
                
                {userRole && <RoleBadge role={userRole} showDetails size="sm" />}
              </div>

              {/* PIN Security Card */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Security PIN</h2>
                
                <div className="flex items-start gap-4 mb-6">
                  <div className={`p-3 rounded-xl ${isPinSet ? 'bg-success-100' : 'bg-warning-100'}`}>
                    <Lock size={24} className={isPinSet ? 'text-success-600' : 'text-warning-600'} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {isPinSet ? 'PIN is Active' : 'PIN Not Set'}
                      </span>
                      {isPinSet ? (
                        <CheckCircle size={16} className="text-success-600" />
                      ) : (
                        <AlertTriangle size={16} className="text-warning-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {isPinSet 
                        ? 'Your security PIN protects sensitive actions like loan approvals and member changes.'
                        : 'Set up a 4-digit PIN to secure sensitive actions in the app.'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {!isPinSet ? (
                    <button 
                      onClick={() => {
                        setPinModalMode('setup')
                        setShowPinModal(true)
                      }}
                      className="btn btn-primary flex items-center gap-2"
                    >
                      <Key size={18} />
                      Set Up PIN
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => {
                          setPinModalMode('change')
                          setShowPinModal(true)
                        }}
                        className="btn btn-secondary flex items-center gap-2"
                      >
                        <Key size={18} />
                        Change PIN
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm('Are you sure you want to remove your PIN? This will disable PIN protection.')) {
                            removePin()
                          }
                        }}
                        className="btn btn-danger flex items-center gap-2"
                      >
                        <XCircle size={18} />
                        Remove PIN
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Session Settings Card */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Session Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="label">Auto-Lock Timeout</label>
                    <select
                      value={sessionTimeout / 60000}
                      onChange={(e) => setSessionTimeout(parseInt(e.target.value))}
                      className="input max-w-xs"
                    >
                      <option value={5}>5 minutes</option>
                      <option value={10}>10 minutes</option>
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Require PIN verification after this period of inactivity
                    </p>
                  </div>
                </div>
              </div>

              {/* Password Card */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="label">Current Password</label>
                    <input type="password" className="input" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="label">New Password</label>
                    <input type="password" className="input" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="label">Confirm New Password</label>
                    <input type="password" className="input" placeholder="••••••••" />
                  </div>
                  <button className="btn btn-primary">Update Password</button>
                </div>
              </div>

              {/* Audit Log Card */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Security Audit Log</h2>
                  {auditLog.length > 0 && (
                    <button 
                      onClick={() => {
                        if (confirm('Are you sure you want to clear the audit log?')) {
                          clearAuditLog()
                        }
                      }}
                      className="text-sm text-danger-600 hover:text-danger-700 flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      Clear Log
                    </button>
                  )}
                </div>
                
                {auditLog.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No security events recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {auditLog.slice(0, 20).map((entry) => (
                      <div key={entry.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`p-1.5 rounded-lg ${
                          entry.action.includes('FAILED') || entry.action.includes('LOCKED')
                            ? 'bg-danger-100 text-danger-600'
                            : entry.action.includes('SUCCESS') || entry.action.includes('VERIFIED')
                            ? 'bg-success-100 text-success-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          <Clock size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-gray-900 text-sm">
                              {entry.action.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {new Date(entry.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5">{entry.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Sessions Card */}
              <div className="card">
                <h3 className="font-medium text-gray-900 mb-4">Active Sessions</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Current Session</div>
                      <div className="text-sm text-gray-500">Windows • Chrome • Nairobi, Kenya</div>
                    </div>
                    <span className="text-xs text-success-600 bg-success-100 px-2 py-1 rounded-full">
                      Active now
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PIN Modal */}
          <PinModal
            isOpen={showPinModal}
            onClose={() => setShowPinModal(false)}
            onSuccess={() => setShowPinModal(false)}
            mode={pinModalMode}
          />

          {/* Billing Settings */}
          {activeTab === 'billing' && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Billing & Subscription</h2>
              
              <div className="bg-primary-50 border border-primary-100 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-primary-900">Premium Plan</h3>
                    <p className="text-sm text-primary-700 mt-1">
                      Unlimited members, advanced reports, priority support
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-900">KES 2,500</div>
                    <div className="text-sm text-primary-700">per month</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-primary-200 flex justify-between items-center">
                  <span className="text-sm text-primary-700">Next billing: Feb 1, 2025</span>
                  <button className="btn btn-secondary text-sm">Change Plan</button>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-4">Payment Method</h3>
                <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <CreditCard size={24} className="text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">M-PESA</div>
                    <div className="text-sm text-gray-500">+254 712 ***678</div>
                  </div>
                  <button className="text-primary-600 text-sm font-medium hover:underline">
                    Change
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="font-medium text-gray-900 mb-4">Billing History</h3>
                <div className="space-y-3">
                  {[
                    { date: 'Jan 1, 2025', amount: 2500, status: 'Paid' },
                    { date: 'Dec 1, 2024', amount: 2500, status: 'Paid' },
                    { date: 'Nov 1, 2024', amount: 2500, status: 'Paid' },
                  ].map((invoice, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{invoice.date}</div>
                        <div className="text-sm text-gray-500">Premium Plan</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">KES {invoice.amount.toLocaleString()}</div>
                        <span className="text-xs text-success-600 bg-success-100 px-2 py-0.5 rounded-full">
                          {invoice.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
