/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0B0E13',
          secondary: '#121720',
          surface: '#171F2B',
          surfaceHover: '#1F2A3A',
        },
        accent: {
          primary: '#79B8FF',
          secondary: '#A5B9D1',
          hover: '#93C5FD',
        },
        status: {
          success: '#67C99A',
          warning: '#E9B96A',
          danger: '#E87575',
          info: '#79B8FF',
        },
        text: {
          primary: '#F5F7FA',
          secondary: '#A1ACBA',
          muted: '#6B7A90',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
