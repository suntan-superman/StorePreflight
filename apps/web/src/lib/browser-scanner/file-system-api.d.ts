/**
 * TypeScript declarations for File System Access API
 * https://developer.mozilla.org/en-US/docs/Web/API/File_System_API
 */

interface FileSystemHandle {
  kind: "file" | "directory";
  name: string;
}

interface FileSystemFileHandle extends FileSystemHandle {
  kind: "file";
  getFile(): Promise<File>;
}

interface FileSystemDirectoryHandle extends FileSystemHandle {
  kind: "directory";
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
  values(): AsyncIterableIterator<FileSystemFileHandle | FileSystemDirectoryHandle>;
  entries(): AsyncIterableIterator<[string, FileSystemFileHandle | FileSystemDirectoryHandle]>;
}

interface ShowDirectoryPickerOptions {
  mode?: "read" | "readwrite";
  startIn?: FileSystemHandle | "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos";
}

interface Window {
  showDirectoryPicker(options?: ShowDirectoryPickerOptions): Promise<FileSystemDirectoryHandle>;
}
