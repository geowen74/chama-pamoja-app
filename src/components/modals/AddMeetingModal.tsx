import { useState } from 'react'
import { X } from 'lucide-react'
import { useDataStore } from '../../store/dataStore'
import { useAuthStore } from '../../store/authStore'
import { useNotificationStore, createActivityNotification } from '../../store/notificationStore'

interface AddMeetingModalProps {
  onClose: () => void
}

export default function AddMeetingModal({ onClose }: AddMeetingModalProps) {
  const { addMeeting } = useDataStore()
  const { user } = useAuthStore()
  const { addNotification } = useNotificationStore()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    type: 'regular' as 'regular' | 'special' | 'agm',
    agenda: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    addMeeting({
      title: formData.title,
      description: formData.description,
      date: formData.date,
      time: formData.time,
      venue: formData.venue,
      type: formData.type,
      status: 'scheduled',
      agenda: formData.agenda.split('\n').filter(item => item.trim()),
      attendees: [],
      createdBy: `${user?.firstName} ${user?.lastName}`,
    })

    // Add notification for new meeting
    addNotification(createActivityNotification.meetingScheduled(formData.title, formData.date, formData.time))
    
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Schedule Meeting</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Meeting Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder="e.g., January Monthly Meeting"
              required
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input min-h-[80px]"
              placeholder="e.g., Regular monthly meeting to discuss group progress, review financials, and approve pending loan applications."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>
          <div>
            <label className="label">Venue</label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              className="input"
              placeholder="e.g., Community Hall, Westlands"
              required
            />
          </div>
          <div>
            <label className="label">Meeting Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as typeof formData.type })}
              className="input"
            >
              <option value="regular">Regular Meeting</option>
              <option value="special">Special Meeting</option>
              <option value="agm">Annual General Meeting (AGM)</option>
            </select>
          </div>
          <div>
            <label className="label">Agenda Items</label>
            <textarea
              value={formData.agenda}
              onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
              className="input min-h-[100px]"
              placeholder="Opening Prayer\nReading of Minutes\nFinancial Report\nLoan Applications\nAny Other Business\nClosing"
            />
            <p className="text-xs text-gray-500 mt-1">One item per line</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              Schedule Meeting
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
