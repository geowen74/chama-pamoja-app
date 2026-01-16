import React from 'react';

const ProjectIncomeDetails: React.FC = () => {
  // Example data, replace with real data fetching logic
  const incomeDetails = [
    {
      id: 1,
      source: 'Grant from NGO',
      amount: 5000,
      date: '2026-01-10',
      description: 'Support for community project',
    },
    {
      id: 2,
      source: 'Fundraiser Event',
      amount: 3200,
      date: '2026-01-12',
      description: 'Proceeds from annual fundraiser',
    },
  ];

  return (
    <div className="card">
      <h2 className="gradient-text text-2xl font-bold mb-6">Project Income Details</h2>
      <table className="w-full">
        <thead>
          <tr className="table-header">
            <th>Source</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {incomeDetails.map((income) => (
            <tr key={income.id} className="table-cell hover-lift">
              <td>{income.source}</td>
              <td className="text-green-600 font-semibold">${income.amount.toLocaleString()}</td>
              <td>{income.date}</td>
              <td>{income.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectIncomeDetails;
