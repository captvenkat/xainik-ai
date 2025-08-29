# Xainik - Mobile-First Fundraising App

A mobile-first, viral fundraising application for Xainik (Veteran Success Foundation) built with Next.js, Tailwind CSS, and Supabase.

## 🚀 Features

- **Mobile-First Design**: Optimized for mobile devices with responsive design
- **Live Impact Tracker**: Real-time fundraising progress and milestones
- **Secure Payments**: Razorpay integration for secure donations
- **Badge System**: Gamified recognition for donors (Friend, Champion, Founding Supporter)
- **Email Subscriptions**: Stay connected with mission updates
- **Transparency**: Fund breakdown and document visibility
- **Viral Elements**: Share functionality and social proof

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Payments**: Razorpay
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ 
- pnpm/npm
- Supabase account
- Razorpay account

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <repository-url>
cd xainik
pnpm install
```

### 2. Environment Variables

Create `.env.local` with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
SITE_BASE_URL=https://xainik.in
TZ_DB=Asia/Kolkata
```

### 3. Database Setup

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-schema.sql`
4. Execute the SQL to create tables, views, and policies

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📊 Database Schema

### Core Tables

- **donors**: Donor information and preferences
- **donations**: Payment records and status tracking
- **subscribers**: Email subscription management
- **documents**: Transparency documents and certificates
- **badge_tiers**: Donor recognition tiers

### Views

- **v_stats**: Live fundraising statistics
- **v_public_feed**: Public donation feed (no PII)

## 🎯 Key Components

### Pages
- **Hero**: Main landing with donation CTA
- **ImpactTracker**: Live progress and milestones
- **ProblemCards**: Veteran transition challenges
- **Solution**: Xainik's AI-powered solution
- **Transparency**: Fund breakdown and documents
- **StayConnected**: Email subscription

### API Routes
- `/api/metrics`: Live fundraising statistics
- `/api/subscribers`: Email subscription management
- `/api/donations/create-order`: Razorpay order creation
- `/api/donations/verify`: Payment verification

## 🔧 Configuration

### Tailwind CSS
Custom configuration in `tailwind.config.js` with:
- Primary and secondary color schemes
- Inter font family
- Mobile-first responsive design

### Razorpay Integration
- Server-side order creation
- Client-side payment processing
- Signature verification for security

## 📱 Mobile Optimization

- Touch-friendly buttons and interactions
- Responsive typography and spacing
- Optimized images and assets
- Fast loading with Next.js optimizations

## 🔒 Security Features

- Row Level Security (RLS) on all tables
- Server-side payment verification
- No sensitive data exposed to client
- Input validation and sanitization

## 🚀 Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy with `npx vercel --prod`

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:
- Supabase credentials
- Razorpay keys
- Site URL and timezone

## 📈 Analytics & Tracking

- Real-time donation tracking
- Milestone notifications
- Email subscription analytics
- Social sharing metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the Veteran Success Foundation initiative.

## 🆘 Support

For technical support or questions:
- Check the documentation
- Review the code comments
- Contact the development team

---

**Built with ❤️ for Veteran Success Foundation**
