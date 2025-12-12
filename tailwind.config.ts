import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        sand: {
          light: '#fdf8f1',
          dark: '#e6d5c0'
        },
        accent: {
          coral: '#ff8252',
          moss: '#646a24',
          sage: '#919668'
        }
      },
      fontFamily: {
        body: ['Geist', 'Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;
