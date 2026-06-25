/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        unbounded: ['Unbounded', 'sans-serif'],
        sf: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      borderRadius: {
        11: '11px',
        54: '54px',
      },
      colors: {
        'vyrix-input': '#1e1e1e',
        'vyrix-label': '#e1e1e1',
        'vyrix-placeholder': '#c7c7c7',
        'vyrix-link-blue': '#b2c5f2',
        'vyrix-link-purple': '#92a9e1',
        'vyrix-border': 'rgba(71,67,126,0.54)',
        'vyrix-outline': '#6b6b6b',
        'vyrix-overlay': 'rgba(32,28,71,0.2)',
      },
    },
  },
  plugins: [],
}
