import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#4F46E5', 600: '#4F46E5', 700: '#4338CA' },
        teal:  { DEFAULT: '#0D9488', 600: '#0D9488' },
      },
      fontFamily: {
        sans:    ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #4F46E5 0%, #0D9488 100%)',
      },
    },
  },
  plugins: [],
}

export default config
