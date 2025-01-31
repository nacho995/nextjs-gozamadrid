/** @type {import('tailwindcss').Config} */
export default{
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
<<<<<<< HEAD
    ".src/**/*.{js,ts,jsx,tsx,mdx}",
=======
>>>>>>> 33e1efe (guardando antes del pull locales)
    ["./node_modules/@relume_io/relume-ui/dist/**/*.{js,ts,jsx,tsx}"],
     ],
presets: [require("@relume_io/relume-tailwind")], 
theme: {
    extend: {
      colors: {
<<<<<<< HEAD
        customColors: "#73FAFA",
        greenYellow:" #B1F553",
        amarillo: "#C7A336",
=======
>>>>>>> 33e1efe (guardando antes del pull locales)
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
<<<<<<< HEAD
  plugins: [
    require('tailwindcss-textshadow')
  ],
=======
  plugins: [],
>>>>>>> 33e1efe (guardando antes del pull locales)
};
