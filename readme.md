🦷 Dental Clinic Appointment & Payment System (MERN Backend)

A production-structured healthcare backend system designed to manage appointment workflows, consultation processes, and transactional payment operations for dental clinics.

Built with Node.js, Express, and MongoDB following scalable REST architecture principles.

🏗 System Architecture Overview

This system models a real-world clinic workflow including:

Patient onboarding & verification

Appointment booking (direct & consultation-based)

Role-based access control (Patient / Admin)

Deposit-based and partial payment tracking

Transaction-safe financial logic

Automated contextual email notifications

The architecture is designed to support high-volume transactional operations and third-party payment gateway integration via webhook verification.

👥 Role-Based Access
🧑‍⚕️ Patient

Register & verify email

Secure login (JWT access & refresh tokens)

Book appointment (direct or consultation)

Track appointment & payment status

Receive automated email notifications

🏥 Admin

Manage appointments

Set service pricing dynamically

Update quantities & schedule

Record manual payments (transfer / walk-in)

View payment summaries & breakdown

Enforce financial integrity safeguards

💳 Transactional Payment Architecture

The payment system is designed to support:

Deposit-based payments (e.g., 50%)

Partial payments

Full payments

Multi-payment tracking per appointment

Prevention of overpayments

Prevention of duplicate full payments

Payment status synchronization with appointment records

Current Implementation

Dedicated Payment model

Payment status: pending | successful | failed

Appointment paymentStatus: unpaid | partial | paid

Admin manual recording flow

Integration-ready Paystack initialization endpoint

Webhook verification architecture (final phase integration)

Financial Safeguards Implemented

Blocks payment on cancelled appointments

Prevents payment beyond remaining balance

Prevents duplicate full payments

Reconciles total paid vs service total dynamically

Auto-updates paymentStatus on every transaction

📧 Automated Email System

Context-based notifications:

Scenario	Email Trigger
Consultation request	Confirmation to patient & clinic
Appointment booking	Booking confirmation
Partial payment	Deposit confirmation
Full payment	Full receipt confirmation
Appointment completed	Feedback request
Reschedule	Updated appointment notice

All emails are:

Dynamically calculated (quantity-aware)

Localized Nigeria date formatting

Localized for Nigerian time zone

🔐 Authentication & Security

JWT access & refresh token system

Refresh token invalidation on logout

Role-based route protection

Password hashing via bcrypt

Protected admin-only endpoints

Ownership validation (patient can only access their own records)

🧱 Tech Stack

Backend

Node.js

Express.js

MongoDB Atlas

Mongoose

Authentication

JWT

bcryptjs

Payments

Paystack (initialization & webhook-ready)

Nodemailer (transaction emails)

Environment

dotenv

📂 Project Structure
dental_backend/
├─ server.js
├─ config/
│  └─ db.js
├─ models/
│  ├─ User.js
│  ├─ Appointment.js
│  └─ Payment.js
├─ routes/
│  ├─ authRoutes.js
│  ├─ appointmentRoutes.js
│  └─ paymentRoutes.js
├─ controllers/
│  ├─ authController.js
│  ├─ appointmentController.js
│  └─ paymentController.js
├─ middleware/
│  └─ authMiddleware.js
└─ utils/
   ├─ sendEmail.js
   └─ generateToken.js

🚀 Installation
git clone https://github.com/officialmelvinp/Dental_care_home.git
cd Dental_care_home
npm install

🔧 Environment Variables
PORT=5000
MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
EMAIL_FROM="Dental Clinic <noreply@dentalclinic.com>"

PAYSTACK_SECRET_KEY=your_paystack_secret

🔮 Upcoming Enhancements

Full Paystack webhook verification completion

Payment analytics dashboard

Automated appointment reminders (cron)

Review & rating system

Availability scheduling engine

Multi-branch clinic support

👨‍💻 Author

Adeboye Ajayi
Backend Engineer | MERN Developer

GitHub:
https://github.com/officialmelvinp

LinkedIn:
https://linkedin.com/in/adeboye-ajayi

⚖️ License

Copyright © 2026 Adeboye Ajayi
All rights reserved.
This project is proprietary and provided for evaluation and portfolio purposes only.
