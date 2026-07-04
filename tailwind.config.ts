import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-poppins)", "sans-serif"],
      },
      colors: {
        brand: {
          blue: {
            DEFAULT: '#0E46A3',
            light: '#E0F4FF',
            dark: '#001C30',
          },
          orange: {
            DEFAULT: '#FF6C22',
            light: '#FFF7F1',
            dark: '#E25E1B',
          }
        }
      }
    },
  },
  plugins: [],
};
export default config;
