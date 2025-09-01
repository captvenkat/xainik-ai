'use client'
import { useState } from 'react'
import Link from 'next/link'
import Icon from '@/components/ui/Icon'

export default function Transparency() {
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  const documents = {
    'section8': {
      title: 'Section 8 Licence - Companies Act 2013',
      description: 'Official license (No. 138784) granting VETERAN SUCCESS FOUNDATION non-profit status under Section 8 of the Companies Act, 2013. Permits operation without "Limited" suffix.',
      image: 'https://byleslhlkakxnsurzyzt.supabase.co/storage/v1/object/sign/legal-docs/sec-8-license.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NzE3NGRjNS1jMGQ5LTRhMGItODU1OC02ZTRmODEzZWIxN2UiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsZWdhbC1kb2NzL3NlYy04LWxpY2Vuc2UucG5nIiwiaWF0IjoxNzU2NjQ4NjM5LCJleHAiOjE5MTQzMjg2Mzl9.SiTAHQ0ucgkv86Nn46BXC7Ev6nNJhoeFmSJh-c6n3P4'
    },
    'incorporation': {
      title: 'Certificate of Incorporation',
      description: 'Proof we\'re registered under the Companies Act, 2013 as a Section 8 Company.',
      image: 'https://byleslhlkakxnsurzyzt.supabase.co/storage/v1/object/sign/legal-docs/vsf-inc-certificate.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NzE3NGRjNS1jMGQ5LTRhMGItODU1OC02ZTRmODEzZWIxN2UiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsZWdhbC1kb2NzL3ZzZi1pbmMtY2VydGlmaWNhdGUucG5nIiwiaWF0IjoxNzU2NjQ4NjYyLCJleHAiOjE5MTQzMjg2NjJ9.LIEn8OrNqWGrPva2Q9zZGlNZhoe9uMzIaCoE3ZB-AsI'
    },
    'form10ac': {
      title: 'FORM NO. 10AC - Section 80G Provisional Approval',
      description: 'Provisional approval for tax exemption under Section 80G (PAN: AAICV9997L). Valid from 11-10-2022 to AY 2025-2026. Donors can claim tax benefits.',
      image: 'https://byleslhlkakxnsurzyzt.supabase.co/storage/v1/object/sign/legal-docs/form-10AC.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV82NzE3NGRjNS1jMGQ5LTRhMGItODU1OC02ZTRmODEzZWIxN2UiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJsZWdhbC1kb2NzL2Zvcm0tMTBBQy5wbmciLCJpYXQiOjE3NTY2NDg2MTMsImV4cCI6MTkxNDMyODYxM30.nTFzQTCJATv90K8Z-MPEKsnCZpWWiTNiNIVbiFwXmsM'
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setSubmitMessage('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim() || 'Website Visitor',
          email: email.trim() || 'visitor@xainik.com',
          message: message
        })
      })

      const result = await response.json()

      if (result.success) {
        setSubmitStatus('success')
        setSubmitMessage(result.message)
        setMessage('')
        setTimeout(() => {
          setShowContactModal(false)
          setSubmitStatus('idle')
          setSubmitMessage('')
        }, 3000)
      } else {
        setSubmitStatus('error')
        setSubmitMessage(result.error || 'Failed to send message. Please try again.')
      }
    } catch (error) {
      setSubmitStatus('error')
      setSubmitMessage('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="app-section bg-premium-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="premium-heading text-3xl md:text-5xl mb-6 text-premium-white">
            Complete <span className="military-heading">Transparency</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Every rupee, open for all. We believe in complete accountability to our supporters and veterans.
          </p>
        </div>

        {/* Fund Breakdown */}
        <div className="military-card mb-12">
          <h3 className="text-2xl font-bold text-premium-white mb-8 text-center">
            Phase 1 — ₹10,00,000 Breakdown
          </h3>
          <div className="space-y-6">
            {/* Veteran Transition & Support */}
            <div className="flex items-center justify-between p-6 bg-premium-gray/30 rounded-2xl border border-military-gold/20">
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full bg-military-green"></div>
                <span className="font-semibold text-premium-white">Veteran Transition & Support</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-military-gold text-xl">₹4,00,000</div>
                <div className="text-sm text-gray-400">40%</div>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed px-6 -mt-4">
              Direct soldier programs: training, counselling, mentoring, resume/storytelling help.
            </p>

            {/* Outreach & Partnerships */}
            <div className="flex items-center justify-between p-6 bg-premium-gray/30 rounded-2xl border border-military-gold/20">
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full bg-military-gold"></div>
                <span className="font-semibold text-premium-white">Outreach & Partnerships (Veterans + Industry)</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-military-gold text-xl">₹3,50,000</div>
                <div className="text-sm text-gray-400">35%</div>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed px-6 -mt-4">
              Massive push to connect both sides: roadshows, recruiter workshops, industry awareness campaigns, veteran outreach camps.
            </p>

            {/* Tech & AI Platform */}
            <div className="flex items-center justify-between p-6 bg-premium-gray/30 rounded-2xl border border-military-gold/20">
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full bg-military-red"></div>
                <span className="font-semibold text-premium-white">Tech & AI Platform</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-military-gold text-xl">₹2,50,000</div>
                <div className="text-sm text-gray-400">25%</div>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed px-6 -mt-4">
              Lean platform that powers skill translation + smart matchmaking between soldiers & employers.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-400">Funds Allocated</span>
              <span className="text-sm text-military-gold font-semibold">100% Planned</span>
            </div>
            <div className="w-full h-2 bg-premium-gray rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-military-green via-military-gold to-military-red rounded-full" style={{width: '100%'}}></div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="premium-card mb-12">
          <h3 className="text-2xl font-bold text-premium-white mb-8 text-center">
            Legal Documents & Compliance
          </h3>
          <div className="space-y-6">
            {/* Section 8 Licence */}
            <div className="border border-military-gold/30 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-military-gold/50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-premium-white mb-2 text-lg">Section 8 Licence - Companies Act 2013</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Official license (No. 138784) granting VETERAN SUCCESS FOUNDATION non-profit status under Section 8 of the Companies Act, 2013. Permits operation without "Limited" suffix.
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedDoc('section8')}
                  className="ml-4 px-6 py-3 bg-military-gold hover:bg-yellow-500 text-black font-semibold rounded-xl transition-all duration-300 hover:scale-105">
                  View Doc
                </button>
              </div>
            </div>

            {/* Certificate of Incorporation */}
            <div className="border border-military-gold/30 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-military-gold/50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-premium-white mb-2 text-lg">Certificate of Incorporation</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Proof we're registered under the Companies Act, 2013 as a Section 8 Company.
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedDoc('incorporation')}
                  className="ml-4 px-6 py-3 bg-military-gold hover:bg-yellow-500 text-black font-semibold rounded-xl transition-all duration-300 hover:scale-105">
                  View Doc
                </button>
              </div>
            </div>

            {/* FORM NO. 10AC - Section 80G Approval */}
            <div className="border border-military-gold/30 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-military-gold/50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-premium-white mb-2 text-lg">FORM NO. 10AC - Section 80G Provisional Approval</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Provisional approval for tax exemption under Section 80G (PAN: AAICV9997L). Valid from 11-10-2022 to AY 2025-2026. Donors can claim tax benefits.
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedDoc('form10ac')}
                  className="ml-4 px-6 py-3 bg-military-gold hover:bg-yellow-500 text-black font-semibold rounded-xl transition-all duration-300 hover:scale-105">
                  View Doc
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Statement */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-premium-gray/50 backdrop-blur-sm px-8 py-4 rounded-2xl border border-military-gold/30">
            <span className="text-military-gold text-2xl">🔒</span>
            <div>
              <p className="text-premium-white font-semibold">We are a registered Sec-8 Nonprofit</p>
              <p className="text-gray-400 text-sm">Every rupee is reinvested. All documents open.</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center mb-12 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setShowContactModal(true)}
              className="inline-flex items-center gap-3 bg-military-gold hover:bg-yellow-500 text-black font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105">
              <Icon name="email" size="md" className="text-black" />
              <span>Get in Touch</span>
            </button>
            
            <Link
              href="/donor-wall"
              className="inline-flex items-center gap-3 bg-premium-gray/50 hover:bg-premium-gray/70 text-premium-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 border border-military-gold/30">
              <Icon name="trophy" size="md" className="text-premium-white" />
              <span>View Donor Wall</span>
            </Link>
          </div>
          <p className="text-gray-400 text-sm">Have questions or want to see our supporters?</p>
        </div>

        {/* Financial Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center p-6 rounded-2xl bg-premium-gray/30 border border-military-gold/20">
            <div className="text-3xl mb-3">
              <Icon name="money" size="lg" className="text-military-gold mx-auto" />
            </div>
            <h4 className="font-semibold text-premium-white mb-2">Zero Profit</h4>
            <p className="text-gray-400 text-sm">All funds go directly to our mission</p>
          </div>
          
          <div className="text-center p-6 rounded-2xl bg-premium-gray/30 border border-military-gold/20">
            <div className="text-3xl mb-3">📊</div>
            <h4 className="font-semibold text-premium-white mb-2">Full Disclosure</h4>
            <p className="text-gray-400 text-sm">Complete transparency in all operations</p>
          </div>
          
          <div className="text-center p-6 rounded-2xl bg-premium-gray/30 border border-military-gold/20">
            <div className="text-3xl mb-3">🎯</div>
            <h4 className="font-semibold text-premium-white mb-2">Mission Focus</h4>
            <p className="text-gray-400 text-sm">Every decision serves veteran success</p>
          </div>
        </div>
      </div>

      {/* Simple Document Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDoc(null)}>
          <div className="bg-premium-black rounded-2xl max-w-4xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-military-gold/30">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-premium-white">
                  {documents[selectedDoc as keyof typeof documents].title}
                </h3>
                <button 
                  onClick={() => setSelectedDoc(null)}
                  className="text-gray-400 hover:text-white text-2xl font-bold">
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <img 
                src={documents[selectedDoc as keyof typeof documents].image} 
                alt={documents[selectedDoc as keyof typeof documents].title}
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowContactModal(false)}>
          <div className="bg-premium-black rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-military-gold/30">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-premium-white">Get in Touch</h3>
                <button 
                  onClick={() => setShowContactModal(false)}
                  className="text-gray-400 hover:text-white text-2xl font-bold">
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              {submitStatus === 'success' ? (
                <div className="text-center space-y-4">
                  <div className="text-4xl">✅</div>
                  <h3 className="text-xl font-semibold text-premium-white">Message Sent!</h3>
                  <p className="text-gray-300">{submitMessage}</p>
                </div>
              ) : submitStatus === 'error' ? (
                <div className="text-center space-y-4">
                  <div className="text-4xl">❌</div>
                  <h3 className="text-xl font-semibold text-premium-white">Error</h3>
                  <p className="text-gray-300">{submitMessage}</p>
                  <button
                    onClick={() => setSubmitStatus('idle')}
                    className="bg-military-gold hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded-lg transition-all duration-300"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Your Message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message here..."
                      className="w-full px-4 py-3 bg-premium-gray/50 border border-military-gold/30 rounded-xl text-premium-white placeholder-gray-400 focus:ring-2 focus:ring-military-gold focus:border-transparent outline-none transition-all duration-300"
                      rows={4}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="text-center">
                    <button
                      type="submit"
                      disabled={isSubmitting || !message.trim()}
                      className="w-full bg-military-gold hover:bg-yellow-500 text-black font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message to CEO@faujnet.com'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 text-center">
                    Your message will be sent directly to our CEO
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
