import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "@radix-ui/themes/styles.css";
import "@terrazzo/tokens/index.css";
import "@terrazzo/tiles/dist/all-components.css";
import "@terrazzo/react-color-picker/dist/styles.css";
import "./globals.css";

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono"
});

export const metadata: Metadata = {
  title: "ephemeral",
  description: "Inspect and organize CSS design tokens in a three-column workspace."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geistMono.variable}>{children}</body>
    </html>
  );
}
