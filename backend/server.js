require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const Patient = require('./models/Patient');

connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH']
  }
});

app.use(cors());
app.use(express.json());

async function broadcastQueueUpdate() {
  try {
    const patients = await Patient.find({
      status: { $in: ['Waiting', 'Serving'] }
    });

    const sorted = patients.sort((a, b) => {
      if (a.status === 'Serving') return -1;
      if (b.status === 'Serving') return 1;

      const weights = {
        Emergency: 3,
        Urgent: 2,
        Routine: 1
      };

      if (weights[b.severity] !== weights[a.severity]) {
        return weights[b.severity] - weights[a.severity];
      }

      return new Date(a.joinedAt) - new Date(b.joinedAt);
    });

    io.emit('queueUpdated', sorted);

    const completed = await Patient.find({
      status: 'Completed'
    });

    let avgDuration = 10;

    if (completed.length > 0) {
      const totalDuration = completed.reduce(
        (sum, p) => sum + (p.duration || 0),
        0
      );

      avgDuration =
        Math.round(
          (totalDuration / completed.length) * 10
        ) / 10;
    }

    io.emit('avgTimeUpdated', avgDuration);
  } catch (err) {
    console.error(err);
  }
}

const history = await Patient.find({
  status: 'Completed'
})
.sort({ completedAt: -1 })
.limit(50);

io.emit('historyUpdated', history);

io.on('connection', async socket => {
  console.log(`⚡ Client Connected: ${socket.id}`);

  await broadcastQueueUpdate();

  socket.on('disconnect', () => {
    console.log(`❌ Client Disconnected: ${socket.id}`);
  });
});

/**
 * GET QUEUE
 */
app.get('/api/queue', async (req, res) => {
  try {
    const patients = await Patient.find({
      status: { $in: ['Waiting', 'Serving'] }
    });

    const sorted = patients.sort((a, b) => {
      if (a.status === 'Serving') return -1;
      if (b.status === 'Serving') return 1;

      const weights = {
        Emergency: 3,
        Urgent: 2,
        Routine: 1
      };

      if (weights[b.severity] !== weights[a.severity]) {
        return weights[b.severity] - weights[a.severity];
      }

      return new Date(a.joinedAt) - new Date(b.joinedAt);
    });

    res.status(200).json(sorted);
  } catch (err) {
    res
      .status(500)
      .json({
        error:
          'Failed to fetch queue registry from database'
      });
  }
});

/**
 * REGISTER PATIENT
 */
app.post('/api/queue/register', async (req, res) => {
  try {
    const { name, phone, severity } = req.body;

    const lastPatient = await Patient.findOne().sort({
      token: -1
    });

    const nextToken = lastPatient
      ? lastPatient.token + 1
      : 101;

    const newPatient = new Patient({
      token: nextToken,
      name,
      phone,
      severity: severity || 'Routine'
    });

    await newPatient.save();

    await broadcastQueueUpdate();

    res.status(201).json(newPatient);
  } catch (err) {
    res.status(400).json({
      error: 'Registration rejection. Invalid payload.',
      details: err.message
    });
  }
});

/**
 * CALL NEXT
 */
app.patch('/api/queue/call-next', async (req, res) => {
  try {
    const currentServing =
      await Patient.findOne({
        status: 'Serving'
      });

      let completedPatient = null;

    if (currentServing) {
      currentServing.status = 'Completed';
      currentServing.duration =
        Math.floor(Math.random() * 8) + 6;
      currentServing.completedAt = new Date();

      await currentServing.save();
      console.log("COMPLETED:", currentServing.name);
      completedPatient = currentServing;
    }

    const waitingList = await Patient.find({
      status: 'Waiting'
    });

    if (waitingList.length === 0) {
      await broadcastQueueUpdate();

      return res.status(200).json({
        message: 'No patients in waiting queue.',
        currentlyServing: null,
        completedPatient
      });
    }

    const sortedWaiting = waitingList.sort(
      (a, b) => {
        const weights = {
          Emergency: 3,
          Urgent: 2,
          Routine: 1
        };

        if (
          weights[b.severity] !==
          weights[a.severity]
        ) {
          return (
            weights[b.severity] -
            weights[a.severity]
          );
        }

        return (
          new Date(a.joinedAt) -
          new Date(b.joinedAt)
        );
      }
    );

    const nextPatient = sortedWaiting[0];

    nextPatient.status = 'Serving';
    nextPatient.calledAt = new Date();

    await nextPatient.save();

    io.emit('patientCalled', {
      token: nextPatient.token,
      name: nextPatient.name
    });

    await broadcastQueueUpdate();

    res.status(200).json({
      message: `Token #${nextPatient.token} summoned successfully`,
      currentlyServing: nextPatient,
      completedPatient
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to process dispatcher',
      details: err.message
    });
  }
});

/**
 * ANALYTICS
 */
app.get('/api/queue/analytics', async (req, res) => {
  try {
    const completed = await Patient.find({
      status: 'Completed'
    });

    if (completed.length === 0) {
      return res.status(200).json({
        avgDuration: 10,
        totalCompleted: 0
      });
    }

    const totalDuration = completed.reduce(
      (sum, p) => sum + (p.duration || 0),
      0
    );

    res.status(200).json({
      avgDuration:
        Math.round(
          (totalDuration / completed.length) *
            10
        ) / 10,
      totalCompleted: completed.length
    });
  } catch (err) {
    res.status(500).json({
      error:
        'Failed to compile database metrics'
    });
  }
});

app.get('/api/queue/history', async (req, res) => {
  try {
    const history = await Patient.find({
      status: 'Completed'
    })
      .sort({ completedAt: -1 })
      .limit(50);

    res.json(history);
  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch history'
    });
  }
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `🚀 QueueCure Socket Server running on port ${PORT}`
  );
});