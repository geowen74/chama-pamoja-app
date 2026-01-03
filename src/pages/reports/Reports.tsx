import { useState } from 'react'
import { useDataStore } from '../../store/dataStore'
import { useAuthStore } from '../../store/authStore'
import {
  BarChart3,
  Download,
  TrendingUp,
  TrendingDown,
  Users,
  Wallet,
  HandCoins,
  FileText,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

// Mock data for charts
const monthlyData = [
  { month: 'Jan', contributions: 125000, loans: 80000, repayments: 45000 },
  { month: 'Feb', contributions: 135000, loans: 60000, repayments: 55000 },
  { month: 'Mar', contributions: 128000, loans: 100000, repayments: 48000 },
  { month: 'Apr', contributions: 142000, loans: 75000, repayments: 62000 },
  { month: 'May', contributions: 138000, loans: 90000, repayments: 58000 },
  { month: 'Jun', contributions: 155000, loans: 120000, repayments: 72000 },
  { month: 'Jul', contributions: 148000, loans: 85000, repayments: 68000 },
  { month: 'Aug', contributions: 160000, loans: 95000, repayments: 75000 },
  { month: 'Sep', contributions: 152000, loans: 110000, repayments: 82000 },
  { month: 'Oct', contributions: 168000, loans: 88000, repayments: 78000 },
  { month: 'Nov', contributions: 175000, loans: 105000, repayments: 85000 },
  { month: 'Dec', contributions: 185000, loans: 130000, repayments: 92000 },
]

const contributionTypeData = [
  { name: 'Monthly', value: 65, color: '#3b82f6' },
  { name: 'Emergency Fund', value: 20, color: '#22c55e' },
  { name: 'Investment Fund', value: 15, color: '#f59e0b' },
]

const loanStatusData = [
  { name: 'Repaying', value: 45, color: '#3b82f6' },
  { name: 'Completed', value: 40, color: '#22c55e' },
  { name: 'Pending', value: 10, color: '#f59e0b' },
  { name: 'Defaulted', value: 5, color: '#ef4444' },
]

export default function Reports() {
  const { group } = useAuthStore()
  const { members, contributions, loans } = useDataStore()
  const [reportType, setReportType] = useState<'overview' | 'contributions' | 'loans' | 'members'>('overview')
  const [dateRange, setDateRange] = useState('year')

  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0)
  const totalLoans = loans.reduce((sum, l) => sum + l.principalAmount, 0)
  const outstandingLoans = loans.filter(l => ['repaying', 'disbursed'].includes(l.status)).reduce((sum, l) => sum + l.balance, 0)

  const reportTypes = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'contributions', label: 'Contributions', icon: Wallet },
    { id: 'loans', label: 'Loans', icon: HandCoins },
    { id: 'members', label: 'Members', icon: Users },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Financial insights and performance metrics</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input w-auto"
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
          <button className="btn btn-primary flex items-center gap-2">
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Report type tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {reportTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setReportType(type.id as typeof reportType)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              reportType === type.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <type.icon size={18} />
            {type.label}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Contributions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                KES {totalContributions.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/25">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Loans Disbursed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                KES {totalLoans.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <HandCoins className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outstanding Loans</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                KES {outstandingLoans.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Balance</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                KES {(group?.availableBalance || 0).toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Wallet className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly trend chart */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Financial Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorContributions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLoans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `${(value/1000)}k`} />
                <Tooltip 
                  formatter={(value: number) => [`KES ${value.toLocaleString()}`, '']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="contributions" 
                  name="Contributions"
                  stroke="#22c55e" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorContributions)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="loans" 
                  name="Loans Issued"
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorLoans)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Contribution breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contribution Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={contributionTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value}%)`}
                >
                  {contributionTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Loan status breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Status Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={loanStatusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip formatter={(value: number) => [`${value}%`, 'Percentage']} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {loanStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top members table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Top Contributors</h3>
          <button className="text-primary-600 text-sm font-medium hover:underline">
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="table-header px-4 py-3">Rank</th>
                <th className="table-header px-4 py-3">Member</th>
                <th className="table-header px-4 py-3">Total Contributions</th>
                <th className="table-header px-4 py-3">Shares</th>
                <th className="table-header px-4 py-3">Loans Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {members
                .sort((a, b) => b.totalContributions - a.totalContributions)
                .slice(0, 5)
                .map((member, index) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-600' :
                        index === 1 ? 'bg-gray-200 text-gray-600' :
                        index === 2 ? 'bg-orange-100 text-orange-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="table-cell font-medium text-gray-900">
                      {member.firstName} {member.lastName}
                    </td>
                    <td className="table-cell font-semibold text-gray-900">
                      KES {member.totalContributions.toLocaleString()}
                    </td>
                    <td className="table-cell text-gray-600">{member.shares}</td>
                    <td className="table-cell text-gray-600">
                      KES {member.totalLoans.toLocaleString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick reports */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="card flex items-center gap-4 hover:shadow-md transition-shadow text-left">
          <div className="p-3 bg-blue-100 rounded-xl">
            <FileText size={24} className="text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">Member Statement</div>
            <div className="text-sm text-gray-500">Generate individual member reports</div>
          </div>
        </button>
        <button className="card flex items-center gap-4 hover:shadow-md transition-shadow text-left">
          <div className="p-3 bg-green-100 rounded-xl">
            <FileText size={24} className="text-green-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">Financial Statement</div>
            <div className="text-sm text-gray-500">Income & expense summary</div>
          </div>
        </button>
        <button className="card flex items-center gap-4 hover:shadow-md transition-shadow text-left">
          <div className="p-3 bg-purple-100 rounded-xl">
            <FileText size={24} className="text-purple-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">Loan Report</div>
            <div className="text-sm text-gray-500">Loan performance analysis</div>
          </div>
        </button>
      </div>
    </div>
  )
}
