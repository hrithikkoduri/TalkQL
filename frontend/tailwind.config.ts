import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      perspective: {
        '3d': '1000px',
      },
      transformStyle: {
        '3d': 'preserve-3d',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      maxWidth: {
        '8xl': '88rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-in': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' }
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'slide-in': 'slide-in 0.5s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      transitionProperty: {
        'filter': 'filter',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      typography: {
        DEFAULT: {
          css: {
            strong: {
              fontWeight: '600',
              color: '#1F2937',
            },
            maxWidth: 'none',
            color: '#334155',
            hr: {
              borderColor: '#E2E8F0',
              marginTop: '2rem',
              marginBottom: '2rem',
            },
            'h1, h2, h3, h4': {
              color: '#1E293B',
              fontWeight: '600',
            },
            pre: {
              padding: '1rem',
              background: 'rgb(249 250 251)',
              borderRadius: '0.5rem',
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
            },
            code: {
              color: '#2563eb',
              fontWeight: '500',
              '&::before': {
                content: '""',
              },
              '&::after': {
                content: '""',
              },
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            'blockquote p:first-of-type::before': {
              content: '""',
            },
            'blockquote p:last-of-type::after': {
              content: '""',
            },
            table: {
              fontSize: '0.875rem',
              lineHeight: '1.25rem',
            },
            thead: {
              borderBottomColor: '#CBD5E1',
            },
            'thead th': {
              color: '#475569',
              fontWeight: '600',
              borderBottom: '2px solid #E2E8F0',
            },
            'tbody tr': {
              borderBottomColor: '#E2E8F0',
            },
            'tbody td': {
              padding: '0.75rem 1rem',
            },
          },
        },
        sm: {
          css: {
            fontSize: '0.875rem',
            lineHeight: '1.5rem',
            h1: {
              fontSize: '1.875rem',
              lineHeight: '2.25rem',
            },
            h2: {
              fontSize: '1.5rem',
              lineHeight: '2rem',
            },
            h3: {
              fontSize: '1.25rem',
              lineHeight: '1.75rem',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

export default config