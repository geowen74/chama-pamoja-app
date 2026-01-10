
import AddMemberModal from '../../components/modals/AddMemberModal'
import { Link } from 'react-router-dom'
import { useDataStore } from '../../store/dataStore'
import { useState } from 'react'
import {
  UsersRound,
  Search,
  Filter,
  UserCheck,
  UserX,
  Clock,
  Phone,
  Mail,
  Eye,
  TrendingUp,
  TrendingDown,
  UserCog,
} from 'lucide-react'

// Simulated last login data (in production, this would come from auth store)
const getLastLogin = (memberId: string) => {
  const loginTimes: Record<string, Date> = {
    '1': new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    '2': new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    '3': new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    '4': new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    '5': new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
  }
  return loginTimes[memberId] || new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
}

const formatLastLogin = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 60) return `${minutes} min ago`
  if (hours < 24) return `${hours} hours ago`
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return `${Math.floor(days / 30)} months ago`
}

const getMemberStatus = (lastLogin: Date): 'active' | 'inactive' | 'dormant' => {
  const daysSinceLogin = Math.floor((Date.now() - lastLogin.getTime()) / 86400000)
  if (daysSinceLogin <= 7) return 'active'
  if (daysSinceLogin <= 30) return 'inactive'
  return 'dormant'
}

export default function GroupMembers() {
  const { members } = useDataStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'dormant'>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  // Add last login data to members
  const membersWithStatus = members.map(member => {
    const lastLogin = getLastLogin(member.id)
    return {
      ...member,
      lastLogin,
      status: getMemberStatus(lastLogin)
    }
  })

  // Filter members
  const filteredMembers = membersWithStatus.filter(member => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Stats
  const activeCount = membersWithStatus.filter(m => m.status === 'active').length
  const inactiveCount = membersWithStatus.filter(m => m.status === 'inactive').length
  const dormantCount = membersWithStatus.filter(m => m.status === 'dormant').length

  const getStatusBadge = (status: 'active' | 'inactive' | 'dormant') => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Active
          </span>
        )
      case 'inactive':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Inactive
          </span>
        )
      case 'dormant':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            Dormant
          </span>
        )
    }
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Group Members</h1>
          <p className="text-gray-500 mt-1">Monitor member activity and engagement status</p>
        </div>
        <div>
          <button
            className="btn btn-primary flex items-center gap-2"
            onClick={() => setShowAddModal(true)}
          >
            Add Member
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Members</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{members.length}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25 flex items-center justify-center">
              <UsersRound className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Active</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{activeCount}</p>
              <p className="text-xs text-gray-400 mt-1">Last 7 days</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25 flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Inactive</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{inactiveCount}</p>
              <p className="text-xs text-gray-400 mt-1">8-30 days</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Dormant</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{dormantCount}</p>
              <p className="text-xs text-gray-400 mt-1">Over 30 days</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/25 flex items-center justify-center">
              <UserX className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12 w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="input-field"
            >
              <option value="all">All Members</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
              <option value="dormant">Dormant Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Member</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">ID Number</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Role</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Contact</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Last Login</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member, index) => (
                <tr
                  key={member.id}
                  className={`border-b border-gray-50 hover:bg-violet-50/50 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-white ${
                        member.status === 'active' 
                          ? 'bg-gradient-to-br from-emerald-500 to-green-600' 
                          : member.status === 'inactive'
                          ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                          : 'bg-gradient-to-br from-red-500 to-rose-600'
                      }`}>
                        {member.firstName[0]}{member.lastName[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono text-base text-gray-700">
                    {member.idNumber || '--'}
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-violet-100 text-violet-700 capitalize">
                      <UserCog className="w-3.5 h-3.5" />
                      {member.role?.replace('_', ' ') || 'Member'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-3.5 h-3.5" />
                        {member.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Mail className="w-3.5 h-3.5" />
                        {member.email}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(member.status)}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {formatLastLogin(member.lastLogin)}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-end">
                      <Link
                        to={`/members/${member.id}`}
                        className="p-2 rounded-lg hover:bg-violet-100 text-violet-600 transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMembers.length === 0 && (
          <div className="p-12 text-center">
            <UsersRound className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No members found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Activity Summary */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-violet-600" />
          Activity Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-emerald-700">Active Rate</span>
              <span className="text-2xl font-bold text-emerald-600">
                {members.length > 0 ? Math.round((activeCount / members.length) * 100) : 0}%
              </span>
            </div>
            <div className="mt-2 h-2 bg-emerald-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${members.length > 0 ? (activeCount / members.length) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-amber-700">Inactive Rate</span>
              <span className="text-2xl font-bold text-amber-600">
                {members.length > 0 ? Math.round((inactiveCount / members.length) * 100) : 0}%
              </span>
            </div>
            <div className="mt-2 h-2 bg-amber-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{ width: `${members.length > 0 ? (inactiveCount / members.length) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          <div className="p-4 bg-red-50 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-700">Dormant Rate</span>
              <span className="text-2xl font-bold text-red-600">
                {members.length > 0 ? Math.round((dormantCount / members.length) * 100) : 0}%
              </span>
            </div>
            <div className="mt-2 h-2 bg-red-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500 rounded-full transition-all"
                style={{ width: `${members.length > 0 ? (dormantCount / members.length) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    {/* Add Member Modal */}
    {showAddModal && (
      <AddMemberModal onClose={() => setShowAddModal(false)} />
    )}
  </div>
  )
}
