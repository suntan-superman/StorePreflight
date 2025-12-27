/**
 * Scanner Adapter Interface
 * All framework scanners must implement this interface
 */

import type { ScanResult } from "@storepreflight/shared";

export interface ScannerAdapter {
  /**
   * Unique identifier for the adapter
   * e.g. "expo", "flutter"
   */
  id: string;

  /**
   * Determines whether this adapter can scan the given project
   * @param rootPath - Absolute path to project root
   * @returns true if this adapter can handle the project
   */
  detectProject(rootPath: string): boolean;

  /**
   * Perform a full scan and return a normalized ScanResult
   * @param rootPath - Absolute path to project root
   * @returns Normalized scan result with capabilities and evidence
   */
  scan(rootPath: string): Promise<ScanResult>;
}
