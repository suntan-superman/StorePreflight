import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { IdentityProvider } from "@/context/IdentityContext";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "StorePreflight - App Store & Play Console Scanner",
  description: "Know what Apple and Google will ask before you submit. Preflight your mobile app against App Store Connect and Google Play Console requirements.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <IdentityProvider>
          <ToastProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="bg-gray-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Trust Statement */}
              <div className="text-center mb-6 pb-6 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-700">
                  {"\uD83D\uDD12"} Local-first. Intent-aware. No surprises.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Your workflow, your data, your call.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-gray-500 text-sm">
                  © 2025 Workside Software LLC. All rights reserved.
                </p>
                <nav className="flex items-center gap-4 text-sm">
                  <a href="/faq" className="text-gray-500 hover:text-gray-700">FAQ</a>
                  <a href="/support" className="text-gray-500 hover:text-gray-700">Support</a>
                  <a href="/contact" className="text-gray-500 hover:text-gray-700">Contact</a>
                  <a href="/privacy" className="text-gray-500 hover:text-gray-700">Privacy</a>
                </nav>
              </div>
            </div>
          </footer>
          </ToastProvider>
        </IdentityProvider>
      </body>
    </html>
  );
}
