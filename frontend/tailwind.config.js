/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Chakra Petch", "sans-serif"],
      },
      colors: {
        gold: "#C7A336",
        bluecolor: "#000752",
        amarillo: "#C7A336",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      typography: {
        DEFAULT: {
          css: {
            color: 'inherit',
            a: {
              color: 'inherit',
              fontWeight: 'inherit',
              textDecoration: 'inherit',
              '&:hover': {
                color: 'inherit',
              },
            },
            h1: {
              fontWeight: '700',
            },
            h2: {
              fontWeight: '600',
            },
            h3: {
              fontWeight: '600',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-textshadow'),
    require('@tailwindcss/typography'),
  ],
} 