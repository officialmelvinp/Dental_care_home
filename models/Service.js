const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    price: {
      type: Number,
      default: null, // null for call-only services
    },

    unit: {
      type: String,
      enum: ["per_session", "per_tooth"],
      default: "per_session",
    },

  requiresConsultation: {
  type: Boolean,
  default: false,
},

    isOnlineBookable: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    description: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", serviceSchema);
