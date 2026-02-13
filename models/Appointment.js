const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    // Snapshot of agreed price (can be null initially for consultation)
    servicePrice: {
      type: Number,
      default: null,
    },

    quantity: {
      type: Number,
      default: 1,
    },

    // Only required for non-consultation services
    appointmentDate: {
      type: Date,
      default: null,
    },

    bookingSource: {
      type: String,
      enum: ["online", "walk-in", "phone"],
      default: "online",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "pending_consultation",
        "confirmed",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    // Payment tracking (future-proof but simple)
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
    },

    paymentMethod: {
      type: String,
      enum: ["online", "walk-in", "transfer"],
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
