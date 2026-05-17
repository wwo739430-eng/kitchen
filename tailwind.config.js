/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#88a86b",
        "soft-pink": "#fce4ec",
        "sky-blue": "#e3f2fd",
        "background-light": "#fdfdfb",
        "background-dark": "#191c16",
      },
      fontFamily: {
        sans: ["PingFang SC", "Lantinghei SC", "Microsoft YaHei", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "1.5rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px",
      },
    },
  },
}
