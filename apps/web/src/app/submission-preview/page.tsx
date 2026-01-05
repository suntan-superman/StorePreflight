"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";

// =============================================================================
// TYPES
// =============================================================================

interface ConsoleConfig {
  appId: string;
  devId?: string;
  appUrl: string;
}

interface ScanData {
  appName?: string;
  bundleId?: string;
  version?: string;
  sdkVersion?: string;
  platforms?: string[];
  capabilities?: string[];
  permissions?: string[];
}

interface FormData {
  // Localizable Information
  promotionalText: string;
  description: string;
  keywords: string;
  whatsNew: string;
  supportUrl: string;
  marketingUrl: string;
  
  // General Information
  version: string;
  copyright: string;
  
  // App Review
  signInRequired: "yes" | "no" | "";
  demoUsername: string;
  demoPassword: string;
  contactFirstName: string;
  contactLastName: string;
  contactPhone: string;
  contactEmail: string;
  reviewNotes: string;
  
  // Version Release
  releaseType: "manual" | "immediate" | "scheduled";
  phasedRelease: boolean;
}

// =============================================================================
// STORAGE KEYS
// =============================================================================

const STORAGE_KEYS = {
  CONSOLE_CONFIG: "storepreflight_apple_console_config",
  SCAN_RESULT: "storepreflight_scan_result",
  FORM_DATA: "storepreflight_submission_form",
};

// =============================================================================
// SMART GENERATORS
// =============================================================================

function generateDescription(scanData: ScanData, userDescription: string): string {
  if (userDescription) return userDescription;
  
  const features: string[] = [];
  const appName = scanData.appName || "This app";
  
  if (scanData.capabilities?.includes("location_foreground") || scanData.capabilities?.includes("location_background")) {
    features.push("location-based services");
  }
  if (scanData.capabilities?.includes("camera")) {
    features.push("camera functionality");
  }
  if (scanData.capabilities?.includes("notifications")) {
    features.push("push notifications");
  }
  if (scanData.capabilities?.includes("authentication")) {
    features.push("secure user authentication");
  }
  if (scanData.capabilities?.includes("payments")) {
    features.push("in-app purchases");
  }
  
  if (features.length === 0) {
    return `${appName} provides a seamless mobile experience designed to help you accomplish your goals efficiently.\n\nKey Features:\n• Intuitive, user-friendly interface\n• Fast and responsive performance\n• Regular updates and improvements\n\nDownload now and discover what ${appName} can do for you!`;
  }
  
  return `${appName} is a powerful mobile application featuring ${features.join(", ")}.\n\nKey Features:\n${features.map(f => `• ${f.charAt(0).toUpperCase() + f.slice(1)}`).join("\n")}\n• Intuitive, user-friendly interface\n• Fast and responsive performance\n\nDownload now and experience the difference!`;
}

function generateKeywords(scanData: ScanData): string {
  const keywords: string[] = [];
  
  // Add app name words
  if (scanData.appName) {
    keywords.push(...scanData.appName.toLowerCase().split(/\s+/).filter(w => w.length > 2));
  }
  
  // Add capability-based keywords
  if (scanData.capabilities?.includes("location_foreground") || scanData.capabilities?.includes("location_background")) {
    keywords.push("location", "maps", "navigation", "gps");
  }
  if (scanData.capabilities?.includes("camera")) {
    keywords.push("camera", "photo", "scan");
  }
  if (scanData.capabilities?.includes("notifications")) {
    keywords.push("alerts", "reminders");
  }
  if (scanData.capabilities?.includes("authentication")) {
    keywords.push("secure", "login", "account");
  }
  
  // Add general keywords
  keywords.push("mobile", "app");
  
  // Deduplicate and limit to 100 chars
  const unique = [...new Set(keywords)];
  let result = unique.join(",");
  while (result.length > 100) {
    unique.pop();
    result = unique.join(",");
  }
  
  return result;
}

function generatePromotionalText(scanData: ScanData): string {
  const appName = scanData.appName || "Our app";
  return `${appName} - Your essential companion for getting things done. Download now!`;
}

