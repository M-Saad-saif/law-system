/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary teal from your palette: #027f7e
        primary: {
          50: '#e6f5f5',
          100: '#ccebeb',
          200: '#99d6d6',
          300: '#66c2c2',
          400: '#33adad',
          500: '#027f7e',      // Main teal color
          600: '#026665',
          700: '#014c4b',
          800: '#013332',
          900: '#001919',
          950: '#000d0d',
        },
        // Secondary navy blue from your palette: #103168
        secondary: {
          50: '#e8edf5',
          100: '#d0dbeb',
          200: '#a2b7d6',
          300: '#7393c2',
          400: '#456fad',
          500: '#103168',      // Main navy blue
          600: '#0d2753',
          700: '#0a1d3e',
          800: '#06142a',
          900: '#030a15',
          950: '#01050b',
        },
        // White and black tones
        white: '#ffffff',
        black: '#000000',
        // Neutral grays for backgrounds and text (balanced with beige/warm undertone)
        neutral: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
          950: '#0c0a09',
        },
        // Surface colors using the palette
        surface: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          800: '#1c1917',
          900: '#0c0a09',
          950: '#050505',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        glow: '0 0 20px rgba(2,127,126,0.15)',     // Updated to teal glow
        'glow-navy': '0 0 20px rgba(16,49,104,0.15)', // Navy glow option
      },
    },
  },
  plugins: [],
};