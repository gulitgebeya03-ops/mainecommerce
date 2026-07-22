/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: '#C8A97E',
        dark: '#111111',
        surface: '#FAFAFA',
        'border-light': '#E5E7EB',
        'text-primary': '#111111',
        'text-muted': '#6B7280',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', "'Segoe UI'", "'Helvetica Neue'", 'sans-serif'],
      },
    },
  },
  plugins: [],
}
