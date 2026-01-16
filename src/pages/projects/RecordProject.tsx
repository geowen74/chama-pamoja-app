import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';

const RecordProject: React.FC = () => {
    const { addProject } = useProjectStore();
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
      id: Date.now().toString(),
      name: form.name,
      description: form.description,
      loanAmount: form.loanAmount ? Number(form.loanAmount) : undefined,
      startDate: form.startDate,
      category: '', // Provide a default or get from form
      status: 'pending', // Example default status
      totalInvestment: 0,
      totalBorrowed: 0,
      members: [],
      repayments: [],
      investments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: '', // Provide a default or get from context
      isActive: true,
      currentValue: 0, // Add default value or calculate as needed
      expectedIncome: 0, // Add default value or calculate as needed
      actualIncome: 0, // Add default value or calculate as needed
      roi: 0, // Add default value or calculate as needed
      // Add any other required properties here with default values
    };

    // Try to save to backend
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
        addProject(yes);
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
