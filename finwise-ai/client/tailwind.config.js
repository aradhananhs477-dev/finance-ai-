/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        finwise: {
          navy: '#0B0F19',
          card: '#111827',
          cardHover: '#172033',
          border: '#1F2937',
          borderLight: '#374151',
          purple: '#8B5CF6',
          purpleDark: '#6D28D9',
          indigo: '#6366F1',
          cyan: '#06B6D4',
          emerald: '#10B981',
          rose: '#F43F5E',
          amber: '#F59E0B'
        }
      }
    },
  },
  plugins: [],
}