function generateReviewerNotes(scanData: ScanData): string {
  const notes: string[] = [];
  
  if (scanData.capabilities?.includes("location_background")) {
    notes.push("• Background location is used only during active work sessions for [describe purpose]. Location tracking stops when the user ends their session.");
  }
  if (scanData.capabilities?.includes("location_foreground")) {
    notes.push("• Location access is used to [describe purpose, e.g., show nearby locations, provide navigation].");
  }
  if (scanData.capabilities?.includes("camera")) {
    notes.push("• Camera access is used to [describe purpose, e.g., scan documents, take photos for records].");
  }
  if (scanData.capabilities?.includes("notifications")) {
    notes.push("• Push notifications are used to alert users about [describe what triggers notifications].");
  }
  if (scanData.capabilities?.includes("authentication")) {
    notes.push("• Demo account credentials are provided above for testing all app features.");
  }
  
  if (notes.length === 0) {
    return "Thank you for reviewing our app. All features are accessible without special configuration. Please contact us if you have any questions during the review process.";
  }
  
  return notes.join("\n\n") + "\n\nPlease contact us if you have any questions during the review process.";
}

function generateCopyright(scanData: ScanData): string {
  const year = new Date().getFullYear();
  const appName = scanData.appName || "App";
  return `${year} ${appName}`;
}

function generateWhatsNew(version: string): string {
  return `Version ${version || "1.0"} includes:\n• Bug fixes and performance improvements\n• Enhanced user experience\n• Stability improvements`;
}

// =============================================================================
// COPY BUTTON COMPONENT
// =============================================================================

