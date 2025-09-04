import  React from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/theme-provider";
import { Suspense } from "react";
import "./globals.css";


export const metadata = {
  title: "UrbanEyes - Smart Travel & AR Navigation",
  description:
    "Discover the future of travel with intelligent route planning, real-time parking availability, and immersive AR landmark exploration.",
  keywords: [
    "navigation",
    "AR",
    "travel",
    "parking",
    "landmarks",
    "route planning",
  ],
  authors: [{ name: "UrbanEyes Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
            storageKey="UrbanEyes-theme"
          >
            {children}
          </ThemeProvider>
        </Suspense>
      </body>
    </html>
  );
}
