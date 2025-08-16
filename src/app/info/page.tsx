import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Xainik - No Reply',
  description: 'No reply page for Xainik platform notifications and system messages.',
  openGraph: {
    title: 'Xainik - No Reply',
    description: 'No reply page for Xainik platform notifications and system messages.',
    url: 'https://noreply.xainik.org',
    siteName: 'Xainik No Reply',
  },
}

export default function InfoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            No Reply
          </h1>
          <p className="text-xl text-gray-600">
            This is a no-reply page for Xainik platform notifications and system messages
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* About This Page */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">About This Page</h2>
            <p className="text-gray-600 mb-4">
              This is a no-reply page used by the Xainik platform for system notifications and automated messages.
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• System notifications</li>
              <li>• Automated emails</li>
              <li>• Platform updates</li>
              <li>• Service messages</li>
            </ul>
          </div>

          {/* System Messages */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">System Messages</h2>
            <p className="text-gray-600 mb-4">
              This page handles various system-generated messages and notifications.
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Email confirmations</li>
              <li>• Password resets</li>
              <li>• Account notifications</li>
              <li>• Service updates</li>
            </ul>
            <a 
              href="https://xainik.org" 
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Main Site
            </a>
          </div>

          {/* Email Notifications */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Email Notifications</h2>
            <p className="text-gray-600 mb-4">
              Automated email notifications and system communications.
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Welcome emails</li>
              <li>• Password resets</li>
              <li>• Account alerts</li>
              <li>• Service notices</li>
            </ul>
            <a 
              href="https://xainik.org/support" 
              className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Get Support
            </a>
          </div>

          {/* Platform Updates */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Platform Updates</h2>
            <p className="text-gray-600 mb-4">
              Important updates and maintenance notifications for the platform.
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Feature announcements</li>
              <li>• Maintenance schedules</li>
              <li>• Security updates</li>
              <li>• Bug fixes</li>
            </ul>
            <a 
              href="https://xainik.org/updates" 
              className="inline-block mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              View Updates
            </a>
          </div>

          {/* Account Management */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Account Management</h2>
            <p className="text-gray-600 mb-4">
              Account-related notifications and management tools.
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Account verification</li>
              <li>• Security alerts</li>
              <li>• Privacy updates</li>
              <li>• Terms changes</li>
            </ul>
            <a 
              href="https://xainik.org/account" 
              className="inline-block mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Manage Account
            </a>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact & Support</h2>
            <p className="text-gray-600 mb-4">
              Get in touch with our team for support and questions.
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Email: support@xainik.org</li>
              <li>• Help center</li>
              <li>• FAQ section</li>
              <li>• Live chat support</li>
            </ul>
            <a 
              href="https://xainik.org/contact" 
              className="inline-block mt-4 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500">
            © 2024 Xainik. All rights reserved. | 
            <a href="https://xainik.org" className="text-blue-600 hover:text-blue-800 ml-2">
              Back to Main Site
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
