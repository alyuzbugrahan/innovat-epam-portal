import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb', // Blue-600
        'primary-dark': '#1e40af', // Blue-800
        'primary-light': '#3b82f6', // Blue-500
        secondary: '#64748b', // Slate-500
        'secondary-dark': '#475569', // Slate-700
        'secondary-light': '#94a3b8', // Slate-400
        success: '#16a34a', // Green-600
        'success-dark': '#15803d', // Green-700
        'success-light': '#4ade80', // Green-500
        warning: '#ea580c', // Orange-600
        'warning-dark': '#c2410c', // Orange-700
        'warning-light': '#fb923c', // Orange-400
        error: '#dc2626', // Red-600
        'error-dark': '#b91c1c', // Red-700
        'error-light': '#ef4444', // Red-500
        background: '#ffffff', // White
        surface: '#f8fafc', // Slate-50
        'surface-dark': '#f1f5f9', // Slate-100
        border: '#e2e8f0', // Slate-200
        'border-dark': '#cbd5e1', // Slate-300
        text: '#1e293b', // Slate-900
        'text-muted': '#64748b', // Slate-500
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
}

export default config
