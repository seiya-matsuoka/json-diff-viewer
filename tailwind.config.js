/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        diff: {
          added: "#e6ffed",
          removed: "#ffecec",
          changed: "#fff5cc",
          equal: "#f8fafc",
        },
      },
    },
  },
  plugins: [],
};
