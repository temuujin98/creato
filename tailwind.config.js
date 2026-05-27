/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "Noto Sans",
          "Noto Sans Mongolian",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        ink: "#050505",
        smoke: "#111111",
        bone: "#f7f7f4",
        silver: "#a7a7a7",
        electric: "#7dd3fc",
        mint: "#9ef2c9",
      },
      boxShadow: {
        glow: "0 0 80px rgba(125, 211, 252, 0.16)",
      },
      backgroundImage: {
        "soft-grid":
          "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
