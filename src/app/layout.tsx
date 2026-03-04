import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kryvexis Inbox",
  description: "Apple-clean team inbox SaaS for customer messaging.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
