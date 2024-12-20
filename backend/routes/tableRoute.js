const express = require('express');
const Table = require('../models/table');
const router = express.Router();

// GET: Fetch all tables
router.get('/', async (req, res) => {
  try {
    const tables = await Table.find();
    res.status(200).json({ tables });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch tables', error: error.message });
  }
});

// POST: Add a new table
router.post('/', async (req, res) => {
  const { name, status } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Table name is required' });
  }

  try {
    const newTable = new Table({ name, status });
    const savedTable = await newTable.save();
    res.status(201).json(savedTable);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to add table', error: error.message });
  }
});

// PUT: Update a table
router.put('/tables/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Table name is required' });
  }

  try {
    const updatedTable = await Table.findByIdAndUpdate(
      id,
      { name },
      { new: true, runValidators: true }
    );
    if (!updatedTable) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.status(200).json(updatedTable);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update table', error: error.message });
  }
});

// DELETE: Delete a table
router.delete('/tables/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTable = await Table.findByIdAndDelete(id);
    if (!deletedTable) {
      return res.status(404).json({ message: 'Table not found' });
    }
    res.status(200).json({ message: 'Table deleted successfully', table: deletedTable });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete table', error: error.message });
  }
});


// NEW: Update table status
router.patch('/tables/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate input parameters
  if (!id) {
    return res.status(400).json({ message: 'Table ID is required' });
  }

  // Validate status
  if (!['available', 'occupied'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    // Find and update the table
    const updatedTable = await Table.findByIdAndUpdate(
      id, 
      { status }, 
      { 
        new: true,      // Return the updated document
        runValidators: true  // Run model validation
      }
    );

    // Check if table was found and updated
    if (!updatedTable) {
      return res.status(404).json({ message: 'Table not found' });
    }

    // Successful response
    res.status(200).json(updatedTable);

  } catch (error) {
    // Log the full error for server-side debugging
    console.error('Table status update error:', error);

    // Determine the appropriate error response
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.errors 
      });
    }

    // Generic server error
    res.status(500).json({ 
      message: 'Failed to update table status', 
      error: error.message 
    });
  }
});

module.exports = router;
