# Resend Email Integration for Xainik Veterans

This document outlines the complete Resend email integration for all mailing functions in the Xainik Veterans platform.

## 🚀 Overview

The platform now uses [Resend](https://resend.com) for all email functionality, replacing client-side `mailto:` links with professional, server-side email delivery.

## 📧 Email Functions Implemented

### 1. Contact Form Emails
- **Route**: `/api/contact`
- **Purpose**: Sends contact form submissions to CEO@faujnet.com
- **Features**: Professional HTML templates, reply-to functionality

### 2. Newsletter Subscription
- **Route**: `/api/subscribers`
- **Purpose**: Handles newsletter signups and sends welcome emails
- **Features**: Welcome email templates, name collection

### 3. Donation Receipts
- **Route**: `/api/email/donation-receipt`
- **Purpose**: Sends donation confirmations to donors
- **Features**: Professional receipts, impact information

### 4. Welcome Emails
- **Route**: `/api/email/welcome`
- **Purpose**: Welcomes new users based on their role
- **Features**: Role-specific content, onboarding guidance

### 5. Password Reset
- **Route**: `/api/email/password-reset`
- **Purpose**: Sends password reset links
- **Features**: Secure tokens, expiration warnings

### 6. Test Emails
- **Route**: `/api/email/test`
- **Purpose**: Verifies Resend integration
- **Features**: Status confirmation, debugging

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install resend
```

### 2. Environment Variables
Add to your `.env.local` file:
```env
RESEND_API_KEY=your_resend_api_key_here
```

### 3. Get Resend API Key
1. Sign up at [resend.com](https://resend.com)
2. Go to API Keys section
3. Create a new API key
4. Copy the key to your environment variables

### 4. Domain Verification
1. Add your domain in Resend dashboard
2. Verify domain ownership (DNS records)
3. Set up SPF, DKIM, and DMARC records

## 📁 File Structure

```
src/
├── lib/
│   └── services/
│       └── email.ts              # Main email service
├── app/
│   └── api/
│       ├── contact/
│       │   └── route.ts          # Contact form API
│       ├── subscribers/
│       │   └── route.ts          # Newsletter API
│       └── email/
│           ├── donation-receipt/
│           │   └── route.ts      # Donation receipts
│           ├── welcome/
│           │   └── route.ts      # Welcome emails
│           ├── password-reset/
│           │   └── route.ts      # Password reset
│           └── test/
│               └── route.ts      # Test emails
```

## 🔧 Usage Examples

### Send Contact Form Email
```typescript
import EmailService from '@/lib/services/email'

const result = await EmailService.sendContactForm({
  name: 'John Doe',
  email: 'john@example.com',
  message: 'Hello, I have a question about veterans.'
})
```

### Send Donation Receipt
```typescript
const result = await EmailService.sendDonationReceipt({
  donorName: 'Anonymous Hero',
  donorEmail: 'donor@example.com',
  amount: 1000,
  transactionId: 'txn_123456',
  date: '2024-01-15',
  isAnonymous: true,
  displayName: 'Veteran Supporter'
})
```

### Send Welcome Email
```typescript
const result = await EmailService.sendWelcomeEmail({
  email: 'veteran@example.com',
  name: 'Captain Singh',
  role: 'veteran'
})
```

## 🎨 Email Templates

All emails use consistent, professional HTML templates with:
- Military-inspired color scheme (gold, dark grays)
- Responsive design
- Professional branding
- Clear call-to-actions
- Mobile-friendly layout

## 🔒 Security Features

- Input validation on all API routes
- Rate limiting (implemented in middleware)
- Secure token handling for password resets
- No sensitive data in email content
- Professional sender addresses

## 📊 Monitoring & Debugging

### Test Email Function
Use `/api/email/test` to verify integration:
```bash
curl -X POST /api/email/test \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "your-email@example.com"}'
```

### Logging
All email operations are logged to console for debugging:
- Success confirmations
- Error details
- API responses

## 🚨 Troubleshooting

### Common Issues

1. **API Key Invalid**
   - Verify `RESEND_API_KEY` in environment
   - Check key permissions in Resend dashboard

2. **Domain Not Verified**
   - Complete domain verification in Resend
   - Check DNS records

3. **Rate Limits**
   - Resend has daily sending limits
   - Check usage in dashboard

4. **Email Not Delivered**
   - Check spam folders
   - Verify recipient email format
   - Check Resend delivery logs

### Debug Steps

1. Test with `/api/email/test` endpoint
2. Check browser console for errors
3. Verify environment variables
4. Check Resend dashboard for delivery status

## 📈 Performance

- **Async Operations**: All email sending is non-blocking
- **Error Handling**: Graceful fallbacks for failed emails
- **Batch Processing**: Ready for future bulk email features
- **Caching**: Email templates are optimized

## 🔮 Future Enhancements

- Email analytics and tracking
- Template customization
- Bulk email campaigns
- Email preferences management
- A/B testing for email content

## 📞 Support

For Resend-specific issues:
- [Resend Documentation](https://resend.com/docs)
- [Resend Support](https://resend.com/support)

For Xainik platform issues:
- Check application logs
- Review API response codes
- Test individual endpoints

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Maintainer**: Xainik Development Team
