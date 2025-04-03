/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'himalia': '#db0202',
        'accent': '#e74c3c',
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ship-flight': 'shipFlight 2s linear infinite',
      },
      keyframes: {
        shipFlight: {
          '0%': { transform: 'translateX(-100%) translateY(-50%)' },
          '100%': { transform: 'translateX(100%) translateY(-50%)' }
        }
      }
    },
  },
  plugins: [],
};