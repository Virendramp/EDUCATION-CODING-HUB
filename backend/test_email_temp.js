const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Test Email",
      text: "This is a test email."
    });

    console.log("Email sent successfully: " + info.messageId);
  } catch (error) {
    console.error("Failed to send email:", error.message);
  }
}

testEmail();
