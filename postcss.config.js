export default {
  plugins: {
    // Tailwind v4: pass content globs here so the JIT scanner picks up classes in TSX/HTML
    '@tailwindcss/postcss': {
      content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
      ],
    },
    autoprefixer: {},
  },
}
