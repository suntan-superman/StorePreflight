export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-gray-500 mb-8">Last updated: December 26, 2025</p>

      <div className="prose prose-gray max-w-none">
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Overview</h2>
          <p className="text-gray-600 mb-4">
            StorePreflight is built with privacy as a core principle. We believe your code is your business, 
            and we've designed our service to keep it that way.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800 font-medium">
              🔒 Your code never leaves your computer. All scanning happens locally in your browser.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Information We Don't Collect</h2>
          <p className="text-gray-600 mb-4">
            StorePreflight does NOT collect, store, or transmit:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
            <li>Your source code or project files</li>
            <li>Your app.json, app.config.js, or package.json contents</li>
            <li>Your scan results or findings</li>
            <li>Your exported reports</li>
            <li>Any personally identifiable information from your projects</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">How Scanning Works</h2>
          <p className="text-gray-600 mb-4">
            When you use StorePreflight to scan your project:
          </p>
          <ol className="list-decimal list-inside text-gray-600 space-y-2 mb-4">
            <li>You select a folder using your browser's File System Access API</li>
            <li>The scanning JavaScript code runs entirely in your browser</li>
            <li>Results are stored in your browser's localStorage (on your device only)</li>
            <li>Exported reports are generated client-side and downloaded directly to your device</li>
          </ol>
          <p className="text-gray-600">
            No server-side processing occurs. No data is transmitted to our servers or any third party.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Information We May Collect</h2>
          <p className="text-gray-600 mb-4">
            Like most websites, we may collect basic analytics to improve the service:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
            <li><strong>Usage analytics:</strong> Page views, feature usage patterns (anonymized)</li>
            <li><strong>Technical information:</strong> Browser type, operating system, screen resolution</li>
            <li><strong>Error logs:</strong> JavaScript errors to help us fix bugs (no personal data)</li>
          </ul>
          <p className="text-gray-600">
            This data is aggregated and anonymized. It cannot be used to identify you or your projects.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Cookies</h2>
          <p className="text-gray-600 mb-4">
            StorePreflight uses minimal cookies:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
            <li><strong>Essential cookies:</strong> Required for the website to function</li>
            <li><strong>Preference cookies:</strong> Remember your settings (e.g., theme preference)</li>
          </ul>
          <p className="text-gray-600">
            We do not use advertising or tracking cookies.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Local Storage</h2>
          <p className="text-gray-600 mb-4">
            StorePreflight uses your browser's localStorage to store:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
            <li>Your scan history (up to 10 recent scans)</li>
            <li>Your current scan results</li>
            <li>App preferences and settings</li>
          </ul>
          <p className="text-gray-600">
            This data is stored only on your device and can be cleared at any time through your browser settings 
            or using the "Clear History" button in the Dashboard.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
          <p className="text-gray-600 mb-4">
            StorePreflight may use the following third-party services:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
            <li><strong>Hosting:</strong> Netlify or similar CDN providers for serving the web application</li>
            <li><strong>Analytics:</strong> Privacy-focused analytics (if implemented)</li>
          </ul>
          <p className="text-gray-600">
            These services have their own privacy policies. We choose providers that respect user privacy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Retention</h2>
          <p className="text-gray-600 mb-4">
            Since your scan data is stored locally in your browser:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4">
            <li>You control how long data is retained</li>
            <li>Clear your browser's localStorage to remove all scan history</li>
            <li>Use the Dashboard's "Clear History" feature for easy cleanup</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Children's Privacy</h2>
          <p className="text-gray-600">
            StorePreflight is designed for professional developers and is not intended for children under 13. 
            We do not knowingly collect information from children.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
          <p className="text-gray-600">
            We may update this privacy policy from time to time. We will notify users of any material changes 
            by posting the new policy on this page with an updated revision date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-600 mb-4">
            If you have questions about this privacy policy or our privacy practices, please contact us:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Email: <a href="mailto:privacy@worksidesoft.com" className="text-brand hover:underline">privacy@worksidesoft.com</a></li>
            <li>Contact form: <a href="/contact" className="text-brand hover:underline">Contact Us</a></li>
          </ul>
        </section>

        <section className="bg-gray-50 rounded-lg p-6">
          <p className="text-gray-600 text-sm">
            <strong>Workside Software LLC</strong><br />
            This privacy policy is effective as of December 26, 2025.
          </p>
        </section>
      </div>
    </div>
  );
}
