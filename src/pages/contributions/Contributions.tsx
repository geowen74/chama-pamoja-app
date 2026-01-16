import { Link } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import { useAuthStore } from '../../store/authStore';

export default function Contributions() {
  const { contributions } = useDataStore();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Contributions</h1>
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

// Example usage of ContributionDetails in your router (move this to your main router file, not here):
// <Route path="/contributions/:id" element={<ContributionDetails />} />

