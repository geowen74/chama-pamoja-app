const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

let contributions = [];

// Get all contributions
app.get('/api/contributions', (req, res) => {
  res.json(contributions);
});

// Add a contribution
app.post('/api/contributions', (req, res) => {
  const contribution = { ...req.body, id: Date.now().toString() };
  contributions.push(contribution);
  res.status(201).json(contribution);
});

// Update a contribution
app.put('/api/contributions/:id', (req, res) => {
  const { id } = req.params;
  const idx = contributions.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  contributions[idx] = { ...contributions[idx], ...req.body };
  res.json(contributions[idx]);
});

// Delete a contribution
app.delete('/api/contributions/:id', (req, res) => {
  const { id } = req.params;
  contributions = contributions.filter(c => c.id !== id);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
