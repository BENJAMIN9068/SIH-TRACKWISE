const crypto = require('crypto');
const nodemailer = require('nodemailer');
const OTP = require('../models/OTP');

class OTPService {
  constructor() {
    // Initialize email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  /**
   * Generate a 6-digit OTP
   * @returns {string} 6-digit OTP
   */
  generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Generate and save OTP for password reset
   * @param {string} email - User's email
   * @param {string} userType - 'staff' or 'public'
   * @param {string} userId - employeeId for staff or username for public
   * @param {string} phone - User's phone (optional)
   * @param {string} purpose - Purpose of OTP (default: 'password_reset')
   * @returns {Promise<Object>} OTP record
   */
  async generateAndSaveOTP(email, userType, userId, phone = null, purpose = 'password_reset') {
    try {
      // Delete any existing OTPs for this user
      await OTP.deleteMany({
        email,
        userType,
        purpose,
        verified: false
      });

      // Generate new OTP
      const otpCode = this.generateOTP();

      // Create OTP record
      const otpRecord = new OTP({
        email,
        phone,
        otp: otpCode,
        userType,
        userId,
        purpose
      });

      await otpRecord.save();
      
      return {
        success: true,
        otp: otpCode,
        otpId: otpRecord._id,
        expiresAt: otpRecord.expiresAt
      };
    } catch (error) {
      console.error('Error generating OTP:', error);
      return {
        success: false,
        error: 'Failed to generate OTP'
      };
    }
  }

  /**
   * Send OTP via email
   * @param {string} email - Recipient's email
   * @param {string} otp - OTP code
   * @param {string} name - User's name
   * @param {string} userType - 'staff' or 'public'
   * @returns {Promise<Object>} Send result
   */
  async sendOTPEmail(email, otp, name, userType) {
    try {
      const subject = `${userType === 'staff' ? 'Staff' : 'Public'} Password Reset - OTP Verification`;
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            .container { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: ${userType === 'staff' ? '#007bff' : '#17a2b8'}; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .otp-box { background-color: white; border: 2px solid ${userType === 'staff' ? '#007bff' : '#17a2b8'}; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 36px; font-weight: bold; color: ${userType === 'staff' ? '#007bff' : '#17a2b8'}; letter-spacing: 5px; margin: 10px 0; }
            .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0; }
            .footer { color: #666; font-size: 14px; margin-top: 30px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Password Reset Request</h1>
              <p>Bus Tracking System - ${userType === 'staff' ? 'Staff Portal' : 'Public Portal'}</p>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>We received a request to reset your password. Please use the OTP code below to verify your identity and proceed with password reset.</p>
              
              <div class="otp-box">
                <h3>Your OTP Code</h3>
                <div class="otp-code">${otp}</div>
                <p><strong>Valid for 10 minutes</strong></p>
              </div>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>This OTP is valid for 10 minutes only</li>
                  <li>Maximum 3 verification attempts allowed</li>
                  <li>Do not share this code with anyone</li>
                  <li>If you didn't request this, please ignore this email</li>
                </ul>
              </div>

              <p>If you're having trouble, please contact the administrator or try again later.</p>
            </div>
            <div class="footer">
              <p>This is an automated email from Bus Tracking System. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} Bus Tracking System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: subject,
        html: html
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Error sending OTP email:', error);
      return {
        success: false,
        error: 'Failed to send OTP email'
      };
    }
  }

  /**
   * Verify OTP code
   * @param {string} email - User's email
   * @param {string} otp - OTP code to verify
   * @param {string} userType - 'staff' or 'public'
   * @param {string} purpose - Purpose of OTP (default: 'password_reset')
   * @returns {Promise<Object>} Verification result
   */
  async verifyOTP(email, otp, userType, purpose = 'password_reset') {
    try {
      const otpRecord = await OTP.findOne({
        email,
        userType,
        purpose,
        verified: false
      }).sort({ createdAt: -1 });

      if (!otpRecord) {
        return {
          success: false,
          error: 'No OTP found for this email. Please request a new OTP.'
        };
      }

      // Check if OTP is expired
      if (otpRecord.isExpired()) {
        return {
          success: false,
          error: 'OTP has expired. Please request a new OTP.'
        };
      }

      // Check if max attempts reached
      if (otpRecord.isMaxAttemptsReached()) {
        return {
          success: false,
          error: 'Maximum verification attempts reached. Please request a new OTP.'
        };
      }

      // Increment attempt count
      otpRecord.attempts += 1;
      await otpRecord.save();

      // Check if OTP matches
      if (otpRecord.otp !== otp) {
        const attemptsLeft = 3 - otpRecord.attempts;
        return {
          success: false,
          error: `Invalid OTP. ${attemptsLeft} attempt(s) remaining.`
        };
      }

      // Mark OTP as verified
      otpRecord.verified = true;
      await otpRecord.save();

      return {
        success: true,
        message: 'OTP verified successfully',
        userId: otpRecord.userId,
        otpId: otpRecord._id
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        error: 'Failed to verify OTP'
      };
    }
  }

  /**
   * Check if email service is configured
   * @returns {boolean} Whether email service is properly configured
   */
  isEmailConfigured() {
    return !!(process.env.SMTP_USER && process.env.SMTP_PASS);
  }

  /**
   * Clean up expired OTPs (maintenance function)
   * @returns {Promise<Object>} Cleanup result
   */
  async cleanupExpiredOTPs() {
    try {
      const result = await OTP.cleanupExpired();
      return {
        success: true,
        deletedCount: result.deletedCount
      };
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
      return {
        success: false,
        error: 'Failed to cleanup expired OTPs'
      };
    }
  }

  /**
   * Get OTP statistics
   * @returns {Promise<Object>} OTP statistics
   */
  async getOTPStats() {
    try {
      const stats = await OTP.aggregate([
        {
          $group: {
            _id: {
              userType: '$userType',
              verified: '$verified'
            },
            count: { $sum: 1 }
          }
        }
      ]);

      return {
        success: true,
        stats
      };
    } catch (error) {
      console.error('Error getting OTP stats:', error);
      return {
        success: false,
        error: 'Failed to get OTP statistics'
      };
    }
  }
}

module.exports = new OTPService();