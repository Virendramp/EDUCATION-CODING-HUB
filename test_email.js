const nodemailer = require('nodemailer');
require('dotenv').config({ path: './backend/.env' });

async function testEmail() {
  try {
    console.log('Testing with User:', process.env.EMAIL_USER);
    console.log('Testing with Pass:', process.env.EMAIL_PASS ? '*** (Set)' : 'Not Set');

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.verify();
    console.log("SUCCESS! Credentials are valid.");
  } catch (err) {
    console.error("ERROR! Failed to verify credentials:", err.message);
  }
}

testEmail();
