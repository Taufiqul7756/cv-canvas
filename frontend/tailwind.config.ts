import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4F46E5',
          dark: '#4338CA',
          light: '#EEF2FF',
        },
        ink: {
          DEFAULT: '#0F172A',
          muted: '#64748B',
          subtle: '#94A3B8',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          2: '#F8FAFC',
        },
        line: {
          DEFAULT: '#E2E8F0',
          strong: '#CBD5E1',
        },
        accent: '#10B981',
        warn: '#F59E0B',
        danger: '#EF4444',
        'tag-template-bg': '#EEF2FF',
        'tag-template-text': '#4338CA',
        'tag-upload-bg': '#FFEDD5',
        'tag-upload-text': '#9A3412',
      },
      borderRadius: {
        card: '12px',
        chip: '9999px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
