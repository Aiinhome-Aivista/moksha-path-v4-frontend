/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        saffron: '#E76F20',
        'saffron-soft': '#F6B93B',
        'saffron-tint': '#FBEBD7',
        indigo: {
          DEFAULT: '#1E2749',
          soft: '#2B3A67',
        },
        gold: '#D4A017',
        cream: {
          DEFAULT: '#FAF6EC',
          2: '#F3ECD9',
        },
        ink: '#15182A',
        muted: '#5C6178',
        line: '#E6DFCB',
      },
      fontFamily: {
        display: ['Fraunces', 'Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        devanagari: ['Noto Serif Devanagari', 'Fraunces', 'serif'],
      },
      borderRadius: {
        sm: '10px',
        md: '16px',
        lg: '24px',
        xl: '36px',
      },
      boxShadow: {
        sm: '0 2px 8px rgba(30,39,73,0.06)',
        md: '0 10px 30px rgba(30,39,73,0.10)',
        lg: '0 30px 60px rgba(30,39,73,0.14)',
      },
    },
  },
  plugins: [],
};
