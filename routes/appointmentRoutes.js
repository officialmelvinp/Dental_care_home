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

// Reschedule - both admin & patient can hit this, but only admin can actually reschedule
router.put("/:id/reschedule", protect, rescheduleAppointment);

// Delete - both admin & patient can hit this, but only admin can actually delete
router.delete("/:id/delete", protect, deleteAppointment);

module.exports = router;