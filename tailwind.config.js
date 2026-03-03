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
          50: '#e6f3ff',
          100: '#b3d9ff',
          200: '#80bfff',
          300: '#4da6ff',
          400: '#1a8cff',
          500: '#007acc',
          600: '#006bb3',
          700: '#005c99',
          800: '#004d80',
          900: '#003d66',
        },
        vs: {
          bg: '#1e1e1e',
          sidebar: '#252526',
          activitybar: '#333333',
          titlebar: '#323233',
          accent: '#007acc',
          text: '#d4d4d4',
          'text-secondary': '#858585',
          border: '#3c3c3c',
          hover: '#2a2d2e',
          success: '#4ec9b0',
          warning: '#dcdcaa',
          error: '#f44747',
          info: '#569cd6',
          string: '#ce9178',
          keyword: '#c586c0',
          'light-bg': '#ffffff',
          'light-sidebar': '#f3f3f3',
          'light-titlebar': '#dddddd',
          'light-text': '#1e1e1e',
          'light-border': '#e5e5e5',
        },
      },
      fontFamily: {
        sans: ['Segoe UI', '-apple-system', 'BlinkMacSystemFont', 'Roboto', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0, 0, 0, 0.05)',
        'medium': '0 2px 6px rgba(0, 0, 0, 0.08)',
        'strong': '0 4px 12px rgba(0, 0, 0, 0.10)',
      }
    },
  },
  plugins: [],
}
