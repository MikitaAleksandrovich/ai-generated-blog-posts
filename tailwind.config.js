const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        body: "var(--font-dm-sans)",
        heading: "var(--font-dm-serif)",
        sans: ["var(--font-dm-sans)", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        surface: {
          light: "#f8fafc",
          dark: "#0f172a",
        },
        card: {
          light: "#ffffff",
          dark: "#1e293b",
        },
        text: {
          light: "#0f172a",
          dark: "#e2e8f0",
        },
        accent: {
          light: "#0ea5e9",
          dark: "#38bdf8",
        },
      },
      boxShadow: {
        card: "0 20px 35px -25px rgba(15, 23, 42, 0.35)",
      },
      transitionDuration: {
        theme: "250ms",
      },
    },
  },
  plugins: [],
};