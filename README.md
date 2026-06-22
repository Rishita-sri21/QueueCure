# QueueCure '26

A real-time clinic queue management system built for the QueueCure '26 Hackathon.

## Problem

Traditional clinics use paper tokens and manual announcements.

Patients have no visibility into:

* Current token being served
* Number of patients ahead
* Expected waiting time

Receptionists manually manage queues and doctors have no live dashboard.

QueueCure solves this using real-time synchronization powered by Socket.IO.

---

## Features

### Receptionist Dashboard

* Register patients
* Auto-generate tokens
* Priority-based triage
* Call next patient
* Queue management

### Patient View

* Personal token display
* Tokens ahead
* Estimated waiting time
* Real-time queue updates

### Lobby Display

* Current patient being served
* Live waiting queue
* Queue statistics

### Doctor Chamber

* Currently serving patient
* Severity information
* Consultation status

### Real-Time Updates

* Socket.IO synchronization
* No page refresh required
* Instant updates across all screens

---

## Tech Stack

Frontend

* React
* Tailwind CSS
* Framer Motion
* Socket.IO Client

Backend

* Node.js
* Express.js
* Socket.IO

Database

* MongoDB Atlas
* Mongoose

---

## Architecture

Receptionist → Express API → MongoDB → Socket.IO → All Connected Clients

---

## Key Innovation

Patients can see their queue position and estimated wait time in real time without repeatedly asking clinic staff.

---

## Hackathon Questions

### Can a receptionist add a patient and assign a token in under 10 seconds?

Yes.

Token generation is automatic and registration requires only basic patient information.

### Does the patient-facing screen update live without refresh?

Yes.

Socket.IO broadcasts queue updates to all connected clients instantly.

### Is estimated wait time computed from real data?

Yes.

Wait time is calculated from completed consultations and queue position rather than hardcoded values.

---

## Running Locally

### Backend

npm install

npm run server

### Frontend

npm install

npm run dev

---

## Future Improvements

* SMS Notifications
* WhatsApp Integration
* Multi-Doctor Support
* Appointment Booking
* Analytics Dashboard
* Authentication

---

## Built For

QueueCure '26 Hackathon

Transforming clinic waiting experiences through real-time queue intelligence.
