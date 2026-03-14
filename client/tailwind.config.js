/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e7ff',
          500: '#667eea',
          600: '#5a67d8',
          700: '#4c51bf',
        },
        secondary: {
          500: '#764ba2',
          600: '#6b46c1',
        },
        background: '#ffffff',
        foreground: '#1f2937',
        border: '#e5e7eb',
        ring: '#667eea',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}