const Appointment = require("../models/Appointment");
const Service = require("../models/Service");
const {
  rescheduleEmailTemplate,
} = require("../utils/appointmentEmailTemplates");
const Payment = require("../models/Payment");

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

    //  CASE 1: Service Requires Consultation
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

      // Send emails asynchronously (don't block the response)
      (async () => {
        // Send email to patient
        try {
          await sendEmail({
            to: populated.patient.email,
            subject: "Consultation Request Received",
            html: consultationEmailTemplate(
              populated.patient.fullName,
              populated.service.name,
            ),
          });
        } catch (emailError) {
          console.error(
            "Failed to send patient consultation email:",
            emailError.message,
          );
        }

        // Send email to clinic
        try {
          await sendEmail({
            to: process.env.EMAIL_FROM,
            subject: "New Consultation Request",
            html: `<p>New consultation request from ${populated.patient.fullName} 
   for ${populated.service.name}</p>`,
          });
        } catch (emailError) {
          console.error(
            "Failed to send clinic consultation email:",
            emailError.message,
          );
        }
      })();

      return res.status(201).json({
        message:
          "Consultation request received. Please call the clinic to finalize your appointment.",
        appointment,
      });
    }

    // CASE 2: Normal Priced Service
    if (!appointmentDate) {
      return res.status(400).json({
        message: "Appointment date is required for this service",
      });
    }

    // Validate that appointment date is not in the past
    const appointmentDateTime = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentDateTime < today) {
      return res.status(400).json({
        message:
          "Cannot book an appointment for a past date. Please select a future date.",
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

    // Send emails asynchronously (don't block the response)
    (async () => {
      // Send email to patient
      try {
        await sendEmail({
          to: populated.patient.email,
          subject: "Appointment Booking Confirmation",
          html: bookingEmailTemplate(
            populated.patient.fullName,
            populated.service.name,
            populated.appointmentDate,
            totalAmount,
          ),
        });
      } catch (emailError) {
        console.error(
          "Failed to send patient booking email:",
          emailError.message,
        );
      }

      // Notify clinic
      try {
        await sendEmail({
          to: process.env.EMAIL_FROM,
          subject: "New Appointment Booked",
          html: `<p>${populated.patient.fullName} booked ${populated.service.name}
   for ${new Date(populated.appointmentDate).toLocaleDateString("en-NG", {
     year: "numeric",
     month: "long",
     day: "numeric",
   })}</p>`,
        });
      } catch (emailError) {
        console.error(
          "Failed to send clinic booking email:",
          emailError.message,
        );
      }
    })();

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
    const { servicePrice, appointmentDate, status, quantity } = req.body;

    const appointment = await Appointment.findById(req.params.id)
      .populate("patient", "fullName email")
      .populate("service", "name");

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    // Validate servicePrice if provided
    if (servicePrice !== undefined) {
      if (servicePrice <= 0) {
        return res.status(400).json({
          message: "Service price must be greater than zero",
        });
      }
      if (isNaN(servicePrice)) {
        return res.status(400).json({
          message: "Service price must be a valid number",
        });
      }
    }

    // Validate quantity if provided
    if (quantity !== undefined) {
      if (quantity <= 0) {
        return res.status(400).json({
          message: "Quantity must be greater than zero",
        });
      }
      if (!Number.isInteger(quantity)) {
        return res.status(400).json({
          message: "Quantity must be a whole number",
        });
      }
    }

    // Validate appointmentDate if provided
    if (appointmentDate !== undefined) {
      const appointmentDateTime = new Date(appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (appointmentDateTime < today) {
        return res.status(400).json({
          message: "Cannot schedule appointment for a past date",
        });
      }
    }

    let priceWasUpdated = false;

    // Update price
    if (servicePrice !== undefined) {
      appointment.servicePrice = servicePrice;
      priceWasUpdated = true;
    }

    // Reset reminder because date changed
    if (appointmentDate !== undefined) {
      appointment.appointmentDate = appointmentDate;
      appointment.reminderSent = false;
    }

    if (status !== undefined) {
      const validStatuses = [
        "pending",
        "pending_consultation",
        "awaiting_payment",
        "confirmed",
        "completed",
        "cancelled",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        });
      }
      appointment.status = status;
    }

    // Update quantity
    if (quantity !== undefined) {
      appointment.quantity = quantity;
    }

    // If admin sets a price, automatically move to awaiting_payment
    if (servicePrice !== undefined) {
      appointment.status = "awaiting_payment";
      appointment.paymentStatus = "unpaid";
    }

    await appointment.save();

    const totalAmount = appointment.servicePrice * appointment.quantity;

    const depositAmount = totalAmount * 0.5;

    // Send email if awaiting payment
    if (appointment.status === "awaiting_payment") {
      try {
        (async () => {
          await sendEmail({
            to: appointment.patient.email,
            subject: "Your Treatment Plan & Payment Details",
            html: `
      <h3>Hello ${appointment.patient.fullName},</h3>
      <p>Your consultation has been completed.</p>
      <p><strong>Service:</strong> ${appointment.service.name}</p>
      <p><strong>Total Amount:</strong> ₦${totalAmount}</p>
      <p><strong>Required Deposit (50%):</strong> ₦${depositAmount}</p>
      <p>Please proceed to make your deposit payment to confirm your appointment.</p>
    `,
          });
        })();
      } catch (emailError) {
        console.error("Failed to send payment email:", emailError.message);
      }
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
    // Only admins can fetch all appointments
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admins can view all appointments",
      });
    }

    const appointments = await Appointment.find()
      .populate("patient", "fullName email phone")
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
    const userId = req.user.id;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    // If the user is a patient (not admin), tell them to call the clinic
    if (req.user.role !== "admin") {
      if (appointment.patient.toString() !== userId) {
        return res.status(403).json({
          message: "Not authorized to access this appointment",
        });
      }

      return res.status(403).json({
        message:
          "Appointments can only be rescheduled by the clinic. Please call us at [CLINIC_PHONE_NUMBER] to reschedule your appointment. Since payment has already been made, our team will assist you with the process.",
      });
    }

    // ---- Admin logic below ----
    const { appointmentDate } = req.body;

    if (!appointmentDate) {
      return res.status(400).json({
        message: "New appointment date is required",
      });
    }

    const newAppointmentDate = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (newAppointmentDate < today) {
      return res.status(400).json({
        message: "Cannot reschedule to a past date. Please select a future date.",
      });
    }

    if (["completed", "cancelled"].includes(appointment.status)) {
      return res.status(400).json({
        message: `Cannot reschedule a ${appointment.status} appointment`,
      });
    }

    // Only update the date and reset reminder
    appointment.appointmentDate = appointmentDate;
    appointment.reminderSent = false;

    await appointment.save();

    const populated = await appointment.populate([
      { path: "patient", select: "fullName email" },
      { path: "service", select: "name price" },
    ]);

    // Fetch payment records for this appointment
    const payments = await Payment.find({
      appointment: appointment._id,
      status: "successful",
    }).populate("recordedBy", "fullName");

    const totalAmount = populated.servicePrice * populated.quantity;
    const totalPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);
    const remainingBalance = totalAmount - totalPaid;

    // Build payment info for the response
    const paymentDetails = payments.map((p) => ({
      amountPaid: p.amountPaid,
      method: p.method,
      receiptNumber: p.receiptNumber,
      transactionReference: p.transactionReference,
      paidAt: p.paidAt || p.createdAt,
      recordedBy: p.recordedBy || null,
    }));

    // Send email asynchronously
    try {
      (async () => {
        await sendEmail({
          to: populated.patient.email,
          subject: "Appointment Rescheduled",
          html: rescheduleEmailTemplate(
            populated.patient.fullName,
            populated.service.name,
            populated.appointmentDate
          ),
        });
      })();
    } catch (emailError) {
      console.error("Failed to send reschedule email:", emailError.message);
    }

    res.status(200).json({
      message: "Appointment rescheduled successfully",
      appointment: {
        _id: populated._id,
        patient: populated.patient,
        service: populated.service,
        servicePrice: populated.servicePrice,
        quantity: populated.quantity,
        totalAmount,
        appointmentDate: populated.appointmentDate,
        bookingSource: populated.bookingSource,
        status: populated.status,
        paymentStatus: populated.paymentStatus,
        totalPaid,
        remainingBalance,
        payments: paymentDetails,
        reminderSent: populated.reminderSent,
        createdAt: populated.createdAt,
        updatedAt: populated.updatedAt,
      },
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
    const userId = req.user.id;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    // If the user is a patient (not admin), tell them to call the clinic
    if (req.user.role !== "admin") {
      // Verify the patient owns this appointment
      if (appointment.patient.toString() !== userId) {
        return res.status(403).json({
          message: "Not authorized to access this appointment",
        });
      }

      return res.status(403).json({
        message:
          "Appointments can only be cancelled by the clinic. Please call us at [CLINIC_PHONE_NUMBER] to cancel your appointment. Since payment has already been made, our team will guide you through the refund process.",
      });
    }

    // ---- Admin logic below ----

    // Prevent deleting completed appointments
    if (appointment.status === "completed") {
      return res.status(400).json({
        message: "Cannot delete a completed appointment",
      });
    }

    await Appointment.findByIdAndDelete(req.params.id);

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


