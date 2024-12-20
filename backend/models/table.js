const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['available', 'occupied'],
    default: 'available',
  },
}, { timestamps: true });

module.exports = mongoose.model('Table', tableSchema);
