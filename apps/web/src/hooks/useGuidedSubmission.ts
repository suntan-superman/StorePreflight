/**
 * useGuidedSubmission Hook
 * React hook for managing guided submission flow state
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { RuleEvaluationResult } from "@/lib/browser-scanner/types";
import type {
  StoreTarget,
  GeneratedCopy,
  GuidedSubmissionFlow,
  GuidedSession,
} from "@storepreflight/guided";
import {
  buildGuidedFlow,
  googleGuidedCatalog,
  appleGuidedCatalog,
} from "@storepreflight/guided";
import {
  generateCopyFromFindings,
  mapToGuidedInput,
  createGuidedSession,
  saveGuidedSession,
  loadGuidedSession,
  getCurrentGuidedSession,
  updateStepProgress,
  getSessionStats,
  isStepCompleted,
  getSelectedIntent,
} from "@/lib/guided-integration";
import type { SubmissionIntent } from "@storepreflight/shared";

export interface UseGuidedSubmissionOptions {
  /** Auto-load current session on mount */
  autoLoad?: boolean;
}

export interface UseGuidedSubmissionReturn {
  /** Current guided session */
  session: GuidedSession | null;
  /** Current guided flow (derived from session) */
  flow: GuidedSubmissionFlow | null;
  /** Whether a session is active */
  isActive: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  
  /** Start a new guided session */
  startSession: (
    store: StoreTarget,
    evaluation: RuleEvaluationResult,
    copyOverrides?: Partial<GeneratedCopy>
  ) => void;
  
  /** Load an existing session */
  loadSession: (sessionId: string) => void;
  
  /** Clear current session */
  clearSession: () => void;
  
  /** Mark a step as complete/incomplete */
  toggleStepComplete: (stepId: string, notes?: string) => void;
  
  /** Update generated copy */
  updateCopy: (updates: Partial<GeneratedCopy>) => void;
  
  /** Reset all progress */
  resetProgress: () => void;
  
  /** Session statistics */
  stats: {
    completed: number;
    total: number;
    blockingCompleted: number;
    blockingTotal: number;
    percentComplete: number;
  } | null;
  
  /** Check if a specific step is completed */
  isStepComplete: (stepId: string) => boolean;
}

export function useGuidedSubmission(
  options: UseGuidedSubmissionOptions = {}
): UseGuidedSubmissionReturn {
  const { autoLoad = true } = options;

  const [session, setSession] = useState<GuidedSession | null>(null);
  const [flow, setFlow] = useState<GuidedSubmissionFlow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-load current session on mount
  useEffect(() => {
    if (autoLoad) {
      try {
        const currentSession = getCurrentGuidedSession();
        if (currentSession) {
          setSession(currentSession);
          rebuildFlow(currentSession);
        }
      } catch (err) {
        console.error("Failed to load guided session:", err);
      }
    }
    setIsLoading(false);
  }, [autoLoad]);

  // Rebuild flow from session
  const rebuildFlow = useCallback((sess: GuidedSession) => {
    try {
      // Get the stored scan result
      const storedScan = localStorage.getItem("storepreflight_scan_result");
      if (!storedScan) {
        throw new Error("No scan result found");
      }

      const { result: evaluation } = JSON.parse(storedScan) as {
        result: RuleEvaluationResult;
      };

      const { scan } = mapToGuidedInput(evaluation);
      
      const newFlow = buildGuidedFlow({
        store: sess.store,
        intent: sess.intent,
        scan,
        evaluation,
        generated: sess.generatedCopy,
      });

      setFlow(newFlow);
      setError(null);
    } catch (err) {
      console.error("Failed to build guided flow:", err);
      setError(err instanceof Error ? err.message : "Failed to build flow");
    }
  }, []);

  // Start new session
  const startSession = useCallback(
    (
      store: StoreTarget,
      evaluation: RuleEvaluationResult,
      copyOverrides?: Partial<GeneratedCopy>
    ) => {
      try {
        // Get the selected intent from storage
        const intent = getSelectedIntent();
        
        const generatedCopy = generateCopyFromFindings(
          store,
          evaluation,
          copyOverrides
        );
        const newSession = createGuidedSession(store, intent, evaluation, generatedCopy);

        // Build flow
        const { scan } = mapToGuidedInput(evaluation);
        const newFlow = buildGuidedFlow({
          store,
          intent,
          scan,
          evaluation,
          generated: generatedCopy,
        });

        // Save and set state
        saveGuidedSession(newSession);
        setSession(newSession);
        setFlow(newFlow);
        setError(null);
      } catch (err) {
        console.error("Failed to start guided session:", err);
        setError(err instanceof Error ? err.message : "Failed to start session");
      }
    },
    []
  );

  // Load existing session
  const loadSessionById = useCallback(
    (sessionId: string) => {
      try {
        const loaded = loadGuidedSession(sessionId);
        if (!loaded) {
          throw new Error("Session not found");
        }

        setSession(loaded);
        rebuildFlow(loaded);
      } catch (err) {
        console.error("Failed to load session:", err);
        setError(err instanceof Error ? err.message : "Failed to load session");
      }
    },
    [rebuildFlow]
  );

  // Clear session
  const clearSession = useCallback(() => {
    setSession(null);
    setFlow(null);
    setError(null);
    localStorage.removeItem("storepreflight_current_guided_session");
  }, []);

  // Toggle step completion
  const toggleStepComplete = useCallback(
    (stepId: string, notes?: string) => {
      if (!session) return;

      const currentlyCompleted = isStepCompleted(session, stepId);
      const updatedSession = updateStepProgress(
        session,
        stepId,
        !currentlyCompleted,
        notes
      );

      saveGuidedSession(updatedSession);
      setSession(updatedSession);
    },
    [session]
  );

  // Update copy
  const updateCopy = useCallback(
    (updates: Partial<GeneratedCopy>) => {
      if (!session) return;

      const updatedSession: GuidedSession = {
        ...session,
        generatedCopy: {
          ...session.generatedCopy,
          ...updates,
        },
        updatedAt: new Date().toISOString(),
      };

      saveGuidedSession(updatedSession);
      setSession(updatedSession);
      rebuildFlow(updatedSession);
    },
    [session, rebuildFlow]
  );

  // Reset progress
  const resetProgress = useCallback(() => {
    if (!session) return;

    const updatedSession: GuidedSession = {
      ...session,
      progress: [],
      updatedAt: new Date().toISOString(),
    };

    saveGuidedSession(updatedSession);
    setSession(updatedSession);
  }, [session]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!session || !flow) return null;
    return getSessionStats(session, flow);
  }, [session, flow]);

  // Check step completion
  const checkStepComplete = useCallback(
    (stepId: string): boolean => {
      if (!session) return false;
      return isStepCompleted(session, stepId);
    },
    [session]
  );

  return {
    session,
    flow,
    isActive: session !== null,
    isLoading,
    error,
    startSession,
    loadSession: loadSessionById,
    clearSession,
    toggleStepComplete,
    updateCopy,
    resetProgress,
    stats,
    isStepComplete: checkStepComplete,
  };
}
