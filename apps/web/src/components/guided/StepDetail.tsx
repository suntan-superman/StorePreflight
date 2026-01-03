"use client";

import { useEffect, useRef } from "react";
import type { GuidedStep, StoreConsoleLink } from "@storepreflight/guided";
import { CopyButton } from "./CopyButton";

interface StepDetailProps {
  step: GuidedStep;
  isCompleted: boolean;
  onToggleComplete: () => void;
  generatedCopy?: Record<string, string>;
  /** Direct link to App Store Connect / Play Console for this step */
  consoleLink?: StoreConsoleLink | null;
  /** Callback when user wants to configure console URL */
  onConfigureConsole?: () => void;
}

export function StepDetail({
  step,
  isCompleted,
  onToggleComplete,
  generatedCopy = {},
  consoleLink,
  onConfigureConsole,
}: StepDetailProps) {
  // Check for missing placeholders
  const hasMissingKeys = step.missingKeys && step.missingKeys.length > 0;
  
  // Ref for scrolling to top when step changes
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Scroll to top when step changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [step.id]);

  return (
    <div ref={containerRef} className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6 space-y-6 animate-fadeIn">
        {/* Direct Link to Store Console */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                {step.store === "apple" ? (
                  <span className="text-xl">🍎</span>
                ) : (
                  <span className="text-xl">▶️</span>
                )}
              </div>
              <div>
                <h4 className="font-medium text-blue-900">
                  {consoleLink ? consoleLink.section : `Open in ${step.store === "apple" ? "App Store Connect" : "Play Console"}`}
                </h4>
                <p className="text-sm text-blue-700">
                  {consoleLink 
                    ? "Click to open this section directly" 
                    : "Configure your app URL to get direct links"}
                </p>
              </div>
            </div>
            
            {consoleLink ? (
              <a
                href={consoleLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                {consoleLink.label}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ) : (
              <button
                onClick={onConfigureConsole}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Configure
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Missing data warning */}
        {hasMissingKeys && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-semibold text-orange-800">Missing Information</h4>
                <p className="text-sm text-orange-700 mt-1">
                  Some content couldn&apos;t be auto-generated. You may need to provide:
                </p>
                <ul className="mt-2 text-sm text-orange-700 list-disc list-inside">
                  {step.missingKeys.map((key) => (
                    <li key={key} className="capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="text-sm text-gray-500 mb-1">
              {step.sectionPath.join(" › ")}
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{step.title}</h2>
            {step.blocking && !isCompleted && (
              <span className="inline-block mt-2 text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                Required for submission
              </span>
            )}
          </div>
          
          {/* Complete button */}
          <button
            onClick={onToggleComplete}
            className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-colors ${
              isCompleted
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-brand text-white hover:bg-brand/90"
            }`}
          >
            {isCompleted ? "✓ Completed" : "Mark Complete"}
          </button>
        </div>

        {/* Description */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">About This Step</h3>
          <p className="text-gray-600">{step.description}</p>
          {step.whyThisExists && (
            <p className="mt-2 text-sm text-gray-500 italic">{step.whyThisExists}</p>
          )}
        </div>

        {/* Instructions */}
        {step.instructions && step.instructions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Instructions</h3>
            {step.instructions.map((instruction, idx) => (
              <div
                key={idx}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-brand text-white rounded-full text-xs flex items-center justify-center font-medium">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {instruction.label}
                    </span>
                    <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded">
                      {instruction.type}
                    </span>
                  </div>
                  {instruction.value && instruction.type === "paste" && (
                    <CopyButton text={instruction.value} />
                  )}
                </div>
                
                {instruction.value && (
                  <div className="p-3 mt-2 rounded border bg-white border-gray-200 text-sm whitespace-pre-wrap text-gray-800">
                    {instruction.value}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Generated Copy */}
        {Object.keys(generatedCopy).length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Pre-Generated Content</h3>
            {Object.entries(generatedCopy).map(([key, value]) => (
              <div
                key={key}
                className="bg-gray-50 border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <CopyButton text={value} />
                </div>
                <div className="p-3 rounded border bg-white border-gray-200 text-sm whitespace-pre-wrap text-gray-800">
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Artifacts Required */}
        {step.artifacts && step.artifacts.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Assets Required
            </h3>
            <ul className="space-y-2">
              {step.artifacts.map((artifact, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-amber-900">
                  <span className="flex-shrink-0 mt-0.5">
                    {artifact.type === "screenshot" && "📸"}
                    {artifact.type === "video" && "🎬"}
                    {artifact.type === "text" && "📝"}
                    {artifact.type === "url" && "🔗"}
                  </span>
                  <div>
                    <span className="font-medium">{artifact.description}</span>
                    {artifact.required && (
                      <span className="text-red-600 ml-1">*</span>
                    )}
                    {artifact.value && (
                      <span className="text-amber-700 ml-1 text-xs">
                        ({artifact.value})
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Completion Criteria */}
        {step.completionCriteria && step.completionCriteria.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-green-800 mb-3">Completion Checklist</h3>
            <ul className="space-y-2">
              {step.completionCriteria.map((criteria, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-green-900">
                  <span className="flex-shrink-0 mt-0.5">☐</span>
                  <span>{criteria}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        {step.warnings && step.warnings.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-red-800 mb-3">Warnings</h3>
            <ul className="space-y-2">
              {step.warnings.map((warning, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-red-900">
                  <span className="flex-shrink-0 mt-0.5">⚠️</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
