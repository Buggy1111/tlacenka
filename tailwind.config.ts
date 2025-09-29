import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        'onyx': '#0B0F14',
        'deep-blue': '#0D1B2A',
        'gold': {
          DEFAULT: '#C6A15B',
          light: '#E3C988',
          dark: '#A68847',
        },
        'glass': {
          white: 'rgba(255, 255, 255, 0.06)',
          border: 'rgba(255, 255, 255, 0.1)',
        }
      },
      fontFamily: {
        'serif': ['Playfair Display', 'serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.2s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
      },
      keyframes: {
        glow: {
          '0%, 100%': {
            boxShadow: '0 10px 40px rgba(198, 161, 91, 0.3)',
          },
          '50%': {
            boxShadow: '0 20px 60px rgba(198, 161, 91, 0.5)',
          }
        },
        slideUp: {
          '0%': {
            transform: 'translateY(20px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          }
        },
        scaleIn: {
          '0%': {
            transform: 'scale(0.95)',
            opacity: '0',
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1',
          }
        }
      },
      backdropBlur: {
        'xl': '20px',
      },
      boxShadow: {
        'gold': '0 10px 40px rgba(198, 161, 91, 0.15)',
        'gold-lg': '0 20px 60px rgba(198, 161, 91, 0.25)',
      }
    },
  },
  plugins: [],
}

export default config