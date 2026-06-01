import type { Config } from 'tailwindcss'

// TrustGrid Design Token System
// Brand: Indigo (#4F46E5) + Teal (#0D9488)
// Philosophy: Authority (Indigo) + Community (Teal)

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', '"Geist Mono"', 'monospace'],
        display: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', 'sans-serif'],
      },

      colors: {
        // Brand primaries
        brand: {
          DEFAULT: '#4F46E5',
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',  // ← primary
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
        },
        // Brand teal (community)
        teal: {
          DEFAULT: '#0D9488',
          50:  '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',  // ← primary teal
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        // Canvas/background tokens
        canvas: '#F8FAFC',
        surface: '#FFFFFF',

        // Trust semantic colours
        trust: {
          verified:    '#059669',
          partial:     '#0D9488',
          endorsed:    '#4F46E5',
          pending:     '#D97706',
          unverified:  '#64748B',
          incident:    '#E11D48',
        },
      },

      backgroundImage: {
        'brand-gradient':   'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
        'brand-gradient-v': 'linear-gradient(180deg, #4F46E5 0%, #0D9488 100%)',
        'trust-gradient':   'linear-gradient(135deg, #059669 0%, #0D9488 100%)',
        'hero-gradient':    'linear-gradient(135deg, #4F46E5 0%, #0D9488 100%)',
        'dot-pattern':      'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.06) 1px, transparent 0)',
      },

      borderRadius: {
        xs:  '4px',
        sm:  '8px',
        md:  '12px',
        lg:  '16px',
        xl:  '20px',
        '2xl': '24px',
        '3xl': '32px',
      },

      boxShadow: {
        brand:    '0 8px 24px rgba(79,70,229,0.18)',
        'brand-lg': '0 16px 48px rgba(79,70,229,0.24)',
        trust:    '0 8px 24px rgba(5,150,105,0.15)',
        card:     '0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.05)',
        'card-hover': '0 4px 16px rgba(0,0,0,0.10)',
        passport: '0 20px 60px rgba(15,23,42,0.15)',
      },

      animation: {
        'trust-pulse': 'trust-pulse 2.5s cubic-bezier(.4,0,.6,1) infinite',
        'score-in':    'score-in 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'fade-up':     'fade-up 0.4s ease forwards',
        'slide-in':    'slide-in 0.3s ease forwards',
      },

      keyframes: {
        'trust-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':       { opacity: '0.4', transform: 'scale(1.08)' },
        },
        'score-in': {
          from: { opacity: '0', transform: 'scale(0.8)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(-8px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
      },

      letterSpacing: {
        tight:   '-0.02em',
        tighter: '-0.03em',
        display: '-0.04em',
      },
    },
  },
  plugins: [],
}

export default config
