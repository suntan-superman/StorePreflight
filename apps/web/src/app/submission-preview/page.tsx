"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { GateFinding } from "@/lib/browser-scanner/types";
import { Header } from "@/components/Header";

// =============================================================================
// TYPES
// =============================================================================

interface ScanResultData {
  findings: GateFinding[];
}

interface ConsoleConfig {
  appId: string;
  devId?: string;
  appUrl: string;
}

interface FieldStatus {
  status: "complete" | "from-scan" | "needs-input" | "optional";
  value?: string;
  placeholder?: string;
}

interface SectionField {
  id: string;
  label: string;
  description?: string;
  type: "text" | "textarea" | "url" | "select" | "file";
  status: FieldStatus;
  ascPath?: string; // Specific path in App Store Connect
  copyable?: boolean;
  required?: boolean;
}

interface FormSection {
  id: string;
  title: string;
  icon: string;
  ascPath: string; // Path in App Store Connect
  description: string;
  fields: SectionField[];
}

// =============================================================================
// STORAGE KEYS
// =============================================================================

const STORAGE_KEYS = {
  CONSOLE_CONFIG: "storepreflight_apple_console_config",
  SCAN_RESULT: "storepreflight_scan_result",
  SESSION: "storepreflight_session",
  PREVIEW_DATA: "storepreflight_preview_data",
};

// =============================================================================
// APP STORE CONNECT SECTION DEFINITIONS
// =============================================================================

