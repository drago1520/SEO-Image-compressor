/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}', // Ensure this matches your project structure
  ],
  corePlugins: {
    preflight: true,
  },
}

