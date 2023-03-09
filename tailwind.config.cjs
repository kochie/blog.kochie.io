module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './public/articles/**/*.mdx',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // or 'media' or 'class'
  theme: {
    extend: {
      transitionDelay: {
        0: '0ms',
      },
      animation: {
        wiggle: 'wiggle 0.2s ease-in-out 5',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-in': 'bounce-in 0.5s ease-in-out both',
        'bounce-out': 'bounce-out 0.5s ease-in-out both',
        'bounce-orig': 'bounceOrig 1s linear infinite',
      },
      keyframes: {
        bounceOrig: {
          '0%': {
            transform: 'translateY(0)',
            // 'animation-timing-function': 'cubic-bezier(0,0,0.2,1)',
          },
          '25%': {
            transform: 'translateY(5%)',
            // 'animation-timing-function': 'cubic-bezier(0,0,0.2,1)',
          },
          '50%': {
            transform: 'translateY(0)',
            // 'animation-timing-function': 'cubic-bezier(0.8,0,1,1)',
          },
          '75%': {
            transform: 'translateY(-5%)',
            // 'animation-timing-function': 'cubic-bezier(0.8,0,1,1)',
          },
          '100%': {
            transform: 'translateY(0)',
            // 'animation-timing-function': 'cubic-bezier(0.8,0,1,1)',
          },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-5deg)' },
          '50%': { transform: 'rotate(5deg)' },
        },
        'bounce-in': {
          from: {
            opacity: 0,
          },
          '0%': {
            opacity: 0,
            transform: 'scale3d(0.3, 0.3, 0.3)',
          },
          '20%': {
            transform: 'scale3d(1.1, 1.1, 1.1)',
          },
          '40%': {
            transform: 'scale3d(0.9, 0.9, 0.9)',
          },
          '60%': {
            opacity: 1,
            transform: 'scale3d(1.03, 1.03, 1.03)',
          },
          '80%': {
            transform: 'scale3d(0.97, 0.97, 0.97)',
          },
          to: {
            opacity: 1,
            transform: 'scale3d(1, 1, 1)',
          },
        },
        'bounce-out': {
          from: {
            opacity: 1,
          },
          '20%': {
            transform: 'scale3d(0.9, 0.9, 0.9)',
          },
          '55%': {
            opacity: 1,
            transform: 'scale3d(1.1, 1.1, 1.1)',
          },
          to: {
            opacity: 0,
            transform: 'scale3d(0.3, 0.3, 0.3)',
          },
        },
      },
    },
  },
  plugins: [],
}
