import Link from "next/link";

export default function FinalCall() {
  const C = { premiumBlack: "#0F0F0F", premiumLight: "#F9FAFB", militaryGold: "#D4AF37" };
  return (
    <section className="xk-final relative isolate text-center"
             style={{ backgroundColor: C.premiumBlack, color: C.premiumLight }}>
      {/* Subtle gold particles via CSS gradients */}
      <div aria-hidden className="absolute inset-0"
           style={{
             background: `
               radial-gradient(600px circle at 70% 10%, rgba(212,175,55,0.12), transparent 40%),
               radial-gradient(500px circle at 20% 80%, rgba(212,175,55,0.08), transparent 40%)
             `
           }} />
      <div className="relative mx-auto max-w-screen-sm px-4 py-12 md:py-16 lg:py-20">
        <p className="text-xl sm:text-2xl font-semibold">
          Don't Just Thank a Soldier. <span style={{ color: C.militaryGold }}>Help Hire One.</span>
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => {
              const event = new CustomEvent('openDonationModal');
              window.dispatchEvent(event);
            }}
            className="inline-flex items-center justify-center rounded-2xl px-8 py-4 font-semibold shadow-lg hover:brightness-110 focus:outline-none focus-visible:ring-2 transition"
            style={{
              color: "#0F0F0F",
              backgroundImage: "linear-gradient(135deg, #D4AF37 0%, #F59E0B 100%)",
              boxShadow: "0 0 0 2px rgba(212,175,55,0.4), 0 8px 30px rgba(0,0,0,0.6)",
            }}>
            Stand With Soldiers — Donate Now
          </button>
          
          <button
            onClick={() => {
              const event = new CustomEvent('openShareModal');
              window.dispatchEvent(event);
            }}
            className="inline-flex items-center gap-3 bg-premium-gray/50 hover:bg-premium-gray/70 text-premium-white font-semibold px-6 py-4 rounded-2xl transition-all duration-300 hover:scale-105 border border-military-gold/30"
          >
            <span>Share This Mission</span>
            <span className="transform group-hover:scale-110 transition-transform">📢</span>
          </button>
        </div>
      </div>
    </section>
  );
}
