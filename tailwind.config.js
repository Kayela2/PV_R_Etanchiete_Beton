/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        smac: {
          red:       "#E3000F",
          redDark:   "#B8000C",
          redLight:  "#FDECEA",
          gray:      "#6B7280",
          grayLight: "#F3F4F6",
          grayBorder:"#E5E7EB",
          dark:      "#111827",
          text:      "#374151",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};