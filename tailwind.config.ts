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
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out',
      },
      colors: {
        brand: {
          blue: {
            DEFAULT: '#0F9488',
            light: '#E6FFFA',
            dark: '#0F4C46',
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
  plugins: [
    // @tailwindcss/typography — provides the `prose` utility classes used in
    // article detail pages. Install with: npm install @tailwindcss/typography
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@tailwindcss/typography'),
  ],
};
export default config;
