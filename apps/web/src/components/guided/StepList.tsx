"use client";

import type { GuidedStep } from "@storepreflight/guided";

interface StepListProps {
  steps: GuidedStep[];
  selectedStepId: string | null;
  completedStepIds: Set<string>;
  onSelectStep: (stepId: string) => void;
}

export function StepList({
  steps,
  selectedStepId,
  completedStepIds,
  onSelectStep,
}: StepListProps) {
  // Group steps by section
  const sections = groupStepsBySection(steps);

  return (
    <nav className="h-full overflow-y-auto bg-gray-50 border-r border-gray-200">
      <div className="p-4 space-y-4">
        {sections.map((section) => (
          <div key={section.name}>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
              {section.name}
            </h3>
            <ul className="space-y-1">
              {section.steps.map((step) => {
                const isSelected = step.id === selectedStepId;
                const isCompleted = completedStepIds.has(step.id);

                return (
                  <li key={step.id}>
                    <button
                      onClick={() => onSelectStep(step.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                        isSelected
                          ? "bg-brand text-white"
                          : isCompleted
                          ? "bg-green-50 text-green-800 hover:bg-green-100"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {/* Status indicator */}
                      <span className="flex-shrink-0">
                        {isCompleted ? (
                          <span className={isSelected ? "text-white" : "text-green-600"}>✓</span>
                        ) : step.blocking ? (
                          <span className={isSelected ? "text-white" : "text-red-500"}>●</span>
                        ) : (
                          <span className={isSelected ? "text-white/50" : "text-gray-300"}>○</span>
                        )}
                      </span>
                      
                      {/* Title */}
                      <span className="flex-1 truncate">{step.title}</span>
                      
                      {/* Blocking badge */}
                      {step.blocking && !isCompleted && !isSelected && (
                        <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded">
                          Required
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}

interface Section {
  name: string;
  steps: GuidedStep[];
}

function groupStepsBySection(steps: GuidedStep[]): Section[] {
  const sectionMap = new Map<string, GuidedStep[]>();
  
  for (const step of steps) {
    const sectionName = step.sectionPath[0] || "Other";
    const existing = sectionMap.get(sectionName) || [];
    existing.push(step);
    sectionMap.set(sectionName, existing);
  }
  
  return Array.from(sectionMap.entries()).map(([name, sectionSteps]) => ({
    name,
    steps: sectionSteps,
  }));
}
