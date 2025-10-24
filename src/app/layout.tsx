import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AILocationMiddlewareProvider } from "@/middleware/aiLocationMiddlewareInit";

const inter = Inter({ subsets: ["latin"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ClimaSense AI - Intelligent Weather Assistant",
  description: "AI-powered weather forecasting with real-time data, predictive analytics, and intelligent insights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${geistMono.className} antialiased`}>
        <AILocationMiddlewareProvider>
          {children}
        </AILocationMiddlewareProvider>
      </body>
    </html>
  );
}
