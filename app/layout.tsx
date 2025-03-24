import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InkspireEditor – Minimalist Text Editor to Ignite Your Creativity",
  description:
    "Discover InkspireEditor, the sleek and intuitive text editor designed to spark creativity and streamline your writing process. Enjoy a distraction-free interface, powerful editing tools, and a seamless writing experience that lets your ideas flow effortlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
