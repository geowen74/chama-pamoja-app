import { useState } from 'react'
import {
  FileText,
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
  Edit,
  Download,
  Filter,
  FileCheck,
  AlertCircle,
} from 'lucide-react'

interface Resolution {
  id: string
  title: string
  description: string
  category: 'financial' | 'operational' | 'membership' | 'policy' | 'other'
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  proposedBy: string
  proposedDate: string
  votingDate?: string
  votesFor: number
  votesAgainst: number
  votesAbstain: number
  approvedDate?: string
  attachments: string[]
}

export default function BoardResolutions() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'pending' | 'approved' | 'rejected'>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedResolution, setSelectedResolution] = useState<Resolution | null>(null)

  // Resolutions data - starts empty, add your group's resolutions
  const [resolutions] = useState<Resolution[]>([])

  const filteredResolutions = resolutions.filter(resolution => {
    const matchesSearch = 
      resolution.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resolution.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || resolution.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: Resolution['status']) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            <Edit className="w-3 h-3" />
            Draft
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <Clock className="w-3 h-3" />
            Pending Vote
          </span>
        )
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="w-3 h-3" />
            Approved
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        )
    }
  }

  const getCategoryBadge = (category: Resolution['category']) => {
    const colors = {
      financial: 'bg-blue-100 text-blue-700',
      operational: 'bg-purple-100 text-purple-700',
      membership: 'bg-green-100 text-green-700',
      policy: 'bg-orange-100 text-orange-700',
      other: 'bg-gray-100 text-gray-700'
    }
    return (
      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${colors[category]}`}>
        {category}
      </span>
    )
  }

  // Stats
  const approvedCount = resolutions.filter(r => r.status === 'approved').length
  const pendingCount = resolutions.filter(r => r.status === 'pending').length
  const draftCount = resolutions.filter(r => r.status === 'draft').length
  const rejectedCount = resolutions.filter(r => r.status === 'rejected').length

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Board Resolutions</h1>
          <p className="text-gray-500 mt-1">Track and manage group decisions and policies</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Resolution
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Approved</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{approvedCount}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Pending</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{pendingCount}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25 flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Drafts</p>
              <p className="text-3xl font-bold text-gray-600 mt-1">{draftCount}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 shadow-lg shadow-gray-500/25 flex items-center justify-center">
              <Edit className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Rejected</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{rejectedCount}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/25 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-white" />
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
              placeholder="Search resolutions..."
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
              <option value="all">All Status</option>
              <option value="draft">Drafts</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resolutions List */}
      <div className="space-y-4">
        {filteredResolutions.map((resolution) => (
          <div
            key={resolution.id}
            className="glass-card rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setSelectedResolution(resolution)}
          >
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                    resolution.status === 'approved' 
                      ? 'bg-gradient-to-br from-emerald-500 to-green-600' 
                      : resolution.status === 'pending'
                      ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                      : resolution.status === 'rejected'
                      ? 'bg-gradient-to-br from-red-500 to-rose-600'
                      : 'bg-gradient-to-br from-gray-400 to-gray-500'
                  } shadow-lg`}>
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{resolution.title}</h3>
                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{resolution.description}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {getStatusBadge(resolution.status)}
                      {getCategoryBadge(resolution.category)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  Proposed by {resolution.proposedBy}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  {new Date(resolution.proposedDate).toLocaleDateString()}
                </div>
                {resolution.status === 'approved' || resolution.status === 'rejected' ? (
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-emerald-600 font-medium">✓ {resolution.votesFor}</span>
                    <span className="text-red-600 font-medium">✗ {resolution.votesAgainst}</span>
                    <span className="text-gray-400">○ {resolution.votesAbstain}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}

        {filteredResolutions.length === 0 && (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30 flex items-center justify-center mx-auto mb-4">
                <FileCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Resolutions Yet</h3>
              <p className="text-gray-500 mb-6">Start documenting your group's formal decisions and policies here.</p>
              <div className="text-left bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">📋 How to use Board Resolutions:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600">1.</span>
                    <span>Click "New Resolution" to propose a new decision</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600">2.</span>
                    <span>Save as draft for review, or submit for voting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600">3.</span>
                    <span>Members vote on pending resolutions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600">4.</span>
                    <span>Track approved/rejected decisions with voting records</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Create First Resolution
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Resolution Detail Modal */}
      {selectedResolution && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Resolution Details</h2>
                <button
                  onClick={() => setSelectedResolution(null)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedResolution.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  {getStatusBadge(selectedResolution.status)}
                  {getCategoryBadge(selectedResolution.category)}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                <p className="text-gray-700">{selectedResolution.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Proposed By</h4>
                  <p className="font-semibold text-gray-900">{selectedResolution.proposedBy}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Proposed Date</h4>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedResolution.proposedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {(selectedResolution.status === 'approved' || selectedResolution.status === 'rejected') && (
                <div className="p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Voting Results</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-emerald-600">{selectedResolution.votesFor}</div>
                      <div className="text-xs text-gray-500">In Favor</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{selectedResolution.votesAgainst}</div>
                      <div className="text-xs text-gray-500">Against</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-400">{selectedResolution.votesAbstain}</div>
                      <div className="text-xs text-gray-500">Abstained</div>
                    </div>
                  </div>
                </div>
              )}

              {selectedResolution.attachments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Attachments</h4>
                  <div className="space-y-2">
                    {selectedResolution.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-violet-600" />
                          <span className="text-sm text-gray-700">{file}</span>
                        </div>
                        <button className="p-1.5 rounded-lg hover:bg-violet-100 text-violet-600 transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                {selectedResolution.status === 'draft' && (
                  <>
                    <button className="btn-primary flex-1 flex items-center justify-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Submit for Voting
                    </button>
                    <button className="btn-secondary flex items-center gap-2">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  </>
                )}
                {selectedResolution.status === 'pending' && (
                  <button className="btn-primary flex-1 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Cast Vote
                  </button>
                )}
                <button className="btn-secondary flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Resolution Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">New Resolution</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl mb-2">
                <p className="text-sm text-gray-600">💡 <strong>Tip:</strong> Resolutions document formal decisions made by your group through voting.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input type="text" className="input-field w-full" placeholder="e.g., Increase Monthly Contribution Amount" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select className="input-field w-full">
                  <option value="">Select a category</option>
                  <option value="financial">Financial - Budget, contributions, investments</option>
                  <option value="operational">Operational - Procedures, meetings</option>
                  <option value="membership">Membership - New members, roles</option>
                  <option value="policy">Policy - Rules, guidelines</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea 
                  className="input-field w-full h-32 resize-none" 
                  placeholder="e.g., Proposal to increase monthly contribution from KES 5,000 to KES 7,500 starting next quarter to accelerate savings growth and enable larger investment opportunities."
                ></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <button className="btn-secondary flex-1" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button className="btn-primary flex-1" onClick={() => setShowAddModal(false)}>
                  Save as Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
