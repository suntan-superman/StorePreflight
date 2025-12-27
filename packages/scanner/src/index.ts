/**
 * @storepreflight/scanner
 * Project scanning engine with framework adapters
 */

import type { ScannerAdapter } from "./adapters/ScannerAdapter.js";
import { ExpoScanner } from "./adapters/ExpoScanner.js";
import { FlutterScanner } from "./adapters/FlutterScanner.js";

// All available scanner adapters
const SCANNERS: ScannerAdapter[] = [
  new ExpoScanner(),
  new FlutterScanner(),
];

/**
 * Detect the appropriate scanner for a project
 * @param rootPath - Absolute path to project root
 * @returns The matching scanner adapter
 * @throws Error if no supported project type is detected
 */
export function getScanner(rootPath: string): ScannerAdapter {
  const scanner = SCANNERS.find((s) => s.detectProject(rootPath));

  if (!scanner) {
    throw new Error(
      "No supported project type detected. " +
      "StorePreflight currently supports Expo/React Native projects. " +
      "Flutter support coming soon!"
    );
  }

  return scanner;
}

/**
 * Scan a project for store submission requirements
 * @param rootPath - Absolute path to project root
 * @returns Normalized scan result with capabilities and evidence
 */
export async function scanProject(rootPath: string) {
  const scanner = getScanner(rootPath);
  return scanner.scan(rootPath);
}

// Re-export types and adapters
export * from "./adapters/index.js";
export * from "./utils/loadExpoConfig.js";
export * from "./utils/astScan.js";
