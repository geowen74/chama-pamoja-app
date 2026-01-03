import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useDataStore } from '../../store/dataStore'
import {
  Users,
  Wallet,
  HandCoins,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function Dashboard() {
  const { group, user } = useAuthStore()
  const { members, contributions, loans, meetings } = useDataStore()

  const pendingContributions = contributions.filter(c => c.status === 'pending')
  const pendingLoans = loans.filter(l => l.status === 'pending')
  const upcomingMeetings = meetings.filter(m => m.status === 'scheduled')
  const activeLoans = loans.filter(l => l.status === 'repaying')
  const totalOutstanding = activeLoans.reduce((sum, l) => sum + l.balance, 0)
  
  // Calculate totals from actual data
  const totalContributions = contributions
    .filter(c => c.status === 'confirmed')
    .reduce((sum, c) => sum + c.amount, 0)
  const totalLoansDisbursed = loans
    .filter(l => l.status === 'repaying' || l.status === 'completed')
    .reduce((sum, l) => sum + l.principalAmount, 0)
  const availableBalance = totalContributions - totalLoansDisbursed + activeLoans.reduce((sum, l) => sum + l.amountPaid, 0)

  // Generate chart data from actual contributions
  const contributionData = contributions.length > 0 
    ? contributions.slice(-6).map(c => ({ month: c.date.slice(5, 7), amount: c.amount }))
    : []

  // Generate loan status data from actual loans
  const repayingCount = loans.filter(l => l.status === 'repaying').length
  const pendingCount = loans.filter(l => l.status === 'pending').length
  const completedCount = loans.filter(l => l.status === 'completed').length
  const loanStatusData = [
    { name: 'Repaying', value: repayingCount, color: '#8b5cf6' },
    { name: 'Pending', value: pendingCount, color: '#f97316' },
    { name: 'Completed', value: completedCount, color: '#10b981' },
  ].filter(d => d.value > 0)

  const stats = [
    {
      name: 'Total Members',
      value: members.length,
      icon: Users,
      change: members.length > 0 ? `${members.length} active` : 'No members',
      trend: 'up',
      color: 'purple',
    },
    {
      name: 'Total Contributions',
      value: `KES ${totalContributions.toLocaleString()}`,
      icon: Wallet,
      change: contributions.length > 0 ? `${contributions.length} records` : 'No contributions',
      trend: 'up',
      color: 'green',
    },
    {
      name: 'Active Loans',
      value: activeLoans.length,
      icon: HandCoins,
      change: `KES ${totalOutstanding.toLocaleString()} outstanding`,
      trend: 'neutral',
      color: 'orange',
    },
    {
      name: 'Available Balance',
      value: `KES ${Math.max(0, availableBalance).toLocaleString()}`,
      icon: TrendingUp,
      change: availableBalance >= 0 ? 'Positive' : 'Negative',
      trend: 'up',
      color: 'blue',
    },
  ]

  const colorClasses = {
    blue: { 
      bg: 'bg-gradient-to-br from-blue-500 to-indigo-600', 
      lightBg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      icon: 'text-white',
      shadow: 'shadow-blue-500/30'
    },
    green: { 
      bg: 'bg-gradient-to-br from-emerald-500 to-teal-600', 
      lightBg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      icon: 'text-white',
      shadow: 'shadow-emerald-500/30'
    },
    orange: { 
      bg: 'bg-gradient-to-br from-orange-500 to-amber-600', 
      lightBg: 'bg-gradient-to-br from-orange-50 to-amber-50',
      icon: 'text-white',
      shadow: 'shadow-orange-500/30'
    },
    purple: { 
      bg: 'bg-gradient-to-br from-violet-500 to-purple-600', 
      lightBg: 'bg-gradient-to-br from-violet-50 to-purple-50',
      icon: 'text-white',
      shadow: 'shadow-violet-500/30'
    },
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 rounded-2xl p-5 text-white shadow-xl shadow-purple-500/25">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold">
                Welcome back{user?.firstName ? `, ${user.firstName}` : ''}! 👋
              </h1>
              <p className="text-white/80 mt-1 text-sm">{group?.name || 'Your Chama'} Dashboard</p>
            </div>
            <div className="flex gap-2">
              <Link to="/contributions" className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm font-semibold hover:bg-white/30 transition-all duration-300 border border-white/20">
                Record Contribution
              </Link>
              <Link to="/loans/apply" className="px-4 py-2 bg-white text-purple-600 rounded-lg text-sm font-semibold hover:bg-white/90 transition-all duration-300 shadow-md">
                Apply for Loan
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const colors = colorClasses[stat.color as keyof typeof colorClasses]
          return (
            <div 
              key={stat.name} 
              className="glass-card hover:-translate-y-2 transition-all duration-500 min-w-0"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div className={`p-4 rounded-2xl ${colors.bg} ${colors.shadow} shadow-lg flex-shrink-0`}>
                  <stat.icon size={28} className={colors.icon} />
                </div>
                {stat.trend !== 'neutral' && (
                  <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                    stat.trend === 'up' 
                      ? 'bg-emerald-100 text-emerald-600' 
                      : 'bg-rose-100 text-rose-600'
                  }`}>
                    {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    <span className="font-medium truncate max-w-[80px]">{stat.change}</span>
                  </div>
                )}
              </div>
              <div className="mt-5">
                <div className="text-xl sm:text-2xl lg:text-xl xl:text-2xl font-bold text-gray-900 truncate">{stat.value}</div>
                <div className="text-sm font-bold text-purple-700 mt-1">{stat.name}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contributions chart */}
        <div className="lg:col-span-2 glass-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">📈 Contribution Trends</h3>
            <span className="px-4 py-2 bg-gradient-to-r from-violet-100 to-purple-100 text-purple-700 rounded-full text-sm font-medium">
              Last 6 months
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={contributionData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                    <stop offset="50%" stopColor="#d946ef" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `${(value/1000)}k`} tickLine={false} axisLine={false} />
                <Tooltip 
                  formatter={(value: number) => [`KES ${value.toLocaleString()}`, 'Amount']}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 40px rgba(139, 92, 246, 0.2)',
                    background: 'rgba(255,255,255,0.95)',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="url(#colorAmount)" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Loan status chart */}
        <div className="glass-card">
          <h3 className="text-xl font-bold text-gray-900 mb-6">🎯 Loan Status</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={loanStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {loanStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)' 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {loanStatusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-full">
                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-medium text-gray-700">{item.name}</span>
                <span className="text-sm text-gray-500">({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action items row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending items */}
        <div className="glass-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">⚡ Pending Actions</h3>
            <span className="px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 text-orange-700 rounded-full text-sm font-semibold">
              {pendingContributions.length + pendingLoans.length} pending
            </span>
          </div>
          <div className="space-y-4">
            {pendingContributions.slice(0, 3).map((contribution) => (
              <div key={contribution.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100/50 hover:shadow-lg hover:shadow-amber-100/50 transition-all duration-300">
                <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg shadow-amber-500/30">
                  <AlertCircle size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900">{contribution.memberName}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Contribution of <span className="font-medium text-amber-600">KES {contribution.amount.toLocaleString()}</span>
                  </div>
                </div>
                <Link to="/contributions" className="px-4 py-2 bg-white text-amber-600 rounded-xl text-sm font-semibold hover:bg-amber-50 transition-colors shadow-sm">
                  Review
                </Link>
              </div>
            ))}
            {pendingLoans.slice(0, 2).map((loan) => (
              <div key={loan.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl border border-violet-100/50 hover:shadow-lg hover:shadow-violet-100/50 transition-all duration-300">
                <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/30">
                  <HandCoins size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900">{loan.memberName}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Loan application for <span className="font-medium text-violet-600">KES {loan.principalAmount.toLocaleString()}</span>
                  </div>
                </div>
                <Link to={`/loans/${loan.id}`} className="px-4 py-2 bg-white text-violet-600 rounded-xl text-sm font-semibold hover:bg-violet-50 transition-colors shadow-sm">
                  Review
                </Link>
              </div>
            ))}
            {pendingContributions.length === 0 && pendingLoans.length === 0 && (
              <div className="flex flex-col items-center gap-3 p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl">
                <div className="p-4 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 size={32} className="text-white" />
                </div>
                <span className="text-gray-600 font-medium">All caught up! No pending actions</span>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming meetings */}
        <div className="glass-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">📅 Upcoming Meetings</h3>
            <Link to="/meetings" className="px-4 py-2 bg-gradient-to-r from-violet-100 to-purple-100 text-purple-700 rounded-full text-sm font-semibold hover:from-violet-200 hover:to-purple-200 transition-all">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingMeetings.map((meeting, index) => (
              <div 
                key={meeting.id} 
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                  index === 0 
                    ? 'bg-gradient-to-r from-violet-50 to-purple-50 border-violet-100/50 hover:shadow-violet-100/50' 
                    : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-100/50 hover:shadow-gray-100/50'
                }`}
              >
                <div className={`p-3 rounded-xl shadow-lg ${
                  index === 0 
                    ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-violet-500/30' 
                    : 'bg-gradient-to-br from-gray-400 to-slate-500 shadow-gray-500/30'
                }`}>
                  <Calendar size={20} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">{meeting.title}</div>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-white px-3 py-1 rounded-full">
                      <Calendar size={12} />
                      {new Date(meeting.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500 bg-white px-3 py-1 rounded-full">
                      <Clock size={12} />
                      {meeting.time}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">📍 {meeting.venue}</div>
                </div>
              </div>
            ))}
            {upcomingMeetings.length === 0 && (
              <div className="text-center p-8 bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl">
                <div className="p-4 bg-gradient-to-br from-gray-300 to-slate-400 rounded-full inline-flex mb-3">
                  <Calendar size={28} className="text-white" />
                </div>
                <p className="text-gray-500 font-medium">No upcoming meetings scheduled</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="glass-card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">💰 Recent Contributions</h3>
          <Link to="/contributions" className="px-4 py-2 bg-gradient-to-r from-violet-100 to-purple-100 text-purple-700 rounded-full text-sm font-semibold hover:from-violet-200 hover:to-purple-200 transition-all">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header px-4 py-4 rounded-tl-xl">Member</th>
                <th className="table-header px-4 py-4">Type</th>
                <th className="table-header px-4 py-4">Amount</th>
                <th className="table-header px-4 py-4">Date</th>
                <th className="table-header px-4 py-4 rounded-tr-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {contributions.slice(0, 5).map((contribution) => (
                <tr key={contribution.id} className="hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-purple-50/50 transition-colors">
                  <td className="table-cell text-gray-900 font-medium">{contribution.memberName}</td>
                  <td className="table-cell text-gray-600">{contribution.contributionTypeName}</td>
                  <td className="table-cell font-medium text-gray-900">
                    KES {contribution.amount.toLocaleString()}
                  </td>
                  <td className="table-cell text-gray-600">
                    {new Date(contribution.date).toLocaleDateString()}
                  </td>
                  <td className="table-cell">
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                      contribution.status === 'confirmed' 
                        ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700'
                        : contribution.status === 'pending'
                        ? 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700'
                        : 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700'
                    }`}>
                      {contribution.status === 'confirmed' ? '✓ ' : contribution.status === 'pending' ? '⏳ ' : '✗ '}
                      {contribution.status}
                    </span>
                  </td>
                </tr>
              ))}
              {contributions.length === 0 && (
                <tr>
                  <td colSpan={5} className="table-cell text-center py-12">
                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-gradient-to-br from-gray-100 to-slate-200 rounded-full mb-4">
                        <Wallet size={32} className="text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">No contributions yet</p>
                      <p className="text-gray-400 text-sm">Start recording contributions to see them here</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
