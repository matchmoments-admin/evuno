import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0F',
        surface: {
          DEFAULT: '#111118',
          hover: '#1A1A24',
        },
        border: '#1E1E2E',
        text: {
          DEFAULT: '#E8E8F0',
          muted: '#6E6E8A',
        },
        accent: {
          DEFAULT: '#00E5A0',
          hover: '#00CC8E',
          muted: 'rgba(0, 229, 160, 0.1)',
        },
        danger: {
          DEFAULT: '#FF4444',
          muted: 'rgba(255, 68, 68, 0.1)',
        },
        warning: {
          DEFAULT: '#FFB800',
          muted: 'rgba(255, 184, 0, 0.1)',
        },
        info: {
          DEFAULT: '#3B82F6',
          muted: 'rgba(59, 130, 246, 0.1)',
        },
        // Charger status colors
        status: {
          available: '#00E5A0',
          charging: '#3B82F6',
          faulted: '#FF4444',
          offline: '#6E6E8A',
          reserved: '#FFB800',
        },
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['20px', { lineHeight: '28px' }],
        xl: ['24px', { lineHeight: '32px' }],
        '2xl': ['32px', { lineHeight: '40px' }],
        '3xl': ['48px', { lineHeight: '56px' }],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '12': '48px',
        '16': '64px',
        '24': '96px',
      },
      borderRadius: {
        dashboard: '6px',
        consumer: '8px',
      },
    },
  },
  plugins: [],
};

export default config;
