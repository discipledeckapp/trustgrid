/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        admin: { 900: '#0f172a', 800: '#1e293b', 700: '#334155', 100: '#f1f5f9' },
      },
    },
  },
  plugins: [],
}
