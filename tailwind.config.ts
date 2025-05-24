// tailwind.config.ts
import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

export default {
  content: ['./src/**/*.{ts,tsx,md,mdx}'],
  darkMode: 'media',                 // or 'class'
  theme: { extend: {} },
  plugins: [typography],
} satisfies Config