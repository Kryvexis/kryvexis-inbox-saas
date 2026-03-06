import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kryvexis Customer Operations",
  description: "Customer conversations, quotes, products, and workflows in one operational workspace."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
