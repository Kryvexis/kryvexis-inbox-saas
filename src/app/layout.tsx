import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kryvexis Inbox System",
  description: "A calm workspace for customer conversations, quotes, products, and team follow-up.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
