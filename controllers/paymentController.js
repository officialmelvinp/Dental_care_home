const Appointment = require("../models/Appointment");
const Payment = require("../models/Payment");
const sendEmail = require("../utils/sendEmail");
const axios = require("axios");

const {
  partialPaymentEmailTemplate,
  fullPaymentEmailTemplate,
} = require("../utils/appointmentEmailTemplates");

const {
  generateReceiptNumber,
  generateReference,
} = require("../utils/generatorReceipt");

exports.recordManualPayment = async (req, res) => {
  try {
    const { appointmentId, amountPaid, method } = req.body;

    //  Validate first
    if (!appointmentId) {
      return res.status(400).json({ message: "Appointment ID is required" });
    }

    if (!amountPaid || amountPaid <= 0) {
      return res.status(400).json({ message: "Valid amount is required" });
    }

    if (!method || !["transfer", "walk-in"].includes(method)) {
      return res.status(400).json({
        message: "Method must be transfer or walk-in",
      });
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({
        message: "Cannot make payment for cancelled appointment",
      });
    }

    if (!appointment.servicePrice) {
      return res.status(400).json({
        message: "Service price not set",
      });
    }

    const totalAmount = appointment.servicePrice * appointment.quantity;

    const payments = await Payment.find({
      appointment: appointment._id,
      status: "successful",
    });

    const totalPaidSoFar = payments.reduce(
      (sum, payment) => sum + payment.amountPaid,
      0,
    );

    if (totalPaidSoFar >= totalAmount) {
      return res.status(400).json({
        message: "Appointment already fully paid",
      });
    }

    if (totalPaidSoFar + amountPaid > totalAmount) {
      return res.status(400).json({
        message: "Payment exceeds remaining balance",
      });
    }

    const payment = await Payment.create({
      appointment: appointmentId,
      patient: appointment.patient,
      amountPaid,
      method,
      status: "successful",
      transactionReference: generateReference(),
      receiptNumber: generateReceiptNumber(),
      recordedBy: req.user._id,
    });

    const newTotalPaid = totalPaidSoFar + amountPaid;

    appointment.paymentStatus =
      newTotalPaid === totalAmount ? "paid" : "partial";
    if (newTotalPaid > 0 && appointment.status === "pending") {
      appointment.status = "confirmed";
    }

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointmentId)
      .populate("patient")
      .populate("service");

    const remainingBalance = totalAmount - newTotalPaid;

    // Send emails asynchronously (don't block the response)
    (async () => {
      try {
        if (appointment.paymentStatus === "paid") {
          await sendEmail({
            to: populatedAppointment.patient.email,
            subject: "Appointment Fully Paid",
            html: fullPaymentEmailTemplate(
              populatedAppointment.patient.fullName,
              populatedAppointment.service?.name || "Dental Service",
              totalAmount,
              populatedAppointment.appointmentDate,
            ),
          });
        } else {
          await sendEmail({
            to: populatedAppointment.patient.email,
            subject: "Deposit Received",
            html: partialPaymentEmailTemplate(
              populatedAppointment.patient.fullName,
              populatedAppointment.service?.name || "Dental Service",
              amountPaid,
              remainingBalance,
              totalAmount,
              populatedAppointment.appointmentDate,
            ),
          });
        }
      } catch (emailError) {
        console.error("Failed to send payment email:", emailError.message);
      }
    })();

    res.status(201).json({
      message: "Payment recorded successfully",
      payment,
      paymentStatus: appointment.paymentStatus,
      totalPaid: newTotalPaid,
      totalAmount,
      remainingBalance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.initializeOnlinePayment = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointment =
      await Appointment.findById(appointmentId).populate("patient");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({
        message: "Cannot pay for cancelled appointment",
      });
    }

    if (!appointment.servicePrice) {
      return res.status(400).json({
        message: "Service price not set",
      });
    }

    if (appointment.paymentStatus === "paid") {
      return res.status(400).json({
        message: "Appointment already fully paid",
      });
    }

    const totalAmount = appointment.servicePrice * appointment.quantity;
    const depositAmount = Math.round(totalAmount * 0.5);

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: appointment.patient.email,
        amount: depositAmount * 100,
        metadata: {
          appointmentId: appointment._id,
          patientId: appointment.patient._id,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );

    res.status(200).json({
      authorization_url: response.data.data.authorization_url,
      reference: response.data.data.reference,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.paystackWebhookHandler = async (req, res) => {
  try {
    const crypto = require("crypto");

    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(400).send("Invalid signature");
    }

    const event = req.body;

    if (event.event === "charge.success") {
      const data = event.data;

      const appointmentId = data.metadata.appointmentId;
      const amountPaid = data.amount / 100;
      const reference = data.reference;

      console.log(" PAYMENT SUCCESS WEBHOOK");
      console.log("Appointment:", appointmentId);
      console.log("Amount:", amountPaid);

      // Check if already recorded
      const existingPayment = await Payment.findOne({
        transactionReference: reference,
      });

      if (existingPayment) {
        console.log(" Payment already recorded");
        return res.sendStatus(200);
      }

      //  Find appointment
      const appointment = await Appointment.findById(appointmentId);

      if (!appointment) {
        console.log(" Appointment not found");
        return res.sendStatus(200);
      }

      if (!appointment.servicePrice) {
        console.log(" Service price missing");
        return res.sendStatus(200);
      }

      if (appointment.status === "cancelled") {
        console.log(" Appointment is cancelled — ignoring payment");
        return res.sendStatus(200);
      }

      const totalAmount = appointment.servicePrice * appointment.quantity;

      // 3️⃣ Calculate total paid so far
      const previousPayments = await Payment.find({
        appointment: appointmentId,
        status: "successful",
      });

      const totalPaidSoFar = previousPayments.reduce(
        (sum, payment) => sum + payment.amountPaid,
        0,
      );

      if (totalPaidSoFar + amountPaid > totalAmount) {
        console.log(" Overpayment detected");
        return res.sendStatus(200);
      }

      // 4️⃣ Create payment record
      const payment = await Payment.create({
        appointment: appointmentId,
        patient: appointment.patient,
        amountPaid,
        method: "online",
        status: "successful",
        transactionReference: reference,
        receiptNumber: generateReceiptNumber(),
        paidAt: new Date(data.paid_at),
      });

      console.log(" Payment recorded:", payment._id);

      // 5️⃣ Update appointment paymentStatus
      const newTotalPaid = totalPaidSoFar + amountPaid;

      if (newTotalPaid === totalAmount) {
        appointment.paymentStatus = "paid";
      } else if (newTotalPaid > 0) {
        appointment.paymentStatus = "partial";
      }
      if (newTotalPaid > 0 && appointment.status === "pending") {
        appointment.status = "confirmed";
      }

      await appointment.save();

      console.log(" Appointment payment status updated");

      // Populate patient for email
      const populatedAppointment = await Appointment.findById(appointmentId)
        .populate("patient")
        .populate("service");

      const remainingBalance = totalAmount - newTotalPaid;

      // Send emails asynchronously (don't block webhook response)
      (async () => {
        try {
          if (appointment.paymentStatus === "paid") {
            await sendEmail({
              to: populatedAppointment.patient.email,
              subject: "Appointment Fully Paid",
              html: fullPaymentEmailTemplate(
                populatedAppointment.patient.fullName,
                populatedAppointment.service?.name || "Dental Service",
                totalAmount,
                populatedAppointment.appointmentDate,
              ),
            });
            console.log(" Full payment email sent");
          } else {
            await sendEmail({
              to: populatedAppointment.patient.email,
              subject: "Deposit Received",
              html: partialPaymentEmailTemplate(
                populatedAppointment.patient.fullName,
                populatedAppointment.service?.name || "Dental Service",
                amountPaid,
                remainingBalance,
                totalAmount,
                populatedAppointment.appointmentDate,
              ),
            });
            console.log(" Partial payment email sent");
          }
        } catch (emailError) {
          console.error("Failed to send webhook email:", emailError.message);
        }
      })();
    }

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    // Only admins can fetch all payments
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admins can view all payments",
      });
    }

    const filter = {};

    if (req.query.appointment) {
      filter.appointment = req.query.appointment;
    }

    const payments = await Payment.find(filter)
      .populate("appointment")
      .populate("patient", "fullName email")
      .populate("recordedBy", "fullName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: payments.length,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
};

exports.getAppointmentPayments = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    // Verify authorization - patient or admin only
    if (
      appointment.patient.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Not authorized to view these payments",
      });
    }

    const payments = await Payment.find({
      appointment: req.params.appointmentId,
    })
      .populate("recordedBy", "fullName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: payments.length,
      payments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch appointment payments",
      error: error.message,
    });
  }
};

