import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { AppProvider } from "@/lib/store";
import { NavigationHeader } from "@/components/navigation-header";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/auth-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Mangako - Read Manga Online Free",
    template: "%s | Mangako"
  },
  description: "Read the latest manga chapters online for free. Discover thousands of manga series, webtoons, and comics. Updated daily with new releases.",
  keywords: ["manga", "read manga", "manga online", "free manga", "webtoon", "manhwa", "manhua", "comic", "japanese manga"],
  authors: [{ name: "Mangako" }],
  creator: "Mangako",
  publisher: "Mangako",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),

  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Mangako - Read Manga Online Free",
    description: "Read the latest manga chapters online for free. Discover thousands of manga series, webtoons, and comics.",
    siteName: "Mangako",
    images: [
      {
        url: "/mangako-logo.png",
        width: 1200,
        height: 630,
        alt: "Mangako - Read Manga Online"
      }
    ]
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Mangako - Read Manga Online Free",
    description: "Read the latest manga chapters online for free. Discover thousands of manga series, webtoons, and comics.",
    images: ["/mangako-logo.png"],
    creator: "@mangako"
  },

  // Additional SEO
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Icons
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png"
  },
  manifest: "/manifest.json"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AppProvider>
              <NavigationHeader />
              {children}
            </AppProvider>
          </AuthProvider>
        </ThemeProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
