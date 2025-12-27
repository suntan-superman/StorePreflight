import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Support</h1>
      <p className="text-gray-600 mb-8">
        We're here to help you get the most out of StorePreflight.
      </p>

      {/* Quick Help */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <SupportCard
          icon="📖"
          title="Documentation"
          description="Learn how to use StorePreflight effectively with our guides and tutorials."
          linkText="View FAQ"
          linkHref="/faq"
        />
        <SupportCard
          icon="💬"
          title="Contact Us"
          description="Can't find what you're looking for? Send us a message and we'll help."
          linkText="Get in Touch"
          linkHref="/contact"
        />
        <SupportCard
          icon="🐛"
          title="Report a Bug"
          description="Found something that doesn't work right? Let us know so we can fix it."
          linkText="Report Issue"
          linkHref="/contact?type=bug"
        />
        <SupportCard
          icon="💡"
          title="Feature Request"
          description="Have an idea for a new feature? We'd love to hear your suggestions."
          linkText="Suggest Feature"
          linkHref="/contact?type=feature"
        />
      </div>

      {/* Common Issues */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Common Issues</h2>
        
        <div className="space-y-4">
          <TroubleshootingItem
            title="Browser not supported"
            description="StorePreflight requires the File System Access API, which is only available in Chrome, Edge, and other Chromium-based browsers. Safari and Firefox are not currently supported."
            solution="Try using Google Chrome or Microsoft Edge to access StorePreflight."
          />
          
          <TroubleshootingItem
            title="No project files found"
            description="This error occurs when the scanner can't find recognizable project files (package.json, app.json, etc.) in the selected folder."
            solution="Make sure you're selecting the root folder of your Expo or React Native project—the one containing package.json."
          />
          
          <TroubleshootingItem
            title="Scan results not showing all capabilities"
            description="The scanner may not detect capabilities that are implemented in unusual ways or through dynamically loaded code."
            solution="Check the FAQ for supported detection patterns. If you believe something should be detected, please report it as a bug."
          />
          
          <TroubleshootingItem
            title="Export not working"
            description="The export function generates files client-side. Some browsers or extensions may block automatic downloads."
            solution="Check your browser's download settings and disable any extensions that might be blocking downloads. Try right-clicking the download button and using 'Save As'."
          />
          
          <TroubleshootingItem
            title="Scan history not persisting"
            description="Scan history is stored in your browser's localStorage. If it's not persisting, localStorage may be disabled or cleared."
            solution="Check that your browser allows localStorage. Note that private/incognito mode may not persist data between sessions."
          />
        </div>
      </section>

      {/* System Requirements */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">System Requirements</h2>
        
        <div className="card">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Supported Browsers</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Google Chrome (recommended)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Microsoft Edge
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Brave Browser
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Opera
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-500">✗</span> Safari (not supported)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-500">✗</span> Firefox (not supported)
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Supported Projects</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Expo Managed Workflow
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> Expo Bare Workflow
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> React Native CLI
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> JavaScript projects
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span> TypeScript projects
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-500">◐</span> Flutter (coming soon)
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="bg-brand rounded-xl p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-2">Still Need Help?</h2>
        <p className="text-green-100 mb-6">
          Our team is ready to assist you with any questions or issues.
        </p>
        <Link
          href="/contact"
          className="inline-block bg-white text-brand px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Contact Support
        </Link>
      </section>
    </div>
  );
}

function SupportCard({
  icon,
  title,
  description,
  linkText,
  linkHref,
}: {
  icon: string;
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
}) {
  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <Link href={linkHref} className="text-brand font-medium hover:underline">
        {linkText} →
      </Link>
    </div>
  );
}

function TroubleshootingItem({
  title,
  description,
  solution,
}: {
  title: string;
  description: string;
  solution: string;
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-5">
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-3">{description}</p>
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <p className="text-green-800 text-sm">
          <strong>Solution:</strong> {solution}
        </p>
      </div>
    </div>
  );
}
