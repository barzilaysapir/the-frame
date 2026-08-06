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
          // Neon Studio duo — magenta/cyan stage-lighting energy.
          magenta: "#E91E8C",
          cyan: "#22D3EE",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        logo: ["var(--font-logo)", "cursive"],
      },
      letterSpacing: {
        widest2: "0.25em",
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(233, 30, 140, 0.45)",
      },
      backgroundImage: {
        "neon-cta": "linear-gradient(90deg, #E91E8C, #22D3EE)",
      },
    },
  },
  plugins: [],
};

export default config;
