import Link from "next/link";

export const metadata = {
  title: "Demo Video | StorePreflight",
  description: "Watch StorePreflight in action - see how to scan your mobile app and prepare for App Store and Google Play submission.",
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="pt-12 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            See StorePreflight in Action
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Watch how StorePreflight helps you prepare your mobile app for submission
            to the App Store and Google Play — without the guesswork.
          </p>
        </div>
      </section>

      {/* Video Section */}
      <section className="pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="aspect-video bg-gray-900">
              <video
                controls
                className="w-full h-full"
                poster="/videos/StorePreflight-poster.png"
                preload="metadata"
              >
                <source src="/videos/StorePreflight.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            What You&apos;ll Learn
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Scanning</h3>
              <p className="text-sm text-gray-600">
                Upload your project files and let StorePreflight detect permissions, SDKs, and policy requirements automatically.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Compliance Checks</h3>
              <p className="text-sm text-gray-600">
                See exactly what Apple and Google will require based on your app&apos;s functionality and target markets.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Guided Submission</h3>
              <p className="text-sm text-gray-600">
                Follow a step-by-step checklist tailored to your app, with all the copy and assets you&apos;ll need.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Try It?
          </h2>
          <p className="text-gray-600 mb-8">
            Start scanning your project today — it&apos;s free and takes just a few minutes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/scan"
              className="px-6 py-3 bg-brand text-white font-semibold rounded-lg hover:bg-brand/90 transition-colors"
            >
              Scan Your Project
            </Link>
            <Link
              href="/guided"
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Guided Submission
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
