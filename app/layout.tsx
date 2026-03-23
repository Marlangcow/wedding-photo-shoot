import type { Metadata, Viewport } from "next";
import { Inter, Nanum_Myeongjo } from "next/font/google";
import "./globals.css";
import { FloatingHearts } from "@/components/floating-hearts";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const nanumMyeongjo = Nanum_Myeongjo({
  weight: ["400", "700", "800"],
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Wedding Photo Shoot",
  description: "Capture and share moments from our special day.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${nanumMyeongjo.variable} ${inter.variable} font-sans antialiased text-neutral-800 selection:bg-accent/20`}
      >
        <FloatingHearts />
        {children}
      </body>
    </html>
  );
}
