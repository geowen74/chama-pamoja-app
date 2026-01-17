const express = require('express');
const router = express.Router();

let user = null;
let group = null;

// Get user profile
router.get('/user', (req, res) => {
  res.json(user || {});
});

// Update user profile
router.put('/user', (req, res) => {
  user = { ...user, ...req.body };
  res.json(user);
});

// Get group profile
router.get('/group', (req, res) => {
  res.json(group || {});
});

// Update group profile
router.put('/group', (req, res) => {
  group = { ...group, ...req.body };
  res.json(group);
});

module.exports = router;
