import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

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
        <ToastProvider>
          <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">✓</span>
                  </div>
                  <span className="text-xl font-semibold text-gray-900">StorePreflight</span>
                </a>
                <nav className="flex items-center gap-1 sm:gap-2">
                  <NavLink href="/dashboard">Dashboard</NavLink>
                  <NavLink href="/scan">Scan</NavLink>
                  <NavLink href="/guided">Guided</NavLink>
                  <NavLink href="/assets">Assets</NavLink>
                  <NavLink href="/export">Export</NavLink>
                </nav>
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="bg-gray-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </body>
    </html>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
    >
      {children}
    </a>
  );
}
