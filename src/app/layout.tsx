import type { Metadata } from "next";
import "reflect-metadata";
import "./globals.css";
import { AppProviders } from "@/components/layout/AppProviders";

export const metadata: Metadata = {
  title: "Financial Tracker",
  description: "Production-ready financial tracking system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
