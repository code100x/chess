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
        slate_legal: "#69708080"
      }
    },
  },
  plugins: [],
}