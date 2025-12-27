import type { Metadata } from "next";
import "./globals.css";

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
      <body className="min-h-screen">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">✓</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">StorePreflight</span>
              </div>
              <nav className="flex items-center gap-6">
                <a href="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                  Home
                </a>
                <a href="/scan" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                  Scan
                </a>
                <a href="/assets" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                  Assets
                </a>
              </nav>
            </div>
          </div>
        </header>
        <main>{children}</main>
        <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <p className="text-center text-gray-500 text-sm">
              © {new Date().getFullYear()} StorePreflight. Built for developers who hate surprises.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
