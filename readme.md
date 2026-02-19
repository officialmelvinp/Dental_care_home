🦷 Dental Clinic Appointment & Consultation System

A production-structured backend system for managing:

Patient registration & authentication

Dental service bookings

Consultation workflow

Smart appointment lifecycle management

Advanced payment engine (manual + Paystack)

Automated email notifications

Revenue tracking foundation

Reminder scheduling support

Built with Node.js + Express + MongoDB and structured for real clinic operations.

⚠️ Usage & Rights Notice

This project is NOT open-source.

The source code is publicly visible for portfolio and evaluation purposes only.

You are NOT permitted to:

Copy or reuse the code

Deploy it commercially

Modify or resell it

For collaboration or licensing inquiries, contact the author.

🏥 System Overview

The system supports two primary roles:

👤 Patients

Register and verify email

Login securely

Book appointments

Request consultations

Make online payments (Paystack)

Make partial or full payments

Receive automated email confirmations

Track appointment & payment status

🛠 Admin

View all appointments

Update appointment details

Confirm / complete treatments

Record manual payments

Track partial & full payments

View payment history

Reschedule appointments

Manage service pricing

View revenue analytics foundation

Securely verify online payments via webhook

🔐 Authentication & Authorization

Email verification via unique token

JWT access & refresh tokens

Token refresh flow

Logout with refresh invalidation

Role-based access control (patient / admin)

Password hashing with bcrypt

Protected route middleware

📅 Appointment System
Create Appointment

Supports:

Online-bookable services

Consultation-required services

Quantity support (e.g. family bookings)

Dynamic Pricing Logic
servicePrice = unit price
totalAmount = servicePrice × quantity
amountPaid = cumulative payments
balance = totalAmount - amountPaid

Consultation Flow

Creates:

status = pending_consultation


Automated email sent to:

Patient

Clinic

Appointment Lifecycle

Statuses include:

pending

pending_consultation

confirmed

completed

cancelled

Payment statuses:

unpaid

partial

paid

💳 Advanced Payment Engine (Fully Implemented)

This system now supports a real financial workflow, not just basic flags.

🟢 Manual Payment (Admin)

Admin can record:

Cash

Transfer

Walk-in

Financial Protections:

❌ Cannot pay cancelled appointments

❌ Cannot overpay

❌ Cannot pay fully paid appointment

❌ Cannot pay if servicePrice not set

❌ Cannot exceed remaining balance

Smart Status Update:
Scenario	Result
amountPaid < totalAmount	paymentStatus = partial
amountPaid >= totalAmount	paymentStatus = paid

Each payment creates:

Unique transactionReference

Unique receiptNumber

recordedBy (admin ID)

Payment history record

🟢 Online Payment (Paystack Integration)
Flow:

Patient calls:

POST /api/payments/initialize


Backend:

Calculates remaining balance

Rounds deposit properly

Generates Paystack authorization link

Returns secure reference

User pays via Paystack checkout

Paystack sends webhook → backend verifies signature

System:

Validates reference

Prevents duplicate processing

Confirms appointment exists

Blocks cancelled appointments

Prevents overpayment

Updates payment status

Generates receipt

Sends confirmation email

🔒 Webhook Security

Signature verification via PAYSTACK_SECRET_KEY

Duplicate reference blocking

Appointment existence validation

Financial integrity enforcement

This protects against:

Replay attacks

Double crediting

Manual webhook abuse

🧾 Payment Model

Tracks:

appointment

patient

amountPaid

method (online / transfer / walk-in)

status

transactionReference

receiptNumber

recordedBy (admin)

paidAt

This enables:

Full payment history

Audit logging

Revenue tracking

Refund support (next phase)

✉️ Smart Email Automation

Emails are triggered based on:

Scenario	Email
Consultation request	Consultation confirmation
Appointment booked	Booking confirmation
Partial payment	Deposit receipt
Full payment	Full receipt
Treatment completed	Completion & feedback
Reschedule	Reschedule notice

Features:

Proper HTML formatting

