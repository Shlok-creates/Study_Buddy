/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        salmon: {
          400: "#FFA07A",
          500: "#FA8072",
          600: "#E96D60",
        },
        teal: {
          500: "#20B2AA",
          600: "#008080",
          700: "#005959",
        },
        dark: {
          bg: "#0A191E",
          surface: "#0F172A",
          card: "#13232C",
          border: "#1E333D",
        },
        light: {
          bg: "#F9FAFB",
          surface: "#FFFFFF",
          card: "#FFFFFF",
          border: "#E5E7EB",
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-gentle": "bounce 2s infinite",
      }
    },
  },
  plugins: [],
};

