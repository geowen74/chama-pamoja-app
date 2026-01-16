import { useState } from 'react'
import { GlobalWorkerOptions } from 'pdfjs-dist';
import * as pdfjsLib from 'pdfjs-dist';
// Remove this line:
// import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?worker';

// Set workerSrc to a CDN string URL:
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

import { Link } from 'react-router-dom'
import { useDataStore } from '../../store/dataStore'
// import { Permission } from '../../utils/permissions'
import AddProjectModal from '../../components/modals/AddProjectModal'
import { FolderKanban, Plus, Download } from 'lucide-react'

const categoryIcons = {
  real_estate: FolderKanban,
  agriculture: FolderKanban,
  business: FolderKanban,
  stocks: FolderKanban,
  savings: FolderKanban,
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
  const { projects } = useDataStore()
  // const canAddProjects = usePermission('add_projects')
  const [searchQuery] = useState('')
  const [statusFilter] = useState<string>('all')
  const [categoryFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [uploadResult, setUploadResult] = useState<string | null>(null)

  // Analyze PDF and categorize using pdfjs-dist
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item: any) => item.str).join(' ');
      }
      text = text.toLowerCase();
      let detected = 'Unknown';
      if (text.includes('deposit')) detected = 'Deposit';
      else if (text.includes('withdrawal')) detected = 'Withdrawal';
      else if (text.includes('expense')) detected = 'Expense';
      else if (text.includes('income')) detected = 'Income';
      setUploadResult(`Detected: ${detected}`);
    } catch (err) {
      setUploadResult('Could not analyze PDF.');
    }
  }

  // Calculate loans per project
  // (removed unused getProjectLoans function)

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-700 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
            Project Management
          </h1>
          <p className="text-gray-500 mt-1">
            Create and manage investment projects with financial tracking
          </p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary flex items-center gap-2">
            <Download size={18} />
            Export
          </button>
          {/* Removed canAddProjects check due to missing implementation */}
            <>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus size={18} />
                New Project
              </button>
              <Link
                to="/projects/record"
                className="btn btn-accent flex items-center gap-2"
                style={{ textDecoration: 'none' }}
              >
                Record a Project
              </Link>
            </>
        </div>
      </div>

      {/* PDF Upload for Project Analysis */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Upload Project PDF (Bank Slip, Expense, Income):</label>
        <input type="file" accept="application/pdf" onChange={handlePdfUpload} />
        {uploadResult && <div className="mt-2 text-green-700">{uploadResult}</div>}
      </div>

      {/* Projects grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const CategoryIcon = categoryIcons[project.category]

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
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                  {project.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{project.description}</p>
                <button
                  className="btn btn-accent w-full mt-2"
                  // TODO: Implement handler for project income modal
                >
                  Record Project Income
                </button>
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
  );
}
