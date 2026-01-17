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
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  if (!project) return <div>Project not found.</div>;

  const validate = () => {
    if (!depositor.trim()) return 'Depositor is required.';
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return 'Valid amount is required.';
    if (!date) return 'Date is required.';
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    addProjectIncome({
      projectId: project.id,
      depositor,
      amount: parseFloat(amount),
      date,
      method,
      reference,
    });
    setShowConfirm(false);
    alert('Income recorded!');
    navigate(`/projects/${project.id}/edit`);
  };

  return (
    <div className="card max-w-lg mx-auto mt-8 p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Record Project Income</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-600 font-medium mb-2">{error}</div>}
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
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4">Confirm Record Income</h2>
            <p className="mb-2">Depositor: <strong>{depositor}</strong></p>
            <p className="mb-2">Amount: <strong>KES {amount}</strong></p>
            <p className="mb-2">Date: <strong>{date}</strong></p>
            <p className="mb-2">Method: <strong>{method}</strong></p>
            {reference && <p className="mb-2">Reference: <strong>{reference}</strong></p>}
            <div className="flex gap-3 mt-4">
              <button className="btn btn-primary" onClick={handleConfirm}>Confirm</button>
              <button className="btn btn-secondary" onClick={() => setShowConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
