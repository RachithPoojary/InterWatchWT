export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      { light: { "primary": "#3b82f6", "secondary": "#8b5cf6", "accent": "#06b6d4", "base-100": "#ffffff" } },
      { dark: { "primary": "#3b82f6", "secondary": "#8b5cf6", "accent": "#06b6d4", "base-100": "#1f2937" } },
    ],
  },
}
