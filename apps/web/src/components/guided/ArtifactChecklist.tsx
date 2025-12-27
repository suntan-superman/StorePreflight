"use client";

import type { GuidedArtifact } from "@storepreflight/guided";

interface ArtifactChecklistProps {
  artifacts: GuidedArtifact[];
  className?: string;
}

export function ArtifactChecklist({ artifacts, className = "" }: ArtifactChecklistProps) {
  if (!artifacts || artifacts.length === 0) return null;

  const groupedArtifacts = groupByType(artifacts);

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Asset Checklist
      </h3>
      
      <div className="space-y-4">
        {Object.entries(groupedArtifacts).map(([type, items]) => (
          <div key={type}>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
              {getTypeIcon(type as GuidedArtifact["type"])}
              {getTypeName(type as GuidedArtifact["type"])}
            </h4>
            <ul className="space-y-2">
              {items.map((artifact, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-2 bg-gray-50 rounded-lg text-sm"
                >
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand focus:ring-brand"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-gray-800">
                      {artifact.description}
                      {artifact.required && <span className="text-red-500 ml-1">*</span>}
                    </span>
                    {artifact.value && (
                      <p className="text-xs text-gray-500 mt-0.5">{artifact.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function groupByType(artifacts: GuidedArtifact[]): Record<string, GuidedArtifact[]> {
  return artifacts.reduce((acc, artifact) => {
    const type = artifact.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(artifact);
    return acc;
  }, {} as Record<string, GuidedArtifact[]>);
}

function getTypeIcon(type: GuidedArtifact["type"]): string {
  switch (type) {
    case "screenshot":
      return "📸";
    case "video":
      return "🎬";
    case "text":
      return "📝";
    case "url":
      return "🔗";
    default:
      return "📁";
  }
}

function getTypeName(type: GuidedArtifact["type"]): string {
  switch (type) {
    case "screenshot":
      return "Screenshots";
    case "video":
      return "Videos";
    case "text":
      return "Text Content";
    case "url":
      return "URLs";
    default:
      return "Other";
  }
}
