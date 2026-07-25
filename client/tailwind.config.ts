import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0f1d",
        panel: "#121a2d",
        accent: {
          cyan: "#00f2ff",
          amber: "#ffb703",
          red: "#ff2e63",
          green: "#00e676",
        },
      },
    },
  },
  plugins: [],
};
export default config;
