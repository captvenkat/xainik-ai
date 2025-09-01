"use client";



const C = {
  militaryGold: "#D4AF37",
  premiumBlack: "#0F0F0F",
  premiumLight: "#F9FAFB",
  militaryNavy: "#1B365D",
  militaryRed: "#B91C1C",
  premiumGray: "#1F2937",
  premiumDark: "#111827",
};

export default function HeroOverlay() {

  return (
    <section className="xk-hero relative isolate overflow-hidden"
      style={{ backgroundColor: C.premiumBlack }}>
      {/* Premium gradient background */}
      <div className="absolute inset-0">
        {/* Primary gradient */}
        <div 
          className="absolute inset-0"
          style={{ 
            background: `linear-gradient(160deg, ${C.premiumBlack} 0%, ${C.militaryNavy} 50%, ${C.premiumBlack} 100%)`
          }} 
        />
        
        {/* Subtle pattern overlay for texture */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="relative mx-auto max-w-screen-sm px-4 py-12 md:py-16 lg:py-20 text-center" style={{ color: C.premiumLight }}>
        <h1 className="text-3xl sm:text-4xl font-semibold leading-tight">
          Over 5,00,000 retired soldiers are struggling for dignified jobs.
        </h1>

        <p className="mt-4 text-base sm:text-lg opacity-90">
          They secured us. Now we must secure their future.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          {/* Static military icon */}
          <div className="h-16 w-16 bg-military-gold rounded-full flex items-center justify-center text-black font-bold text-2xl">
            🎖️
          </div>
          <p className="text-sm sm:text-base font-medium">
            Don't Just Thank a Soldier. <span style={{ color: C.militaryGold }}>Help Hire One.</span>
          </p>
        </div>

        <div className="mt-8">
          <button
            onClick={() => {
              // Trigger donation modal directly
              const event = new CustomEvent('openDonationModal');
              window.dispatchEvent(event);
            }}
            className="inline-flex items-center justify-center rounded-2xl px-8 py-4 font-semibold shadow-lg hover:brightness-110 focus:outline-none focus-visible:ring-2 transition"
            style={{
              color: C.premiumBlack,
              backgroundImage: "linear-gradient(135deg, #D4AF37 0%, #F59E0B 100%)",
              boxShadow: "0 0 0 2px rgba(212,175,55,0.4), 0 8px 30px rgba(0,0,0,0.6)",
            }}
          >
            Stand With Soldiers — Donate Now
          </button>
        </div>

                        <p className="mt-3 text-xs opacity-80 mx-auto" style={{ maxWidth: "40ch" }}>
                  Every rupee you give goes directly to building a world-class, AI-first post-retirement career support system for ex-servicemen.
                </p>

                {/* Secondary CTA - Share Mission */}
                <div className="mt-8">
                  <button
                    onClick={() => {
                      // Trigger share modal directly
                      const event = new CustomEvent('openShareModal');
                      window.dispatchEvent(event);
                    }}
                    className="inline-flex items-center gap-3 bg-premium-gray/50 hover:bg-premium-gray/70 text-premium-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 border border-military-gold/30"
                  >
                    <span>Share This Mission</span>
                    <span className="transform group-hover:scale-110 transition-transform">📢</span>
                  </button>
                </div>
              </div>
            </section>
  );
}
