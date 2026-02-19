const express = require("express");
const router = express.Router();

const {
  recordManualPayment,
  getAllPayments,
  getAppointmentPayments,
  getPaymentSummary,
  getGlobalPaymentSummary,
  initializeOnlinePayment,
  paystackWebhookHandler,
} = require("../controllers/paymentController");

const { protect, admin } = require("../middleware/authMiddleware");

// PATIENT - Initialize online payment
router.post("/initialize", protect, initializeOnlinePayment);


// PAYSTACK - Webhook (no protect)
router.post("/webhook", paystackWebhookHandler);

// ADMIN - Manual transfer / walk-in
router.post("/manual", protect, admin, recordManualPayment);

// ADMIN - Queries
router.get("/", protect, admin, getAllPayments);
router.get("/summary", protect, admin, getGlobalPaymentSummary);
router.get("/summary/:appointmentId", protect, admin, getPaymentSummary);
router.get("/appointment/:appointmentId", protect, admin, getAppointmentPayments);




module.exports = router;
