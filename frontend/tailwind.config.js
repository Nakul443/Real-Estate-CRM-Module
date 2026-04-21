/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Mapping your custom variables to Tailwind names
        brand: {
          primary: 'var(--accent)',
          text: 'var(--text-h)',
          bg: 'var(--bg)',
        }
      },
    },
  },
  plugins: [],
}