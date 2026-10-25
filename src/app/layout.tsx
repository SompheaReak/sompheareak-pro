import type { Metadata, Viewport } from "next";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import { SmoothScrollProvider } from "@/components/SmoothScrollProvider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  title: "Somphea Reak V2 • Cambodia Toy Wonderland & Charm Studio",
  description:
    "Discover legendary minifigures, viral mystery blind boxes, wall-climbing RC cars, and assemble your authentic custom Italian modular charm bracelets at Somphea Reak Studio. Fast delivery across Cambodia!",
  keywords: [
    "Somphea Reak",
    "សម្ភារៈ",
    "Toys Cambodia",
    "Minifigures",
    "Blind Box",
    "Italian Charm Bracelet",
    "Phnom Penh Toys",
    "Pop Mart",
    "Kids Toys",
  ],
  authors: [{ name: "Somphea Reak Studio" }],
  icons: {
    icon: "/assets/favicon.ico",
    apple: "/assets/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/assets/favicon.ico" sizes="any" />
      </head>
      <body className="antialiased selection:bg-toy-pink selection:text-white">
        <StoreProvider>
          <SmoothScrollProvider>
            {children}
          </SmoothScrollProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
