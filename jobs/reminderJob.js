const cron = require("node-cron");
const Appointment = require("../models/Appointment");
const sendEmail = require("../utils/sendEmail");

const startReminderJob = () => {
  // Runs every day at 9:00 AM
  cron.schedule("0 9 * * *", async () => {
    console.log(" Running appointment reminder job...");

    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const startOfDay = new Date(tomorrow.setHours(0, 0, 0, 0));
      const endOfDay = new Date(tomorrow.setHours(23, 59, 59, 999));

      const appointments = await Appointment.find({
        appointmentDate: { $gte: startOfDay, $lte: endOfDay },
        status: "confirmed",
        paymentStatus: { $in: ["partial", "paid"] },
        reminderSent: false,
      })
        .populate("patient", "fullName email")
        .populate("service", "name");

      for (const appointment of appointments) {
        await sendEmail({
          to: appointment.patient.email,
          subject: "Appointment Reminder",
          html: `
            <h3>Hello ${appointment.patient.fullName},</h3>
            <p>This is a reminder that you have an appointment tomorrow.</p>
            <p><strong>Service:</strong> ${appointment.service.name}</p>
            <p><strong>Date:</strong> ${appointment.appointmentDate.toDateString()}</p>
            <p>Please arrive 10 minutes early.</p>
          `,
        });
        appointment.reminderSent = true;
        await appointment.save();
      }

      console.log(` Sent ${appointments.length} reminders`);
    } catch (error) {
      console.error("Reminder job error:", error.message);
    }
  });
};

module.exports = startReminderJob;
