import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Selasar Bahasa",
  description: "Platform belajar bahasa online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`antialiased`}>
        {children}
      </body>
    </html>
  );
}
