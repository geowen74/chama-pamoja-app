import { useState } from 'react'
import { useDataStore } from '../../store/dataStore'
import { usePermission } from '../../utils/permissions'
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Upload,
  Eye,
  Sparkles,
  MessageSquarePlus,
  Trash2,
  ListPlus,
  MessageCircle,
  Download,
  History,
  Printer,
} from 'lucide-react'
import AddMeetingModal from '../../components/modals/AddMeetingModal'
import MeetingDocuments from '../../components/meetings/MeetingDocuments'
import { Meeting, MeetingDocument } from '../../types'

interface DiscussionTopic {
  id: string
  topic: string
  raisedBy: string
  notes: string
  status: 'discussed' | 'pending' | 'deferred'
  createdAt: string
}

export default function Meetings() {
  const { meetings } = useDataStore()
  const canScheduleMeetings = usePermission('schedule_meetings')
  const [showAddModal, setShowAddModal] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [meetingDocuments, setMeetingDocuments] = useState<Record<string, MeetingDocument[]>>({})
  const [additionalTopics, setAdditionalTopics] = useState<Record<string, DiscussionTopic[]>>({})
  const [showAddTopicForm, setShowAddTopicForm] = useState(false)
  const [newTopic, setNewTopic] = useState({ topic: '', raisedBy: '', notes: '' })
  const [showLastAgendaModal, setShowLastAgendaModal] = useState(false)

  // Get last completed meeting
  const lastCompletedMeeting = meetings
    .filter(m => m.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

  const filteredMeetings = meetings.filter((meeting) => {
    if (filter === 'all') return true
    return meeting.status === filter
  })

  const upcomingMeetings = filteredMeetings.filter(m => m.status === 'scheduled')
  const pastMeetings = filteredMeetings.filter(m => m.status === 'completed' || m.status === 'cancelled')

  const statusConfig = {
    scheduled: { color: 'bg-primary-100 text-primary-600', icon: Clock },
    ongoing: { color: 'bg-warning-100 text-warning-600', icon: AlertCircle },
    completed: { color: 'bg-success-100 text-success-600', icon: CheckCircle },
    cancelled: { color: 'bg-danger-100 text-danger-600', icon: XCircle },
  }

  const typeConfig = {
    regular: 'bg-blue-100 text-blue-600',
    special: 'bg-purple-100 text-purple-600',
    agm: 'bg-orange-100 text-orange-600',
  }

  const handleDocumentsChange = (meetingId: string, docs: MeetingDocument[]) => {
    setMeetingDocuments(prev => ({
      ...prev,
      [meetingId]: docs
    }))
  }

  const getDocumentCount = (meetingId: string) => {
    return meetingDocuments[meetingId]?.length || 0
  }

  const getTopicCount = (meetingId: string) => {
    return additionalTopics[meetingId]?.length || 0
  }

  const handleAddTopic = (meetingId: string) => {
    if (!newTopic.topic.trim()) return

    const topic: DiscussionTopic = {
      id: `topic_${Date.now()}`,
      topic: newTopic.topic,
      raisedBy: newTopic.raisedBy || 'Anonymous',
      notes: newTopic.notes,
      status: 'discussed',
      createdAt: new Date().toISOString()
    }

    setAdditionalTopics(prev => ({
      ...prev,
      [meetingId]: [...(prev[meetingId] || []), topic]
    }))

    setNewTopic({ topic: '', raisedBy: '', notes: '' })
    setShowAddTopicForm(false)
  }

  const handleDeleteTopic = (meetingId: string, topicId: string) => {
    setAdditionalTopics(prev => ({
      ...prev,
      [meetingId]: (prev[meetingId] || []).filter(t => t.id !== topicId)
    }))
  }

  const handleUpdateTopicStatus = (meetingId: string, topicId: string, status: DiscussionTopic['status']) => {
    setAdditionalTopics(prev => ({
      ...prev,
      [meetingId]: (prev[meetingId] || []).map(t => 
        t.id === topicId ? { ...t, status } : t
      )
    }))
  }

  // Download agenda as text file
  const downloadAgenda = (meeting: Meeting) => {
    const agendaText = `
═══════════════════════════════════════════════════════════════
                    MEETING AGENDA
═══════════════════════════════════════════════════════════════

Meeting Title: ${meeting.title}
Type: ${meeting.type === 'agm' ? 'Annual General Meeting (AGM)' : meeting.type.charAt(0).toUpperCase() + meeting.type.slice(1)} Meeting
Date: ${new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Time: ${meeting.time}
Venue: ${meeting.venue}

───────────────────────────────────────────────────────────────
                    AGENDA ITEMS
───────────────────────────────────────────────────────────────

${meeting.agenda.map((item, index) => `${index + 1}. ${item}`).join('\n\n')}

${additionalTopics[meeting.id]?.length ? `
───────────────────────────────────────────────────────────────
              ADDITIONAL TOPICS DISCUSSED (AOB)
───────────────────────────────────────────────────────────────

${additionalTopics[meeting.id].map((topic, index) => `${index + 1}. ${topic.topic}
   Raised by: ${topic.raisedBy}
   Status: ${topic.status.charAt(0).toUpperCase() + topic.status.slice(1)}
   ${topic.notes ? `Notes: ${topic.notes}` : ''}`).join('\n\n')}
` : ''}

───────────────────────────────────────────────────────────────
Description: ${meeting.description || 'No description provided'}

Generated on: ${new Date().toLocaleString()}
═══════════════════════════════════════════════════════════════
    `.trim()

    const blob = new Blob([agendaText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${meeting.title.replace(/[^a-z0-9]/gi, '_')}_Agenda.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Print agenda
  const printAgenda = (meeting: Meeting) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${meeting.title} - Agenda</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          h1 { color: #1f2937; border-bottom: 3px solid #7c3aed; padding-bottom: 10px; }
          h2 { color: #4b5563; margin-top: 30px; }
          .meta { background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .meta p { margin: 8px 0; color: #374151; }
          .meta strong { color: #1f2937; }
          ol { padding-left: 20px; }
          li { padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #374151; }
          .topic { background: #ecfdf5; padding: 15px; border-radius: 8px; margin: 10px 0; }
          .topic h4 { margin: 0 0 5px 0; color: #047857; }
          .topic p { margin: 5px 0; font-size: 14px; color: #6b7280; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>📋 ${meeting.title}</h1>
        <div class="meta">
          <p><strong>Type:</strong> ${meeting.type === 'agm' ? 'Annual General Meeting (AGM)' : meeting.type.charAt(0).toUpperCase() + meeting.type.slice(1)} Meeting</p>
          <p><strong>Date:</strong> ${new Date(meeting.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p><strong>Time:</strong> ${meeting.time}</p>
          <p><strong>Venue:</strong> ${meeting.venue}</p>
        </div>
        
        <h2>Agenda Items</h2>
        <ol>
          ${meeting.agenda.map(item => `<li>${item}</li>`).join('')}
        </ol>
        
        ${additionalTopics[meeting.id]?.length ? `
          <h2>Additional Topics Discussed (AOB)</h2>
          ${additionalTopics[meeting.id].map(topic => `
            <div class="topic">
              <h4>${topic.topic}</h4>
              <p><strong>Raised by:</strong> ${topic.raisedBy} | <strong>Status:</strong> ${topic.status}</p>
              ${topic.notes ? `<p><strong>Notes:</strong> ${topic.notes}</p>` : ''}
            </div>
          `).join('')}
        ` : ''}
        
        ${meeting.description ? `<h2>Description</h2><p>${meeting.description}</p>` : ''}
        
        <div class="footer">
          Generated on ${new Date().toLocaleString()} | Chama Pamoja
        </div>
      </body>
      </html>
    `

    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.print()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meetings</h1>
          <p className="text-gray-500 mt-1">Schedule and manage group meetings</p>
        </div>
        {canScheduleMeetings && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            Schedule Meeting
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'scheduled', 'completed', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Last Meeting Agenda Card */}
      {lastCompletedMeeting && (
        <div className="glass-card rounded-2xl p-6 bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 border border-violet-100">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25 flex items-center justify-center flex-shrink-0">
                <History className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Last Meeting Agenda</h3>
                <p className="text-gray-600 font-medium">{lastCompletedMeeting.title}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(lastCompletedMeeting.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <ListPlus size={14} />
                    {lastCompletedMeeting.agenda.length} agenda items
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${typeConfig[lastCompletedMeeting.type]}`}>
                    {lastCompletedMeeting.type === 'agm' ? 'AGM' : lastCompletedMeeting.type}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLastAgendaModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-violet-600 hover:bg-violet-100 transition-colors font-medium shadow-sm border border-violet-200"
              >
                <Eye size={18} />
                View
              </button>
              <button
                onClick={() => downloadAgenda(lastCompletedMeeting)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-colors font-medium shadow-lg shadow-violet-500/25"
              >
                <Download size={18} />
                Download
              </button>
              <button
                onClick={() => printAgenda(lastCompletedMeeting)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium"
              >
                <Printer size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming meetings */}
      {upcomingMeetings.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Meetings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingMeetings.map((meeting) => {
              const status = statusConfig[meeting.status]
              const StatusIcon = status.icon
              return (
                <div key={meeting.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize mt-1 ${typeConfig[meeting.type]}`}>
                        {meeting.type === 'agm' ? 'AGM' : meeting.type}
                      </span>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${status.color}`}>
                      <StatusIcon size={14} />
                      {meeting.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{meeting.description}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} />
                      {new Date(meeting.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock size={16} />
                      {meeting.time}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={16} />
                      {meeting.venue}
                    </div>
                  </div>

                  {meeting.agenda.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Agenda</h4>
                      <ul className="space-y-1">
                        {meeting.agenda.slice(0, 3).map((item, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-primary-600">•</span>
                            {item}
                          </li>
                        ))}
                        {meeting.agenda.length > 3 && (
                          <li className="text-sm text-gray-500">
                            +{meeting.agenda.length - 3} more items
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Documents Section */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText size={16} />
                        <span>{getDocumentCount(meeting.id)} Documents</span>
                      </div>
                      <button
                        onClick={() => setSelectedMeeting(meeting)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors text-sm font-medium"
                      >
                        <Upload size={14} />
                        Manage Docs
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Past meetings */}
      {pastMeetings.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Meetings</h2>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="table-header px-6 py-4">Meeting</th>
                  <th className="table-header px-6 py-4">Date</th>
                  <th className="table-header px-6 py-4">Type</th>
                  <th className="table-header px-6 py-4">Attendance</th>
                  <th className="table-header px-6 py-4">Documents</th>
                  <th className="table-header px-6 py-4">Status</th>
                  <th className="table-header px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pastMeetings.map((meeting) => {
                  const status = statusConfig[meeting.status]
                  const StatusIcon = status.icon
                  const presentCount = meeting.attendees.filter(a => a.status === 'present').length
                  const docCount = getDocumentCount(meeting.id)
                  return (
                    <tr key={meeting.id} className="hover:bg-gray-50">
                      <td className="table-cell">
                        <div className="font-medium text-gray-900">{meeting.title}</div>
                        <div className="text-xs text-gray-500">{meeting.venue}</div>
                      </td>
                      <td className="table-cell text-gray-600">
                        {new Date(meeting.date).toLocaleDateString()}
                      </td>
                      <td className="table-cell">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${typeConfig[meeting.type]}`}>
                          {meeting.type === 'agm' ? 'AGM' : meeting.type}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Users size={14} />
                          {presentCount}/{meeting.attendees.length}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1.5">
                          <FileText size={14} className="text-gray-400" />
                          <span className={docCount > 0 ? 'text-violet-600 font-medium' : 'text-gray-500'}>
                            {docCount}
                          </span>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${status.color}`}>
                          <StatusIcon size={14} />
                          {meeting.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() => setSelectedMeeting(meeting)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors text-sm font-medium"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredMeetings.length === 0 && (
        <div className="card text-center py-12">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings found</h3>
          <p className="text-gray-500 mb-4">
            {filter !== 'all' ? 'Try adjusting your filter' : 'Schedule your first meeting'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <Plus size={18} />
            Schedule Meeting
          </button>
        </div>
      )}

      {/* Add Meeting Modal */}
      {showAddModal && (
        <AddMeetingModal onClose={() => setShowAddModal(false)} />
      )}

      {/* Meeting Documents Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedMeeting.title}</h2>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(selectedMeeting.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {selectedMeeting.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {selectedMeeting.venue}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMeeting(null)}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <XCircle size={20} className="text-gray-400" />
                </button>
              </div>

              {/* AI Badge */}
              <div className="mt-4 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Smart Meeting Management</h4>
                    <p className="text-sm text-gray-600">
                      Upload documents for AI analysis and add discussion topics not on the original agenda
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Agenda Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                    <ListPlus className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Original Agenda</h3>
                </div>
                {selectedMeeting.agenda.length > 0 ? (
                  <div className="space-y-2">
                    {selectedMeeting.agenda.map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No agenda items set for this meeting</p>
                )}
              </div>

              {/* Additional Discussion Topics Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Additional Topics (AOB)</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                      {getTopicCount(selectedMeeting.id)} topics
                    </span>
                  </div>
                  <button
                    onClick={() => setShowAddTopicForm(!showAddTopicForm)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors text-sm font-medium"
                  >
                    <MessageSquarePlus size={16} />
                    Add Topic
                  </button>
                </div>

                {/* Add Topic Form */}
                {showAddTopicForm && (
                  <div className="mb-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <h4 className="font-medium text-gray-900 mb-3">Add New Discussion Topic</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Topic *</label>
                        <input
                          type="text"
                          value={newTopic.topic}
                          onChange={(e) => setNewTopic({ ...newTopic, topic: e.target.value })}
                          className="input-field w-full"
                          placeholder="Enter the discussion topic..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Raised By</label>
                        <input
                          type="text"
                          value={newTopic.raisedBy}
                          onChange={(e) => setNewTopic({ ...newTopic, raisedBy: e.target.value })}
                          className="input-field w-full"
                          placeholder="Name of member who raised the topic"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Outcome</label>
                        <textarea
                          value={newTopic.notes}
                          onChange={(e) => setNewTopic({ ...newTopic, notes: e.target.value })}
                          className="input-field w-full h-20 resize-none"
                          placeholder="Key discussion points and decisions made..."
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddTopicForm(false)
                            setNewTopic({ topic: '', raisedBy: '', notes: '' })
                          }}
                          className="btn-secondary flex-1"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAddTopic(selectedMeeting.id)}
                          disabled={!newTopic.topic.trim()}
                          className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add Topic
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Topics List */}
                {(additionalTopics[selectedMeeting.id] || []).length > 0 ? (
                  <div className="space-y-3">
                    {(additionalTopics[selectedMeeting.id] || []).map((topic) => (
                      <div key={topic.id} className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-all">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{topic.topic}</h4>
                              <select
                                value={topic.status}
                                onChange={(e) => handleUpdateTopicStatus(selectedMeeting.id, topic.id, e.target.value as DiscussionTopic['status'])}
                                className={`px-2 py-0.5 rounded-lg text-xs font-medium border-0 cursor-pointer ${
                                  topic.status === 'discussed' 
                                    ? 'bg-emerald-100 text-emerald-700' 
                                    : topic.status === 'pending'
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                <option value="discussed">Discussed</option>
                                <option value="pending">Pending</option>
                                <option value="deferred">Deferred</option>
                              </select>
                            </div>
                            <p className="text-sm text-gray-500 mb-2">
                              Raised by: <span className="font-medium text-gray-700">{topic.raisedBy}</span>
                            </p>
                            {topic.notes && (
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                {topic.notes}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteTopic(selectedMeeting.id, topic.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-xl">
                    <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No additional topics discussed yet</p>
                    <p className="text-gray-400 text-xs mt-1">Click "Add Topic" to record AOB items</p>
                  </div>
                )}
              </div>

              {/* Documents Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Meeting Documents</h3>
                  <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-medium">
                    {getDocumentCount(selectedMeeting.id)} files
                  </span>
                </div>
                <MeetingDocuments
                  documents={meetingDocuments[selectedMeeting.id] || []}
                  onDocumentsChange={(docs) => handleDocumentsChange(selectedMeeting.id, docs)}
                  meetingId={selectedMeeting.id}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedMeeting(null)
                  setShowAddTopicForm(false)
                  setNewTopic({ topic: '', raisedBy: '', notes: '' })
                }}
                className="btn btn-primary"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Last Meeting Agenda Modal */}
      {showLastAgendaModal && lastCompletedMeeting && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-violet-50 to-purple-50">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25 flex items-center justify-center">
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Meeting Agenda</h2>
                    <p className="text-gray-600">{lastCompletedMeeting.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLastAgendaModal(false)}
                  className="p-2 rounded-xl hover:bg-white/80 transition-colors"
                >
                  <XCircle size={20} className="text-gray-400" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Meeting Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <Calendar size={14} />
                    Date
                  </div>
                  <p className="font-semibold text-gray-900">
                    {new Date(lastCompletedMeeting.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <Clock size={14} />
                    Time
                  </div>
                  <p className="font-semibold text-gray-900">{lastCompletedMeeting.time}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <MapPin size={14} />
                    Venue
                  </div>
                  <p className="font-semibold text-gray-900">{lastCompletedMeeting.venue}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                    <Users size={14} />
                    Meeting Type
                  </div>
                  <p className="font-semibold text-gray-900 capitalize">
                    {lastCompletedMeeting.type === 'agm' ? 'Annual General Meeting' : lastCompletedMeeting.type}
                  </p>
                </div>
              </div>

              {/* Description */}
              {lastCompletedMeeting.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-xl">{lastCompletedMeeting.description}</p>
                </div>
              )}

              {/* Agenda Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <ListPlus size={18} className="text-violet-600" />
                  Agenda Items ({lastCompletedMeeting.agenda.length})
                </h3>
                <div className="space-y-2">
                  {lastCompletedMeeting.agenda.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-violet-50 rounded-xl border border-violet-100">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <span className="text-gray-800 pt-1">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Topics if any */}
              {(additionalTopics[lastCompletedMeeting.id] || []).length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MessageCircle size={18} className="text-emerald-600" />
                    Additional Topics Discussed (AOB)
                  </h3>
                  <div className="space-y-2">
                    {(additionalTopics[lastCompletedMeeting.id] || []).map((topic, index) => (
                      <div key={topic.id} className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{topic.topic}</h4>
                            <p className="text-sm text-gray-500 mt-1">Raised by: {topic.raisedBy}</p>
                            {topic.notes && (
                              <p className="text-sm text-gray-600 mt-2 bg-white p-2 rounded-lg">{topic.notes}</p>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            topic.status === 'discussed' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : topic.status === 'pending'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {topic.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadAgenda(lastCompletedMeeting)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors font-medium"
                >
                  <Download size={18} />
                  Download
                </button>
                <button
                  onClick={() => printAgenda(lastCompletedMeeting)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium"
                >
                  <Printer size={18} />
                  Print
                </button>
              </div>
              <button
                onClick={() => setShowLastAgendaModal(false)}
                className="btn btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
