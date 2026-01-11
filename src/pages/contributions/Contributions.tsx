import { useParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useDataStore } from '../../store/dataStore'
import { useAuthStore } from '../../store/authStore'
import { FaArrowLeft } from 'react-icons/fa'
import pdfParse from 'pdf-parse'

export default function ContributionDetails() {
  const { user } = useAuthStore()
  const { members, contributions } = useDataStore()
  const isMember = members?.some(m => m.userId === user?.id)
  const [uploadResult, setUploadResult] = useState<string | null>(null)

  // Analyze PDF and categorize
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const data = await pdfParse(Buffer.from(arrayBuffer));
      const text = data.text.toLowerCase();
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

  // Sample data for non-members
  const sampleContribution = {
    id: 'sample',
    memberName: 'Sample Member',
    contributionTypeName: 'Monthly Contribution',
    amount: 1000,
    date: new Date().toISOString(),
    method: 'cash',
    reference: 'N/A',
    status: 'confirmed',
    confirmedBy: 'Admin',
  }

  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  if (!isMember) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded mb-4 text-center font-semibold">
          You are viewing sample data. Join the group to see real contributions.
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/contributions')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FaArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Contribution Details</h1>
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Upload Bank Slip (PDF):</label>
          <input type="file" accept="application/pdf" onChange={handlePdfUpload} />
          {uploadResult && <div className="mt-2 text-green-700">{uploadResult}</div>}
        </div>
        <div className="card">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-500">Member</div>
              <div className="text-lg font-semibold text-gray-900">{sampleContribution.memberName}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Type</div>
              <div className="text-lg font-semibold text-gray-900">{sampleContribution.contributionTypeName}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Amount</div>
              <div className="text-lg font-semibold text-gray-900">KES {sampleContribution.amount.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Date</div>
              <div className="text-lg font-semibold text-gray-900">{new Date(sampleContribution.date).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Method</div>
              <div className="text-lg font-semibold text-gray-900">{sampleContribution.method.replace('_', ' ')}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Reference</div>
              <div className="text-lg font-semibold text-gray-900">{sampleContribution.reference}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Status</div>
              <div className="text-lg font-semibold text-gray-900 capitalize">{sampleContribution.status}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Confirmed By</div>
              <div className="text-lg font-semibold text-gray-900">{sampleContribution.confirmedBy}</div>
            </div>
          </div>
        </div>
      </div>
    )
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