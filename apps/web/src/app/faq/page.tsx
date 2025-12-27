"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How does StorePreflight work?",
    answer: `StorePreflight scans your project folder directly in your browser using the File System Access API. Here's the process:

1. **Select your project folder** - You choose your Expo or React Native project folder from your local file system.
2. **Local scanning** - The scanner reads your code files (package.json, app.json, app.config.js, and source files) entirely in your browser. Nothing is uploaded to any server.
3. **Capability detection** - We identify permissions and capabilities your app uses: location services, camera, microphone, push notifications, analytics SDKs, payment systems, and more.
4. **Rule evaluation** - Each detected capability is matched against our database of App Store Connect and Google Play Console requirements.
5. **Report generation** - You get a detailed report showing what the stores will ask for, plus pre-written copy-paste text for common justifications.

The entire process takes just a few seconds and keeps your code completely private.`,
  },
  {
    question: "What development environments are supported?",
    answer: `StorePreflight currently supports:

**Fully Supported:**
• **Expo Managed Workflow** - Full support for app.json and app.config.js configuration
• **Expo Bare Workflow** - Supports both managed config and native code scanning
• **React Native CLI** - JavaScript and TypeScript projects

**Languages:**
• **JavaScript** (.js, .jsx files)
• **TypeScript** (.ts, .tsx files)

**Coming Soon:**
• Flutter/Dart projects
• Native iOS (Swift/Objective-C)
• Native Android (Kotlin/Java)

The scanner works with any project structure as long as it has a package.json file at the root.`,
  },
  {
    question: "Is my code uploaded to your servers?",
    answer: `**No, absolutely not.** StorePreflight is designed with privacy as a core principle.

Your code never leaves your computer. The scanning happens entirely in your browser using the File System Access API. We don't have servers that receive or store your code.

Here's what stays local:
• Your source code files
• Your configuration files
• Your scan results (stored in browser localStorage)
• Your exported reports

The only network requests are for loading the web application itself. Once loaded, everything runs client-side.`,
  },
  {
    question: "Which browsers are supported?",
    answer: `StorePreflight requires the File System Access API, which is currently supported in:

**Fully Supported:**
• Google Chrome (desktop)
• Microsoft Edge (desktop)
• Other Chromium-based browsers (Brave, Opera, etc.)

**Not Supported:**
• Safari (Apple hasn't implemented the File System Access API)
• Firefox (not yet implemented)
• Mobile browsers

We recommend using Chrome or Edge for the best experience.`,
  },
  {
    question: "What permissions and capabilities do you detect?",
    answer: `StorePreflight scans for 12+ capabilities that commonly trigger store review requirements:

**Location Services:**
• Background location (NSLocationAlwaysUsageDescription)
• Foreground location (NSLocationWhenInUseUsageDescription)

**Hardware Access:**
• Camera (NSCameraUsageDescription)
• Microphone (NSMicrophoneUsageDescription)
• Photo library access

**Services:**
• Push notifications (APNs / FCM)
• Background tasks and processing
• File system and document access

**Third-Party SDKs:**
• Analytics (Google Analytics, Mixpanel, Amplitude, etc.)
• Payment processors (Stripe, RevenueCat, IAP)
• Authentication providers
• Maps and location services

Each detection includes specific guidance on what Apple and Google require during review.`,
  },
  {
    question: "What's the difference between High, Medium, and Low risk findings?",
    answer: `**High Risk (Blocking):**
These will almost certainly cause rejection if not addressed. Examples:
• Background location without video demonstration
• Missing privacy policy URL
• Camera/microphone access without clear justification

**Medium Risk:**
These may cause delays or requests for additional information. Examples:
• Analytics SDK detected without data collection disclosure
• Push notifications without proper capability configuration

**Low Risk (Informational):**
Best practices and recommendations that won't block submission but improve your chances. Examples:
• Missing promotional text
• Screenshot optimization suggestions`,
  },
  {
    question: "What's next for StorePreflight?",
    answer: `We have an exciting roadmap planned:

**Coming Soon:**
• **Flutter support** - Detect permissions in pubspec.yaml and Dart files
• **CI/CD integration** - Run preflight checks as part of your build pipeline
• **Asset pack builder** - Auto-generate screenshot mockups and app preview videos

**Future Plans:**
• **Native iOS/Android** - Support for Swift, Objective-C, Kotlin, and Java projects
• **Team collaboration** - Share reports and track submission progress
• **Historical tracking** - Compare scans over time to see improvement
• **Store API integration** - Check against live App Store Connect and Play Console requirements

Have a feature request? Let us know on our support page!`,
  },
  {
    question: "Is StorePreflight free?",
    answer: `**Yes, StorePreflight is currently free to use.**

We're in early development and want to help as many developers as possible avoid the frustration of app store rejections.

In the future, we may introduce premium features like:
• CI/CD pipeline integration
• Team collaboration tools
• Advanced reporting and analytics
• Priority support

The core scanning functionality will always have a free tier.`,
  },
  {
    question: "Can I use StorePreflight offline?",
    answer: `Currently, you need an internet connection to load the StorePreflight web application. However, once loaded:

• Scanning happens entirely offline
• Results are stored in your browser's localStorage
• You can export reports without an internet connection

We're considering a desktop app version in the future that would work fully offline.`,
  },
  {
    question: "How accurate is the detection?",
    answer: `StorePreflight uses pattern matching and AST-like scanning to detect capabilities. Our accuracy depends on:

**High Accuracy:**
• Expo app.json and app.config.js configuration
• package.json dependencies
• Common SDK patterns (expo-location, react-native-camera, etc.)

**Good Accuracy:**
• Custom native module usage
• Third-party SDK detection
• Permission string patterns

**Limitations:**
• Dynamically generated code
• Highly obfuscated dependencies
• Custom native implementations without standard patterns

We continuously improve detection patterns based on user feedback. If you find a false positive or missed detection, please let us know!`,
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        Frequently Asked Questions
      </h1>
      <p className="text-gray-600 mb-8">
        Everything you need to know about StorePreflight.
      </p>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <FAQAccordion
            key={index}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>

      {/* Contact CTA */}
      <div className="mt-12 bg-gray-50 rounded-xl p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Still have questions?
        </h2>
        <p className="text-gray-600 mb-4">
          We're here to help. Reach out and we'll get back to you as soon as possible.
        </p>
        <a href="/contact" className="btn-primary">
          Contact Us
        </a>
      </div>
    </div>
  );
}

function FAQAccordion({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900 pr-4">{question}</span>
        <svg
          className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 bg-white border-t border-gray-100">
          <div className="prose prose-sm max-w-none text-gray-600 pt-4 whitespace-pre-line">
            {answer}
          </div>
        </div>
      )}
    </div>
  );
}
