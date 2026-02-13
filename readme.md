 Dental Clinic Appointment & Consultation System

A production-structured backend system for managing:

Patient registration & authentication

Dental service bookings

Consultation requests

Appointment management

Payment tracking (integration-ready)

Automated email notifications

Built with Node.js + Express + MongoDB and designed for real clinic workflow.

⚠️ Usage & Rights Notice

This project is NOT open-source.

The source code is publicly visible for portfolio and evaluation purposes only.

You are NOT permitted to:

Copy or reuse the code

Deploy it commercially

Modify or resell it

For collaboration or licensing inquiries, contact the author.

 System Overview

This system supports two primary roles:

 Patients

Register and verify email

Login securely

Book appointments

Request consultations

Receive automated email confirmations

Track appointment status


 Admin

View all appointments

Update appointment details

Confirm or complete treatments

Update payment status (partial / paid)

Reschedule appointments

Manage service pricing

Track payment history (integration-ready)


 Current Backend Features
 Authentication & Authorization

User registration

Email verification via unique token

Login with JWT access & refresh tokens

Token refresh system

Logout with refresh token invalidation

Role-based access control (patient, admin)

Password hashing using bcrypt


 Appointment System
Create Appointment

Online bookable services

Consultation-required services

Quantity support (e.g., family bookings)

Dynamic pricing structure:

servicePrice = unit price
totalAmount = servicePrice × quantity

Consultation Flow

Consultation request creates:

status = pending_consultation

Email sent to:

Patient

Clinic

Appointment Updates (Admin)

Admin can update:

Service price (unit-based)

Quantity

Appointment date

Status (pending, confirmed, completed, etc.)

Payment status (unpaid, partial, paid)

Payment method (online, transfer, walk-in)


 Smart Email Automation

The system sends contextual emails based on status:

Scenario	Email Sent
Consultation request	Consultation confirmation
Appointment booked	Booking confirmation
Partial payment	Deposit confirmation
Full payment	Full payment confirmation
Treatment completed	Completion & feedback request
Reschedule	Reschedule notification


All emails:

Properly formatted

Localized date formatting (Nigeria)

Correct total calculations

Quantity-aware billing

 Payment Logic (Integration Ready)

Current system tracks:

paymentStatus: unpaid | partial | paid
paymentMethod: online | transfer | walk-in


Architecture supports:

Paystack integration

Manual transfer confirmation by admin

Future payment history model

Dynamic total calculation

Multi-payment tracking (next phase)

 Tech Stack
Backend

Node.js

Express.js

MongoDB Atlas

Mongoose

Nodemailer

JWT (jsonwebtoken)

bcryptjs

dotenv

##  Project Structure

dental_backend/
│
├─ server.js # Entry point
├─ config/
│ └─ db.js # MongoDB connection
├─ models/ # Mongoose schemas
│ └─ User.js
│ └─ Appointment.js
│ └─ Payment.js
├─ routes/ # API routes
│ └─ authRoutes.js
│ └─ appointmentRoutes.js
│ └─ paymentRoutes.js
├─ controllers/ # Functions handling route requests
│ └─ authController.js
│ └─ appointmentController.js
│ └─ paymentController.js
├─ middleware/ # Middleware functions
│ └─ authMiddleware.js
└─ utils/ # Utility functions (email, tokens)
└─ generateToken.js


 Installation
git clone https://github.com/officialmelvinp/Dental_care_home.git
cd Dental_care_home

npm install

 Environment Variables

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

 API Endpoints
 Authentication
Method	Route	Description
POST	/api/auth/register	Register & send verification email
POST	/api/auth/login	Login
POST	/api/auth/refresh-token	Refresh access token
POST	/api/auth/logout	Logout
GET	/api/auth/verify-email/:token	Verify email
POST	/api/auth/resend-verification	Resend verification
 Appointments
Method	Route	Description
POST	/api/appointments	Create appointment
GET	/api/appointments	Get all (admin)
GET	/api/appointments/:userId	Get user appointments
PUT	/api/appointments/:id	Admin update appointment
PUT	/api/appointments/reschedule/:id	Reschedule
DELETE	/api/appointments/:id	Delete appointment
 Payments (Next Phase)
Method	Route	Description
POST	/api/payments	Create payment
GET	/api/payments/:userId	Get payment history
 Authentication Flow

User registers

Email verification required

Login returns access + refresh tokens

Protected routes require access token

Refresh token issues new access token

Logout invalidates refresh token


 Upcoming Enhancements

Paystack integration (partial & full payments)

Dedicated Payment model

Payment history endpoint

Cron job reminders (24hr before appointment)

Admin dashboard metrics

Review & rating system

Availability scheduling logic

Multi-branch clinic support

 Author

Adeboye Ajayi
Backend Developer | Full-Stack Developer | REST API Engineer

GitHub: https://github.com/officialmelvinp

LinkedIn: https://linkedin.com/in/adeboye-ajayi


 License

Copyright © 2026 Adeboye Ajayi
All rights reserved.

This software is proprietary and provided strictly for portfolio and evaluation purposes only.

