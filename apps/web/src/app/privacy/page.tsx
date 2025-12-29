export default function PrivacyPage() {
  return (
    <div className="max-w-4xl px-4 py-12 mx-auto sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-bold text-gray-900">Privacy Policy</h1>
      <p className="mb-8 text-gray-500">Last updated: December 28, 2025</p>

      {/* Trust Banner */}
      <div className="p-6 mb-10 border border-green-200 bg-green-50 rounded-xl">
        <h2 className="mb-2 text-xl font-semibold text-green-800">
          Your code stays on your machine.
        </h2>
        <p className="text-green-700">
          We only collect what's necessary to help you ship. StorePreflight is designed as a 
          local-first engineering tool, not a data-harvesting platform.
        </p>
      </div>

      <div className="prose prose-gray max-w-none">
        {/* What We Don't Do */}
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">What StorePreflight Does Not Do</h2>
          <p className="mb-4 text-gray-600">Let's be explicit:</p>
          <ul className="mb-4 space-y-2">
            <li className="flex items-start gap-3">
              <span className="font-bold text-red-500">❌</span>
              <span className="text-gray-700">We do not upload your source code by default</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-red-500">❌</span>
              <span className="text-gray-700">We do not inspect proprietary business logic</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-red-500">❌</span>
              <span className="text-gray-700">We do not train AI models on your code</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-red-500">❌</span>
              <span className="text-gray-700">We do not sell or share user data</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="font-bold text-red-500">❌</span>
              <span className="text-gray-700">We do not require an account to scan your app</span>
            </li>
          </ul>
          <p className="italic text-gray-600">
            If you can use StorePreflight without logging in, that's intentional.
          </p>
        </section>

        {/* Overview */}
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">1. Overview</h2>
          <p className="mb-4 text-gray-600">
            StorePreflight ("StorePreflight," "we," "us," or "our") respects your privacy and is 
            committed to protecting it through this Privacy Policy.
          </p>
          <p className="mb-4 text-gray-600">
            StorePreflight is designed as a <strong>local-first developer tool</strong>. Our goal is 
            to collect only the minimum information necessary to operate and improve the Service.
          </p>
          <p className="text-gray-600">
            You can use significant portions of StorePreflight without creating an account or 
            providing personal information.
          </p>
        </section>

        {/* How Scans Work */}
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">2. How Scans Work</h2>
          <p className="mb-4 text-gray-600">By default:</p>
          <ul className="mb-4 space-y-2 text-gray-600 list-disc list-inside">
            <li>All scans run locally on your machine</li>
            <li>We read configuration files (e.g., app.json, manifests, metadata)</li>
            <li>We evaluate structure and declarations, not application behavior</li>
            <li>Results stay on your machine unless you explicitly choose otherwise</li>
          </ul>
          <p className="font-medium text-gray-600">
            StorePreflight analyzes what exists, not what you build.
          </p>
        </section>

        {/* Information We Collect */}
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">3. Information We Collect</h2>
          
          <h3 className="mt-6 mb-3 text-lg font-semibold text-gray-800">3.1 Information You Provide Voluntarily</h3>
          <p className="mb-4 text-gray-600">Depending on how you use the Service, you may provide:</p>
          <ul className="mb-4 space-y-2 text-gray-600 list-disc list-inside">
            <li><strong>Email address (optional)</strong> — Used for authentication (passwordless magic links) 
                and to send important product or policy updates if you opt in</li>
            <li><strong>Account information</strong> — If you create an account: email address and basic 
                account metadata (creation date, last activity)</li>
          </ul>
          <p className="mb-4 text-gray-600">We do <strong>not</strong> require:</p>
          <ul className="mb-4 space-y-2 text-gray-600 list-disc list-inside">
            <li>Usernames or passwords</li>
            <li>Social logins</li>
            <li>App Store or Google Play credentials</li>
          </ul>

          <h3 className="mt-6 mb-3 text-lg font-semibold text-gray-800">3.2 Information Collected Automatically</h3>
          <p className="mb-4 text-gray-600">We may collect limited technical information, such as:</p>
          <ul className="mb-4 space-y-2 text-gray-600 list-disc list-inside">
            <li>Anonymous session identifiers</li>
            <li>Application version</li>
            <li>Operating system type</li>
            <li>Timestamps of scans or usage events</li>
          </ul>
          <p className="text-gray-600">
            This information is used solely to maintain sessions, improve reliability and performance, 
            and understand feature usage at a high level.
          </p>

          <h3 className="mt-6 mb-3 text-lg font-semibold text-gray-800">3.3 Application Scan Data</h3>
          <p className="mb-4 text-gray-600">By default:</p>
          <ul className="mb-4 space-y-2 text-gray-600 list-disc list-inside">
            <li>StorePreflight scans run locally on your machine</li>
            <li>Configuration files are analyzed locally</li>
            <li>Scan results remain local unless you explicitly choose to save or sync them</li>
          </ul>
          <p className="text-gray-600">
            If you choose to save scan data, only metadata and scan results are stored. 
            Source code is not uploaded unless explicitly enabled in future enterprise features.
          </p>
        </section>

        {/* Identity & Accounts */}
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">4. Identity & Accounts</h2>
          <p className="mb-4 text-gray-600">
            <strong>You can use StorePreflight without an account.</strong>
          </p>
          <p className="mb-4 text-gray-600">When we ask for an email, it's because:</p>
          <ul className="mb-4 space-y-2 text-gray-600 list-disc list-inside">
            <li>You want to save progress</li>
            <li>You want to resume work later</li>
            <li>You want to be notified when store requirements change</li>
          </ul>
          <p className="mb-4 text-gray-600">
            Authentication uses secure, <strong>passwordless magic links</strong>.
          </p>
        </section>

        {/* How We Use Information */}
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">5. How We Use Information</h2>
          <p className="mb-4 text-gray-600">We use collected information to:</p>
          <ul className="mb-4 space-y-2 text-gray-600 list-disc list-inside">
            <li>Provide and maintain the Service</li>
            <li>Authenticate users (if applicable)</li>
            <li>Save and restore project scans (if enabled)</li>
            <li>Notify users of important changes to app store requirements</li>
            <li>Improve product functionality and usability</li>
            <li>Ensure security and prevent abuse</li>
          </ul>
          <p className="mb-4 text-gray-600">
            We do <strong>not</strong> use your information for:
          </p>
          <ul className="space-y-2 text-gray-600 list-disc list-inside">
            <li>Advertising networks</li>
            <li>Selling or renting data</li>
            <li>Training AI models on your code</li>
          </ul>
        </section>

        {/* Notifications */}
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">6. Notifications</h2>
          <p className="mb-4 text-gray-600">If you opt in to emails, you'll hear from us when:</p>
          <ul className="mb-4 space-y-2 text-gray-600 list-disc list-inside">
            <li>App Store or Google Play requirements change</li>
            <li>A change may affect one of your previous scans</li>
            <li>We ship a meaningful improvement</li>
          </ul>
          <p className="mb-4 text-gray-600">We don't send:</p>
          <ul className="mb-4 space-y-2 text-gray-600 list-disc list-inside">
            <li>Marketing blasts</li>
            <li>Sales drip campaigns</li>
            <li>Noise</li>
          </ul>
          <p className="text-gray-600">You can unsubscribe at any time.</p>
        </section>

        {/* Cookies */}
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">7. Cookies and Tracking</h2>
          <p className="mb-4 text-gray-600">StorePreflight uses minimal tracking technologies:</p>
          <ul className="mb-4 space-y-2 text-gray-600 list-disc list-inside">
            <li>Local storage may be used to persist anonymous session data</li>
            <li>Cookies may be used for authentication sessions (web only)</li>
          </ul>
          <p className="text-gray-600">We do <strong>not</strong> use:</p>
          <ul className="space-y-2 text-gray-600 list-disc list-inside">
            <li>Third-party advertising cookies</li>
            <li>Cross-site tracking pixels</li>
          </ul>
        </section>

        {/* Data Sharing */}
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">8. Data Sharing and Disclosure</h2>
          <p className="mb-4 text-gray-600">
            <strong>We do not sell, trade, or rent your personal information.</strong>
          </p>
          <p className="mb-4 text-gray-600">We may share information only in the following circumstances:</p>
          <ul className="space-y-2 text-gray-600 list-disc list-inside">
            <li><strong>Service providers</strong> — Trusted infrastructure providers who help operate 
                the Service (e.g., hosting, email delivery), under strict confidentiality obligations</li>
            <li><strong>Legal requirements</strong> — If required to comply with applicable laws, 
                regulations, or legal processes</li>
            <li><strong>Business transfers</strong> — In the event of a merger, acquisition, or sale 
                of assets, user information may be transferred as part of that transaction</li>
          </ul>
        </section>

        {/* Data Retention */}
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">9. Data Retention</h2>
          <p className="mb-4 text-gray-600">We retain information only as long as necessary:</p>
          <ul className="mb-4 space-y-2 text-gray-600 list-disc list-inside">
            <li>Anonymous session data may be retained temporarily</li>
            <li>Account information is retained until you request deletion</li>
            <li>Email subscriptions can be canceled at any time</li>
          </ul>
          <p className="text-gray-600">
            You may request deletion of your account and associated data by contacting us.
          </p>
        </section>

        {/* Security */}
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">10. Security</h2>
          <p className="mb-4 text-gray-600">
            We take reasonable technical and organizational measures to protect your information, including:
          </p>
          <ul className="mb-4 space-y-2 text-gray-600 list-disc list-inside">
            <li>Encrypted communications</li>
            <li>Secure authentication flows</li>
            <li>Limited data access controls</li>
          </ul>
          <p className="text-gray-600">
            No system is completely secure, but we strive to protect your data using industry-standard practices.
          </p>
        </section>

        {/* Your Rights */}
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">11. Your Rights and Choices</h2>
          <p className="mb-4 text-gray-600">Depending on your location, you may have rights to:</p>
          <ul className="mb-4 space-y-2 text-gray-600 list-disc list-inside">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your data</li>
            <li>Opt out of communications</li>
          </ul>
          <p className="text-gray-600">
            You can exercise these rights by contacting us at the address below.
          </p>
        </section>

        {/* Teams & Enterprise */}
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">12. For Teams & Enterprises</h2>
          <p className="mb-4 text-gray-600">When teams or organizations use StorePreflight:</p>
          <ul className="mb-4 space-y-2 text-gray-600 list-disc list-inside">
            <li>Access is role-based</li>
            <li>Audit trails are explicit</li>
            <li>Data boundaries are clear</li>
            <li>Nothing is shared across accounts</li>
          </ul>
          <p className="text-gray-600">Enterprise features are opt-in, not assumed.</p>
        </section>

        {/* Children's Privacy */}
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">13. Children's Privacy</h2>
          <p className="text-gray-600">
            StorePreflight is not intended for use by individuals under the age of 13. 
            We do not knowingly collect personal information from children.
          </p>
        </section>

        {/* International Users */}
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">14. International Users</h2>
          <p className="text-gray-600">
            StorePreflight may be accessed from outside the United States. By using the Service, 
            you consent to the transfer and processing of information in accordance with this Privacy Policy.
          </p>
        </section>

        {/* Changes */}
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">15. Changes to This Policy</h2>
          <p className="mb-4 text-gray-600">
            We may update this Privacy Policy from time to time. When we do:
          </p>
          <ul className="space-y-2 text-gray-600 list-disc list-inside">
            <li>We will update the "Last updated" date</li>
            <li>Significant changes will be communicated through the Service or email (if you have opted in)</li>
          </ul>
        </section>

        {/* Philosophy */}
        <section className="p-6 mb-10 bg-gray-50 rounded-xl">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Our Philosophy</h2>
          <p className="mb-4 text-gray-600">
            StorePreflight was built by engineers who have spent decades working in regulated, 
            high-trust environments. That background shapes everything:
          </p>
          <ul className="mb-4 space-y-2 text-gray-600 list-disc list-inside">
            <li>Minimal data collection</li>
            <li>Explicit consent</li>
            <li>Predictable behavior</li>
            <li>Respect for developer intent</li>
          </ul>
          <p className="font-medium text-gray-700">
            We believe trust is earned by restraint, not promises.
          </p>
        </section>

        {/* Contact */}
        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">16. Contact Us</h2>
          <p className="mb-4 text-gray-600">
            If you have questions or concerns about this Privacy Policy, you can contact us at:
          </p>
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <p className="mb-2 font-medium text-gray-700">StorePreflight (Workside Software LLC)</p>
            <p className="text-gray-600">
              Email: <a href="mailto:privacy@worksidesoftware.com" className="text-brand hover:underline">privacy@worksidesoftware.com</a>
            </p>
            <p className="text-gray-600">
              Website: <a href="https://storepreflight.com" className="text-brand hover:underline">https://storepreflight.com</a>
            </p>
          </div>
        </section>

        {/* Trust Footer */}
        <section className="p-6 text-center border bg-brand/5 border-brand/20 rounded-xl">
          <p className="mb-2 text-lg font-medium text-gray-900">
            Local-first. Intent-aware. No surprises.
          </p>
          <p className="text-gray-600">
            Your workflow, your data, your call.
          </p>
        </section>
      </div>
    </div>
  );
}
