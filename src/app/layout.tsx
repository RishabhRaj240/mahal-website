import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Cinzel, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MAHAL — The Sovereign Residence | An Interactive Cinematic Odyssey",
  description: "An architectural marvel sculpted between stone and sky. Experience the 80-second cinematic scroll journey through the world's most exclusive royal palace.",
  keywords: ["Mahal", "Luxury Residence", "Cinematic Architecture", "Royal Palace", "High Jewelry Real Estate"],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png" },
    ],
  },
  openGraph: {
    title: "MAHAL — The Sovereign Residence",
    description: "An architectural masterpiece at the edge of sky.",
    type: "website",
    images: ["/logo.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#060608",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${cinzel.variable} ${jakarta.variable} bg-[#060608] text-[#F9F8F5] antialiased selection:bg-[#D4AF37]/30 selection:text-[#FFF]`}
    >
      <body className="min-h-screen bg-[#060608] text-[#F9F8F5] overflow-x-hidden font-sans">
        {children}
      </body>
    </html>
  );
}