Localized Nigeria date formatting

Quantity-aware billing

Accurate balance breakdown

⏰ Reminder System Foundation

Appointment model includes:

reminderSent: {
  type: Boolean,
  default: false
}


Used for:

Cron-based reminder system

Preventing duplicate reminders

24-hour pre-appointment notification

Reschedule-safe logic

📊 Revenue & Analytics Foundation

Current architecture supports:

Total revenue aggregation

Monthly income grouping

Outstanding balance tracking

Admin financial dashboard (next phase)

🧠 Financial Integrity Rules Implemented

✔ Cannot overpay
✔ Cannot double-pay
✔ Cannot pay cancelled appointment
✔ Cannot process duplicate webhook
✔ Cannot initialize payment for fully paid appointment
✔ Deposit calculated correctly
✔ Balance calculated dynamically
✔ Partial payment supported
✔ Multiple payments per appointment supported

🛠 Tech Stack

Backend:

Node.js

Express.js

MongoDB Atlas

Mongoose

Nodemailer

JWT (jsonwebtoken)

bcryptjs

dotenv

node-cron (reminder system)

Paystack API

📂 Project Structure
dental_backend/
│
├─ server.js
├─ config/
│   └─ db.js
├─ models/
│   └─ User.js
│   └─ Appointment.js
│   └─ Payment.js
├─ routes/
│   └─ authRoutes.js
│   └─ appointmentRoutes.js
│   └─ paymentRoutes.js
├─ controllers/
│   └─ authController.js
│   └─ appointmentController.js
│   └─ paymentController.js
├─ middleware/
│   └─ authMiddleware.js
├─ utils/
│   └─ sendEmail.js
│   └─ generatorReceipt.js
│   └─ reminderJobs.js
└─ config/
    └─ paystack.js

⚙️ Installation
git clone https://github.com/officialmelvinp/Dental_care_home.git
cd Dental_care_home
npm install

🌍 Environment Variables

Create a .env file:

PORT=5000
MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
EMAIL_FROM="Dental Clinic <noreply@dentalclinic.com>"

PAYSTACK_SECRET_KEY=your_paystack_secret


Run:

npm run dev

🔌 API Endpoints
Authentication
Method	Route	Description
POST	/api/auth/register	Register
POST	/api/auth/login	Login
POST	/api/auth/refresh-token	Refresh token
POST	/api/auth/logout	Logout
GET	/api/auth/verify-email/:token	Verify email
POST	/api/auth/resend-verification	Resend verification
Appointments
Method	Route	Description
POST	/api/appointments	Create appointment
GET	/api/appointments	Get all (admin)
GET	/api/appointments/:userId	Get user appointments
PUT	/api/appointments/:id	Admin update
PUT	/api/appointments/reschedule/:id	Reschedule
DELETE	/api/appointments/:id	Delete
Payments
Method	Route	Description
POST	/api/payments/manual	Record manual payment
POST	/api/payments/initialize	Initialize Paystack payment
POST	/api/payments/webhook	Paystack webhook
GET	/api/payments/:appointmentId	Payment history
🚀 Upcoming Enhancements

PDF receipt generation

Refund engine (manual admin-triggered)

Full admin revenue dashboard

Audit logging system

Appointment rating & review system

Availability scheduling logic

Multi-branch clinic support

Cloud file storage for invoices

👨‍💻 Author

Adeboye Ajayi
Backend Developer | Full-Stack Developer | REST API Engineer

GitHub:
https://github.com/officialmelvinp

LinkedIn:
https://linkedin.com/in/adeboye-ajayi

📜 License

Copyright © 2026 Adeboye Ajayi
All rights reserved.

This software is proprietary and provided strictly for portfolio and evaluation purposes only.

🔥 This README now reflects a production-grade financial backend, not a basic CRUD app.

When someone reviews this, they will immediately see:

You understand payment architecture

You understand webhook security

You understand financial integrity

You understand real-world clinic workflow

When your test finishes, we move to:

PDF Receipts → Refund Engine → Revenue Dashboard.