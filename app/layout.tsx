import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ToastProvider } from "@/components/ui/use-toast";
import { WalletProvider } from "@/lib/wallet";
import { PresaleProvider } from "@/providers/provider";
import QueryProvider from "@/components/QueryProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { validateEnv } from "@/lib/config/env";

// Validate environment configuration on app startup
if (typeof window === 'undefined') {
  // Only validate on server-side to avoid hydration issues
  try {
    validateEnv();
  } catch (error) {
    console.error('Environment validation failed. Please check your .env.local file.');
  }
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
});

export const metadata: Metadata = {
  title: "USDT RAIN - Cryptocurrency Referral Platform",
  description: "Multi-level cryptocurrency referral platform with global pool rewards",
};

// create a singleton QueryClient at module scope (safe for this use)
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          rel="stylesheet"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body className={`${inter.variable} ${orbitron.variable} antialiased`}>
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/js/all.min.js"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          strategy="afterInteractive"
        />
        <Script
          id="fontawesome-config"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.FontAwesomeConfig = { autoReplaceSvg: 'nest' }`,
          }}
        />
        <ErrorBoundary>
          <QueryProvider>
            <ToastProvider>
              <WalletProvider>
                <PresaleProvider>
                  {children}
                </PresaleProvider>
              </WalletProvider>
            </ToastProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
