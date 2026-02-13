const Appointment = require("../models/Appointment");
const Service = require("../models/Service");
const { rescheduleEmailTemplate } = require("../utils/appointmentEmailTemplates");


const sendEmail = require("../utils/sendEmail");
const {
  bookingEmailTemplate,
  consultationEmailTemplate,
} = require("../utils/appointmentEmailTemplates");


exports.createAppointment = async (req, res) => {
  try {
    const { serviceId, appointmentDate, bookingSource, quantity } = req.body;

    if (!serviceId) {
      return res.status(400).json({
        message: "Service is required",
      });
    }

    const service = await Service.findById(serviceId);

    if (!service || !service.isActive) {
      return res.status(404).json({
        message: "Service not available",
      });
    }

    // Block call-only services from online booking
    if (!service.isOnlineBookable && bookingSource === "online") {
      return res.status(400).json({
        message: "This service must be booked by calling the clinic",
      });
    }

  let finalQuantity = quantity && quantity > 0 ? quantity : 1;

    let appointmentData = {
      patient: req.user.id,
      service: service._id,
      quantity: finalQuantity,
      bookingSource: bookingSource || "online",
      createdBy: req.user.id,
    };

    // ✅ CASE 1: Service Requires Consultation
    if (service.requiresConsultation) {
      appointmentData.status = "pending_consultation";
      appointmentData.servicePrice = null;
      appointmentData.appointmentDate = null;

      const appointment = await Appointment.create(appointmentData);

// Get patient & service details
const populated = await appointment.populate([
  { path: "patient", select: "fullName email" },
  { path: "service", select: "name" },
]);

// Send email to patient
await sendEmail(
  populated.patient.email,
  "Consultation Request Received",
  consultationEmailTemplate(
    populated.patient.fullName,
    populated.service.name
  )
);

// Send email to clinic
await sendEmail(
  process.env.EMAIL_FROM,
  "New Consultation Request",
  `<p>New consultation request from ${populated.patient.fullName} 
   for ${populated.service.name}</p>`
);

return res.status(201).json({

        message:
          "Consultation request received. Please call the clinic to finalize your appointment.",
        appointment,
      });
    }

    // ✅ CASE 2: Normal Priced Service
    if (!appointmentDate) {
      return res.status(400).json({
        message: "Appointment date is required for this service",
      });
    }


    appointmentData.servicePrice = service.price;
    appointmentData.appointmentDate = appointmentDate;
    appointmentData.status = "pending";

    const appointment = await Appointment.create(appointmentData);

  const populated = await appointment.populate([
  { path: "patient", select: "fullName email" },
  { path: "service", select: "name" },
]);

const totalAmount = populated.servicePrice * populated.quantity;

await sendEmail(
  populated.patient.email,
  "Appointment Booking Confirmation",
bookingEmailTemplate(
  populated.patient.fullName,
  populated.service.name,
  populated.appointmentDate,
  totalAmount
)

);

// Notify clinic
await sendEmail(
  process.env.EMAIL_FROM,
  "New Appointment Booked",
  `<p>${populated.patient.fullName} booked ${populated.service.name}
   for ${new Date(populated.appointmentDate).toLocaleDateString("en-NG", {
     year: "numeric",
     month: "long",
     day: "numeric",
   })}</p>`
);


    res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to create appointment",
      error: error.message,
    });
  }
};

exports.adminUpdateAppointment = async (req, res) => {
  try {
    const {
      servicePrice,
      appointmentDate,
      status,
      paymentStatus,
      paymentMethod,
      quantity,
    } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    // Update price if provided
    if (servicePrice !== undefined) {
      appointment.servicePrice = servicePrice;
    }

    // Update date if provided
    if (appointmentDate !== undefined) {
      appointment.appointmentDate = appointmentDate;
    }

    // Update status if provided
    if (status !== undefined) {
      appointment.status = status;
    }

    // Update payment status if provided
    if (paymentStatus !== undefined) {
      appointment.paymentStatus = paymentStatus;
    }

    // Update payment method if provided
    if (paymentMethod !== undefined) {
      appointment.paymentMethod = paymentMethod;
    }

    
    // Update quantity 
    if (quantity !== undefined) {
      appointment.quantity = quantity;
    }

    await appointment.save();

const sendEmail = require("../utils/sendEmail");
const {
  bookingEmailTemplate,
  partialPaymentEmailTemplate,
  completedTreatmentEmailTemplate,
  fullPaymentEmailTemplate,
} = require("../utils/appointmentEmailTemplates");

const populated = await appointment.populate([
  { path: "patient", select: "fullName email" },
  { path: "service", select: "name" },
]);

const totalAmount = appointment.servicePrice * appointment.quantity;

// 1️⃣ Partial Payment
if (appointment.paymentStatus === "partial") {
  const paidAmount = totalAmount * 0.5;
  const remaining = totalAmount - paidAmount;

  await sendEmail(
    populated.patient.email,
    "Partial Payment Received",
    partialPaymentEmailTemplate(
      populated.patient.fullName,
      populated.service.name,
      paidAmount,
      remaining,
      totalAmount,
      appointment.appointmentDate
    )
  );
}

// 2️⃣ Full Payment but Not Completed Yet
else if (
  appointment.paymentStatus === "paid" &&
  appointment.status !== "completed"
) {
  await sendEmail(
    populated.patient.email,
    "Full Payment Confirmation",
    fullPaymentEmailTemplate(
      populated.patient.fullName,
      populated.service.name,
      totalAmount,
      appointment.appointmentDate
    )
  );
}

// 3️⃣ Treatment Completed
else if (
  appointment.status === "completed" &&
  appointment.paymentStatus === "paid"
) {
  await sendEmail(
    populated.patient.email,
    "Treatment Completed Successfully",
    completedTreatmentEmailTemplate(
      populated.patient.fullName,
      populated.service.name,
      totalAmount
    )
  );
}

    res.status(200).json({
      message: "Appointment updated successfully by admin",
      appointment,
    });

  } catch (error) {
    res.status(500).json({
      message: "Failed to update appointment",
      error: error.message,
    });
  }
};

exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "name email phone")
      .populate("service", "name price")
      .sort({ appointmentDate: 1 });

    res.status(200).json({
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch appointments",
      error: error.message,
    });
  }
};

exports.rescheduleAppointment = async (req, res) => {
  try {
    const { appointmentDate } = req.body;

    if (!appointmentDate) {
      return res.status(400).json({
        message: "New appointment date is required",
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    appointment.appointmentDate = appointmentDate;
    await appointment.save();

    const populated = await appointment.populate([
  { path: "patient", select: "fullName email" },
  { path: "service", select: "name" },
]);

await sendEmail(
  populated.patient.email,
  "Appointment Rescheduled",
  rescheduleEmailTemplate(
    populated.patient.fullName,
    populated.service.name,
    populated.appointmentDate
  )
);

    res.status(200).json({
      message: "Appointment rescheduled successfully",
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to reschedule",
      error: error.message,
    });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    await appointment.deleteOne();

    res.status(200).json({
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete appointment",
      error: error.message,
    });
  }
};

