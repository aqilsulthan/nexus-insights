/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        sans: ['Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        brand: {
          blue: '#1B40A0',
          'blue-dark': '#0D2160',
          'blue-light': '#2563EB',
          navy: '#0A1628',
          accent: '#00B4D8',
        },
      },
    },
  },
  plugins: [],
}
