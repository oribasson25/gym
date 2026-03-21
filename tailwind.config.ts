import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6366F1",
          50: "#EEF2FF",
          100: "#E0E7FF",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
        },
        success: {
          DEFAULT: "#22C55E",
          50: "#F0FDF4",
          500: "#22C55E",
          600: "#16A34A",
        },
        warning: {
          DEFAULT: "#F59E0B",
          50: "#FFFBEB",
          500: "#F59E0B",
          600: "#D97706",
        },
        danger: {
          DEFAULT: "#EF4444",
          50: "#FEF2F2",
          500: "#EF4444",
          600: "#DC2626",
        },
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 24px -2px rgba(0,0,0,0.08)",
        "card-hover": "0 8px 32px -4px rgba(0,0,0,0.12)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-slow": "bounce 2s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
