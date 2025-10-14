/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-blue': '#1e3a8a',
        'dark-blue-light': '#1e40af',
        'gold': '#fbbf24',
        'gold-dark': '#f59e0b',
      },
    },
  },
  plugins: [],
}

