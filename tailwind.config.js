/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#50DB7B',
          dark: '#3C4372',
        },
        secondary: {
          DEFAULT: '#3C4372',
          light: '#50DB7B',
        },
        background: {
          light: '#EDEEFF',
          dark: '#737497',
        },
        text: {
          light: '#737497',
          dark: '#EDEEFF',
        },
      },
    },
  },
  plugins: [],
}
