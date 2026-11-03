import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import Scenery from "@/components/scenery/Scenery";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amulung: Pot of Gold",
  description: "Clear the logs. Find your fortune! A sliding block puzzle set in Amulung, Cagayan.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#5fc3f0",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Scenery />
        {children}
      </body>
    </html>
  );
}
