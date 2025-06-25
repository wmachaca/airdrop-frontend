/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // Scan all files in src for class names
  ],
  theme: {
    extend: {
      colors: {
        background: '#0D1117',
        foreground: '#E6EDF3',
        muted: '#161B22',
        primary: '#3B82F6',
        card: '#161B22',
      },
      fontFamily: {
        sans: ['InterVariable', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