function buildAppleFormSections(
  appId: string,
  scanResult: ScanResultData | null,
  sessionData: Record<string, string>
): FormSection[] {
  const baseUrl = `https://appstoreconnect.apple.com/apps/${appId}`;
  
  // Helper to determine field status
  const getFieldStatus = (
    fieldId: string,
    sessionKey?: string,
    isFromScan?: boolean
  ): FieldStatus => {
    const value = sessionKey ? sessionData[sessionKey] : undefined;
    if (value) {
      return { status: isFromScan ? "from-scan" : "complete", value };
    }
    return { status: "needs-input" };
  };

  return [
    // =========================================================================
    // App Information Section
    // =========================================================================
    {
      id: "app-info",
      title: "App Information",
      icon: "📱",
      ascPath: `${baseUrl}/distribution/generalAppInfo`,
      description: "Basic app details displayed on the App Store",
      fields: [
        {
          id: "app-name",
          label: "App Name",
          description: "The name of your app as it appears on the App Store (max 30 characters)",
          type: "text",
          status: getFieldStatus("app-name", "appName"),
          required: true,
          copyable: true,
        },
        {
          id: "subtitle",
          label: "Subtitle",
          description: "A brief summary of your app (max 30 characters)",
          type: "text",
          status: { status: "optional", placeholder: "Optional - adds context under app name" },
          copyable: true,
        },
        {
          id: "primary-category",
          label: "Primary Category",
          type: "select",
          status: { status: "needs-input" },
          required: true,
        },
        {
          id: "secondary-category",
          label: "Secondary Category",
          type: "select",
          status: { status: "optional" },
        },
        {
          id: "content-rights",
          label: "Content Rights",
          description: "Does your app contain, show, or access third-party content?",
          type: "select",
          status: { status: "needs-input" },
          required: true,
        },
      ],
    },

    // =========================================================================
    // Privacy Section
    // =========================================================================
    {
      id: "privacy",
      title: "Privacy",
      icon: "🔒",
      ascPath: `${baseUrl}/distribution/privacy`,
      description: "Privacy policy and App Privacy labels",
      fields: [
        {
          id: "privacy-policy-url",
          label: "Privacy Policy URL",
          description: "Link to your publicly accessible privacy policy",
          type: "url",
          status: getFieldStatus("privacy-policy-url", "privacyPolicyUrl", true),
          required: true,
          copyable: true,
        },
        {
          id: "data-collection",
          label: "Data Collection Practices",
          description: "Declare what data your app collects and how it's used",
          type: "text",
          status: scanResult?.findings.some(f => 
            f.id.includes("LOCATION") || f.id.includes("CAMERA") || f.id.includes("PHOTO")
          ) ? { status: "from-scan", value: "Data types detected by scan - review required" } 
            : { status: "needs-input" },
          required: true,
        },
        {
          id: "tracking",
          label: "Tracking Declaration",
          description: "Does your app track users across other companies' apps/websites?",
          type: "select",
          status: { status: "needs-input" },
          required: true,
        },
      ],
    },

    // =========================================================================
    // Pricing & Availability
    // =========================================================================
    {
      id: "pricing",
      title: "Pricing & Availability",
      icon: "💰",
      ascPath: `${baseUrl}/distribution/pricing`,
      description: "Set your app's price and availability",
      fields: [
        {
          id: "price",
          label: "Price",
          description: "Base price for your app",
          type: "select",
          status: { status: "needs-input" },
          required: true,
        },
        {
          id: "availability",
          label: "Availability",
          description: "Countries and regions where your app is available",
          type: "select",
          status: { status: "needs-input" },
          required: true,
        },
        {
          id: "pre-order",
          label: "Pre-Order",
          description: "Make your app available for pre-order",
          type: "select",
          status: { status: "optional" },
        },
      ],
    },

    // =========================================================================
    // iOS App Version
    // =========================================================================
    {
      id: "version-info",
      title: "iOS App - Version Information",
      icon: "📋",
      ascPath: `${baseUrl}/distribution/ios/version/inflight`,
      description: "Screenshots, description, and promotional content",
      fields: [
        {
          id: "screenshots-6-7",
          label: "iPhone 6.7\" Screenshots",
          description: "Required: 3-10 screenshots for iPhone 15 Pro Max, 14 Plus, etc.",
          type: "file",
          status: { status: "needs-input" },
          required: true,
        },
        {
          id: "screenshots-6-5",
          label: "iPhone 6.5\" Screenshots",
          description: "Required: 3-10 screenshots for iPhone 11 Pro Max, XS Max, etc.",
          type: "file",
          status: { status: "needs-input" },
          required: true,
        },
        {
          id: "screenshots-ipad",
          label: "iPad Screenshots",
          description: "Required if your app runs on iPad",
          type: "file",
          status: { status: "needs-input" },
        },
        {
          id: "app-preview",
          label: "App Preview Video",
          description: "Optional video showing your app in action (15-30 seconds)",
          type: "file",
          status: { status: "optional" },
        },
        {
          id: "promotional-text",
          label: "Promotional Text",
          description: "Text that appears above your description (max 170 characters). Can be updated without new submission.",
          type: "textarea",
          status: getFieldStatus("promotional-text", "promotionalText"),
          copyable: true,
        },
        {
          id: "description",
          label: "Description",
          description: "Detailed description of your app (max 4000 characters)",
          type: "textarea",
          status: getFieldStatus("description", "appDescription"),
          required: true,
          copyable: true,
        },
        {
          id: "keywords",
          label: "Keywords",
          description: "Keywords for App Store search (max 100 characters, comma separated)",
          type: "text",
          status: getFieldStatus("keywords", "keywords"),
          required: true,
          copyable: true,
        },
        {
          id: "support-url",
          label: "Support URL",
          description: "URL for customer support",
          type: "url",
          status: getFieldStatus("support-url", "supportUrl", true),
          required: true,
          copyable: true,
        },
        {
          id: "marketing-url",
          label: "Marketing URL",
          description: "URL to your app's marketing page",
          type: "url",
          status: getFieldStatus("marketing-url", "marketingUrl"),
          copyable: true,
        },
        {
          id: "whats-new",
          label: "What's New",
          description: "Describe what's new in this version",
          type: "textarea",
          status: getFieldStatus("whats-new", "whatsNew"),
          required: true,
          copyable: true,
        },
      ],
    },

    // =========================================================================
    // App Review Information
    // =========================================================================
    {
      id: "app-review",
      title: "App Review Information",
      icon: "👁️",
      ascPath: `${baseUrl}/distribution/ios/version/inflight`,
      description: "Information for App Review team",
      fields: [
        {
          id: "sign-in-required",
          label: "Sign-In Required",
          description: "Does your app require sign-in to access features?",
          type: "select",
          status: scanResult?.findings.some(f => f.id.includes("AUTHENTICATION"))
            ? { status: "from-scan", value: "Yes - authentication detected" }
            : { status: "needs-input" },
          required: true,
        },
        {
          id: "demo-username",
          label: "Demo Account Username",
          description: "Username for App Review team to test sign-in features",
          type: "text",
          status: scanResult?.findings.some(f => f.id.includes("AUTHENTICATION"))
            ? { status: "from-scan", placeholder: "Required - provide test credentials" }
            : { status: "optional" },
          copyable: true,
        },
        {
          id: "demo-password",
          label: "Demo Account Password",
          description: "Password for the demo account",
          type: "text",
          status: scanResult?.findings.some(f => f.id.includes("AUTHENTICATION"))
            ? { status: "from-scan", placeholder: "Required - provide test credentials" }
            : { status: "optional" },
          copyable: true,
        },
        {
          id: "review-notes",
          label: "Notes for Review",
          description: "Additional information for the App Review team",
          type: "textarea",
          status: getFieldStatus("review-notes", "reviewerNotes", true),
          copyable: true,
        },
        {
          id: "review-attachment",
          label: "Attachment",
          description: "Optional file attachment for reviewers (e.g., demo video)",
          type: "file",
          status: { status: "optional" },
        },
      ],
    },

    // =========================================================================
    // Export Compliance
    // =========================================================================
    {
      id: "export-compliance",
      title: "Export Compliance",
      icon: "🌍",
      ascPath: `${baseUrl}/distribution/encryption`,
      description: "Encryption and export compliance declarations",
      fields: [
        {
          id: "uses-encryption",
          label: "Uses Encryption",
          description: "Does your app use encryption?",
          type: "select",
          status: scanResult?.findings.some(f => f.id.includes("EXPORT"))
            ? { status: "from-scan", value: "Review required - see guidance" }
            : { status: "needs-input" },
          required: true,
        },
        {
          id: "encryption-exempt",
          label: "Encryption Exemption",
          description: "Does your encryption qualify for an exemption?",
          type: "select",
          status: getFieldStatus("encryption-exempt", "exportCompliance", true),
        },
      ],
    },

    // =========================================================================
    // Age Rating
    // =========================================================================
    {
      id: "age-rating",
      title: "Age Rating",
      icon: "🔞",
      ascPath: `${baseUrl}/distribution/ageRatings`,
      description: "Content rating questionnaire",
      fields: [
        {
          id: "age-rating-questionnaire",
          label: "Age Rating Questionnaire",
          description: "Answer questions about your app's content to receive an age rating",
          type: "select",
          status: { status: "needs-input" },
          required: true,
        },
      ],
    },
  ];
}

