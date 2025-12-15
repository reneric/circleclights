import type { Metadata, Viewport } from "next";
import { Crimson_Pro, Inter } from "next/font/google";
import "./globals.css";

const crimsonPro = Crimson_Pro({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://circleclights.vercel.app"),
  title: "🎄 Circle C Ranch Christmas Lights",
  description: "Discover and tour 43 decorated houses in Circle C Ranch! Build an optimized driving route from your location.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎄</text></svg>",
  },
  openGraph: {
    title: "🎄 Circle C Ranch Christmas Lights",
    description: "Discover and tour 43 decorated houses in Circle C Ranch! Build an optimized driving route from your location.",
    images: [
      {
        url: "/thumbnail.jpg",
        width: 1200,
        height: 630,
        alt: "Circle C Ranch Christmas Lights Map",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "🎄 Circle C Ranch Christmas Lights",
    description: "Discover and tour 43 decorated houses in Circle C Ranch!",
    images: ["/thumbnail.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${crimsonPro.variable} ${inter.variable} antialiased bg-[#0a0a0a]`}
      >
        {children}
      </body>
    </html>
  );
}
