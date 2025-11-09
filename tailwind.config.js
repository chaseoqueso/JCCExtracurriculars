// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#2b2d83',
        'primary-hover': '#434486ff',
        'secondary': '#eb6c6b',
        'secondary-hover': '#e29393ff',
      }
    },
  },
  plugins: [],
}
