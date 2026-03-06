import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kryvexis Showcase",
  description: "Stable Vercel-ready SaaS showcase before API integration."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
