import React, { useState } from 'react';
import { useDataStore } from '../../store/dataStore';

const RecordProject: React.FC = () => {
  const { addProject } = useDataStore();
  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: '',
    loanAmount: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
      const newProject = {
        name: form.name,
        description: form.description,
        category: 'other' as const,
        status: 'planning' as const,
        startDate: form.startDate,
        endDate: '',
        totalInvestment: 0,
        totalBorrowed: 0,
        currentValue: 0,
        expectedIncome: 0,
        actualIncome: 0,
        roi: 0,
        members: [],
        milestones: [],
        transactions: [],
        createdBy: '',
        createdAt: new Date().toISOString(),
        loanAmount: form.loanAmount ? Number(form.loanAmount) : undefined,
        dailyIncome: [],
      };
    fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProject),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to save to backend');
        return res.json();
      })
      .then(() => {
        setSubmitted(true);
      })
      .catch(() => {
        // If backend fails, save to local store
          const projectData = newProject; // Omit 'id' when saving to local store
          addProject(projectData);
        setSubmitted(true);
      });
  };

  return (
    <div className="card max-w-xl mx-auto mt-10">
      <h2 className="gradient-text text-2xl font-bold mb-6">Record a New Project</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label" htmlFor="name">Project Name</label>
          <input className="input" id="name" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div>
          <label className="label" htmlFor="description">Description</label>
          <textarea className="input" id="description" name="description" value={form.description} onChange={handleChange} required />
        </div>
        <div>
          <label className="label" htmlFor="startDate">Start Date</label>
          <input className="input" id="startDate" name="startDate" type="date" value={form.startDate} onChange={handleChange} required />
        </div>
        <div>
          <label className="label" htmlFor="loanAmount">Loan Amount (optional)</label>
          <input className="input" id="loanAmount" name="loanAmount" type="number" value={form.loanAmount} onChange={handleChange} />
        </div>
        <button type="submit" className="btn btn-primary w-full">Record Project</button>
      </form>
      {submitted && (
        <div className="mt-6 text-green-600 font-semibold">Project recorded successfully!</div>
      )}
    </div>
  );
};

export default RecordProject;
