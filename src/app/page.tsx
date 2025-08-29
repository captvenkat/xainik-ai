import Hero from '@/components/Hero'
import ImpactTracker from '@/components/ImpactTracker'
import ProblemCards from '@/components/ProblemCards'
import Solution from '@/components/Solution'
import Transparency from '@/components/Transparency'
import StayConnected from '@/components/StayConnected'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <ImpactTracker />
      <ProblemCards />
      <Solution />
      <Transparency />
      <StayConnected />
      
      {/* Final CTA Section */}
      <section className="py-16 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Be part of this change.
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            — Donate what you can<br />
            — Share with those who can<br />
            — Stand for those who once stood for us
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-full text-lg shadow-lg transform transition-all duration-200 hover:scale-105">
              Donate Now
            </button>
            <button className="bg-white hover:bg-gray-100 text-gray-900 font-semibold py-4 px-8 rounded-full text-lg shadow-lg transform transition-all duration-200 hover:scale-105">
              Share This Mission
            </button>
          </div>
          
          <p className="text-gray-400">
            Even if you can't donate, share this mission. <strong>Every share counts.</strong>
          </p>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-800 text-gray-400">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm">
            Xainik is an initiative by Veteran Success Foundation (Sec-8 Nonprofit, Regn. No: XXXX).
          </p>
          <p className="text-sm mt-2">
            © 2024 Veteran Success Foundation. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  )
}
