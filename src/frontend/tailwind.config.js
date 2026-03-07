import typography from '@tailwindcss/typography';
import containerQueries from '@tailwindcss/container-queries';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['index.html', 'src/**/*.{js,ts,jsx,tsx,html,css}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'oklch(var(--border))',
        input: 'oklch(var(--input))',
        ring: 'oklch(var(--ring) / <alpha-value>)',
        background: 'oklch(var(--background))',
        foreground: 'oklch(var(--foreground))',
        primary: {
          DEFAULT: 'oklch(var(--primary) / <alpha-value>)',
          foreground: 'oklch(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'oklch(var(--secondary) / <alpha-value>)',
          foreground: 'oklch(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'oklch(var(--destructive) / <alpha-value>)',
          foreground: 'oklch(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'oklch(var(--muted) / <alpha-value>)',
          foreground: 'oklch(var(--muted-foreground) / <alpha-value>)'
        },
        accent: {
          DEFAULT: 'oklch(var(--accent) / <alpha-value>)',
          foreground: 'oklch(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'oklch(var(--popover))',
          foreground: 'oklch(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'oklch(var(--card))',
          foreground: 'oklch(var(--card-foreground))'
        },
        chart: {
          1: 'oklch(var(--chart-1))',
          2: 'oklch(var(--chart-2))',
          3: 'oklch(var(--chart-3))',
          4: 'oklch(var(--chart-4))',
          5: 'oklch(var(--chart-5))'
        },
        /* Engagement custom colors */
        blush: 'oklch(var(--blush))',
        'rose-gold': 'oklch(var(--rose-gold))',
        ivory: 'oklch(var(--ivory))',
        wine: 'oklch(var(--wine))',
        gold: 'oklch(var(--gold))',
        petal: 'oklch(var(--petal))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
        '3xl': '2rem',
      },
      fontFamily: {
        sans: ['Crimson Pro', 'Georgia', 'serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
        'instrument': ['Instrument Serif', 'Georgia', 'serif'],
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0,0,0,0.05)',
        soft: '0 4px 16px -4px rgba(180, 80, 80, 0.12)',
        romantic: '0 8px 32px -8px rgba(180, 60, 60, 0.18), 0 2px 8px -2px rgba(180, 60, 60, 0.08)',
        'gold-glow': '0 0 24px -4px rgba(180, 140, 40, 0.30)',
        'petal-glow': '0 8px 40px -8px rgba(200, 80, 100, 0.20)',
        card: '0 2px 24px -4px rgba(180, 80, 80, 0.10), 0 1px 4px -1px rgba(0,0,0,0.04)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        },
        'heart-float': {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0.8' },
          '50%': { transform: 'translateY(-20px) scale(1.1)', opacity: '1' },
          '100%': { transform: 'translateY(-40px) scale(0.9)', opacity: '0' },
        },
        'drift': {
          '0%': { transform: 'translateX(0) translateY(0)' },
          '33%': { transform: 'translateX(8px) translateY(-8px)' },
          '66%': { transform: 'translateX(-6px) translateY(-4px)' },
          '100%': { transform: 'translateX(0) translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'heart-float': 'heart-float 3s ease-in-out infinite',
        'drift': 'drift 6s ease-in-out infinite',
      }
    }
  },
  plugins: [typography, containerQueries, animate]
};
