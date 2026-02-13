require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require("./routes/serviceRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");


const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Test route
app.get('/', (req, res) => {
  res.send('Hello Dental API!');
});

app.use('/api/auth', authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointments", appointmentRoutes);


// Start server after DB connects
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