// =============================================================================
// COPY BUTTON COMPONENT
// =============================================================================

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy");
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        copied
          ? "bg-green-100 text-green-700 border border-green-300"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
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
          {label || "Copy"}
        </>
      )}
    </button>
  );
}

// =============================================================================
// STATUS BADGE COMPONENT
// =============================================================================

function StatusBadge({ status }: { status: FieldStatus["status"] }) {
  const config = {
    complete: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200",
      label: "Ready",
      icon: "✓",
    },
    "from-scan": {
      bg: "bg-amber-100",
      text: "text-amber-800",
      border: "border-amber-200",
      label: "From Scan",
      icon: "⚡",
    },
    "needs-input": {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-200",
      label: "Required",
      icon: "!",
    },
    optional: {
      bg: "bg-gray-100",
      text: "text-gray-600",
      border: "border-gray-200",
      label: "Optional",
      icon: "○",
    },
  };

  const c = config[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text} ${c.border} border`}>
      <span>{c.icon}</span>
      {c.label}
    </span>
  );
}

// =============================================================================
// FIELD COMPONENT
// =============================================================================

function FormField({ field, onValueChange }: { 
  field: SectionField; 
  onValueChange: (id: string, value: string) => void;
}) {
  const [localValue, setLocalValue] = useState(field.status.value || "");

  const handleChange = (value: string) => {
    setLocalValue(value);
    onValueChange(field.id, value);
  };

  const borderColor = {
    complete: "border-green-300 bg-green-50",
    "from-scan": "border-amber-300 bg-amber-50",
    "needs-input": "border-red-300 bg-red-50",
    optional: "border-gray-200 bg-white",
  }[field.status.status];

  return (
    <div className={`p-4 rounded-lg border-2 ${borderColor} transition-all`}>
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <label className="font-medium text-gray-900">{field.label}</label>
            {field.required && <span className="text-red-500 text-sm">*</span>}
            <StatusBadge status={field.status.status} />
          </div>
          {field.description && (
            <p className="text-sm text-gray-600 mt-1">{field.description}</p>
          )}
        </div>
        {field.copyable && localValue && (
          <CopyButton text={localValue} />
        )}
      </div>

      {field.type === "textarea" ? (
        <textarea
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.status.placeholder || `Enter ${field.label.toLowerCase()}...`}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm mt-2"
        />
      ) : field.type === "url" || field.type === "text" ? (
        <input
          type={field.type}
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.status.placeholder || `Enter ${field.label.toLowerCase()}...`}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm mt-2"
        />
      ) : field.type === "file" ? (
        <div className="mt-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-sm text-gray-500">
          <span>📁 Upload in App Store Connect</span>
        </div>
      ) : field.type === "select" ? (
        <div className="mt-2 p-3 bg-gray-100 rounded-lg text-sm text-gray-600">
          <span>↗️ Select in App Store Connect</span>
        </div>
      ) : null}
    </div>
  );
}

// =============================================================================
// SECTION COMPONENT
// =============================================================================

function FormSectionComponent({ 
  section, 
  isExpanded, 
  onToggle,
  onValueChange,
}: { 
  section: FormSection; 
  isExpanded: boolean;
  onToggle: () => void;
  onValueChange: (fieldId: string, value: string) => void;
}) {
  const stats = useMemo(() => {
    const required = section.fields.filter(f => f.required);
    const complete = section.fields.filter(f => 
      f.status.status === "complete" || f.status.status === "from-scan"
    );
    const needsInput = section.fields.filter(f => 
      f.status.status === "needs-input" && f.required
    );
    return { total: section.fields.length, complete: complete.length, needsInput: needsInput.length, required: required.length };
  }, [section.fields]);

  const sectionStatus = stats.needsInput > 0 ? "incomplete" : "complete";

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${
      sectionStatus === "complete" ? "border-green-200" : "border-gray-200"
    }`}>
      {/* Section Header */}
      <button
        onClick={onToggle}
        className={`w-full px-6 py-4 flex items-center justify-between transition-colors ${
          sectionStatus === "complete" 
            ? "bg-green-50 hover:bg-green-100" 
            : "bg-white hover:bg-gray-50"
        }`}
      >
        <div className="flex items-center gap-4">
          <span className="text-2xl">{section.icon}</span>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{section.title}</h3>
            <p className="text-sm text-gray-600">{section.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Progress indicator */}
          <div className="flex items-center gap-2 text-sm">
            {sectionStatus === "complete" ? (
              <span className="flex items-center gap-1 text-green-600 font-medium">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Ready
              </span>
            ) : (
              <span className="text-gray-500">
                {stats.complete}/{stats.total} fields
              </span>
            )}
          </div>
          
          {/* Chevron */}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Section Content */}
      {isExpanded && (
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          {/* Open in ASC button */}
          <div className="mb-6 flex justify-end">
            <a
              href={section.ascPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
            >
              Open in App Store Connect
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* Fields */}
          <div className="space-y-4">
            {section.fields.map((field) => (
              <FormField
                key={field.id}
                field={field}
                onValueChange={onValueChange}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function SubmissionPreviewPage() {
  const router = useRouter();
  const [consoleConfig, setConsoleConfig] = useState<ConsoleConfig | null>(null);
  const [scanResult, setScanResult] = useState<ScanResultData | null>(null);
  const [sessionData, setSessionData] = useState<Record<string, string>>({});
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["app-info"]));
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage
  useEffect(() => {
    try {
      // Load console config
      const configStr = localStorage.getItem(STORAGE_KEYS.CONSOLE_CONFIG);
      if (configStr) {
        setConsoleConfig(JSON.parse(configStr));
      }

      // Load scan result
      const scanStr = localStorage.getItem(STORAGE_KEYS.SCAN_RESULT);
      if (scanStr) {
        const { result } = JSON.parse(scanStr);
        setScanResult(result);
      }

      // Load session data (generated copy)
      const sessionStr = localStorage.getItem(STORAGE_KEYS.SESSION);
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (session.generatedCopy) {
          setSessionData(session.generatedCopy);
        }
      }

      // Load any saved preview data
      const previewStr = localStorage.getItem(STORAGE_KEYS.PREVIEW_DATA);
      if (previewStr) {
        const previewData = JSON.parse(previewStr);
        setSessionData(prev => ({ ...prev, ...previewData }));
      }
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle field value changes
  const handleValueChange = useCallback((fieldId: string, value: string) => {
    setSessionData(prev => {
      const updated = { ...prev, [fieldId]: value };
      // Save to localStorage
      localStorage.setItem(STORAGE_KEYS.PREVIEW_DATA, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Toggle section expansion
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }, []);

  // Expand all sections
  const expandAll = useCallback(() => {
    setExpandedSections(new Set(sections.map(s => s.id)));
  }, []);

  // Collapse all sections
  const collapseAll = useCallback(() => {
    setExpandedSections(new Set());
  }, []);

  // Build form sections
  const sections = useMemo(() => {
    if (!consoleConfig) return [];
    return buildAppleFormSections(consoleConfig.appId, scanResult, sessionData);
  }, [consoleConfig, scanResult, sessionData]);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const allFields = sections.flatMap(s => s.fields);
    const required = allFields.filter(f => f.required);
    const complete = allFields.filter(f => 
      f.status.status === "complete" || f.status.status === "from-scan"
    );
    const fromScan = allFields.filter(f => f.status.status === "from-scan");
    return {
      total: allFields.length,
      required: required.length,
      complete: complete.length,
      fromScan: fromScan.length,
      percent: Math.round((complete.length / Math.max(required.length, 1)) * 100),
    };
  }, [sections]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!consoleConfig) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Configure App Store Connect First
            </h1>
            <p className="text-gray-600 mb-6">
              To use the Submission Preview, you need to configure your App Store Connect URL first.
            </p>
            <Link
              href="/guided/apple"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors font-medium"
            >
              Go to Guided Submission
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/guided/apple" className="hover:text-brand">Guided Submission</Link>
            <span>/</span>
            <span>Submission Preview</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="text-4xl">🍎</span>
                App Store Submission Preview
              </h1>
              <p className="text-gray-600 mt-2">
                Review and prepare all fields before submitting to App Store Connect
              </p>
            </div>
            
            {/* Quick actions */}
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Submission Readiness</h2>
            <span className="text-2xl font-bold text-brand">{overallProgress.percent}%</span>
          </div>
          
          {/* Progress bar */}
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-brand to-green-500 transition-all duration-500"
              style={{ width: `${overallProgress.percent}%` }}
            />
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{overallProgress.complete}</div>
              <div className="text-sm text-green-700">Fields Ready</div>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">{overallProgress.fromScan}</div>
              <div className="text-sm text-amber-700">From Scan</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{overallProgress.required - overallProgress.complete}</div>
              <div className="text-sm text-gray-700">Needs Input</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="font-medium text-gray-700">Field Status:</span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-green-400" />
              Ready to submit
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-400" />
              Generated from scan
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-400" />
              Needs your input
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-gray-300" />
              Optional
            </span>
          </div>
        </div>

        {/* Form Sections */}
        <div className="space-y-4">
          {sections.map((section) => (
            <FormSectionComponent
              key={section.id}
              section={section}
              isExpanded={expandedSections.has(section.id)}
              onToggle={() => toggleSection(section.id)}
              onValueChange={handleValueChange}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Ready to submit?</h3>
              <p className="text-sm text-blue-700">
                Open App Store Connect and copy your prepared content into each section.
              </p>
            </div>
            <a
              href={`https://appstoreconnect.apple.com/apps/${consoleConfig.appId}/distribution/ios/version/inflight`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Open App Store Connect
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
