// utils/appointmentEmailTemplates.js

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};


exports.bookingEmailTemplate = (patientName, serviceName, date, price) => {
  return `
    <h2>Appointment Booking Confirmation</h2>
    <p>Hello ${patientName},</p>
    <p>Your appointment for <strong>${serviceName}</strong> has been booked.</p>
    <p><strong>Date:</strong> ${formatDate(date)}</p>
    <p><strong>Total Price:</strong> ₦${price.toLocaleString()}</p>
    <p>Thank you for choosing our clinic.</p>
  `;
};

exports.consultationEmailTemplate = (patientName, serviceName) => {
  return `
    <h2>Consultation Request Received</h2>
    <p>Hello ${patientName},</p>
    <p>Your request for <strong>${serviceName}</strong> has been received.</p>
    <p>Please contact the clinic to finalize pricing and appointment details.</p>
    <p>Thank you.</p>
  `;
};

exports.rescheduleEmailTemplate = (patientName, serviceName, newDate) => {
  return `
    <h2>Appointment Rescheduled</h2>
    <p>Hello ${patientName},</p>
    <p>Your appointment for <strong>${serviceName}</strong> has been rescheduled.</p>
    <p><strong>New Date:</strong> ${formatDate(newDate)}</p>
    <p>Please contact us if this does not work for you.</p>
  `;
};

exports.partialPaymentEmailTemplate = (
  fullName,
  serviceName,
  paidAmount,
  remainingAmount,
  totalAmount,
  appointmentDate
) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return `
    <h2>Partial Payment Received</h2>
    <p>Hello ${fullName},</p>

    <p>We have received ₦${paidAmount.toLocaleString()} as 50% deposit for ${serviceName}.</p>

    <p><strong>Total Bill:</strong> ₦${totalAmount.toLocaleString()}</p>
    <p><strong>Remaining Balance:</strong> ₦${remainingAmount.toLocaleString()}</p>

    <p><strong>Appointment Date:</strong> ${formatDate(appointmentDate)}</p>

    <p>The balance will be paid upon arrival on your appointment day.</p>

    <p>Thank you.</p>
  `;
};


exports.fullPaymentEmailTemplate = (
  fullName,
  serviceName,
  totalAmount,
  appointmentDate
) => {
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return `
    <h2>Full Payment Confirmation</h2>
    <p>Hello ${fullName},</p>

    <p>We have received your full payment of ₦${totalAmount.toLocaleString()} for ${serviceName}.</p>

    <p><strong>Appointment Date:</strong> ${formatDate(appointmentDate)}</p>

    <p>Thank you for trusting our clinic.</p>
  `;
};


exports.reminderEmailTemplate = (patientName, serviceName, date) => {
  return `
    <h2>Appointment Reminder</h2>
    <p>Hello ${patientName},</p>
    <p>This is a reminder that you have an appointment for 
    <strong>${serviceName}</strong>.</p>
    <p><strong>Date:</strong> ${formatDate(date)}</p>
    <p>Please arrive 15 minutes early.</p>
    <p>We look forward to seeing you.</p>
  `;
};


exports.completedTreatmentEmailTemplate = (
  fullName,
  serviceName,
  totalAmount
) => {
  return `
    <h2>Treatment Completed</h2>

    <p>Hello ${fullName},</p>

    <p>Your treatment for <strong>${serviceName}</strong> has been successfully completed.</p>

    <p>Total Amount Paid: ₦${totalAmount.toLocaleString()}</p>

    <p>Thank you for choosing us.</p>

    <p>We would appreciate your feedback or rating.</p>
  `;
};

