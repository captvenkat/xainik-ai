import { Shield, FileText, Users, CreditCard } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | Xainik',
  description: 'Read Xainik\'s Terms of Service. Learn about user responsibilities, payment terms, privacy protection, and platform usage guidelines for veterans and recruiters.',
  openGraph: {
    title: 'Terms of Service | Xainik',
    description: 'Read Xainik\'s Terms of Service and platform usage guidelines.',
    url: '/terms',
  },
  alternates: {
    canonical: '/terms',
  },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <FileText className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
            </div>
            <p className="text-gray-600">Last updated: January 27, 2025</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using Xainik ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              Xainik is a platform that connects military veterans with civilian employment opportunities. The service includes:
            </p>
            <ul>
              <li>Veteran profile creation and management</li>
              <li>Recruiter access to veteran profiles</li>
              <li>Resume request and sharing functionality</li>
              <li>Referral and endorsement systems</li>
            </ul>

            <h2>3. User Responsibilities</h2>
            <h3>For Veterans:</h3>
            <ul>
              <li>Provide accurate and truthful information</li>
              <li>Maintain the confidentiality of your account</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Respect the privacy of other users</li>
            </ul>

            <h3>For Recruiters:</h3>
            <ul>
              <li>Use the platform for legitimate hiring purposes only</li>
              <li>Respect veteran privacy and preferences</li>
              <li>Comply with anti-discrimination laws</li>
              <li>Maintain professional conduct</li>
            </ul>

            <h2>4. Payment Terms</h2>
            <p>
              Veterans may purchase plans to enhance their profile visibility. All payments are processed through Razorpay and are non-refundable except as required by law.
            </p>

            <h2>5. Privacy and Data Protection</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Platform, to understand our practices.
            </p>

            <h2>6. Intellectual Property</h2>
            <p>
              The Platform and its original content, features, and functionality are and will remain the exclusive property of Xainik and its licensors.
            </p>

            <h2>7. Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            </p>

            <h2>8. Limitation of Liability</h2>
            <p>
              In no event shall Xainik, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages.
            </p>

            <h2>9. Governing Law</h2>
            <p>
              These Terms shall be interpreted and governed by the laws of India, without regard to its conflict of law provisions.
            </p>

            <h2>10. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
            </p>

            <h2>11. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <ul>
              <li>Email: legal@xainik.com</li>
              <li>Address: [Your Business Address]</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
