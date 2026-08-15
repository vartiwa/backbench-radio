import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://backbench-radio.vercel.app";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: "Backbench Radio — for the quiet ones",
  description:
    "A radio for the back row. Slow indie and acoustic songs for empty classrooms, rainy corridors, and the last bell — flip to Hip Hop mode for something louder.",
  keywords: ["backbench radio", "indie music", "lo-fi", "study music", "hip hop", "desi rap", "chill playlist"],
  authors: [{ name: "Backbench Radio" }],
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Backbench Radio — for the quiet ones",
    description:
      "A radio for the back row. Slow indie and acoustic songs for empty classrooms, rainy corridors, and the last bell.",
    siteName: "Backbench Radio",
    images: [
      {
        url: "/bg/logo.png",
        width: 1200,
        height: 630,
        alt: "Backbench Radio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Backbench Radio — for the quiet ones",
    description:
      "A radio for the back row. Slow indie and acoustic songs for empty classrooms, rainy corridors, and the last bell.",
    images: ["/bg/logo.png"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/bg/logo.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#12141c",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&family=Newsreader:ital,opsz,wght@1,6..72,400;1,6..72,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
