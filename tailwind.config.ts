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
      keyframes: {
        overlayShow: { from: { opacity: "0" }, to: { opacity: "1" } },
        overlayHide: { from: { opacity: "1" }, to: { opacity: "0" } },
        contentShow: {
          from: { opacity: "0", transform: "translate(-50%, -50%) scale(0.95)" },
          to: { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
        },
        contentHide: {
          from: { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
          to: { opacity: "0", transform: "translate(-50%, -50%) scale(0.95)" },
        },
      },
      animation: {
        overlayShow: "overlayShow 200ms ease-out forwards",
        overlayHide: "overlayHide 150ms ease-in forwards",
        contentShow: "contentShow 200ms ease-out forwards",
        contentHide: "contentHide 150ms ease-in forwards",
      },
    },
  },
  plugins: [],
};

export default config;
