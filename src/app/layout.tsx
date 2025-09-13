import type { Metadata } from "next";
import "./globals.css";
import ClientOnlyPWA from "@/components/ClientOnlyPWA";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Sabores de Zissou - Confeitaria Artesanal",
  description: "Os mais deliciosos doces artesanais, feitos com amor e ingredientes selecionados. Produtos do dia e sob encomenda.",
  keywords: "confeitaria, doces, bolos, tortas, sobremesas, artesanal",
  authors: [{ name: "Sabores de Zissou" }],
  creator: "Sabores de Zissou",
  publisher: "Sabores de Zissou",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192x192.png",
    shortcut: "/favicon.ico",
    apple: "/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sabores de Zissou",
  },
};

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    themeColor: '#ec4899',
    viewportFit: 'cover'
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Sabores de Zissou" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#ec4899" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className="bg-pastel-vanilla min-h-screen">
        <AuthProvider>
          <ClientOnlyPWA />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}