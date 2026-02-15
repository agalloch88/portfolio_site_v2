import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#1a1b26",
        charcoal: "#24283b",
        steel: "#565f89",
        electricBlue: "#2ac3de",
        cyberTeal: "#1abc9c",
        lightGray: "#c0caf5",
        mutedGray: "#9aa5ce",
        successGreen: "#9ece6a",
        errorRed: "#f7768e",
        warningOrange: "#ff9500",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
