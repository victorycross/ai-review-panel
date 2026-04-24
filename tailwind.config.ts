import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#ffffff",
        surface: "#f8fafc",
        "surface-2": "#f1f5f9",
        border: "#e2e8f0",
        muted: "#64748b",
        ink: "#0f172a",
        accent: "#c2410c",
        "accent-hover": "#9a3412",
        "accent-soft": "#fff7ed",
        "accent-tint": "#ffedd5",
        risk: {
          critical: "#ef4444",
          high: "#f97316",
          medium: "#eab308",
          low: "#22c55e",
          informational: "#64748b",
        },
        persona: {
          rai: "#7c3aed",
          independence: "#0d9488",
          cyber: "#2563eb",
          legal: "#dc2626",
          governance: "#4f46e5",
          performance: "#059669",
        },
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        blink: "blink 1s step-end infinite",
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
