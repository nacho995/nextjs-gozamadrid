/** @type {import('tailwindcss').Config} */
export default{
  content: [
    "./src/pages/**.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    ".src/**/*.{js,ts,jsx,tsx,mdx}",
    ["./node_modules/@relume_io/relume-ui/dist/**/*.{js,ts,jsx,tsx}"],
     ],
presets: [require("@relume_io/relume-tailwind")], 
theme: {
    extend: {
      textShadow: {
        'custom': '2px 2px 2px rgba(0, 0, 0, 0.3)',
        'sm': '1px 1px 1px rgba(0, 0, 0, 0.25)',
        'md': '2px 2px 2px rgba(0, 0, 0, 0.35)',
        'lg': '3px 3px 3px rgba(0, 0, 0, 0.4)',
      },
      fontFamily: {
        sans: ["Chakra Petch", "sans-serif"], // Fuente predeterminada
      },
      colors: {
        customColors: "#73FAFA",
        greenYellow:" #B1F553",
        amarillo: "#C7A336",
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [
    require('tailwindcss-textshadow'),
  ],
};