exports.getPaymentSummary = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.appointmentId);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    // Verify authorization - patient or admin only
    if (
      appointment.patient.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Not authorized to view this payment summary",
      });
    }

    const totalAmount = appointment.servicePrice * appointment.quantity;

    const payments = await Payment.find({
      appointment: appointment._id,
      status: "successful",
    });

    let totalPaid = 0;
    let breakdown = {};

    payments.forEach((payment) => {
      totalPaid += payment.amountPaid;

      if (!breakdown[payment.method]) {
        breakdown[payment.method] = 0;
      }

      breakdown[payment.method] += payment.amountPaid;
    });

    res.status(200).json({
      totalAmount,
      totalPaid,
      remainingBalance: totalAmount - totalPaid,
      paymentStatus: appointment.paymentStatus,
      breakdown,
      transactions: payments.length,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch payment summary",
      error: error.message,
    });
  }
};

exports.getGlobalPaymentSummary = async (req, res) => {
  try {
    // Only admins can view global payment summary
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admins can view global payment summary",
      });
    }

    const payments = await Payment.find({
      status: "successful",
    });

    let totalRevenue = 0;
    let breakdown = {};

    payments.forEach((payment) => {
      totalRevenue += payment.amountPaid;

      if (!breakdown[payment.method]) {
        breakdown[payment.method] = 0;
      }

      breakdown[payment.method] += payment.amountPaid;
    });

    res.status(200).json({
      totalRevenue,
      totalTransactions: payments.length,
      breakdown,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch global summary",
      error: error.message,
    });
  }
};
