const mongoose = require('mongoose');

/**
 * Patient Schema defines database constraints for industrial validation.
 * Includes automated triage priority indexing.
 */
const PatientSchema = new mongoose.Schema({
  token: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Patient name is mandatory'],
    trim: true
  },
  phone: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Waiting', 'Serving', 'Completed'],
    default: 'Waiting'
  },
  severity: {
    type: String,
    enum: ['Routine', 'Urgent', 'Emergency'],
    default: 'Routine'
  },
  duration: {
    type: Number, // Stored after consultation is marked complete
    default: 0
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  calledAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true // Auto-tracks database mutations
});

module.exports = mongoose.model('Patient', PatientSchema);