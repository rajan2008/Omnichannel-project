/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#2B2D42",
          gray: "#8D99AE",
          light: "#EDF2F4",
          red: "#EF233C",
          darkred: "#D90429",
        }
      }
    },
  },
  plugins: [],
}

