import React, { useState } from 'react';

const RecordProject: React.FC = () => {
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
    setSubmitted(true);
    // Here you would send form data to backend or store
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
