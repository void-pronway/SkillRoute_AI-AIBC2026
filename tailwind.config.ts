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
        // SkillRoute Official Color Palette
        brand: {
          sage: "#CFDBD5", // Neutral cards, subtle borders, tags
          cream: "#E8EDDF", // Primary light canvas
          yellow: "#F5CB5C", // Brand accent, buttons, active states, progress
          black: "#242423", // Typography, dark buttons, dark theme
          onyx: "#333533", // Secondary text, dark cards, dark accents
          // Card & Container tokens for both light and dark
          card: "rgb(var(--bg-card) / <alpha-value>)",
          darkCard: "#242423",
          yellowHover: "#E5BB4C",
          sageLight: "#E5ECE9",
          creamLight: "#F5F8F2",
          onyxMuted: "#4B4E4B",
          darkBg: "#181817",
          darkBorder: "#333533",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        bengali: ["Hind Siliguri", "Noto Sans Bengali", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
