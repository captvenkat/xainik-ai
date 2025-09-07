export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0B1220] via-[#1a365d] to-[#2d3748] pb-32">
      <section className="min-h-screen flex flex-col justify-center px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <p className="text-white/60 text-sm mb-4">Natural leaders in action</p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-3">Xainik - Natural leaders</h1>
          <p className="text-white/80 text-lg mb-8">Unlock your potential with AI-powered guidance</p>
          <div className="flex gap-3 mb-8">
            <button className="flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-200 bg-white/10 text-white border border-white/20 hover:bg-white/20">
              🚀 Get Started
            </button>
            <button className="flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-200 bg-blue-500 text-white shadow-lg">
              📚 Learn More
            </button>
          </div>
          <button className="w-full py-5 px-8 rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-black text-xl hover:from-yellow-400 hover:to-orange-400 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl">
            Join the Community
          </button>
          <div className="mt-6">
            <a className="text-white/60 hover:text-white text-sm transition-colors duration-200" href="/community">
              Explore Community →
            </a>
          </div>
        </div>
      </section>
      
      <div className="fixed bottom-0 inset-x-0 bg-gradient-to-r from-white to-gray-100 text-black py-3 px-4 shadow-2xl z-40">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🪖</span>
            <div>
              <p className="text-sm font-semibold">Natural leaders making a difference</p>
              <p className="text-xs opacity-90">Join our community of excellence</p>
            </div>
          </div>
          <a href="/donate" className="px-6 py-2 bg-black text-white font-bold rounded-full hover:bg-gray-800 transform hover:scale-105 transition-all duration-200 shadow-lg">
            Support Us
          </a>
        </div>
      </div>
    </main>
  );
}