'use client'

export default function Solution() {
  const features = [
    {
      title: 'Build pitches in minutes',
      description: 'AI-powered pitch generation tailored to veteran experience',
      icon: '⚡'
    },
    {
      title: 'Tailor JDs automatically',
      description: 'Smart job description matching for veteran skills',
      icon: '🎯'
    },
    {
      title: 'Track referrals & replies',
      description: 'Complete visibility into application progress',
      icon: '📊'
    },
    {
      title: 'Boost supporter networks',
      description: 'Connect with mentors and industry professionals',
      icon: '🤝'
    },
    {
      title: 'Log conversations, no loss',
      description: 'Never lose track of important networking conversations',
      icon: '💬'
    }
  ]

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            The Solution
          </h2>
          <div className="text-2xl font-bold text-blue-600 mb-4">
            AI + 20 years of real insights = Xainik
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Main Value Proposition */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white text-center mb-8">
          <div className="text-4xl mb-4">👉</div>
          <h3 className="text-2xl font-bold mb-4">
            Xainik removes the broken parts of the job hunt
          </h3>
          <p className="text-xl opacity-90">
            So veterans move forward with confidence.
          </p>
        </div>

        {/* Subtext */}
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">
            We've served veterans for 20 years.
          </p>
          <p className="text-lg text-gray-600 mb-4">
            Now we're building for scale.
          </p>
          <p className="text-lg font-semibold text-gray-800">
            Scale needs infra. Infra needs funds.
          </p>
        </div>
      </div>
    </section>
  )
}
