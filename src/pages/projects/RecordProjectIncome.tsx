import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';

export default function RecordProjectIncome() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, addProjectIncome } = useDataStore();
  const project = projects.find(p => p.id === id);

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [depositor, setDepositor] = useState('');
  const [method, setMethod] = useState('cash');
  const [reference, setReference] = useState('');

  if (!project) return <div>Project not found.</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProjectIncome({
      projectId: project.id,
      depositor,
      amount: parseFloat(amount),
      date,
      method,
      reference,
    });
    alert('Income recorded!');
    navigate(`/projects/${project.id}/edit`);
  };

  return (
    <div className="card max-w-lg mx-auto mt-8 p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Record Project Income</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Depositor</label>
          <input className="input" value={depositor} onChange={e => setDepositor(e.target.value)} required />
        </div>
        <div>
          <label className="label">Amount (KES)</label>
          <input className="input" type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
        </div>
        <div>
          <label className="label">Date</label>
          <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
        </div>
        <div>
          <label className="label">Method</label>
          <select className="input" value={method} onChange={e => setMethod(e.target.value)}>
            <option value="cash">Cash</option>
            <option value="mobile_transfer">Mobile Transfer</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>
        <div>
          <label className="label">Reference (optional)</label>
          <input className="input" value={reference} onChange={e => setReference(e.target.value)} />
        </div>
        <button className="btn btn-primary mt-4" type="submit">Record Income</button>
      </form>
    </div>
  );
}
