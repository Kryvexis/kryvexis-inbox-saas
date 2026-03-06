import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kryvexis Showcase",
  description: "Kryvexis Inbox System for customer conversations, quotes, products, and team workflow."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
