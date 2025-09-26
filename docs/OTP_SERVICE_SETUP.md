# OTP Service Setup Guide

The bus tracking system now includes an automated OTP (One-Time Password) service for secure password reset functionality. This guide will help you configure the email service required for OTP functionality.

## Features

- **Secure OTP Generation**: 6-digit OTP codes with 10-minute expiration
- **Email Delivery**: Professional HTML email templates
- **Rate Limiting**: Maximum 3 verification attempts per OTP
- **Session Security**: Verified OTP sessions expire after 15 minutes
- **Automatic Cleanup**: Expired OTPs are automatically removed from database

## Email Service Configuration

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-step verification if not already enabled

2. **Generate App Password**
   - Go to [App passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" as the app
   - Generate and copy the 16-character app password

3. **Update .env File**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   SMTP_FROM=Bus Tracking System <your-email@gmail.com>
   ```

### Option 2: Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
SMTP_FROM=Bus Tracking System <your-email@outlook.com>
```

### Option 3: Yahoo Mail

1. Enable 2-Factor Authentication
2. Generate app password
3. Configure:

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
SMTP_FROM=Bus Tracking System <your-email@yahoo.com>
```

### Option 4: Custom SMTP Provider

Contact your email service provider for SMTP settings and configure accordingly.

## User Flow

### Staff Password Reset
1. Navigate to `/staff/otp-reset`
2. Enter Employee ID and email address
3. System verifies credentials and sends OTP via email
4. Enter 6-digit OTP within 10 minutes
5. Set new password after OTP verification

### Public User Password Reset
1. Navigate to `/public/otp-reset`
2. Enter username and email address
3. System verifies credentials and sends OTP via email
4. Enter 6-digit OTP within 10 minutes
5. Set new password after OTP verification

## Security Features

- **Email Validation**: Only registered users can request OTP
- **Time-based Expiration**: OTPs expire after 10 minutes
- **Attempt Limiting**: Maximum 3 verification attempts per OTP
- **Session Security**: Password reset sessions expire after 15 minutes
- **Rate Limiting**: Prevents OTP spam requests
- **Automatic Cleanup**: Expired OTPs are removed from database

## Testing the Setup

1. **Check Email Configuration**
   - The system will show an error if email is not configured
   - Check server logs for SMTP connection errors

2. **Test OTP Flow**
   - Use a real email address you have access to
   - Check spam folder if OTP email doesn't arrive
   - Verify OTP arrives within 1-2 minutes

3. **Monitor System Logs**
   ```bash
   # Check for email service errors
   npm start
   # Look for "Error sending OTP email" or SMTP errors
   ```

## Troubleshooting

### Common Issues

1. **OTP Email Not Received**
   - Check spam/junk folder
   - Verify SMTP credentials
   - Ensure 2FA and app password for Gmail

2. **SMTP Authentication Failed**
   - Double-check email and password
   - For Gmail, use app password, not account password
   - Verify SMTP host and port settings

3. **Database Connection Issues**
   - Ensure MongoDB is running
   - Check MONGO_URI in .env file
   - OTP data is stored in MongoDB

### Email Template Customization

The OTP email template can be customized in `utils/otpService.js`:
- Modify the HTML template in `sendOTPEmail` method
- Update colors, branding, and messaging as needed
- Test changes with real email addresses

## API Endpoints

- `POST /auth/staff/request-otp` - Request OTP for staff
- `POST /auth/staff/verify-otp` - Verify OTP for staff
- `POST /auth/staff/reset-password` - Reset staff password
- `POST /auth/public/request-otp` - Request OTP for public user
- `POST /auth/public/verify-otp` - Verify OTP for public user
- `POST /auth/public/reset-password` - Reset public user password

## Database Schema

The OTP service uses a dedicated `OTP` collection with:
- Email and user identification
- 6-digit OTP code
- Expiration timestamp
- Verification attempts counter
- User type (staff/public)

## Production Considerations

1. **Use Professional Email Service**
   - Consider SendGrid, AWS SES, or Mailgun for production
   - Higher delivery rates and better spam handling

2. **Monitor Email Delivery**
   - Track bounce rates and delivery failures
   - Implement email delivery webhooks

3. **Security Monitoring**
   - Monitor failed OTP attempts
   - Alert on suspicious activity patterns

4. **Backup Communication**
   - Consider SMS backup for critical password resets
   - Provide admin contact for emergency access

## Support

For additional support:
1. Check server logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with a simple email first before using the full flow
4. Contact system administrator for email provider configuration