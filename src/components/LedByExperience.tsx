'use client'

import Link from 'next/link'
import Icon from '@/components/ui/Icon'

export default function LedByExperience() {
  return (
    <section className="app-section bg-premium-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="premium-heading text-3xl md:text-5xl mb-6 text-premium-white">
            Led by <span className="military-heading">Experience</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Built by a veteran, for veterans. Two decades of proven expertise in military-to-civilian transitions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Founder Info */}
          <div className="space-y-8">
            <div className="military-card p-8">
              <div className="flex items-start gap-6">
                <div className="text-4xl">
                  <Icon name="soldier" size="xl" className="text-military-gold" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-premium-white mb-3">
                    Capt. Venkat
                  </h3>
                  <p className="text-military-gold font-semibold mb-2">
                    Indian Army, Retd.
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    Xainik is founded by Capt. Venkat (Indian Army, Retd.), who has dedicated his post-service career to veteran empowerment since 2005.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="premium-card border border-military-gold/20">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">
                    <Icon name="trophy" size="lg" className="text-military-gold" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-premium-white mb-2">
                      Pioneering Ventures
                    </h4>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Through pioneering ventures such as <span className="text-military-gold font-semibold">Bridgehead Consulting</span> and <span className="text-military-gold font-semibold">Faujnet</span>, he created many firsts in India's military-to-civilian transition space — opening doors for veterans in domains that were never offered to them in the past.
                    </p>
                  </div>
                </div>
              </div>

              <div className="premium-card border border-military-green/20">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">
                    <Icon name="target" size="lg" className="text-military-green" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-premium-white mb-2">
                      The Next Chapter
                    </h4>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Xainik is the next step in this journey — an AI-powered, soldier-first platform ensuring no veteran is left behind after service.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Connect Button */}
            <div className="text-center pt-6">
              <Link
                href="https://www.linkedin.com/in/capt-venkat"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-military-gold hover:bg-yellow-500 text-black font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105"
              >
                <Icon name="handshake" size="md" className="text-black" />
                <span>Connect with Capt. Venkat on LinkedIn</span>
              </Link>
            </div>
          </div>

          {/* Visual Element */}
          <div className="relative">
            <div className="military-card p-8 text-center">
              <div className="text-6xl mb-6">
                <Icon name="medal" size="xl" className="text-military-gold mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-premium-white mb-4">
                20+ Years of Service
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-premium-gray/30 rounded-xl">
                  <span className="text-gray-300">Military Service</span>
                  <span className="text-military-gold font-semibold">Indian Army</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-premium-gray/30 rounded-xl">
                  <span className="text-gray-300">Veteran Support</span>
                  <span className="text-military-gold font-semibold">Since 2005</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-premium-gray/30 rounded-xl">
                  <span className="text-gray-300">Platforms Built</span>
                  <span className="text-military-gold font-semibold">3+ Ventures</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-premium-gray/30 rounded-xl">
                  <span className="text-gray-300">Mission</span>
                  <span className="text-military-green font-semibold">AI-Powered Future</span>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 border-2 border-military-gold rounded-full opacity-50"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 border-2 border-military-green rounded-full opacity-50"></div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-3 bg-premium-gray/40 backdrop-blur-sm px-8 py-4 rounded-2xl border border-military-gold/30">
            <Icon name="target" size="md" className="text-military-gold" />
            <span className="text-premium-white font-medium">
              Built by veterans, for veterans. Every feature designed with real military experience.
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
