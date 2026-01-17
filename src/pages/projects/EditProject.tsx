import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import { Line } from 'react-chartjs-2';

export default function EditProject() {
  const { id } = useParams();
  const { projects, updateProject } = useDataStore();
  const project = projects.find(p => p.id === id);
  const [editData, setEditData] = useState(project || {});
  const [incident, setIncident] = useState('');
  const [incidents, setIncidents] = useState(project?.incidents || []);

  useEffect(() => {
    if (project) {
      setEditData(project);
      setIncidents(project.incidents || []);
    }
  }, [project]);

  if (!project) return <div>Project not found.</div>;

  // Example graph data for income
  const incomeData = {
    labels: (project.dailyIncome || []).map(d => d.date),
    datasets: [
      {
        label: 'Income',
        data: (project.dailyIncome || []).map(d => d.amount),
        fill: false,
        borderColor: '#7c3aed',
        tension: 0.1,
      },
    ],
  };

  const handleSave = () => {
    updateProject(project.id, { ...editData, incidents });
    alert('Project updated!');
  };

  const handleAddIncident = () => {
    if (incident.trim()) {
      setIncidents([...incidents, { date: new Date().toISOString().split('T')[0], text: incident }]);
      setIncident('');
    }
  };

  return (
    <div className="card space-y-6">
      <h1 className="text-2xl font-bold">Edit Project: {editData.name}</h1>
      <div>
        <label className="label">Project Name</label>
        <input className="input" value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })} />
      </div>
      <div>
        <label className="label">Description</label>
        <textarea className="input" value={editData.description || ''} onChange={e => setEditData({ ...editData, description: e.target.value })} />
      </div>
      <div>
        <label className="label">Category</label>
        <select className="input" value={editData.category || ''} onChange={e => setEditData({ ...editData, category: e.target.value })}>
          <option value="">Select Category</option>
          <option value="transport">Transport</option>
          <option value="investment">Investment</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label className="label">Money Spent</label>
        <input className="input" type="number" value={editData.moneySpent || 0} onChange={e => setEditData({ ...editData, moneySpent: parseInt(e.target.value) })} />
      </div>
      <div>
        <label className="label">Loan Balance</label>
        <input className="input" type="number" value={editData.loanBalance || 0} onChange={e => setEditData({ ...editData, loanBalance: parseInt(e.target.value) })} />
      </div>
      <div>
        <label className="label">Income Graph</label>
        <Line data={incomeData} />
      </div>
      {editData.category === 'transport' && (
        <div>
          <h2 className="text-lg font-semibold mt-6">Daily Incident Report</h2>
          <textarea className="input" value={incident} onChange={e => setIncident(e.target.value)} placeholder="Describe today's incident..." />
          <button className="btn btn-primary mt-2" onClick={handleAddIncident}>Add Incident</button>
          <ul className="mt-4">
            {incidents.map((i, idx) => (
              <li key={idx} className="mb-2 text-sm text-gray-700">{i.date}: {i.text}</li>
            ))}
          </ul>
        </div>
      )}
      <button className="btn btn-primary mt-6" onClick={handleSave}>Save Changes</button>
    </div>
  );
}
