import { useState } from 'react'
import {
  ClipboardList,
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  Target,
  ArrowRight,
  Edit,
  Trash2,
  Filter,
  ChevronRight,
  Flag,
  Timer,
} from 'lucide-react'

interface ActionItem {
  id: string
  title: string
  description: string
  category: 'strategic' | 'operational' | 'financial' | 'member-welfare' | 'compliance'
  priority: 'high' | 'medium' | 'low'
  status: 'not-started' | 'in-progress' | 'completed' | 'overdue'
  assignedTo: string
  dueDate: string
  progress: number
  createdDate: string
  relatedResolution?: string
}

export default function ActionPlan() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'not-started' | 'in-progress' | 'completed' | 'overdue'>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  // Action items data - starts empty, add your group's action items
  const [actionItems] = useState<ActionItem[]>([])

  const filteredItems = actionItems.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: ActionItem['status']) => {
    switch (status) {
      case 'not-started':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            <Clock className="w-3 h-3" />
            Not Started
          </span>
        )
      case 'in-progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            <Timer className="w-3 h-3" />
            In Progress
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </span>
        )
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <AlertTriangle className="w-3 h-3" />
            Overdue
          </span>
        )
    }
  }

  const getPriorityBadge = (priority: ActionItem['priority']) => {
    switch (priority) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-red-50 text-red-600">
            <Flag className="w-3 h-3" />
            High
          </span>
        )
      case 'medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-600">
            <Flag className="w-3 h-3" />
            Medium
          </span>
        )
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-green-50 text-green-600">
            <Flag className="w-3 h-3" />
            Low
          </span>
        )
    }
  }

  const getCategoryColor = (category: ActionItem['category']) => {
    const colors = {
      strategic: 'from-violet-500 to-purple-600',
      operational: 'from-blue-500 to-cyan-600',
      financial: 'from-emerald-500 to-green-600',
      'member-welfare': 'from-pink-500 to-rose-600',
      compliance: 'from-amber-500 to-orange-600'
    }
    return colors[category]
  }

  // Stats
  const completedCount = actionItems.filter(i => i.status === 'completed').length
  const inProgressCount = actionItems.filter(i => i.status === 'in-progress').length
  const overdueCount = actionItems.filter(i => i.status === 'overdue').length
  const notStartedCount = actionItems.filter(i => i.status === 'not-started').length

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Action Plan</h1>
          <p className="text-gray-500 mt-1">Track and manage group tasks and objectives</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Action Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Completed</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{completedCount}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/25 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">In Progress</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{inProgressCount}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/25 flex items-center justify-center">
              <Timer className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Not Started</p>
              <p className="text-3xl font-bold text-gray-600 mt-1">{notStartedCount}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-500 to-gray-600 shadow-lg shadow-gray-500/25 flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Overdue</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{overdueCount}</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/25 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-white" />
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
              placeholder="Search action items..."
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
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Items List */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const daysRemaining = getDaysRemaining(item.dueDate)
          return (
            <div
              key={item.id}
              className="glass-card rounded-2xl p-6 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${getCategoryColor(item.category)} shadow-lg flex items-center justify-center flex-shrink-0`}>
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 text-lg">{item.title}</h3>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(item.status)}
                      {getPriorityBadge(item.priority)}
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">{item.description}</p>
                  
                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-medium text-gray-700">{item.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          item.status === 'completed' 
                            ? 'bg-gradient-to-r from-emerald-500 to-green-500' 
                            : item.status === 'overdue'
                            ? 'bg-gradient-to-r from-red-500 to-rose-500'
                            : 'bg-gradient-to-r from-violet-500 to-purple-500'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      {item.assignedTo}
                    </div>
                    <div className={`flex items-center gap-2 text-sm ${
                      item.status === 'overdue' ? 'text-red-600' : 
                      daysRemaining <= 3 && daysRemaining > 0 ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      <Calendar className="w-4 h-4" />
                      {item.status === 'completed' ? (
                        'Completed'
                      ) : item.status === 'overdue' ? (
                        `${Math.abs(daysRemaining)} days overdue`
                      ) : daysRemaining === 0 ? (
                        'Due today'
                      ) : daysRemaining < 0 ? (
                        `${Math.abs(daysRemaining)} days overdue`
                      ) : (
                        `${daysRemaining} days remaining`
                      )}
                    </div>
                    {item.relatedResolution && (
                      <div className="flex items-center gap-1.5 text-sm text-violet-600">
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-medium">{item.relatedResolution}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 lg:flex-col">
                  <button className="p-2 rounded-lg hover:bg-violet-100 text-violet-600 transition-colors">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {filteredItems.length === 0 && (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30 flex items-center justify-center mx-auto mb-4">
                <ClipboardList className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Action Items Yet</h3>
              <p className="text-gray-500 mb-6">Create and track tasks to achieve your group's goals.</p>
              <div className="text-left bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-3">📌 How to use Action Plan:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600">1.</span>
                    <span>Click "Add Action Item" to create a new task</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600">2.</span>
                    <span>Assign tasks to members with due dates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600">3.</span>
                    <span>Set priority levels (High, Medium, Low)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-violet-600">4.</span>
                    <span>Track progress and mark items as complete</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn-primary flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Create First Action Item
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Action Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Add Action Item</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <ArrowRight className="w-5 h-5 text-gray-400 rotate-45" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl mb-2">
                <p className="text-sm text-gray-600">💡 <strong>Tip:</strong> Action items are tasks assigned to members to implement group decisions.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input type="text" className="input-field w-full" placeholder="e.g., Update Contribution Payment Schedule" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select className="input-field w-full">
                  <option value="">Select a category</option>
                  <option value="strategic">Strategic - Long-term goals, planning</option>
                  <option value="operational">Operational - Day-to-day tasks</option>
                  <option value="financial">Financial - Money-related tasks</option>
                  <option value="member-welfare">Member Welfare - Benefits, support</option>
                  <option value="compliance">Compliance - Regulations, audits</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select className="input-field w-full">
                  <option value="">Select priority level</option>
                  <option value="high">🔴 High - Urgent, needs immediate attention</option>
                  <option value="medium">🟡 Medium - Important but not urgent</option>
                  <option value="low">🟢 Low - Can be done when time permits</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
                <input type="text" className="input-field w-full" placeholder="e.g., Mary Wanjiku (Treasurer)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input type="date" className="input-field w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea 
                  className="input-field w-full h-24 resize-none" 
                  placeholder="e.g., Notify all members of the new contribution amount and update the M-PESA paybill settings to reflect the change."
                ></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <button className="btn-secondary flex-1" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button className="btn-primary flex-1" onClick={() => setShowAddModal(false)}>
                  Add Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
