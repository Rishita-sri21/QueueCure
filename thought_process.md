# QueueCure '26 – Thought Process

## Problem Statement

Most small clinics still use paper tokens and manual queue management.

This creates several problems:

- Patients do not know how long they must wait.
- Receptionists repeatedly answer queue-related questions.
- Doctors have no visibility into patient flow.
- Queue updates are not synchronized across screens.

The goal was to create a real-time digital queue system that improves visibility for all stakeholders.

---

## Objectives

The system should answer three key questions:

### 1. Can a receptionist add a patient in under 10 seconds?

Yes.

The receptionist dashboard provides a simple form that instantly assigns a token and adds the patient to the queue.

### 2. Does the patient view update without refresh?

Yes.

Socket.IO broadcasts queue changes to all connected clients.

Patients immediately see:

- Current token being served
- Tokens ahead
- Updated estimated wait time

without refreshing the page.

### 3. Is wait time computed from real data?

Yes.

The system calculates average consultation duration using completed consultations.

Estimated wait time is dynamically calculated using queue position, patient priority, and historical consultation duration.

---

## Technology Stack

### Frontend

- React.js
- Tailwind CSS
- Framer Motion

### Backend

- Node.js
- Express.js

### Database

- MongoDB Atlas

### Real-Time Communication

- Socket.IO

---

## System Architecture

The application consists of four major layers:

### Reception Layer

Used by receptionists to:

- Register patients
- Generate tokens
- Call next patient
- Manage queue operations

### Backend Layer

Express.js APIs handle:

- Queue management
- Token generation
- Priority sorting
- Analytics calculations

### Database Layer

MongoDB stores:

- Patient information
- Queue state
- Consultation history
- Analytics data

### Real-Time Layer

Socket.IO broadcasts updates to all connected clients whenever queue state changes.

---

## Queue Prioritization Logic

Patients are sorted using triage severity.

Priority order:

1. Emergency
2. Urgent
3. Routine

Within the same severity level, patients follow FIFO (First In First Out) ordering.

This ensures critical patients receive immediate attention while maintaining fairness.

---

## Wait Time Prediction

The wait time prediction is not hardcoded.

The application calculates average consultation duration using completed consultations.

For a patient:

Estimated Wait Time =
Sum of expected consultation durations of patients ahead in the queue.

Severity is considered during estimation:

- Emergency patients consume higher estimated consultation time
- Urgent patients consume moderate estimated consultation time
- Routine patients use baseline consultation time

This creates a more realistic waiting estimate.

---

## Real-Time Synchronization

Whenever one of the following actions occurs:

- Patient registration
- Call Next operation
- Consultation completion

The backend emits Socket.IO events.

### Events Used

#### queueUpdated

Broadcasts latest queue state.

#### patientCalled

Broadcasts the currently called patient.

#### avgTimeUpdated

Broadcasts updated consultation averages.

All connected screens instantly receive updates.

No browser refresh is required.

---

## Concurrency Considerations

### Problem

Multiple receptionists may attempt to modify the queue simultaneously.

### Solution

The backend acts as the single source of truth.

All queue modifications occur on the server before updates are broadcast.

This prevents inconsistent queue ordering and duplicate token handling.

---

## Edge Cases Considered

### Empty Queue

If no patients are waiting:

- Queue remains stable
- Appropriate message is displayed

### Patient Cancellation

Removing a patient automatically updates queue positions.

### Emergency Patient Added Mid-Queue

Emergency patients automatically move ahead according to severity rules.

### Browser Refresh

Queue data persists in MongoDB.

Refreshing the browser does not lose queue information.

### Network Disconnect

Socket.IO automatically reconnects and re-synchronizes queue state.

### Duplicate Patient History Entries

Patient history records are validated before insertion to avoid duplicate entries.

---

## Scalability

The architecture can be extended to support:

- Multiple doctors
- Multiple consultation rooms
- Multiple clinic branches
- Appointment scheduling
- SMS notifications
- WhatsApp alerts
- Advanced analytics dashboards

without major architectural changes.

---

## Future Improvements

- AI-based wait time prediction
- SMS alerts before patient turn
- WhatsApp notifications
- Doctor consultation notes
- Appointment booking integration
- Multi-doctor scheduling
- Daily analytics reports
- Administrative dashboard

---

## Clinic Owner Moment

"When I click Call Next and every screen updates instantly without refreshing."

This moment demonstrates the value of replacing paper-based queue systems with a real-time digital workflow.

---

## Conclusion

QueueCure provides a practical and scalable solution for neighborhood clinics.

By combining MongoDB, Express.js, React, and Socket.IO, the system delivers:

- Fast patient registration
- Real-time queue visibility
- Accurate wait-time prediction
- Live synchronization across all screens

while remaining simple enough for everyday clinic operations.