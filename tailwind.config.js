/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'pflx-dark': '#0a0e17',
        'pflx-darker': '#060a12',
        'pflx-cyan': '#00e5ff',
        'pflx-teal': '#00bcd4',
        'pflx-purple': '#7c4dff',
        'pflx-magenta': '#e040fb',
        'pflx-gold': '#ffd740',
        'pflx-red': '#ff1744',
        'pflx-green': '#00e676',
        'pflx-blue': '#2979ff',
        'pflx-panel': 'rgba(10, 14, 23, 0.85)',
        'pflx-glass': 'rgba(0, 229, 255, 0.08)',
      },
      fontFamily: {
        mono: ['Orbitron', 'JetBrains Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'cyan-glow': '0 0 20px rgba(0, 229, 255, 0.3), 0 0 60px rgba(0, 229, 255, 0.1)',
        'purple-glow': '0 0 20px rgba(124, 77, 255, 0.3), 0 0 60px rgba(124, 77, 255, 0.1)',
        'red-glow': '0 0 20px rgba(255, 23, 68, 0.4), 0 0 60px rgba(255, 23, 68, 0.15)',
        'gold-glow': '0 0 20px rgba(255, 215, 64, 0.3), 0 0 60px rgba(255, 215, 64, 0.1)',
      },
      animation: {
        'pulse-cyan': 'pulseCyan 2s ease-in-out infinite',
        'scan-line': 'scanLine 3s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'float': 'float 6s ease-in-out infinite',
        'battle-shake': 'battleShake 0.5s ease-in-out',
      },
      keyframes: {
        pulseCyan: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 229, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 229, 255, 0.6), 0 0 80px rgba(0, 229, 255, 0.2)' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        battleShake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
      },
    },
  },
  plugins: [],
};
