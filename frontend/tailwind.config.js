/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Outfit"', 'system-ui', 'sans-serif'],
        body: ['"Manrope"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#002FA7',
          light: '#002FA710',
          hover: '#001D6C',
        },
      },
    },
  },
  plugins: [],
}
