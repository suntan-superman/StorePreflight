/**
 * StorePreflight Shared Utilities
 */

import type { Evidence } from "./types.js";

/**
 * Deduplicate evidence entries by file:lines:snippet key
 */
export function uniqueEvidence(evidences: Evidence[]): Evidence[] {
  const seen = new Set<string>();
  const result: Evidence[] = [];

  for (const ev of evidences) {
    const key = `${ev.file}:${ev.lines[0]}-${ev.lines[1]}:${ev.snippet}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(ev);
    }
  }

  return result;
}

/**
 * Format a date for file naming (YYYY-MM-DD_HH-mm-ss)
 */
export function formatDateForFilename(date: Date = new Date()): string {
  return date
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .slice(0, 19);
}

/**
 * Sanitize a string for use in filenames
 */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 50);
}

/**
 * Create a submission pack filename
 */
export function createPackFilename(appName: string): string {
  const safeName = sanitizeFilename(appName);
  const date = formatDateForFilename();
  return `StorePreflight_SubmissionPack_${safeName}_${date}.zip`;
}
