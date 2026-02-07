🦷 Dental Clinic Appointment System (Backend)

A full-stack Dental Clinic Appointment System that allows patients to register, verify their email, book dental appointments, make payments via Nigerian payment platforms, and receive email notifications.

This repository currently contains the backend API, built with Node.js, Express, and MongoDB.
The frontend (React / Next.js) is planned and will be added later.

⚠️ Usage & Rights Notice

This project is NOT open-source.

The source code is publicly visible for portfolio and evaluation purposes only.
You are NOT permitted to:

Copy or reuse the code

Deploy it commercially

Modify or resell it

If you are interested in using this project or collaborating,
please contact the author.

🏗 Project Idea

Goal:
Build a web application where patients can:

Register and verify their email

View available dental services and dentists

Book appointments

Pay for services using Paystack (Flutterwave planned)

Receive email confirmations for bookings and payments

The system supports role-based access:

patient – book and manage appointments

admin – manage users, appointments, dentists, and payments

🔥 Features (Backend)
✅ User Authentication

User registration & login

Email verification using unique verification links

JWT-based access & refresh tokens

Secure password hashing with bcrypt

Role-based access control (patient, admin)

Logout & refresh token invalidation

Resend verification email

📅 Appointments

Create an appointment

View appointments (all or per user)

Update or cancel appointments

Email notification on successful booking

💳 Payments

Paystack integration for one-time payments

Payment linked to appointments

Store payment history in MongoDB

Flutterwave planned as an alternative gateway

🛠 Utilities & Middleware

Nodemailer for transactional emails

Centralized error handling middleware

Authentication & authorization middleware

Environment variable management with dotenv

Token generation utilities

⚙ Tech Stack
Backend

Node.js + Express.js

MongoDB Atlas + Mongoose

JWT (jsonwebtoken) – authentication

bcryptjs – password hashing

Nodemailer – email notifications

Paystack – payments

dotenv – environment variables

Frontend (Planned)

React.js or Next.js

Axios for API communication

Tailwind CSS or plain CSS

React Hook Form (optional)

📂 Project Structure
dental_backend/
│
├─ server.js                 # Entry point
├─ config/
│   └─ db.js                 # MongoDB connection
├─ models/
│   ├─ User.js
│   ├─ Appointment.js
│   ├─ Dentist.js
│   └─ Payment.js
├─ controllers/
│   ├─ authController.js
│   ├─ appointmentController.js
│   ├─ dentistController.js
│   └─ paymentController.js
├─ routes/
│   ├─ authRoutes.js
│   ├─ appointmentRoutes.js
│   ├─ dentistRoutes.js
│   └─ paymentRoutes.js
├─ middleware/
│   ├─ authMiddleware.js
│   └─ errorMiddleware.js
└─ utils/
    ├─ generateToken.js
    ├─ generateRefreshToken.js
    └─ sendEmail.js

📦 Installation & Setup
1️⃣ Clone repository
git clone https://github.com/officialmelvinp/Dental_care_home.git
cd Dental_care_home

2️⃣ Install dependencies
npm install

3️⃣ Environment variables (.env)
PORT=5000
MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_token_secret

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
EMAIL_FROM="Dental Clinic <noreply@dentalclinic.com>"

PAYSTACK_SECRET_KEY=your_paystack_secret_key

4️⃣ Run the server
npm run dev

📖 API Endpoints (Backend)
Authentication

POST /api/auth/register – Register user & send verification email

GET /api/auth/verify-email/:token – Verify email

POST /api/auth/resend-verification – Resend verification email

POST /api/auth/login – Login user

POST /api/auth/refresh-token – Refresh access token

POST /api/auth/logout – Logout user

Appointments

POST /api/appointments – Create appointment

GET /api/appointments – Get all appointments (admin)

GET /api/appointments/:userId – Get user appointments

PUT /api/appointments/:id – Update appointment

DELETE /api/appointments/:id – Cancel appointment

Payments

POST /api/payments – Pay for an appointment

GET /api/payments/:userId – Get user payments

🔐 Authentication Flow

User registers

Verification email is sent

User clicks link → account verified

User logs in → receives access & refresh tokens

Refresh token generates new access tokens

Logout invalidates refresh token

🚧 Project Status & Next Steps

✅ Authentication completed
✅ Email verification implemented
🚧 Appointment availability logic in progress
🚧 Payment webhook verification (Paystack)
🚧 Frontend (React / Next.js)

📫 Author

Adeboye Ajayi
Backend Developer | Full-Stack Developer
Node.js, Express, MongoDB | Django & REST APIs | AI & NLP (In Progress)

GitHub: https://github.com/officialmelvinp

LinkedIn: https://linkedin.com/in/adeboye-ajayi

✅ License

Copyright (c) 2026 Adeboye Ajayi
All rights reserved.

This repository is provided strictly for portfolio and evaluation purposes only.