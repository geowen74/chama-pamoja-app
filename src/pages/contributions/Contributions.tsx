import { Link } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import { useAuthStore } from '../../store/authStore';
import { pdfjs } from 'react-pdf';
import { defineConfig } from 'vite';


pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default defineConfig({
  // ...other config...
  build: {
    rollupOptions: {
      external: ['fsevents'],
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});

export default function Contributions() {
  const { user } = useAuthStore();
  const { members, contributions } = useDataStore();

  console.log('user:', user);
  console.log('members:', members);
  console.log('contributions:', contributions);

  const isMember = members?.some(m => m.userId === user?.id);

  // Optionally keep the PDF upload for non-members (demo)
  const handlePdfUpload = async () => {
    // No-op: demo only, function intentionally left blank
  };

  // Sample data for non-members
  const sampleContributions = [
    {
      id: 'sample1',
      memberName: 'Sample Member',
      contributionTypeName: 'Monthly Contribution',
      amount: 1000,
      date: new Date().toISOString(),
      method: 'cash',
      reference: 'N/A',
      status: 'confirmed',
      confirmedBy: 'Admin',
    },
    {
      id: 'sample2',
      memberName: 'Sample Member 2',
      contributionTypeName: 'Special Contribution',
      amount: 500,
      date: new Date().toISOString(),
      method: 'mpesa',
      reference: 'N/A',
      status: 'pending',
      confirmedBy: '',
    },
  ];


  if (!isMember) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded mb-4 text-center font-semibold">
          You are viewing sample data. Join the group to see real contributions.
        </div>
        <div className="mb-4">
          <label className="block font-medium mb-1">Upload Bank Slip (PDF):</label>
          <input type="file" accept="application/pdf" onChange={handlePdfUpload} />
        </div>
        <div className="card">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sample Contributions</h1>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Member</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Amount</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {sampleContributions.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="px-4 py-2">{c.memberName}</td>
                  <td className="px-4 py-2">{c.contributionTypeName}</td>
                  <td className="px-4 py-2">KES {c.amount.toLocaleString()}</td>
                  <td className="px-4 py-2">{new Date(c.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2 capitalize">{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }


  // Show all contributions for members
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Contributions</h1>
        {/* Add button or filter if needed */}
      </div>
      <div className="card">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Member</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Amount</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {contributions.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">No contributions found.</td>
              </tr>
            ) : (
              contributions.map((c) => (
                <tr key={c.id} className="border-b">
                  <td className="px-4 py-2">{c.memberName}</td>
                  <td className="px-4 py-2">{c.contributionTypeName}</td>
                  <td className="px-4 py-2">KES {c.amount.toLocaleString()}</td>
                  <td className="px-4 py-2">{new Date(c.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2 capitalize">{c.status}</td>
                  <td className="px-4 py-2">
                    <Link to={`/contributions/${c.id}`} className="text-blue-600 hover:underline">View</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
