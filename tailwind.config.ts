import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        soil: {
          950: "#07131F",
          900: "#0F2234",
          800: "#193A4F",
          700: "#234F67",
        },
        parchment: {
          DEFAULT: "#EAF4FF",
          dim: "#D3E2F2",
        },
        sprout: {
          DEFAULT: "#4F7FB0",
          dark: "#355C85",
          light: "#87B4DF",
        },
        harvest: {
          DEFAULT: "#5FA8FF",
          dark: "#3C84D9",
          light: "#9FD1FF",
        },
        dusk: {
          DEFAULT: "#4A7EA7",
          dark: "#2F5D83",
        },
        clay: {
          DEFAULT: "#C56E6E",
          dark: "#9C5252",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "4px",
        md: "6px",
        lg: "10px",
      },
    },
  },
  plugins: [],
};

export default config;
