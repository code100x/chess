/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        green_legal: "#24B48E80",
        slate_legal: "#69708080",
        brown: {
          500: "#262422",
          600: "#302e2b"
        },
        green: {
          300: "#82b34e",
          600: "#759353"
        },
        gray: {
          300: "#797977"
        }
      }
    },
  },
  plugins: [],
}