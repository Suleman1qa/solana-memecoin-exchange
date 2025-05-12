const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('../utils/logger');

// Create transporter
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: {
    user: config.email.auth.user,
    pass: config.email.auth.pass
  }
});

// Send email helper
const sendEmail = async (to, subject, html) => {
  try {
    if (!config.email.host || !config.email.auth.user) {
      logger.warn(`Email not sent (missing config): ${subject} to ${to}`);
      return;
    }
    
    const mailOptions = {
      from: config.email.from,
      to,
      subject,
      html
    };
    
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
};

// Send verification email
exports.sendVerificationEmail = async (to, verificationUrl) => {
  const subject = 'Verify Your Email - Solana Memecoin Exchange';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verify Your Email Address</h2>
      <p>Thank you for registering with Solana Memecoin Exchange. Please click the button below to verify your email address:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #9945FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Verify Email
        </a>
      </div>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't register for an account, you can safely ignore this email.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
      <p style="color: #666; font-size: 12px;">
        © ${new Date().getFullYear()} Solana Memecoin Exchange. All rights reserved.
      </p>
    </div>
  `;
  
  return sendEmail(to, subject, html);
};

// Send password reset email
exports.sendPasswordResetEmail = async (to, resetUrl) => {
  const subject = 'Reset Your Password - Solana Memecoin Exchange';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset Your Password</h2>
      <p>You requested a password reset for your Solana Memecoin Exchange account. Click the button below to set a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #9945FF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
          Reset Password
        </a>
      </div>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p>${resetUrl}</p>
      <p>This link will expire in 30 minutes.</p>
      <p>If you didn't request a password reset, you can safely ignore this email.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
      <p style="color: #666; font-size: 12px;">
        © ${new Date().getFullYear()} Solana Memecoin Exchange. All rights reserved.
      </p>
    </div>
  `;
  
  return sendEmail(to, subject, html);
};

// Send password change notification
exports.sendPasswordChangeNotification = async (to) => {
  const subject = 'Password Changed - Solana Memecoin Exchange';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Changed</h2>
      <p>The password for your Solana Memecoin Exchange account was recently changed.</p>
      <p>If you made this change, you can disregard this email.</p>
      <p>If you didn't change your password, please contact our support team immediately.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
      <p style="color: #666; font-size: 12px;">
        © ${new Date().getFullYear()} Solana Memecoin Exchange. All rights reserved.
      </p>
    </div>
  `;
  
  return sendEmail(to, subject, html);
};

// Send withdrawal confirmation
exports.sendWithdrawalConfirmation = async (to, amount, token, txHash) => {
  const subject = 'Withdrawal Confirmation - Solana Memecoin Exchange';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Withdrawal Confirmation</h2>
      <p>Your withdrawal from Solana Memecoin Exchange has been processed:</p>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p><strong>Amount:</strong> ${amount} ${token}</p>
        <p><strong>Transaction Hash:</strong> ${txHash}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      </div>
      <p>You can view this transaction on the blockchain explorer:</p>
      <p><a href="https://explorer.solana.com/tx/${txHash}">View on Solana Explorer</a></p>
      <p>If you didn't authorize this withdrawal, please contact our support team immediately.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
      <p style="color: #666; font-size: 12px;">
        © ${new Date().getFullYear()} Solana Memecoin Exchange. All rights reserved.
      </p>
    </div>
  `;
  
  return sendEmail(to, subject, html);
};