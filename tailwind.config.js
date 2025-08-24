/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f2f7ff',
          100: '#e6efff',
          200: '#cde0ff',
          300: '#9ec2ff',
          400: '#6da3ff',
          500: '#3a7bff',   // primary
          600: '#2e63d6',
          700: '#234bad',
          800: '#193783',
          900: '#112864',
        },
      },
      boxShadow: {
        card: '0 8px 24px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
