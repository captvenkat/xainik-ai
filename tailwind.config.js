/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B1220",
        glass: "rgba(255,255,255,0.08)",
        line: "rgba(255,255,255,0.10)",
      },
      boxShadow: {
        card: "0 10px 30px rgba(0,0,0,.35)",
        cardHover: "0 20px 40px rgba(0,0,0,.45)",
        soft: "0 18px 45px rgba(0,0,0,.35)",
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
        radius: "var(--radius)",
      },
    },
  },
  plugins: [],
};

