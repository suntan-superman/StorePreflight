"use client";

import type { SubmissionIntent } from "@storepreflight/shared";
import {
  SUBMISSION_INTENT_LABELS,
  SUBMISSION_INTENT_DESCRIPTIONS,
} from "@storepreflight/shared";

interface IntentOption {
  value: SubmissionIntent;
  icon: string;
  recommended?: boolean;
}

const INTENT_OPTIONS: IntentOption[] = [
  {
    value: "internal_testing",
    icon: "🧪",
  },
  {
    value: "external_testing",
    icon: "👥",
  },
  {
    value: "production",
    icon: "🚀",
    recommended: true,
  },
];

interface IntentSelectorProps {
  value: SubmissionIntent;
  onChange: (intent: SubmissionIntent) => void;
  className?: string;
}

export function IntentSelector({ value, onChange, className = "" }: IntentSelectorProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        What are you submitting for?
      </label>
      <div className="grid gap-3">
        {INTENT_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`
                relative flex items-start gap-4 p-4 rounded-lg border-2 transition-all text-left
                ${isSelected
                  ? "border-brand bg-brand/5 ring-2 ring-brand/20"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }
              `}
            >
              <span className="text-2xl">{option.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-medium ${isSelected ? "text-brand" : "text-gray-900"}`}>
                    {SUBMISSION_INTENT_LABELS[option.value]}
                  </span>
                  {option.recommended && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                      Full experience
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {SUBMISSION_INTENT_DESCRIPTIONS[option.value]}
                </p>
              </div>
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {value === "internal_testing" && (
          <>
            <span className="font-medium">Fewer steps required.</span> Skip store listing, screenshots, and marketing assets.
          </>
        )}
        {value === "external_testing" && (
          <>
            <span className="font-medium">Some steps skipped.</span> Privacy and basic metadata required.
          </>
        )}
        {value === "production" && (
          <>
            <span className="font-medium">All steps included.</span> Complete store presence with screenshots and marketing.
          </>
        )}
      </p>
    </div>
  );
}
