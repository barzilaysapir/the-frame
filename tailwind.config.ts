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
          gold: "#D4AF6A",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.25em",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(212, 175, 106, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
