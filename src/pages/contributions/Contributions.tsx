import { useParams, useNavigate } from 'react-router-dom'
import { useDataStore } from '../../store/dataStore'
import { useAuthStore } from '../../store/authStore'
import { FaArrowLeft } from 'react-icons/fa'

export default function ContributionDetails() {
  const { user } = useAuthStore()
  const { members, contributions } = useDataStore()
  const isMember = members?.some(m => m.userId === user?.id)

  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!isMember) {
    return <div>Access denied. Only group members can view financial information.</div>
  }

  const contribution = contributions.find((c) => c.id === id)

  if (!contribution) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Contribution not found</h2>
        <button onClick={() => navigate('/contributions')} className="btn btn-primary mt-4">
          Back to Contributions
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/contributions')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <FaArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Contribution Details</h1>
      </div>

      <div className="card">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-gray-500">Member</div>
            <div className="text-lg font-semibold text-gray-900">{contribution.memberName}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Type</div>
            <div className="text-lg font-semibold text-gray-900">{contribution.contributionTypeName}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Amount</div>
            <div className="text-lg font-semibold text-gray-900">KES {contribution.amount.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Date</div>
            <div className="text-lg font-semibold text-gray-900">{new Date(contribution.date).toLocaleDateString()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Method</div>
            <div className="text-lg font-semibold text-gray-900">{contribution.method.replace('_', ' ')}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Reference</div>
            <div className="text-lg font-semibold text-gray-900">{contribution.reference || '-'}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Status</div>
            <div className="text-lg font-semibold text-gray-900 capitalize">{contribution.status}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Confirmed By</div>
            <div className="text-lg font-semibold text-gray-900">{contribution.confirmedBy || '-'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}