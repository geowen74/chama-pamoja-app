import { useDataStore } from '../../store/dataStore'
import { useState } from 'react'

export default function Projects() {
  const { projects, updateProject } = useDataStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>({})
export interface Project {
  // ...existing fields...
  dailyIncome?: { date: string; amount?: number; mileage?: number; fuel?: number }[]
}import { Link } from 'react-router-dom'
// ...existing imports...

// ...inside your grid rendering...
{filteredProjects.map((project) => {
  const CategoryIcon = categoryIco  import ProjectDetails from './pages/projects/ProjectDetails'
  // ...inside your dashboard routes...
  <Route path="/projects/:id" element={<ProjectDetails />} />ns[project.category]
  const progress = project.expectedIncome > 0 
    ? (project.actualIncome / project.expectedIncome) * 100 
    : 0
  const projectBorrowed = getProjectBorrowedAmount(project.id)
  const projectLoansCount = getProjectLoans(project.id).length

  // Only active projects are clickable
  const cardContent = (
    <>
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${categoryColors[project.category]}`}>
          <CategoryIcon size={24} />
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
            {statusLabels[project.status]}
          </span>
          <button className="p-1 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal size={18} className="text-gray-400" />
          </button>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
        {project.name}
      </h3>
      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{project.description}</p>
      {/* ...rest of card content... */}
    </>
  )

  return project.status === 'active' ? (
    <Link
      key={project.id}
      to={`/projects/${project.id}`}
      className="card hover:shadow-xl hover:shadow-primary-100/50 transition-all duration-300 group"
    >
      {cardContent}
    </Link>
  ) : (
    <div
      key={project.id}
      className="card group"
      style={{ opacity: 0.7, cursor: 'not-allowed' }}
    >
      {cardContent}
    </div>
  )
})}
  const startEdit = (project: any) => {
    setEditingId(project.id)
    setEditData({ ...project })
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value })
  }

  const saveEdit = () => {
    updateProject(editingId!, editData)
    setEditingId(null)
  }

  return (
    <div>
      {projects.map(project => (
        <div key={project.id} style={{ border: '1px solid #eee', margin: 8, padding: 8 }}>
          {editingId === project.id ? (
            <div>
              <input
                name="name"
                value={editData.name}
                onChange={handleEditChange}
                placeholder="Project Name"
              />
              <input
                name="description"
                value={editData.description}
                onChange={handleEditChange}
                placeholder="Description"
              />
              {/* Add more fields as needed */}
              <button onClick={saveEdit}>Save</button>
              <button onClick={() => setEditingId(null)}>Cancel</button>
            </div>
          ) : (
            <>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <button onClick={() => startEdit(project)}>Edit</button>
            </>
          )}
        </div>
      ))}
    </div>
  )
}import { useDataStore } from '../../store/dataStore'
import { useState } from 'react'

export default function Projects() {
  const { projects, updateProject } = useDataStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>({})

  const startEdit = (project: any) => {
    setEditingId(project.id)
    setEditData({ ...project })
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value })
  }

  const saveEdit = () => {
    updateProject(editingId!, editData)
    setEditingId(null)
  }

  return (
    <div>
      {projects.map(project => (
        <div key={project.id} style={{ border: '1px solid #eee', margin: 8, padding: 8 }}>
          {editingId === project.id ? (
            <div>
              <input
                name="name"
                value={editData.name}
                onChange={handleEditChange}
                placeholder="Project Name"
              />
              <input
                name="description"
                value={editData.description}
                onChange={handleEditChange}
                placeholder="Description"
              />
              {/* Add more fields as needed */}
              <button onClick={saveEdit}>Save</button>
              <button onClick={() => setEditingId(null)}>Cancel</button>
            </div>
          ) : (
            <>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <button onClick={() => startEdit(project)}>Edit</button>
            </>
          )}
        </div>
      ))}
    </div>
  )
}import { useParams, useNavigate } from 'react-router-dom'
import { useDataStore } from '../../store/dataStore'
import { useState } from 'react'

export default function ProjectDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { projects, updateProject } = useDataStore()
  const project = projects.find(p => p.id === id)

  const [editData, setEditData] = useState(project ? { ...project } : {})
  const [dailyIncome, setDailyIncome] = useState('')
  const [mileage, setMileage] = useState('')
  const [fuel, setFuel] = useState('')

  if (!project) return <div>Project not found</div>

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData({ ...editData, [e.target.name]: e.target.value })
  }

  const saveEdit = () => {
    updateProject(project.id, editData)
    alert('Project updated!')
  }

  const addDailyRecord = () => {
    const today = new Date().toISOString().slice(0, 10)
    const newDaily = {
      date: today,
      amount: Number(dailyIncome),
      mileage: Number(mileage),
      fuel: Number(fuel)
    }
    // Merge with existing dailyIncome array
    updateProject(project.id, {
      dailyIncome: [
        ...(project.dailyIncome || []),
        newDaily
      ]
    })
    setDailyIncome('')
    setMileage('')
    setFuel('')
  }

  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      <button className="btn btn-secondary mb-4" onClick={() => navigate(-1)}>Back</button>
      <h2 className="text-2xl font-bold mb-2">Edit Project</h2>
      <div className="space-y-2">
        <input
          name="name"
          value={editData.name}
          onChange={handleEditChange}
          placeholder="Project Name"
          className="input w-full"
        />
        <input
          name="description"
          value={editData.description}
          onChange={handleEditChange}
          placeholder="Description"
          className="input w-full"
        />
        {/* Add more fields as needed */}
        <button className="btn btn-primary" onClick={saveEdit}>Save Changes</button>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Add Daily Record</h3>
        <div className="flex flex-col gap-2">
          <input
            type="number"
            value={dailyIncome}
            onChange={e => setDailyIncome(e.target.value)}
            placeholder="Daily Income"
            className="input"
          />
          <input
            type="number"
            value={mileage}
            onChange={e => setMileage(e.target.value)}
            placeholder="Mileage Covered (km)"
            className="input"
          />
          <input
            type="number"
            value={fuel}
            onChange={e => setFuel(e.target.value)}
            placeholder="Fuel Consumed (litres)"
            className="input"
          />
          <button className="btn btn-success" onClick={addDailyRecord}>Add Record</button>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Daily Records</h3>
        <ul>
          {(project.dailyIncome || []).map((rec: any, idx: number) => (
            <li key={idx} className="border-b py-2">
              {rec.date}: Income: {rec.amount ?? '-'} | Mileage: {rec.mileage ?? '-'} | Fuel: {rec.fuel ?? '-'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}import ProjectDetails from './pages/projects/ProjectDetails'
// ...existing code...
<Route path="/projects/:id" element={<ProjectDetails />} /><Link
  key={project.id}
  to={`/projects/${project.id}`}
  className="card ... group"
>
  ...
</Link>{project.status === 'active' ? (
  <Link
    key={project.id}
    to={`/projects/${project.id}`}
    className="card ... group"
  >
    {/* ...card content... */}
  </Link>
) : (
  <div key={project.id} className="card ... group">
    {/* ...card content... */}
  </div>
)}{project.status === 'active' ? (
  <Link
    key={project.id}
    to={`/projects/${project.id}`}
    className="card ... group"
  >
    {/* ...card content... */}
  </Link>
) : (
  <div key={project.id} className="card ... group">
    {/* ...card content... */}
  </div>
)}import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDataStore } from '../../store/dataStore'
import { usePermission } from '../../utils/permissions'
import {
  Search,
  Plus,
  Filter,
  Download,
  FolderKanban,
  TrendingUp,
  Wallet,
  Target,
  Building2,
  Sprout,
  Briefcase,
  LineChart,
  PiggyBank,
  MoreHorizontal,
  Calendar,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  HandCoins,
} from 'lucide-react'
import AddProjectModal from '../../components/modals/AddProjectModal'

const categoryIcons = {
  real_estate: Building2,
  agriculture: Sprout,
  business: Briefcase,
  stocks: LineChart,
  savings: PiggyBank,
  other: FolderKanban,
}

const categoryColors = {
  real_estate: 'bg-blue-100 text-blue-600',
  agriculture: 'bg-green-100 text-green-600',
  business: 'bg-purple-100 text-purple-600',
  stocks: 'bg-orange-100 text-orange-600',
  savings: 'bg-teal-100 text-teal-600',
  other: 'bg-gray-100 text-gray-600',
}

const statusColors = {
  planning: 'bg-gray-100 text-gray-600',
  active: 'bg-success-100 text-success-600',
  completed: 'bg-blue-100 text-blue-600',
  on_hold: 'bg-warning-100 text-warning-600',
  cancelled: 'bg-danger-100 text-danger-600',
}

const statusLabels = {
  planning: 'Planning',
  active: 'Active',
  completed: 'Completed',
  on_hold: 'On Hold',
  cancelled: 'Cancelled',
}

export default function Projects() {
  const { projects, loans } = useDataStore()
  const canAddProjects = usePermission('add_projects')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)

  // Calculate loans per project
  const getProjectLoans = (projectId: string) => {
    return loans.filter(loan => loan.projectId === projectId)
  }

  const getProjectBorrowedAmount = (projectId: string) => {
    return getProjectLoans(projectId).reduce((sum, loan) => sum + loan.principalAmount, 0)
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const totalProjects = projects.length
  const activeProjects = projects.filter(p => p.status === 'active').length
  const totalInvestment = projects.reduce((sum, p) => sum + p.totalInvestment, 0)
  const totalBorrowed = projects.reduce((sum, p) => sum + getProjectBorrowedAmount(p.id), 0)
  const expectedIncome = projects.reduce((sum, p) => sum + p.expectedIncome, 0)
  const actualIncome = projects.reduce((sum, p) => sum + p.actualIncome, 0)
  const avgROI = projects.length > 0 
    ? projects.reduce((sum, p) => sum + p.roi, 0) / projects.length 
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-700 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
            Project Management
          </h1>
          <p className="text-gray-500 mt-1">Create and manage investment projects with financial tracking</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary flex items-center gap-2">
            <Download size={18} />
            Export
          </button>
          {canAddProjects && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              New Project
            </button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <FolderKanban className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalProjects}</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">Total Investment</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                KES {totalInvestment.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/25">
              <HandCoins className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">Total Borrowed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                KES {totalBorrowed.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">Expected Income</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                KES {expectedIncome.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{activeProjects}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Actual Income (Realized)</div>
              <div className="text-xl font-bold text-gray-900">KES {actualIncome.toLocaleString()}</div>
            </div>
            <div className={`flex items-center gap-1 text-sm ${actualIncome >= expectedIncome ? 'text-success-600' : 'text-warning-600'}`}>
              {actualIncome >= expectedIncome ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {expectedIncome > 0 ? ((actualIncome / expectedIncome) * 100).toFixed(1) : 0}% of target
            </div>
          </div>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-success-500 to-emerald-400 rounded-full transition-all"
              style={{ width: `${Math.min((actualIncome / (expectedIncome || 1)) * 100, 100)}%` }}
            />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Average ROI</div>
              <div className="text-xl font-bold text-gray-900">{avgROI.toFixed(1)}%</div>
            </div>
            <div className={`flex items-center gap-1 text-sm ${avgROI >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
              {avgROI >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {avgROI >= 0 ? 'Positive' : 'Negative'} returns
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input w-auto"
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="all">All Categories</option>
            <option value="real_estate">Real Estate</option>
            <option value="agriculture">Agriculture</option>
            <option value="business">Business</option>
            <option value="stocks">Stocks</option>
            <option value="savings">Savings</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Projects grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const CategoryIcon = categoryIcons[project.category]
            const progress = project.expectedIncome > 0 
              ? (project.actualIncome / project.expectedIncome) * 100 
              : 0
            const projectBorrowed = getProjectBorrowedAmount(project.id)
            const projectLoansCount = getProjectLoans(project.id).length
            
            return (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="card hover:shadow-xl hover:shadow-primary-100/50 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${categoryColors[project.category]}`}>
                    <CategoryIcon size={24} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                      {statusLabels[project.status]}
                    </span>
                    <button className="p-1 hover:bg-gray-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal size={18} className="text-gray-400" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{project.description}</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Investment</span>
                    <span className="font-semibold text-gray-900">KES {project.totalInvestment.toLocaleString()}</span>
                  </div>
                  {projectBorrowed > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <HandCoins size={14} className="text-rose-500" />
                        Borrowed
                      </span>
                      <span className="font-semibold text-rose-600">KES {projectBorrowed.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Expected Income</span>
                    <span className="font-semibold text-gray-900">KES {project.expectedIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">ROI</span>
                    <span className={`font-semibold ${project.roi >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                      {project.roi >= 0 ? '+' : ''}{project.roi.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Income Progress</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(project.startDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-3">
                    {projectLoansCount > 0 && (
                      <div className="flex items-center gap-1 text-rose-500">
                        <HandCoins size={14} />
                        {projectLoansCount} loan{projectLoansCount !== 1 ? 's' : ''}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      {project.members.length} members
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="card text-center py-12">
          <FolderKanban size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first investment project to get started'}
          </p>
          {!searchQuery && statusFilter === 'all' && categoryFilter === 'all' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <Plus size={18} />
              Create Project
            </button>
          )}
        </div>
      )}

      {/* Add Project Modal */}
      {showAddModal && (
        <AddProjectModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  )
}