function CopyButton({ text, onCopy }: { text: string; onCopy?: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy");
    }
  };

  return (
    <button
      onClick={handleCopy}
      disabled={!text}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        copied
          ? "bg-green-100 text-green-700"
          : text
          ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
          : "bg-gray-100 text-gray-400 cursor-not-allowed"
      }`}
    >
      {copied ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

// =============================================================================
// FIELD COMPONENT
// =============================================================================

interface FieldProps {
  label: string;
  description?: string;
  required?: boolean;
  maxLength?: number;
  type?: "text" | "textarea" | "url" | "select" | "password";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestion?: string;
  onUseSuggestion?: () => void;
  selectOptions?: { value: string; label: string }[];
  rows?: number;
  showCopy?: boolean;
  status?: "complete" | "suggested" | "needs-input" | "optional";
}

function Field({
  label,
  description,
  required,
  maxLength,
  type = "text",
  value,
  onChange,
  placeholder,
  suggestion,
  onUseSuggestion,
  selectOptions,
  rows = 4,
  showCopy = true,
  status = "needs-input",
}: FieldProps) {
  const charCount = value?.length || 0;
  const isOverLimit = maxLength && charCount > maxLength;
  
  const actualStatus = value ? (suggestion && value === suggestion ? "suggested" : "complete") : status;
  
  const borderColor = {
    complete: "border-green-300 bg-green-50/50",
    suggested: "border-amber-300 bg-amber-50/50",
    "needs-input": required ? "border-red-300 bg-red-50/50" : "border-gray-200",
    optional: "border-gray-200",
  }[actualStatus];

  return (
    <div className={`p-4 rounded-xl border-2 ${borderColor} transition-all`}>
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <label className="font-semibold text-gray-900">{label}</label>
            {required && <span className="text-red-500 text-sm font-bold">*</span>}
            {maxLength && (
              <span className={`text-xs ${isOverLimit ? "text-red-600 font-bold" : "text-gray-500"}`}>
                {charCount}/{maxLength}
              </span>
            )}
            {actualStatus === "complete" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                ✓ Ready
              </span>
            )}
            {actualStatus === "suggested" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                ⚡ Suggested
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        {showCopy && value && <CopyButton text={value} />}
      </div>

      {/* Suggestion banner */}
      {suggestion && !value && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-900 mb-1">💡 Suggested content:</p>
              <p className="text-sm text-blue-800 whitespace-pre-wrap line-clamp-4">{suggestion}</p>
            </div>
            <button
              onClick={onUseSuggestion}
              className="flex-shrink-0 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Use This
            </button>
          </div>
        </div>
      )}

      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
            isOverLimit ? "border-red-500" : "border-gray-300"
          }`}
        />
      ) : type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="">Select...</option>
          {selectOptions?.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm ${
            isOverLimit ? "border-red-500" : "border-gray-300"
          }`}
        />
      )}
    </div>
  );
}

// =============================================================================
// SECTION COMPONENT
// =============================================================================

function Section({ 
  title, 
  icon, 
  children, 
  ascUrl,
  description,
}: { 
  title: string; 
  icon: string; 
  children: React.ReactNode;
  ascUrl?: string;
  description?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{title}</h2>
              {description && <p className="text-sm text-gray-600">{description}</p>}
            </div>
          </div>
          {ascUrl && (
            <button
              onClick={() => window.open(ascUrl, "storepreflight_asc_window", "noopener")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Open in ASC
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <div className="p-6 space-y-4">
        {children}
      </div>
    </div>
  );
}

// =============================================================================
// COPY ALL BUTTON
// =============================================================================

function CopyAllButton({ formData, scanData }: { formData: FormData; scanData: ScanData }) {
  const [copied, setCopied] = useState(false);

  const handleCopyAll = async () => {
    const text = `
APP STORE SUBMISSION DATA
========================

APP NAME: ${scanData.appName || "[Not detected]"}
VERSION: ${formData.version}
BUNDLE ID: ${scanData.bundleId || "[Not detected]"}

PROMOTIONAL TEXT (170 chars):
${formData.promotionalText}

DESCRIPTION (4000 chars):
${formData.description}

KEYWORDS (100 chars):
${formData.keywords}

WHAT'S NEW:
${formData.whatsNew}

SUPPORT URL: ${formData.supportUrl}
MARKETING URL: ${formData.marketingUrl || "[Optional]"}

COPYRIGHT: ${formData.copyright}

REVIEWER NOTES:
${formData.reviewNotes}

${formData.signInRequired === "yes" ? `DEMO CREDENTIALS:
Username: ${formData.demoUsername}
Password: ${formData.demoPassword}` : "SIGN-IN: Not required"}

CONTACT INFO:
${formData.contactFirstName} ${formData.contactLastName}
${formData.contactPhone}
${formData.contactEmail}
`.trim();

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      console.error("Failed to copy");
    }
  };

  return (
    <button
      onClick={handleCopyAll}
      className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
        copied
          ? "bg-green-600 text-white"
          : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
      }`}
    >
      {copied ? (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          All Content Copied!
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Copy All Content
        </>
      )}
    </button>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function SubmissionPreviewPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [consoleConfig, setConsoleConfig] = useState<ConsoleConfig | null>(null);
  const [scanData, setScanData] = useState<ScanData>({});
  const [formData, setFormData] = useState<FormData>({
    promotionalText: "",
    description: "",
    keywords: "",
    whatsNew: "",
    supportUrl: "",
    marketingUrl: "",
    version: "",
    copyright: "",
    signInRequired: "",
    demoUsername: "",
    demoPassword: "",
    contactFirstName: "",
    contactLastName: "",
    contactPhone: "",
    contactEmail: "",
    reviewNotes: "",
    releaseType: "immediate",
    phasedRelease: false,
  });

  // Load saved data
  useEffect(() => {
    try {
      // Load console config
      const configStr = localStorage.getItem(STORAGE_KEYS.CONSOLE_CONFIG);
      if (configStr) {
        setConsoleConfig(JSON.parse(configStr));
      }

      // Load scan data
      const scanStr = localStorage.getItem(STORAGE_KEYS.SCAN_RESULT);
      if (scanStr) {
        const { result, scanResult } = JSON.parse(scanStr);
        // Try to extract app info from scan result
        const appData: ScanData = {
          appName: scanResult?.appJson?.name || scanResult?.appJson?.expo?.name || scanResult?.packageJson?.name,
          version: scanResult?.appJson?.version || scanResult?.appJson?.expo?.version || scanResult?.packageJson?.version || "1.0.0",
          bundleId: scanResult?.appJson?.expo?.ios?.bundleIdentifier || scanResult?.appJson?.ios?.bundleIdentifier,
          capabilities: result?.capabilities || [],
        };
        setScanData(appData);
        
        // Pre-fill form with detected data
        setFormData(prev => ({
          ...prev,
          version: appData.version || prev.version,
          signInRequired: appData.capabilities?.includes("authentication") ? "yes" : "",
        }));
      }

      // Load saved form data
      const formStr = localStorage.getItem(STORAGE_KEYS.FORM_DATA);
      if (formStr) {
        setFormData(prev => ({ ...prev, ...JSON.parse(formStr) }));
      }
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save form data on change
  const updateFormData = useCallback((key: keyof FormData, value: string | boolean) => {
    setFormData(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Generate suggestions
  const suggestions = useMemo(() => ({
    description: generateDescription(scanData, ""),
    keywords: generateKeywords(scanData),
    promotionalText: generatePromotionalText(scanData),
    reviewerNotes: generateReviewerNotes(scanData),
    copyright: generateCopyright(scanData),
    whatsNew: generateWhatsNew(formData.version),
  }), [scanData, formData.version]);

  // Calculate completion
  const completion = useMemo(() => {
    const required = [
      formData.description,
      formData.keywords,
      formData.supportUrl,
      formData.version,
      formData.copyright,
      formData.signInRequired,
      formData.contactFirstName,
      formData.contactLastName,
      formData.contactPhone,
      formData.contactEmail,
    ];
    const filled = required.filter(v => v && v.length > 0).length;
    
    // Check demo creds if sign-in required
    let total = required.length;
    let extra = filled;
    if (formData.signInRequired === "yes") {
      total += 2;
      if (formData.demoUsername) extra++;
      if (formData.demoPassword) extra++;
    }
    
    return { filled: extra, total, percent: Math.round((extra / total) * 100) };
  }, [formData]);

  const baseUrl = consoleConfig ? `https://appstoreconnect.apple.com/apps/${consoleConfig.appId}` : "";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!consoleConfig) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Set Up App Store Connect First
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              To use the Submission Preview, you need to configure your App Store Connect URL. This lets us generate direct links to each section.
            </p>
            <Link
              href="/guided/apple"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
            >
              Configure Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/guided/apple" className="hover:text-blue-600">Guided Submission</Link>
            <span>/</span>
            <span className="text-gray-900">Submission Preview</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="text-4xl">🍎</span>
                {scanData.appName || "Your App"} - Submission
              </h1>
              <p className="text-gray-600 mt-2">
                Prepare everything here, then copy to App Store Connect
              </p>
              {scanData.bundleId && (
                <p className="text-sm text-gray-500 mt-1 font-mono">{scanData.bundleId}</p>
              )}
            </div>
            
            <CopyAllButton formData={formData} scanData={scanData} />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Submission Readiness</h3>
            <span className={`text-2xl font-bold ${completion.percent === 100 ? "text-green-600" : "text-blue-600"}`}>
              {completion.percent}%
            </span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                completion.percent === 100 
                  ? "bg-gradient-to-r from-green-500 to-emerald-500" 
                  : "bg-gradient-to-r from-blue-500 to-purple-500"
              }`}
              style={{ width: `${completion.percent}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {completion.filled} of {completion.total} required fields completed
          </p>
        </div>

        {/* App Info Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 mb-8 text-white shadow-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-blue-100 text-sm mb-1">Detected from your project</p>
              <h2 className="text-2xl font-bold">{scanData.appName || "App Name Not Detected"}</h2>
              <p className="text-blue-100 mt-1">Version {formData.version || scanData.version || "1.0.0"}</p>
            </div>
            {scanData.capabilities && scanData.capabilities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {scanData.capabilities.slice(0, 5).map(cap => (
                  <span key={cap} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                    {cap.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form Sections */}
        <div className="space-y-8">
          
          {/* Localizable Information */}
          <Section
            title="App Store Listing"
            icon="📱"
            description="This is what users see on the App Store"
            ascUrl={`${baseUrl}/distribution/ios/version/inflight`}
          >
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-amber-800">
                <strong>📸 Screenshots:</strong> Upload these directly in App Store Connect. 
                You&apos;ll need 6.7&quot; iPhone screenshots (required) and iPad screenshots (if universal app).
              </p>
            </div>
            
            <Field
              label="Promotional Text"
              description="Appears above your description. Can be changed anytime without a new version."
              maxLength={170}
              type="textarea"
              rows={2}
              value={formData.promotionalText}
              onChange={(v) => updateFormData("promotionalText", v)}
              placeholder="Highlight a feature, promotion, or update..."
              suggestion={suggestions.promotionalText}
              onUseSuggestion={() => updateFormData("promotionalText", suggestions.promotionalText)}
              status="optional"
            />
            
            <Field
              label="Description"
              description="Explain what your app does and why users should download it."
              required
              maxLength={4000}
              type="textarea"
              rows={8}
              value={formData.description}
              onChange={(v) => updateFormData("description", v)}
              placeholder="Describe your app's features and benefits..."
              suggestion={suggestions.description}
              onUseSuggestion={() => updateFormData("description", suggestions.description)}
            />
            
            <Field
              label="Keywords"
              description="Comma-separated words that help users find your app."
              required
              maxLength={100}
              value={formData.keywords}
              onChange={(v) => updateFormData("keywords", v)}
              placeholder="keyword1,keyword2,keyword3..."
              suggestion={suggestions.keywords}
              onUseSuggestion={() => updateFormData("keywords", suggestions.keywords)}
            />
            
            <Field
              label="What's New"
              description="What's new in this version. Shows on your app's page."
              type="textarea"
              rows={4}
              value={formData.whatsNew}
              onChange={(v) => updateFormData("whatsNew", v)}
              placeholder="Describe changes in this version..."
              suggestion={suggestions.whatsNew}
              onUseSuggestion={() => updateFormData("whatsNew", suggestions.whatsNew)}
              status="optional"
            />
            
            <Field
              label="Support URL"
              description="Where users can get help with your app."
              required
              type="url"
              value={formData.supportUrl}
              onChange={(v) => updateFormData("supportUrl", v)}
              placeholder="https://yourwebsite.com/support"
            />
            
            <Field
              label="Marketing URL"
              description="Your app's marketing page (optional)."
              type="url"
              value={formData.marketingUrl}
              onChange={(v) => updateFormData("marketingUrl", v)}
              placeholder="https://yourwebsite.com/app"
              status="optional"
            />
          </Section>

          {/* General Information */}
          <Section
            title="General Information"
            icon="ℹ️"
            ascUrl={`${baseUrl}/distribution/ios/version/inflight`}
          >
            <Field
              label="Version"
              description="The version number for this release (e.g., 1.0, 1.0.1)."
              required
              value={formData.version}
              onChange={(v) => updateFormData("version", v)}
              placeholder="1.0.0"
            />
            
            <Field
              label="Copyright"
              description="The copyright holder and year."
              required
              value={formData.copyright}
              onChange={(v) => updateFormData("copyright", v)}
              placeholder="2024 Your Company Name"
              suggestion={suggestions.copyright}
              onUseSuggestion={() => updateFormData("copyright", suggestions.copyright)}
            />
          </Section>

          {/* App Review Information */}
          <Section
            title="App Review Information"
            icon="👁️"
            description="Help the review team test your app"
            ascUrl={`${baseUrl}/distribution/ios/version/inflight`}
          >
            <Field
              label="Sign-in Required?"
              description="Does your app require users to sign in to access features?"
              required
              type="select"
              value={formData.signInRequired}
              onChange={(v) => updateFormData("signInRequired", v)}
              selectOptions={[
                { value: "no", label: "No - All features are accessible without signing in" },
                { value: "yes", label: "Yes - Sign-in is required for some features" },
              ]}
              showCopy={false}
            />
            
            {formData.signInRequired === "yes" && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-4">
                <p className="text-sm text-blue-800 font-medium">
                  🔑 Provide demo credentials for the App Review team:
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field
                    label="Demo Username"
                    required
                    value={formData.demoUsername}
                    onChange={(v) => updateFormData("demoUsername", v)}
                    placeholder="demo@example.com"
                  />
                  <Field
                    label="Demo Password"
                    required
                    type="password"
                    value={formData.demoPassword}
                    onChange={(v) => updateFormData("demoPassword", v)}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Contact Information</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label="First Name"
                  required
                  value={formData.contactFirstName}
                  onChange={(v) => updateFormData("contactFirstName", v)}
                  placeholder="John"
                />
                <Field
                  label="Last Name"
                  required
                  value={formData.contactLastName}
                  onChange={(v) => updateFormData("contactLastName", v)}
                  placeholder="Doe"
                />
                <Field
                  label="Phone Number"
                  required
                  value={formData.contactPhone}
                  onChange={(v) => updateFormData("contactPhone", v)}
                  placeholder="+1 555-123-4567"
                />
                <Field
                  label="Email"
                  required
                  value={formData.contactEmail}
                  onChange={(v) => updateFormData("contactEmail", v)}
                  placeholder="john@company.com"
                />
              </div>
            </div>
            
            <Field
              label="Notes for Review"
              description="Any additional information to help the review team test your app."
              type="textarea"
              rows={6}
              value={formData.reviewNotes}
              onChange={(v) => updateFormData("reviewNotes", v)}
              placeholder="Instructions or context for the review team..."
              suggestion={suggestions.reviewerNotes}
              onUseSuggestion={() => updateFormData("reviewNotes", suggestions.reviewerNotes)}
              status="optional"
            />
          </Section>

          {/* Version Release */}
          <Section
            title="Version Release"
            icon="🚀"
            ascUrl={`${baseUrl}/distribution/ios/version/inflight`}
          >
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">When should this version be released?</p>
              
              <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="releaseType"
                  checked={formData.releaseType === "manual"}
                  onChange={() => updateFormData("releaseType", "manual")}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-gray-900">Manually release this version</p>
                  <p className="text-sm text-gray-600">You&apos;ll publish it yourself after approval</p>
                </div>
              </label>
              
              <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="releaseType"
                  checked={formData.releaseType === "immediate"}
                  onChange={() => updateFormData("releaseType", "immediate")}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-gray-900">Automatically release after approval</p>
                  <p className="text-sm text-gray-600">Goes live as soon as it&apos;s approved</p>
                </div>
              </label>
              
              <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="releaseType"
                  checked={formData.releaseType === "scheduled"}
                  onChange={() => updateFormData("releaseType", "scheduled")}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-gray-900">Release on a specific date</p>
                  <p className="text-sm text-gray-600">Choose a date after approval</p>
                </div>
              </label>
            </div>
            
            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors mt-4">
              <input
                type="checkbox"
                checked={formData.phasedRelease}
                onChange={(e) => updateFormData("phasedRelease", e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <div>
                <p className="font-medium text-gray-900">Phased Release</p>
                <p className="text-sm text-gray-600">Gradually release to users over 7 days (recommended for updates)</p>
              </div>
            </label>
          </Section>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">Ready to Submit?</h3>
              <p className="text-green-100">
                {completion.percent === 100 
                  ? "All required fields are complete! Open App Store Connect and paste your content."
                  : `Complete ${completion.total - completion.filled} more required fields before submitting.`}
              </p>
            </div>
            <button
              onClick={() => window.open(`${baseUrl}/distribution/ios/version/inflight`, "storepreflight_asc_window", "noopener")}
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-green-700 rounded-xl hover:bg-green-50 transition-colors font-bold text-lg"
            >
              Open App Store Connect
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
