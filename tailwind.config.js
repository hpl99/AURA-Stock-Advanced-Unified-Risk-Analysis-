/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: '#101010',
        'neon-cyan': '#00e5ff',
        'neon-gold': '#ffbe0b',
        'neon-purple': '#8338ec',
      },
    },
  },
  plugins: [],
}
