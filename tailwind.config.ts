import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
        "3xl": "22px"
      },
      boxShadow: {
        soft: "0 12px 40px rgba(0,0,0,0.08)",
        soft2: "0 8px 24px rgba(0,0,0,0.10)"
      }
    },
  },
  plugins: [],
} satisfies Config;
