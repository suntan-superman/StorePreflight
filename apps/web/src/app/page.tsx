import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            StorePreflight
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Know what Apple and Google will ask — <strong>before they ask.</strong>
          </p>
          <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
            Preflight your mobile app against App Store Connect and Google Play Console requirements.
            <br />
            No surprises. No guesswork. No rejections.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/scan" className="btn-primary text-lg">
              Scan Your Project
            </Link>
            <a href="#how-it-works" className="btn-secondary text-lg">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            The Problem
          </h2>
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
            <p className="text-lg text-gray-700">
              Submitting an app shouldn't feel like navigating a maze.
            </p>
            <p className="text-gray-600 mt-4">
              Apple and Google reveal requirements <strong>after</strong> you've already invested 
              time, money, and energy. Background location policies, video demonstrations, 
              data safety forms, account deletion requirements...
            </p>
            <p className="text-red-600 font-semibold mt-4">
              You only discover them when your app gets rejected.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            The Solution
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <FeatureCard
              icon="🔍"
              title="Scan Your Codebase"
              description="StorePreflight scans your project locally and detects permissions, SDKs, and capabilities."
            />
            <FeatureCard
              icon="⚠️"
              title="Identify Policy Gates"
              description="Know which permissions trigger review requirements before you submit."
            />
            <FeatureCard
              icon="📝"
              title="Get Copy-Paste Answers"
              description="Pre-written justifications for location, notifications, and more."
            />
            <FeatureCard
              icon="📦"
              title="Export Submission Pack"
              description="Download a ZIP with everything you need: reports, screenshots, checklists."
            />
          </div>
        </div>
      </section>

      {/* What We Detect Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            What We Detect
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              "Background Location",
              "Foreground Location",
              "Push Notifications",
              "Camera Access",
              "Microphone Access",
              "Photo Library",
              "File Storage",
              "Maps Usage",
              "Payment SDKs",
              "Authentication",
              "Analytics",
              "Background Tasks",
            ].map((capability) => (
              <div
                key={capability}
                className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-brand">✓</span>
                <span className="text-gray-700">{capability}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Who It's For
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "Expo & React Native developers",
              "Flutter developers (coming soon)",
              "Agencies shipping multiple apps",
              "Teams tired of Play Console surprises",
            ].map((audience) => (
              <span
                key={audience}
                className="bg-white border border-gray-200 px-4 py-2 rounded-full text-gray-700"
              >
                {audience}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-brand">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Run StorePreflight before you submit.
          </h2>
          <p className="text-green-100 mb-8">
            Stop getting rejected. Start shipping with confidence.
          </p>
          <Link
            href="/scan"
            className="inline-block bg-white text-brand px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Start Scanning
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="card">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
