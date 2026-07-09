import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#12171C",
        paper: "#EEE8D6",
        brass: "#B98A2E",
        "brass-dim": "#7C5F22",
        stamp: {
          buy: "#3B6B49",
          sell: "#8E3B3B",
          hold: "#5B6B7A",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-plex-sans)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      backgroundImage: {
        ledger:
          "repeating-linear-gradient(to bottom, transparent, transparent 27px, rgba(18,23,28,0.08) 28px)",
      },
      keyframes: {
        stamp: {
          "0%": { transform: "scale(2.2) rotate(-14deg)", opacity: "0" },
          "60%": { transform: "scale(0.94) rotate(-3deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(-4deg)", opacity: "1" },
        },
      },
      animation: {
        stamp: "stamp 0.35s cubic-bezier(0.2, 0.8, 0.3, 1) both",
      },
    },
  },
  plugins: [],
};

export default config;
