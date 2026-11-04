/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // "Mulled wine": the accent palette. Oxblood for actions and labels,
      // rose-cream for chips, dusty rose for accents on dark (night) surfaces.
      colors: {
        wine: {
          50: "#faf2f1",
          100: "#f1e2df",
          200: "#e4c7c3",
          300: "#d3a3a2",
          400: "#b85c63",
          500: "#9a3f47",
          600: "#7a2e35",
          700: "#6b2830",
          800: "#55212a",
          900: "#3f1a20",
        },
      },
      fontFamily: {
        // The platform's own UI font (SF Pro on Apple devices, Segoe UI on Windows):
        // it ships optical sizing and tracking tables, and costs no download.
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto", '"Helvetica Neue"', "Arial", "sans-serif"],
        display: ["var(--font-display)", "Georgia", ...defaultTheme.fontFamily.serif],
        hand: ["var(--font-hand)", "cursive"],
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
