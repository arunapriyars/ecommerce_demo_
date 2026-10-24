/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        vibe: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        character: {
          light: '#fef3c7',
          DEFAULT: '#f59e0b',
          dark: '#b45309'
        },
        study: {
          light: '#e0e7ff',
          DEFAULT: '#6366f1',
          dark: '#4338ca'
        },
        gym: {
          light: '#fee2e2',
          DEFAULT: '#ef4444',
          dark: '#b91c1c'
        },
        gamer: {
          light: '#fae8ff',
          DEFAULT: '#d946ef',
          dark: '#a21caf'
        },
        chill: {
          light: '#dcfce7',
          DEFAULT: '#10b981',
          dark: '#047857'
        },
        creative: {
          light: '#ffedd5',
          DEFAULT: '#f97316',
          dark: '#c2410c'
        }
      },
      boxShadow: {
        'vibe-sm': '0 2px 10px -2px rgba(124, 58, 237, 0.1)',
        'vibe': '0 10px 25px -5px rgba(124, 58, 237, 0.12), 0 8px 10px -6px rgba(124, 58, 237, 0.08)',
        'vibe-lg': '0 20px 35px -10px rgba(124, 58, 237, 0.2)',
        'vibe-glow': '0 0 25px rgba(139, 92, 246, 0.45)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem'
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-reverse': 'float-reverse 5s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'float-reverse': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
}
