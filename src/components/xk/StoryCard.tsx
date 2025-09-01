import Image from "next/image";

export default function StoryCard({
  imageSrc = "/images/story-hands-medal.svg",
}: { imageSrc?: string }) {
  const C = {
    premiumBlack: "#0F0F0F",
    premiumLight: "#F9FAFB",
    militaryGold: "#D4AF37",
    militaryRed: "#B91C1C",
  };

  return (
    <section className="xk-story" style={{ backgroundColor: C.premiumBlack, color: C.premiumLight }}>
      <div className="mx-auto max-w-screen-md px-4 py-12 md:py-16 lg:py-20 grid gap-6 md:gap-8 md:grid-cols-2 items-center">
        <div className="relative order-2 md:order-1 rounded-2xl overflow-hidden">
          <Image
            src={imageSrc}
            alt="A veteran's hands holding a medal (representational)"
            width={1200}
            height={900}
            className="object-cover"
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          />
          <div className="absolute inset-0" style={{
            background: "linear-gradient(135deg,#D4AF37 0%, #F59E0B 100%)",
            mixBlendMode: "multiply",
            opacity: 0.3,
          }} />
          <div className="absolute inset-0 ring-1" style={{ borderColor: "rgba(212,175,55,0.25)" }} />
        </div>

        <div className="order-1 md:order-2">
          <h2 className="text-2xl font-semibold">From Service to Second Career</h2>
          <p className="mt-3 opacity-90">
            Captain Vijay led 600 troops with proven operational leadership. After retirement, he spent 12 months searching for work without success. With Xainik's support, he now leads infrastructure management operations at a top IT MNC.
          </p>
          <p className="mt-3 opacity-90">
            👉 Your support makes transitions like this possible.
          </p>
          <button
            onClick={() => {
              const event = new CustomEvent('openDonationModal');
              window.dispatchEvent(event);
            }}
            className="mt-5 inline-block rounded-xl px-6 py-3 font-semibold shadow-lg hover:brightness-110"
            style={{ backgroundColor: C.militaryRed, color: C.premiumLight }}>
            Help Fund the Next Transition
          </button>
        </div>
      </div>
    </section>
  );
}
