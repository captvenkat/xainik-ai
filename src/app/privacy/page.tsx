import { Shield, Lock, Eye, Database } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Lock className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
            </div>
            <p className="text-gray-600">Last updated: January 27, 2025</p>
          </div>

          <div className="prose prose-lg max-w-none">
            <h2>1. Information We Collect</h2>
            <h3>Personal Information:</h3>
            <ul>
              <li>Name, email address, and phone number</li>
              <li>Military service information and skills</li>
              <li>Profile photos and resume documents</li>
              <li>Payment information (processed securely by Razorpay)</li>
            </ul>

            <h3>Usage Information:</h3>
            <ul>
              <li>IP addresses (hashed for privacy)</li>
              <li>Referral events and interactions</li>
              <li>Platform usage patterns</li>
              <li>Device and browser information</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <ul>
              <li>To provide and maintain the Platform</li>
              <li>To process payments and manage subscriptions</li>
              <li>To facilitate connections between veterans and recruiters</li>
              <li>To send important service notifications</li>
              <li>To improve our services and user experience</li>
              <li>To comply with legal obligations</li>
            </ul>

            <h2>3. Information Sharing</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share information in the following circumstances:</p>
            <ul>
              <li>With your explicit consent</li>
              <li>To facilitate resume requests (with veteran approval)</li>
              <li>With service providers who assist in platform operations</li>
              <li>When required by law or to protect our rights</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>We implement appropriate security measures to protect your information:</p>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication</li>
              <li>Secure payment processing</li>
            </ul>

            <h2>5. Data Retention</h2>
            <p>We retain your information for as long as necessary to:</p>
            <ul>
              <li>Provide our services</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes</li>
              <li>Enforce our agreements</li>
            </ul>

            <h2>6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Export your data</li>
            </ul>

            <h2>7. Cookies and Tracking</h2>
            <p>We use cookies and similar technologies to:</p>
            <ul>
              <li>Remember your preferences</li>
              <li>Analyze platform usage</li>
              <li>Improve our services</li>
              <li>Provide personalized content</li>
            </ul>

            <h2>8. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul>
              <li><strong>Supabase:</strong> Database and authentication</li>
              <li><strong>Razorpay:</strong> Payment processing</li>
              <li><strong>Resend:</strong> Email delivery</li>
              <li><strong>OpenAI:</strong> AI-powered pitch generation</li>
            </ul>

            <h2>9. Children's Privacy</h2>
            <p>Our Platform is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18.</p>

            <h2>10. International Transfers</h2>
            <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.</p>

            <h2>11. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.</p>

            <h2>12. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <ul>
              <li>Email: privacy@xainik.com</li>
              <li>Address: [Your Business Address]</li>
            </ul>

            <div className="bg-blue-50 p-4 rounded-lg mt-8">
              <h3 className="text-blue-900 font-semibold">Cookie Consent</h3>
              <p className="text-blue-800">
                By using our Platform, you consent to our use of cookies and similar technologies as described in this Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
