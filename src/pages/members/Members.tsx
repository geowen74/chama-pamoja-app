import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDataStore } from '../../store/dataStore'
import { usePermission } from '../../utils/permissions'
import {
  Search,
  Plus,
  MoreVertical,
  Mail,
  Phone,
  User,
  Filter,
  Download,
  UserPlus,
} from 'lucide-react'
import AddMemberModal from '../../components/modals/AddMemberModal'

export default function Members() {
  const { members } = useDataStore()
  const canAddMembers = usePermission('add_members')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter
    const matchesRole = roleFilter === 'all' || member.role === roleFilter
    return matchesSearch && matchesStatus && matchesRole
  })

  const roleColors: Record<string, string> = {
    chairman: 'bg-violet-100 text-violet-600',
    vice_chairman: 'bg-violet-50 text-violet-500',
    treasurer: 'bg-blue-100 text-blue-600',
    vice_treasurer: 'bg-blue-50 text-blue-500',
    secretary: 'bg-green-100 text-green-600',
    vice_secretary: 'bg-green-50 text-green-500',
    admin: 'bg-purple-100 text-purple-600',
    member: 'bg-gray-100 text-gray-600',
  }

  const statusColors = {
    active: 'bg-success-100 text-success-600',
    inactive: 'bg-gray-100 text-gray-600',
    suspended: 'bg-danger-100 text-danger-600',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-gray-500 mt-1">{members.length} total members</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary flex items-center gap-2">
            <Download size={18} />
            Export
          </button>
          {canAddMembers && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <UserPlus size={18} />
              Add Member
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-auto"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="treasurer">Treasurer</option>
            <option value="secretary">Secretary</option>
            <option value="member">Member</option>
          </select>
        </div>
      </div>

      {/* Members grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredMembers.map((member) => (
          <Link
            key={member.id}
            to={`/members/${member.id}`}
            className="card hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <User size={24} className="text-primary-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {member.firstName} {member.lastName}
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                    roleColors[member.role]
                  }`}>
                    {member.role}
                  </span>
                </div>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded">
                <MoreVertical size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={14} />
                {member.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={14} />
                {member.phone}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500">Total Contributions</div>
                <div className="text-sm font-semibold text-gray-900">
                  KES {member.totalContributions.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Outstanding Loans</div>
                <div className="text-sm font-semibold text-gray-900">
                  KES {member.outstandingLoans.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                statusColors[member.status]
              }`}>
                {member.status}
              </span>
              <span className="text-xs text-gray-500">
                Joined {new Date(member.joinedAt).toLocaleDateString()}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="card text-center py-12">
          <User size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || statusFilter !== 'all' || roleFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Add your first member to get started'}
          </p>
          {canAddMembers && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Add Member
            </button>
          )}
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <AddMemberModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  )
}
