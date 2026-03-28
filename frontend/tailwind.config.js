/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#fefcf4",
        error: "#be2d06",
        primary: "#b6353a",
        primary_container: "#ff7574",
        secondary: "#776300",
        secondary_container: "#fad538",
        tertiary: "#685b9c",
        tertiary_container: "#c3b4fc",
        on_primary_fixed: "#000000",
        surface: "#fefcf4",
        surface_container_low: "#fbf9f1",
        surface_container: "#f5f4eb",
        surface_container_highest: "#e9e9de"
      },
      fontFamily: {
        sans: ['"Space Grotesk"', "sans-serif"],
        display: ['"Space Grotesk"', "sans-serif"],
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px #000000',
        'brutal-hover': '8px 8px 0px 0px #000000',
      }
    },
  },
  plugins: [],
}
