/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#534AB7',
          light: '#6B63C9',
          dark: '#3D3589'
        },
        surface: {
          DEFAULT: '#1a1a2e',
          card: '#16213e',
          border: '#2a2a4a'
        }
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif']
      }
    }
  },
  plugins: []
}
