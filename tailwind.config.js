/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dce8ff',
          200: '#bfd4ff',
          300: '#93b4fd',
          400: '#5f8ff8',
          500: '#3b6ff0',
          600: 'var(--store-brand-600, #2554e8)',
          700: 'var(--store-brand-700, #1d42d4)',
          800: 'var(--store-brand-800, #1e36ab)',
          900: '#1e3187',
          950: '#141f52',
        },
        whatsapp: {
          DEFAULT: '#22c55e',
          dark: '#16a34a',
        },
        surface: '#f8fafc',
        ink: '#0f172a',
        muted: '#64748b',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.06)',
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 12px 32px rgba(15, 23, 42, 0.08)',
        elevated: '0 4px 6px rgba(15, 23, 42, 0.04), 0 24px 48px rgba(15, 23, 42, 0.12)',
        'glow-brand': '0 0 0 1px rgba(37, 84, 232, 0.08), 0 20px 40px rgba(37, 84, 232, 0.15)',
        'glow-green': '0 0 0 1px rgba(34, 197, 94, 0.12), 0 12px 28px rgba(34, 197, 94, 0.25)',
      },
      animation: {
        'pulse-soft': 'pulse-soft 2.5s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'offer-slide': 'offer-slide 0.45s ease-out',
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.45)' },
          '70%': { boxShadow: '0 0 0 14px rgba(34, 197, 94, 0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'offer-slide': {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
