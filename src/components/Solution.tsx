'use client'

import Icon from '@/components/ui/Icon'

export default function Solution() {
  return (
    <section className="app-section ai-future relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="premium-heading text-3xl md:text-5xl mb-6 text-premium-white">
            The <span className="military-heading">Solution</span>
          </h2>
          <div className="text-2xl font-bold text-military-green mb-4">
            AI + 20 Years of Real Insights = Xainik
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            The world's first AI-powered platform built specifically for veteran career transitions
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Build Pitches */}
          <div className="premium-card hover:scale-105 transition-all duration-300 group border border-military-green/20">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">⚡</div>
            <h3 className="text-lg font-semibold text-premium-white mb-3 group-hover:text-military-green transition-colors">
              Build Pitches in Minutes
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              AI-powered pitch generation tailored to veteran experience, leadership, and unique skill sets.
            </p>
          </div>

          {/* Tailor JDs */}
          <div className="premium-card hover:scale-105 transition-all duration-300 group border border-military-green/20">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎯</div>
            <h3 className="text-lg font-semibold text-premium-white mb-3 group-hover:text-military-green transition-colors">
              Tailor JDs Automatically
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Smart job description matching that translates military skills to civilian requirements.
            </p>
          </div>

          {/* Track Progress */}
          <div className="premium-card hover:scale-105 transition-all duration-300 group border border-military-green/20">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📊</div>
            <h3 className="text-lg font-semibold text-premium-white mb-3 group-hover:text-military-green transition-colors">
              Track Referrals & Replies
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Complete visibility into application progress with AI-powered insights and recommendations.
            </p>
          </div>

          {/* Boost Networks */}
          <div className="premium-card hover:scale-105 transition-all duration-300 group border border-military-green/20">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
              <Icon name="handshake" size="lg" className="text-military-green mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-premium-white mb-3 group-hover:text-military-green transition-colors">
              Boost Supporter Networks
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Connect with mentors, industry professionals, and fellow veterans for guidance and opportunities.
            </p>
          </div>

          {/* Log Conversations */}
          <div className="premium-card hover:scale-105 transition-all duration-300 group border border-military-green/20">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">💬</div>
            <h3 className="text-lg font-semibold text-premium-white mb-3 group-hover:text-military-green transition-colors">
              Log Conversations, No Loss
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Never lose track of important networking conversations with AI-powered memory and follow-up.
            </p>
          </div>

          {/* AI Insights */}
          <div className="premium-card hover:scale-105 transition-all duration-300 group border border-military-green/20">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🧠</div>
            <h3 className="text-lg font-semibold text-premium-white mb-3 group-hover:text-military-green transition-colors">
              AI-Powered Insights
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Get personalized recommendations based on your military background and career goals.
            </p>
          </div>
        </div>

        {/* Main Value Proposition */}
        <div className="premium-card text-center border border-military-green/30 mb-12">
          <div className="text-4xl mb-6">👉</div>
          <h3 className="text-2xl font-bold text-premium-white mb-4">
            Xainik removes the broken parts of the job hunt
          </h3>
          <p className="text-xl text-gray-300">
            So veterans move forward with confidence and purpose.
          </p>
        </div>

        {/* Experience Statement */}
        <div className="text-center">
          <p className="text-lg text-gray-300 mb-4">
            We've served veterans for <span className="text-military-gold font-semibold">20+ years</span>.
          </p>
          <p className="text-lg text-gray-300 mb-4">
            Now we're building for <span className="text-military-gold font-semibold">scale</span>.
          </p>
          <p className="text-lg font-semibold text-premium-white">
            Scale needs infrastructure. Infrastructure needs funds.
          </p>
        </div>

        {/* AI Future Badge */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-3 bg-premium-gray/40 backdrop-blur-sm px-6 py-3 rounded-2xl border border-military-green/30">
            <span className="text-2xl">🚀</span>
            <span className="text-military-green font-medium">Building the AI-Powered Future Veterans Deserve</span>
          </div>
        </div>
      </div>
    </section>
  )
}
