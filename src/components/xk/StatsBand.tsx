export default function StatsBand() {
  const C = {
    premiumDark: "#111827",
    premiumLight: "#F9FAFB",
    premiumGray: "#1F2937",
    militaryGold: "#D4AF37",
  };

  const items = [
    { big: "5,00,000+", small: "Retire each year — still seeking dignified work" },
    { big: "< 20%", small: "Placed in meaningful roles despite proven leadership" },
    { big: "4", small: "Core strengths: Leadership • Integrity • Discipline • Teamwork" },
  ];

  return (
    <section className="xk-stats" style={{ backgroundColor: C.premiumDark, color: C.premiumLight }}>
      <div className="mx-auto max-w-screen-md px-4 py-12 md:py-16 lg:py-20 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
        {items.map((it) => (
          <div key={it.big}
               className="rounded-2xl p-6 md:p-8 shadow-lg"
               style={{ backgroundColor: C.premiumGray }}>
            <div className="text-3xl font-semibold" style={{ color: C.militaryGold }}>
              {it.big}
            </div>
            <div className="mt-2 text-sm opacity-90">{it.small}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
