import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#08121A",
        night: "#0B1822",
        mist: "#B9D5E7",
        aqua: "#73F0D2",
        sun: "#F4B56A",
        rose: "#F57A87"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.08), 0 20px 60px rgba(4, 15, 25, 0.45)",
        pulse: "0 0 30px rgba(115, 240, 210, 0.22)"
      },
      fontFamily: {
        sans: ["'Avenir Next'", "'Segoe UI'", "sans-serif"],
        display: ["'Avenir Next Condensed'", "'Arial Narrow'", "'Avenir Next'", "sans-serif"]
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
