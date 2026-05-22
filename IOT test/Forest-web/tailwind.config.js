/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#e8fff2',
          100: '#c4ffe0',
          200: '#8ef3bc',
          300: '#5ee495',
          400: '#31c86d',
          500: '#1aa650',
          600: '#118244',
          700: '#0f6337',
          800: '#0f4f2e',
          900: '#0a3620'
        },
        ember: {
          50: '#fff4eb',
          100: '#ffe3c8',
          200: '#ffbf85',
          300: '#ff9b4a',
          400: '#ff7a22',
          500: '#ff5b0f',
          600: '#e34207',
          700: '#bd3208',
          800: '#972a0d',
          900: '#68200e'
        },
        midnight: {
          900: '#030b09',
          850: '#071310',
          800: '#0b1713',
          700: '#10201b',
          600: '#172a24'
        }
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(94, 228, 149, 0.18), 0 20px 60px rgba(0, 0, 0, 0.45), 0 0 40px rgba(26, 166, 80, 0.18)',
        ember: '0 0 0 1px rgba(255, 122, 34, 0.16), 0 20px 50px rgba(0, 0, 0, 0.42), 0 0 30px rgba(255, 91, 15, 0.24)'
      },
      backgroundImage: {
        'radial-dots': 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)',
        'forest-glow': 'linear-gradient(135deg, rgba(15, 99, 55, 0.95), rgba(7, 19, 16, 0.95) 55%, rgba(125, 32, 14, 0.9))',
        'ember-glow': 'linear-gradient(135deg, rgba(255, 91, 15, 0.2), rgba(26, 166, 80, 0.14))'
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Sora', 'sans-serif']
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -12px, 0)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.65', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.08)' }
        },
        drift: {
          '0%': { transform: 'translate3d(-3%, -2%, 0)' },
          '50%': { transform: 'translate3d(3%, 4%, 0)' },
          '100%': { transform: 'translate3d(-3%, -2%, 0)' }
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2.4s ease-in-out infinite',
        drift: 'drift 16s ease-in-out infinite'
      }
    }
  },
  plugins: []
};