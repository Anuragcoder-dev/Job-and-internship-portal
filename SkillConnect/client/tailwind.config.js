/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // "Ink & Amber" design system - built around the match-ring signature
        paper: '#F6F4EF',
        ink: {
          DEFAULT: '#12312B',
          50: '#EEF3F1',
          100: '#D3E0DB',
          200: '#A6C1B7',
          400: '#4B776A',
          600: '#2A4E45',
          800: '#183932',
          900: '#0D211D'
        },
        amber: {
          DEFAULT: '#D6A419',
          50: '#FBF3DD',
          100: '#F5E4AF',
          400: '#E0B935',
          600: '#B8860F',
          700: '#8F6A0C'
        },
        teal: {
          DEFAULT: '#2F6F63'
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace']
      },
      borderRadius: {
        card: '14px'
      },
      boxShadow: {
        card: '0 1px 2px rgba(18,49,43,0.06), 0 8px 24px rgba(18,49,43,0.06)'
      }
    }
  },
  plugins: []
};
