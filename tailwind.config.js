/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        slate: {
            750: '#2d3342',
            850: '#1a202c',
            950: '#0d1117',
        }
      }
    },
  },
  plugins: [],
}
