import type { Metadata, Viewport } from "next";
import { Libre_Franklin, Playfair_Display } from "next/font/google";
import "./globals.css";

const libreFranklin = Libre_Franklin({
  variable: "--font-libre-franklin",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export const metadata: Metadata = {
  // NOTE: Most pages set their own explicit title. We intentionally avoid a title
  // template here because it can cause confusing tab titles (especially on Safari)
  // when combined with route-level <head.tsx> or page metadata.
  title: "Glyph Labs",
  description:
    "Glyph Labs is a studio for practical insight, building tools and frameworks that reveal patterns, simplify complexity, and improve decision-making.",
  applicationName: "Glyph Labs",
  icons: {
    // Cache-bust favicons aggressively (Chrome is notoriously sticky here).
    icon: [
      {
        url: "/favicon-32x32.png?v=6a82c6f",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/favicon-16x16.png?v=6a82c6f",
        sizes: "16x16",
        type: "image/png",
      },
      { url: "/favicon.ico?v=6a82c6f" },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png?v=6a82c6f",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Glyph Labs",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="theme-light" suppressHydrationWarning>
      <body
        className={`${libreFranklin.variable} ${playfairDisplay.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
