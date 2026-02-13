const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");


const {
  createAppointment,
  getAllAppointments,
  rescheduleAppointment,
  deleteAppointment,
} = require("../controllers/appointmentController");

const { protect, admin } = require("../middleware/authMiddleware");


// Admin update appointment
router.put(
  "/admin/:id",
  protect,
  admin,
  appointmentController.adminUpdateAppointment
);

// Patient
router.post("/", protect, createAppointment);

// Admin only
router.get("/", protect, admin, getAllAppointments);
router.put("/:id", protect, admin, rescheduleAppointment);
router.delete("/:id", protect, admin, deleteAppointment);

module.exports = router;
