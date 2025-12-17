const express = require('express');
const router = express.Router();
const Charity = require('../models/Charity');

// Get all charities
router.get('/', async (req, res) => {
  try {
    const charities = await Charity.find({ verificationStatus: 'verified' });
    res.json(charities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get charity by ID
router.get('/:id', async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) {
      return res.status(404).json({ error: 'Charity not found' });
    }
    res.json(charity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create charity (admin only)
router.post('/', async (req, res) => {
  try {
    const charity = new Charity(req.body);
    await charity.save();
    res.status(201).json(charity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;