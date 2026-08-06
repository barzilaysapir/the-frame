import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        frame: {
          bg: "#0F0F11",
          panel: "#17171A",
          border: "#2A2A2E",
          silver: "#C9C9CE",
          muted: "#8A8A90",
          // Signal amber — a recording tally light / viewfinder focus
          // indicator, not a decorative "luxury" hue. Used sparingly.
          accent: "#E8951E",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-sans)", "system-ui", "sans-serif"],
        logo: ["var(--font-logo)", "cursive"],
      },
      letterSpacing: {
        widest2: "0.25em",
      },
      boxShadow: {
        glow: "0 20px 40px -12px rgba(0, 0, 0, 0.6)",
      },
    },
  },
  plugins: [],
};

export default config;
