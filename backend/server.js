// 1. MUST BE FIRST: Immediately boot the environment configuration reader
require('dotenv').config();

// 2. Now import core framework modules
const express = require('express');
const cors = require('cors');

// 3. Import database setups (they can now safely see your MONGO_URI string)
const connectDB = require('./config/db');
const Patient = require('./models/Patient');

// Establish connection to MongoDB Atlas Cluster
connectDB();

const app = express();

// Middlewares
app.use(cors()); // Permits React front-end to safely communicate with backend
app.use(express.json()); // Parses incoming HTTP bodies as structured JSON objects

/**
 * @route   GET /api/queue
 * @desc    Retrieves all waiting and serving patients sorted by priority & check-in time.
 */
app.get('/api/queue', async (req, res) => {
  try {
    const patients = await Patient.find({ status: { $in: ['Waiting', 'Serving'] } });
    
    // Server-Side Priority Sorting Matrix
    const sorted = patients.sort((a, b) => {
      if (a.status === 'Serving') return -1;
      if (b.status === 'Serving') return 1;
      const weights = { 'Emergency': 3, 'Urgent': 2, 'Routine': 1 };
      if (weights[b.severity] !== weights[a.severity]) {
        return weights[b.severity] - weights[a.severity];
      }
      return new Date(a.joinedAt) - new Date(b.joinedAt);
    });

    res.status(200).json(sorted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch queue registry from database' });
  }
});

/**
 * @route   POST /api/queue/register
 * @desc    Registers a new walk-in patient with triage levels.
 */
app.post('/api/queue/register', async (req, res) => {
  try {
    const { name, phone, severity } = req.body;
    
    // Find highest token in database to increment seed safely
    const lastPatient = await Patient.findOne().sort({ token: -1 });
    const nextToken = lastPatient ? lastPatient.token + 1 : 101;

    const newPatient = new Patient({
      token: nextToken,
      name,
      phone,
      severity: severity || 'Routine'
    });

    await newPatient.save();
    res.status(201).json(newPatient);
  } catch (err) {
    res.status(400).json({ error: 'Registration rejection. Invalid payload.', details: err.message });
  }
});

/**
 * @route   PATCH /api/queue/call-next
 * @desc    Archives currently serving patient and summons the highest priority waiting patient.
 */
app.patch('/api/queue/call-next', async (req, res) => {
  try {
    // 1. Archive current active consultation if one exists
    const currentServing = await Patient.findOne({ status: 'Serving' });
    if (currentServing) {
      currentServing.status = 'Completed';
      currentServing.duration = Math.floor(Math.random() * 8) + 6; // Mock telemetry
      currentServing.completedAt = new Date();
      await currentServing.save();
    }

    // 2. Locate all waiting patients to find the next priority target
    const waitingList = await Patient.find({ status: 'Waiting' });
    if (waitingList.length === 0) {
      return res.status(200).json({ message: 'No patients in waiting queue.', currentlyServing: null });
    }

    // Sort to extract the absolute highest priority patient in line
    const sortedWaiting = waitingList.sort((a, b) => {
      const weights = { 'Emergency': 3, 'Urgent': 2, 'Routine': 1 };
      if (weights[b.severity] !== weights[a.severity]) {
        return weights[b.severity] - weights[a.severity];
      }
      return new Date(a.joinedAt) - new Date(b.joinedAt);
    });

    const nextPatient = sortedWaiting[0];
    nextPatient.status = 'Serving';
    nextPatient.calledAt = new Date();
    await nextPatient.save();

    res.status(200).json({
      message: `Token #${nextPatient.token} summoned successfully`,
      currentlyServing: nextPatient
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process dispatcher', details: err.message });
  }
});

/**
 * @route   GET /api/queue/analytics
 * @desc    Computes aggregate metrics from completed patient database records.
 */
app.get('/api/queue/analytics', async (req, res) => {
  try {
    const completed = await Patient.find({ status: 'Completed' });
    if (completed.length === 0) {
      return res.status(200).json({ avgDuration: 10, totalCompleted: 0 });
    }
    const totalDuration = completed.reduce((sum, p) => sum + p.duration, 0);
    res.status(200).json({
      avgDuration: Math.round((totalDuration / completed.length) * 10) / 10,
      totalCompleted: completed.length
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compile database metrics' });
  }
});

// Port configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Express.js Server running in production on port ${PORT}`);
});