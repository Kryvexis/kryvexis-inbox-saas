import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kryvexis Inbox System",
  description: "Customer conversations, quotes, and team follow-up in one Meta-ready workspace.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
