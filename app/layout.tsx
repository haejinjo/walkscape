import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Walkscape",
  description:
    "Compare U.S. neighborhoods with plain-English walkability profiles built on the EPA National Walkability Index."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
