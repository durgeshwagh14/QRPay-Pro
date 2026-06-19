import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import logger from '../utils/logger.js';

let transporter: nodemailer.Transporter;

if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT || 587,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
  logger.info('📧 Mail transporter initialized with SMTP credentials');
} else {
  transporter = nodemailer.createTransport({
    streamTransport: true,
    newline: 'windows',
    buffer: true,
  });
  logger.warn('📧 Mail transporter running in STREAM/CONSOLE mock mode (Check logs for OTPs)');
}

export const emailService = {
  async sendOTP(to: string, otp: string, typeName = 'Email Verification'): Promise<void> {
    const mailOptions = {
      from: `"QRPay Pro Support" <${env.FROM_EMAIL}>`,
      to,
      subject: `[QRPay Pro] Your OTP for ${typeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #7c3aed; text-align: center;">QRPay Pro Security</h2>
          <p>Hello,</p>
          <p>Your One-Time Password (OTP) for <strong>${typeName}</strong> is:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e1b4b; background-color: #f3e8ff; padding: 10px 20px; border-radius: 5px; border: 1px dashed #c084fc;">
              ${otp}
            </span>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This OTP is valid for 10 minutes. Please do not share this code with anyone for security reasons.</p>
          <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 20px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">This is an automated email. Please do not reply directly to this message.</p>
        </div>
      `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      if (!env.SMTP_HOST) {
        const messageString = info.message.toString();
        const otpMatch = messageString.match(/<span style="font-size: 32px;[^>]*>\s*(\d+)\s*<\/span>/);
        const extractedOtp = otpMatch ? otpMatch[1] : otp;
        logger.info(`✨ [MOCK EMAIL] OTP sent to ${to}: ${extractedOtp}`);
      } else {
        logger.info(`📧 Real email sent to ${to} (Message ID: ${info.messageId})`);
      }
    } catch (error) {
      logger.error(`❌ Failed to send email to ${to}: %o`, error);
      throw new Error('Email delivery failed');
    }
  },

  async sendPasswordReset(to: string, resetLink: string): Promise<void> {
    const mailOptions = {
      from: `"QRPay Pro Support" <${env.FROM_EMAIL}>`,
      to,
      subject: '[QRPay Pro] Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #7c3aed; text-align: center;">Reset Your Password</h2>
          <p>Hello,</p>
          <p>You requested to reset your password for your QRPay Pro account. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 35px 0;">
            <a href="${resetLink}" style="background-color: #7c3aed; color: #ffffff; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 20px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">If the button doesn't work, copy-paste this URL into your browser: <br/> ${resetLink}</p>
        </div>
      `,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      if (!env.SMTP_HOST) {
        logger.info(`✨ [MOCK EMAIL] Reset Link for ${to}: ${resetLink}`);
      } else {
        logger.info(`📧 Password reset email sent to ${to}`);
      }
    } catch (error) {
      logger.error(`❌ Failed to send password reset to ${to}: %o`, error);
      throw new Error('Email delivery failed');
    }
  }
};
