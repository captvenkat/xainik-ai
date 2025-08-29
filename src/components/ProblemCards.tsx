'use client'

export default function ProblemCards() {
  const problems = [
    {
      title: 'Govt resettlement?',
      description: 'Outdated, one-size-fits-all.',
      icon: '🏛️',
      color: 'bg-red-50 border-red-200'
    },
    {
      title: 'Resume writers?',
      description: 'Charge thousands, give templates.',
      icon: '📝',
      color: 'bg-orange-50 border-orange-200'
    },
    {
      title: 'AI tools?',
      description: 'Not built for veterans.',
      icon: '🤖',
      color: 'bg-yellow-50 border-yellow-200'
    },
    {
      title: 'Courses?',
      description: 'Irrelevant, no guarantee.',
      icon: '📚',
      color: 'bg-blue-50 border-blue-200'
    }
  ]

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            The Problem
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Veterans face broken systems when transitioning to civilian careers
          </p>
        </div>

        {/* Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {problems.map((problem, index) => (
            <div 
              key={index}
              className={`${problem.color} border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{problem.icon}</div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {problem.title}
                  </h3>
                  <p className="text-gray-600">
                    {problem.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Callout */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
          <div className="text-red-600 text-2xl mb-3">🔴</div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Even honest providers haven't touched this at scale
          </h3>
          <p className="text-red-700">
            Veterans are still left behind.
          </p>
        </div>
      </div>
    </section>
  )
}
