import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useDataStore } from '../store/dataStore'
import { useNotificationStore } from '../store/notificationStore'
import { useSecurityStore } from '../store/securityStore'
import { usePermission } from '../utils/permissions'
import SecuritySettingsModal from '../components/modals/SecuritySettingsModal'
import {
  LayoutDashboard,
  Users,
  Wallet,
  HandCoins,
  Calendar,
  Receipt,
  FolderKanban,
  AlertTriangle,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  User,
  ShieldCheck,
  Building2,
  FileText,
  ClipboardList,
  UsersRound,
  Calculator,
  ArrowUpCircle,
  ArrowDownCircle,
  Banknote,
  Briefcase,
  UserCircle,
  CheckCheck,
  Shield,
} from 'lucide-react'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [securityOpen, setSecurityOpen] = useState(false)
  const [financeOpen, setFinanceOpen] = useState(false)
  const [depositsOpen, setDepositsOpen] = useState(false)
  const [withdrawalsOpen, setWithdrawalsOpen] = useState(false)
  const [loansOpen, setLoansOpen] = useState(false)
  const [governanceOpen, setGovernanceOpen] = useState(false)
  const { user, logout } = useAuthStore()
  useDataStore()
  const { getNotificationsForUser, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotificationStore()
  const { getUnreadAlertsCount } = useSecurityStore()
  const navigate = useNavigate()
  const canAccessAdmin = usePermission('edit_settings')

  const userNotifications = user ? getNotificationsForUser(user.role, user.id) : []
  const unreadCount = user ? getUnreadCount(user.role, user.id) : 0
  const securityAlertsCount = getUnreadAlertsCount()

  // Build navigation dynamically based on permissions
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  // Finance sub-menu items
  const depositItems = [
    { name: 'Contributions', href: '/contributions', icon: Wallet },
    { name: 'Fines', href: '/fines', icon: AlertTriangle },
  ]

  const withdrawalItems = [
    { name: 'Expenses', href: '/expenses', icon: Receipt },
  ]

  const loanItems = [
    { name: 'Project Loans', href: '/loans?type=project', icon: Briefcase },
    { name: 'Individual Loans', href: '/loans?type=individual', icon: UserCircle },
  ]

  // Governance sub-menu items
  const governanceItems = [
    { name: 'Group Members', href: '/governance/members', icon: UsersRound },
    { name: 'Meetings', href: '/governance/meetings', icon: Calendar },
    { name: 'Board Resolutions', href: '/governance/resolutions', icon: FileText },
    { name: 'Action Plan', href: '/governance/action-plan', icon: ClipboardList },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-violet-900 via-purple-800 to-fuchsia-900 border-r border-purple-500/20 shadow-2xl shadow-purple-900/30 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-white/20 to-white/10 p-2.5 rounded-2xl shadow-lg shadow-black/20 backdrop-blur-sm border border-white/20">
                <Users size={24} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white">Chama Pamoja</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-xl hover:bg-white/10 transition-colors text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
            {/* Dashboard */}
            <NavLink
              to="/dashboard"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <LayoutDashboard size={18} />
              <span className="font-medium">Dashboard</span>
            </NavLink>

            {/* Finance section with sub-menus */}
            <div className="pt-1">
              <button
                onClick={() => {
                  setFinanceOpen(!financeOpen)
                  if (financeOpen) {
                    setDepositsOpen(false)
                    setWithdrawalsOpen(false)
                    setLoansOpen(false)
                  }
                }}
                className="sidebar-link w-full justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <Banknote size={18} />
                  <span className="font-medium">Finance</span>
                </div>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${financeOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {financeOpen && (
                <div className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-emerald-200 pl-3">
                  {/* Deposits sub-section */}
                  <div>
                    <button
                      onClick={() => setDepositsOpen(!depositsOpen)}
                      className="sidebar-link py-2 w-full justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <ArrowUpCircle size={14} className="text-emerald-500" />
                        <span className="font-medium text-xs">Deposits</span>
                      </div>
                      <ChevronDown
                        size={12}
                        className={`transition-transform ${depositsOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {depositsOpen && (
                      <div className="ml-2 space-y-0.5 border-l border-emerald-100 pl-2">
                        {depositItems.map((item) => (
                          <NavLink
                            key={item.name}
                            to={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                              `sidebar-link py-1.5 ${isActive ? 'active' : ''}`
                            }
                          >
                            <item.icon size={14} />
                            <span className="font-medium text-xs">{item.name}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Withdrawals sub-section */}
                  <div>
                    <button
                      onClick={() => setWithdrawalsOpen(!withdrawalsOpen)}
                      className="sidebar-link py-2 w-full justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <ArrowDownCircle size={14} className="text-rose-500" />
                        <span className="font-medium text-xs">Withdrawals</span>
                      </div>
                      <ChevronDown
                        size={12}
                        className={`transition-transform ${withdrawalsOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {withdrawalsOpen && (
                      <div className="ml-2 space-y-0.5 border-l border-rose-100 pl-2">
                        {withdrawalItems.map((item) => (
                          <NavLink
                            key={item.name}
                            to={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                              `sidebar-link py-1.5 ${isActive ? 'active' : ''}`
                            }
                          >
                            <item.icon size={14} />
                            <span className="font-medium text-xs">{item.name}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Loans sub-section */}
                  <div>
                    <button
                      onClick={() => setLoansOpen(!loansOpen)}
                      className="sidebar-link py-2 w-full justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <HandCoins size={14} className="text-blue-500" />
                        <span className="font-medium text-xs">Loans</span>
                      </div>
                      <ChevronDown
                        size={12}
                        className={`transition-transform ${loansOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {loansOpen && (
                      <div className="ml-2 space-y-0.5 border-l border-blue-100 pl-2">
                        {loanItems.map((item) => (
                          <NavLink
                            key={item.name}
                            to={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                              `sidebar-link py-1.5 ${isActive ? 'active' : ''}`
                            }
                          >
                            <item.icon size={14} />
                            <span className="font-medium text-xs">{item.name}</span>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reconciliation link */}
                  <NavLink
                    to="/finance/reconciliation"
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `sidebar-link py-2 ${isActive ? 'active' : ''}`
                    }
                  >
                    <Calculator size={14} className="text-violet-500" />
                    <span className="font-medium text-xs">Reconciliation</span>
                  </NavLink>
                </div>
              )}
            </div>

            {/* Governance section with sub-menu */}
            <div className="pt-1">
              <button
                onClick={() => setGovernanceOpen(!governanceOpen)}
                className="sidebar-link w-full justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 size={18} />
                  <span className="font-medium">Governance</span>
                </div>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${governanceOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {governanceOpen && (
                <div className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-indigo-200 pl-3">
                  {governanceItems.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `sidebar-link py-2 ${isActive ? 'active' : ''}`
                      }
                    >
                      <item.icon size={16} />
                      <span className="font-medium text-xs">{item.name}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            {/* Other nav items */}
            {navItems.slice(1).map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <item.icon size={18} />
                <span className="font-medium">{item.name}</span>
              </NavLink>
            ))}

            {/* Admin link - shown at bottom of nav for admins only */}
            {canAccessAdmin && (
              <div className="pt-3 mt-2 border-t border-gray-100">
                <NavLink
                  to="/admin"
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <ShieldCheck size={16} />
                  <span className="font-medium text-xs">Admin Panel</span>
                </NavLink>
              </div>
            )}
          </nav>

          {/* User info */}
          <div className="border-t border-purple-500/20 p-3">
            <div className="flex items-center gap-2.5 p-2.5 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
              <div className="w-9 h-9 bg-gradient-to-br from-white/30 to-white/10 rounded-lg flex items-center justify-center shadow-md border border-white/20">
                <User size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-[10px] text-purple-200 capitalize font-medium">{user?.role?.replace('_', ' ')}</div>
              </div>
            </div>
          </div>

          {/* Powered by */}
          <div className="px-4 py-2 border-t border-purple-500/20">
            <p className="text-[10px] text-center text-purple-300">
              Powered by <span className="font-semibold text-white">Ondoro Investment</span>
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 h-20 bg-white/80 backdrop-blur-xl border-b border-gray-100/50 shadow-sm">
          <div className="flex items-center justify-between h-full px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <Menu size={22} />
              </button>

              {/* Dashboard button */}
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white shadow-purple-500/40'
                      : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-purple-500/30 hover:shadow-lg hover:shadow-purple-500/40 hover:-translate-y-0.5'
                  }`
                }
              >
                <LayoutDashboard size={18} />
                <span className="hidden sm:inline">Dashboard</span>
              </NavLink>

              {/* Projects button */}
              <NavLink
                to="/projects"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white shadow-emerald-500/40'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-0.5'
                  }`
                }
              >
                <FolderKanban size={18} />
                <span className="hidden sm:inline">Projects</span>
              </NavLink>
            </div>

            <div className="flex items-center gap-4 ml-auto">
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-3 rounded-xl hover:bg-violet-50 transition-colors group"
                >
                  <Bell size={22} className="text-gray-600 group-hover:text-violet-600 transition-colors" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[20px] h-5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full shadow-lg shadow-rose-500/50 text-white text-xs font-bold flex items-center justify-center px-1">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setNotificationsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-purple-500/20 border border-white/50 z-50 max-h-[70vh] overflow-hidden flex flex-col">
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xl rounded-t-2xl">
                        <div>
                          <div className="text-sm font-bold text-gray-900">Notifications</div>
                          <div className="text-xs text-gray-500">{unreadCount} unread</div>
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => markAllAsRead()}
                            className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                          >
                            <CheckCheck size={14} />
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div className="overflow-y-auto flex-1">
                        {userNotifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <Bell size={32} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-sm text-gray-500">No notifications yet</p>
                          </div>
                        ) : (
                          userNotifications.slice(0, 20).map((notification) => (
                            <div
                              key={notification.id}
                              className={`px-4 py-3 border-b border-gray-50 hover:bg-violet-50/50 transition-colors cursor-pointer ${
                                !notification.read ? 'bg-violet-50/30' : ''
                              }`}
                              onClick={() => {
                                markAsRead(notification.id)
                                if (notification.link) {
                                  navigate(notification.link)
                                  setNotificationsOpen(false)
                                }
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                  !notification.read ? 'bg-purple-500' : 'bg-gray-300'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                      {notification.title}
                                    </p>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        deleteNotification(notification.id)
                                      }}
                                      className="text-gray-400 hover:text-rose-500 transition-colors flex-shrink-0"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-[10px] text-gray-400 mt-1">
                                    {new Date(notification.createdAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Security Center */}
              <button 
                onClick={() => setSecurityOpen(true)}
                className="relative p-3 rounded-xl hover:bg-violet-50 transition-colors group"
                title="Security Center"
              >
                <Shield size={22} className="text-gray-600 group-hover:text-violet-600 transition-colors" />
                {securityAlertsCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[20px] h-5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-lg shadow-amber-500/50 text-white text-xs font-bold flex items-center justify-center px-1">
                    {securityAlertsCount > 99 ? '99+' : securityAlertsCount}
                  </span>
                )}
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-violet-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <User size={18} className="text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-semibold text-gray-700">
                    {user?.firstName}
                  </span>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl shadow-purple-500/20 border border-white/50 py-3 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="text-sm font-bold text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </div>
                        <div className="text-xs text-purple-600 mt-0.5">{user?.email}</div>
                      </div>
                      <NavLink
                        to="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 transition-colors"
                      >
                        <Settings size={18} />
                        Settings
                      </NavLink>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut size={18} />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 md:p-8 lg:p-10 min-h-[calc(100vh-5rem)] bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
          <Outlet />
        </main>
      </div>

      {/* Security Settings Modal */}
      <SecuritySettingsModal 
        isOpen={securityOpen} 
        onClose={() => setSecurityOpen(false)} 
      />
    </div>
  )
}
