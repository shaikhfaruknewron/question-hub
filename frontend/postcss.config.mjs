/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Tailwind v4 ships its own PostCSS plugin and handles vendor prefixing itself.
    "@tailwindcss/postcss": {},
  },
};

export default config;
