/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        amarillo: '#FFB800',
      },
      fontFamily: {
        'playfair': ['Playfair Display', 'serif'],
        'sans': ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            h1: {
              fontFamily: 'Playfair Display, serif',
            },
            h2: {
              fontFamily: 'Playfair Display, serif',
            },
            h3: {
              fontFamily: 'Playfair Display, serif',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 