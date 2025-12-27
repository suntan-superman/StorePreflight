/**
 * File System Access API Utilities
 * Browser-based folder reading
 */

/// <reference path="./file-system-api.d.ts" />

import type { FileEntry } from "./types";

// Declare the global for TypeScript
declare global {
  interface Window {
    showDirectoryPicker(options?: { mode?: "read" | "readwrite" }): Promise<FileSystemDirectoryHandle>;
  }
}

/**
 * Check if File System Access API is supported
 */
export function isFileSystemAccessSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "showDirectoryPicker" in window;
}

/**
 * Prompt user to select a project folder
 */
export async function selectProjectFolder(): Promise<FileSystemDirectoryHandle> {
  if (!isFileSystemAccessSupported()) {
    throw new Error(
      "Your browser doesn't support folder selection. Please use Chrome, Edge, or another Chromium-based browser."
    );
  }

  try {
    const handle = await window.showDirectoryPicker({
      mode: "read",
    });
    return handle;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Folder selection was cancelled");
    }
    throw err;
  }
}

/**
 * File patterns to scan
 */
const SCAN_PATTERNS = {
  config: ["app.json", "app.config.js", "app.config.ts", "package.json"],
  sourceExtensions: [".ts", ".tsx", ".js", ".jsx"],
  sourceDirs: ["src", "app", "components", "screens", "lib", "hooks"],
  ignoreDirs: ["node_modules", ".expo", "dist", "build", ".git", "__tests__"],
};

/**
 * Read all relevant files from the project
 */
export async function readProjectFiles(
  rootHandle: FileSystemDirectoryHandle
): Promise<Map<string, FileEntry>> {
  const files = new Map<string, FileEntry>();

  // Read config files from root
  for (const configFile of SCAN_PATTERNS.config) {
    try {
      const content = await readFile(rootHandle, configFile);
      if (content !== null) {
        files.set(configFile, {
          name: configFile,
          path: configFile,
          content,
        });
      }
    } catch {
      // File doesn't exist, skip
    }
  }

  // Recursively read source directories
  await readSourceFiles(rootHandle, "", files);

  return files;
}

/**
 * Read a single file from a directory handle
 */
async function readFile(
  dirHandle: FileSystemDirectoryHandle,
  fileName: string
): Promise<string | null> {
  try {
    const fileHandle = await dirHandle.getFileHandle(fileName);
    const file = await fileHandle.getFile();
    return await file.text();
  } catch {
    return null;
  }
}

/**
 * Recursively read source files
 */
async function readSourceFiles(
  dirHandle: FileSystemDirectoryHandle,
  currentPath: string,
  files: Map<string, FileEntry>,
  depth: number = 0
): Promise<void> {
  // Limit depth to avoid excessive scanning
  if (depth > 5) return;

  try {
    for await (const entry of dirHandle.values()) {
      const entryPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;

      if (entry.kind === "directory") {
        // Skip ignored directories
        if (SCAN_PATTERNS.ignoreDirs.includes(entry.name)) {
          continue;
        }

        // Only scan source directories at root level, then recurse into all subdirs
        if (depth === 0 && !SCAN_PATTERNS.sourceDirs.includes(entry.name)) {
          continue;
        }

        const subDirHandle = await dirHandle.getDirectoryHandle(entry.name);
        await readSourceFiles(subDirHandle, entryPath, files, depth + 1);
      } else if (entry.kind === "file") {
        // Check if it's a source file
        const isSourceFile = SCAN_PATTERNS.sourceExtensions.some((ext) =>
          entry.name.endsWith(ext)
        );

        if (isSourceFile) {
          const content = await readFile(dirHandle, entry.name);
          if (content !== null) {
            files.set(entryPath, {
              name: entry.name,
              path: entryPath,
              content,
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn(`Error reading directory ${currentPath}:`, err);
  }
}
