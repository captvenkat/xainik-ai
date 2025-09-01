'use client'

export default function ProblemCards() {
  return (
    <section className="app-section bg-premium-black relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23B91C1C' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="premium-heading text-3xl md:text-5xl mb-6 text-premium-white">
            The <span className="military-heading">Reality</span> Veterans Face
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Broken systems that leave our heroes behind when they need support the most
          </p>
        </div>

        {/* Problem Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Govt Resettlement */}
          <div className="military-card hover:scale-105 transition-all duration-300 group">
            <div className="flex items-start gap-4">
              <div className="text-4xl group-hover:scale-110 transition-transform">🏛️</div>
              <div>
                <h3 className="text-xl font-semibold text-premium-white mb-3 group-hover:text-military-gold transition-colors">
                  Govt Resettlement?
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Outdated, one-size-fits-all approach that doesn't recognize individual veteran skills and aspirations.
                </p>
              </div>
            </div>
          </div>

          {/* Resume Writers */}
          <div className="military-card hover:scale-105 transition-all duration-300 group">
            <div className="flex items-start gap-4">
              <div className="text-4xl group-hover:scale-110 transition-transform">📝</div>
              <div>
                <h3 className="text-xl font-semibold text-premium-white mb-3 group-hover:text-military-gold transition-colors">
                  Resume Writers?
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Charge thousands for generic templates that don't translate military experience to civilian success.
                </p>
              </div>
            </div>
          </div>

          {/* AI Tools */}
          <div className="military-card hover:scale-105 transition-all duration-300 group">
            <div className="flex items-start gap-4">
              <div className="text-4xl group-hover:scale-110 transition-transform">🤖</div>
              <div>
                <h3 className="text-xl font-semibold text-premium-white mb-3 group-hover:text-military-gold transition-colors">
                  AI Tools?
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Not built for veterans. They miss the nuances of military service and leadership experience.
                </p>
              </div>
            </div>
          </div>

          {/* Courses */}
          <div className="military-card hover:scale-105 transition-all duration-300 group">
            <div className="flex items-start gap-4">
              <div className="text-4xl group-hover:scale-110 transition-transform">📚</div>
              <div>
                <h3 className="text-xl font-semibold text-premium-white mb-3 group-hover:text-military-gold transition-colors">
                  Generic Courses?
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Irrelevant content with no guarantee of job placement or career advancement.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Statement */}
        <div className="premium-card text-center border border-military-red/30">
          <div className="text-military-red text-4xl mb-4">🔴</div>
          <h3 className="text-2xl font-bold text-military-red mb-3">
            Even honest providers haven't solved this at scale
          </h3>
          <p className="text-military-red/80 text-lg">
            Veterans are still left behind, struggling to translate their invaluable experience into civilian success.
          </p>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-lg text-gray-400 mb-6">
            This is why we're building <span className="text-military-gold font-semibold">Xainik</span> - 
            the first AI-powered platform built specifically for veterans.
          </p>
          <div className="inline-flex items-center gap-2 bg-premium-gray/50 backdrop-blur-sm px-6 py-3 rounded-2xl border border-military-gold/30">
            <span className="text-military-gold">⚡</span>
            <span className="text-premium-white font-medium">Ready to change this reality?</span>
          </div>
        </div>
      </div>
    </section>
  )
}
