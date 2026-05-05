/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        panel: '#0f172a',
        'panel-light': '#1e293b',
        accent: '#3b82f6',
        'accent-hover': '#2563eb',
        'canvas-bg': '#f1f5f9',
        'border-dark': '#334155',
        va: '#22c55e',
        nva: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
