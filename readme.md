## ⚠️ Usage & Rights Notice

This project is **NOT open-source**.

The source code is publicly visible **for portfolio and evaluation purposes only**.
You are **NOT permitted** to:
- Copy or reuse the code
- Deploy it commercially
- Modify or resell it

If you are interested in using this project or collaborating,
please contact the author.


# Dental Clinic Appointment System
A full-stack **Dental Clinic Appointment System** allowing patients to **book appointments, manage their bookings, pay for services, and receive email confirmations**.  
This project uses **Node.js + Express + MongoDB** for the backend and plans to integrate **React/Next.js** for the frontend.

---

## 🏗 Project Idea

Goal: A web application where patients can:  
- View available dental services and appointment slots  
- Book appointments  
- Pay for services using Paystack or Flutterwave 
- Receive email confirmations for their bookings  

The system is designed for **patients** and **administrators**, with role-based access to manage users, appointments, and payments.

---

## 🔥 Features (Backend)

### User Authentication
- User registration & login
- JWT-based access & refresh tokens
- Email verification with unique verification links
- Role-based access: `patient` vs `admin`
- Password hashing with bcrypt
- Logout and token invalidation

### Appointments
- Create an appointment
- View all appointments or appointments by user
- Update or cancel appointments
- Email notifications upon booking

### Payments
- Paystack for single payments (Flutterwave optional)
- Link payments to appointments
- Store payment details in MongoDB (future-proofing for billing and history)

### Utilities
- Nodemailer for sending verification and appointment emails
- Environment variables management with dotenv
- Centralized token generation and authentication middleware

---

## ⚙ Tech Stack

### Backend
- **Node.js** + **Express.js**  
- **MongoDB Atlas** + **Mongoose**  
- **Nodemailer** for emails  
- **Stripe** for payments  
- **bcryptjs** for password hashing  
- **jsonwebtoken (JWT)** for authentication  
- **dotenv** for environment variables  

### Frontend (Planned)
- **React.js** or **Next.js**  
- **Axios** for API requests  
- **Tailwind CSS** or CSS for styling  
- **React Hook Form** (optional for form handling)  

---

## 📂 Project Structure

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


---

## 📦 Installation

1. Clone the repo:

```bash
git clone https://github.com/officialmelvinp/Dental_care_home.git
cd dental_care_home
PORT=5000
MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_super_secret_jwt_key
JWT_REFRESH_SECRET=your_super_secret_refresh_token_key

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
EMAIL_FROM="Dental Clinic <noreply@dentalclinic.com>"

PAYSTACK_SECRET_KEY=your_stripe_secret_key

npm run dev


📖 API Endpoints (Backend)
Authentication
Method	Route	Description
POST	/api/auth/register	Register user & send verification email
POST	/api/auth/login	Login and receive JWT access & refresh tokens
POST	/api/auth/refresh-token	Get a new access token using refresh token
POST	/api/auth/logout	Logout user (invalidate refresh token)
GET	/api/auth/verify-email/:token	Verify user email
POST	/api/auth/resend-verification	Resend email verification
Appointments
Method	Route	Description
POST	/api/appointments	Create a new appointment
GET	/api/appointments	Get all appointments (admin)
GET	/api/appointments/:userId	Get appointments by user
PUT	/api/appointments/:id	Update an appointment
DELETE	/api/appointments/:id	Cancel an appointment
Payments
Method	Route	Description
POST	/api/payments	Make a payment for an appointment
GET	/api/payments/:userId	Get payments for a user
🔐 Authentication Flow

User registers → receives verification email

User clicks link → email verified

User logs in → receives JWT access token & refresh token

Access token expires → refresh token used to obtain new access token

User can logout → refresh token invalidated

💡 Notes & Next Steps

Frontend is still under development using React/Next.js.

Email sending requires valid credentials and app password for Gmail.

Payment integration with  is partially implemented (single payments).

Future:

Add recurring appointments

Improve appointment availability management

Add comprehensive frontend dashboards

📫 Author

Adeboye Ajayi – Backend Developer | Full-Stack Developer | Python & Django Backend Engineer | REST APIs, Databases & Authentication | Node.js, Express & MongoDB | AI & NLP Engineering (In Progress)

GitHub: https://github.com/officialmelvinp

LinkedIn: https://linkedin.com/in/adeboye-ajayi


✅ License

Copyright (c) 2026 Adeboye Ajayi

All rights reserved.

This software and associated documentation files (the "Software") 
are the proprietary property of Adeboye Ajayi.

No part of this software may be copied, modified, merged, published,
distributed, sublicensed, or sold without explicit written permission
from the author.

This repository is provided strictly for portfolio and evaluation
purposes only.

