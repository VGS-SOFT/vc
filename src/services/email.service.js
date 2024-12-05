const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

exports.sendResetPasswordEmail = async (email, token) => {
  try {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send reset password email');
  }
};