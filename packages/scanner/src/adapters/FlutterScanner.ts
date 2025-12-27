/**
 * FlutterScanner - Scanner adapter for Flutter projects (Stub for Phase 2)
 */

import fs from "fs";
import path from "path";
import type { ScannerAdapter } from "./ScannerAdapter.js";
import type { ScanResult } from "@storepreflight/shared";

export class FlutterScanner implements ScannerAdapter {
  id = "flutter";

  /**
   * Detect if this is a Flutter project
   */
  detectProject(rootPath: string): boolean {
    const pubspecPath = path.join(rootPath, "pubspec.yaml");
    return fs.existsSync(pubspecPath);
  }

  /**
   * Perform full project scan (stub implementation)
   */
  async scan(_rootPath: string): Promise<ScanResult> {
    // TODO: Implement Flutter scanning in Phase 2
    // - Parse pubspec.yaml for dependencies
    // - Parse AndroidManifest.xml for permissions
    // - Parse Info.plist for iOS usage descriptions
    // - Optional: Dart AST scanning

    throw new Error(
      "Flutter scanning is not yet implemented. Coming in Phase 2!"
    );
  }
}
