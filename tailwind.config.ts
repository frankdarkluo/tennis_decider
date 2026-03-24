import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#effcfa",
          100: "#d7f7f2",
          200: "#b1efe4",
          300: "#7fe2d2",
          400: "#49ccb8",
          500: "#2bb09f",
          600: "#1f8d81",
          700: "#1d7068",
          800: "#1d5954",
          900: "#1d4a46"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(13, 51, 61, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
