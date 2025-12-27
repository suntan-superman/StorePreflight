/**
 * Asset Validator
 * Client-side image validation and processing for store submissions
 */

export interface AssetSpec {
  id: string;
  name: string;
  platform: "ios" | "android" | "both";
  type: "screenshot" | "icon" | "feature";
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: number;
  formats: string[];
  maxSizeKB: number;
  required: boolean;
  description: string;
}

export interface ValidatedAsset {
  spec: AssetSpec;
  file: File;
  preview: string;
  width: number;
  height: number;
  sizeKB: number;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface AssetValidationResult {
  asset: ValidatedAsset;
  canResize: boolean;
}

/**
 * App Store Connect Screenshot Specifications
 */
export const IOS_SCREENSHOT_SPECS: AssetSpec[] = [
  {
    id: "ios-6.9",
    name: "iPhone 6.9\" Display",
    platform: "ios",
    type: "screenshot",
    width: 1320,
    height: 2868,
    formats: ["image/png", "image/jpeg"],
    maxSizeKB: 10240,
    required: true,
    description: "iPhone 16 Pro Max (required)",
  },
  {
    id: "ios-6.7",
    name: "iPhone 6.7\" Display",
    platform: "ios",
    type: "screenshot",
    width: 1290,
    height: 2796,
    formats: ["image/png", "image/jpeg"],
    maxSizeKB: 10240,
    required: false,
    description: "iPhone 15 Pro Max, 15 Plus, 14 Pro Max",
  },
  {
    id: "ios-6.5",
    name: "iPhone 6.5\" Display",
    platform: "ios",
    type: "screenshot",
    width: 1284,
    height: 2778,
    formats: ["image/png", "image/jpeg"],
    maxSizeKB: 10240,
    required: false,
    description: "iPhone 14 Plus, 13 Pro Max, 12 Pro Max",
  },
  {
    id: "ios-5.5",
    name: "iPhone 5.5\" Display",
    platform: "ios",
    type: "screenshot",
    width: 1242,
    height: 2208,
    formats: ["image/png", "image/jpeg"],
    maxSizeKB: 10240,
    required: false,
    description: "iPhone 8 Plus, 7 Plus, 6s Plus",
  },
  {
    id: "ios-ipad-pro-13",
    name: "iPad Pro 13\" Display",
    platform: "ios",
    type: "screenshot",
    width: 2064,
    height: 2752,
    formats: ["image/png", "image/jpeg"],
    maxSizeKB: 10240,
    required: false,
    description: "iPad Pro 13\" (6th gen)",
  },
  {
    id: "ios-ipad-pro-12.9",
    name: "iPad Pro 12.9\" Display",
    platform: "ios",
    type: "screenshot",
    width: 2048,
    height: 2732,
    formats: ["image/png", "image/jpeg"],
    maxSizeKB: 10240,
    required: false,
    description: "iPad Pro 12.9\" (2nd-5th gen)",
  },
];

/**
 * Google Play Store Screenshot Specifications
 */
export const ANDROID_SCREENSHOT_SPECS: AssetSpec[] = [
  {
    id: "android-phone",
    name: "Phone Screenshots",
    platform: "android",
    type: "screenshot",
    width: 1080,
    height: 1920,
    minWidth: 320,
    minHeight: 320,
    maxWidth: 3840,
    maxHeight: 3840,
    formats: ["image/png", "image/jpeg"],
    maxSizeKB: 8192,
    required: true,
    description: "16:9 aspect ratio recommended (min 2, max 8)",
  },
  {
    id: "android-tablet-7",
    name: "7\" Tablet Screenshots",
    platform: "android",
    type: "screenshot",
    width: 1200,
    height: 1920,
    minWidth: 320,
    minHeight: 320,
    maxWidth: 3840,
    maxHeight: 3840,
    formats: ["image/png", "image/jpeg"],
    maxSizeKB: 8192,
    required: false,
    description: "7-inch tablet screenshots",
  },
  {
    id: "android-tablet-10",
    name: "10\" Tablet Screenshots",
    platform: "android",
    type: "screenshot",
    width: 1600,
    height: 2560,
    minWidth: 320,
    minHeight: 320,
    maxWidth: 3840,
    maxHeight: 3840,
    formats: ["image/png", "image/jpeg"],
    maxSizeKB: 8192,
    required: false,
    description: "10-inch tablet screenshots",
  },
];

/**
 * App Icon Specifications
 */
export const ICON_SPECS: AssetSpec[] = [
  {
    id: "ios-icon",
    name: "iOS App Icon",
    platform: "ios",
    type: "icon",
    width: 1024,
    height: 1024,
    formats: ["image/png"],
    maxSizeKB: 1024,
    required: true,
    description: "1024x1024 PNG, no transparency, no rounded corners",
  },
  {
    id: "android-icon",
    name: "Android App Icon",
    platform: "android",
    type: "icon",
    width: 512,
    height: 512,
    formats: ["image/png"],
    maxSizeKB: 1024,
    required: true,
    description: "512x512 PNG, 32-bit with alpha",
  },
];

/**
 * Feature Graphic Specifications
 */
export const FEATURE_SPECS: AssetSpec[] = [
  {
    id: "android-feature",
    name: "Feature Graphic",
    platform: "android",
    type: "feature",
    width: 1024,
    height: 500,
    formats: ["image/png", "image/jpeg"],
    maxSizeKB: 1024,
    required: true,
    description: "1024x500 PNG or JPEG, displayed on Play Store",
  },
];

/**
 * All asset specifications grouped
 */
export const ALL_SPECS = {
  iosScreenshots: IOS_SCREENSHOT_SPECS,
  androidScreenshots: ANDROID_SCREENSHOT_SPECS,
  icons: ICON_SPECS,
  features: FEATURE_SPECS,
};

/**
 * Get image dimensions from a File
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Validate an image file against a spec
 */
export async function validateAsset(
  file: File,
  spec: AssetSpec
): Promise<AssetValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check format
  if (!spec.formats.includes(file.type)) {
    errors.push(`Invalid format: ${file.type}. Expected: ${spec.formats.join(" or ")}`);
  }
  
  // Check file size
  const sizeKB = file.size / 1024;
  if (sizeKB > spec.maxSizeKB) {
    errors.push(`File too large: ${sizeKB.toFixed(0)}KB. Max: ${spec.maxSizeKB}KB`);
  }
  
  // Get dimensions
  let width = 0;
  let height = 0;
  let canResize = false;
  
  try {
    const dims = await getImageDimensions(file);
    width = dims.width;
    height = dims.height;
    
    // Check exact dimensions for icons
    if (spec.type === "icon" || spec.type === "feature") {
      if (width !== spec.width || height !== spec.height) {
        errors.push(`Wrong dimensions: ${width}x${height}. Required: ${spec.width}x${spec.height}`);
        canResize = true;
      }
    } else {
      // Screenshots have more flexibility
      if (spec.minWidth && width < spec.minWidth) {
        errors.push(`Width too small: ${width}px. Min: ${spec.minWidth}px`);
      }
      if (spec.maxWidth && width > spec.maxWidth) {
        errors.push(`Width too large: ${width}px. Max: ${spec.maxWidth}px`);
      }
      if (spec.minHeight && height < spec.minHeight) {
        errors.push(`Height too small: ${height}px. Min: ${spec.minHeight}px`);
      }
      if (spec.maxHeight && height > spec.maxHeight) {
        errors.push(`Height too large: ${height}px. Max: ${spec.maxHeight}px`);
      }
      
      // Check aspect ratio match
      const targetAspect = spec.width / spec.height;
      const actualAspect = width / height;
      const aspectDiff = Math.abs(targetAspect - actualAspect);
      
      if (aspectDiff > 0.1) {
        warnings.push(`Aspect ratio mismatch. Expected ~${targetAspect.toFixed(2)}, got ${actualAspect.toFixed(2)}`);
      }
    }
  } catch {
    errors.push("Failed to read image dimensions");
  }
  
  const preview = URL.createObjectURL(file);
  
  return {
    asset: {
      spec,
      file,
      preview,
      width,
      height,
      sizeKB,
      isValid: errors.length === 0,
      errors,
      warnings,
    },
    canResize,
  };
}

/**
 * Resize an image to target dimensions using Canvas
 */
export async function resizeImage(
  file: File,
  targetWidth: number,
  targetHeight: number,
  format: "image/png" | "image/jpeg" = "image/png",
  quality: number = 0.92
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      
      // Use high-quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      
      // Draw scaled image
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to create blob"));
            return;
          }
          
          const resizedFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, format === "image/png" ? ".png" : ".jpg"),
            { type: format }
          );
          resolve(resizedFile);
        },
        format,
        quality
      );
      
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      reject(new Error("Failed to load image"));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Auto-detect which spec an image best matches
 */
export function detectBestSpec(
  width: number,
  height: number,
  type: "screenshot" | "icon" | "feature"
): AssetSpec | null {
  let allSpecs: AssetSpec[] = [];
  
  if (type === "screenshot") {
    allSpecs = [...IOS_SCREENSHOT_SPECS, ...ANDROID_SCREENSHOT_SPECS];
  } else if (type === "icon") {
    allSpecs = ICON_SPECS;
  } else {
    allSpecs = FEATURE_SPECS;
  }
  
  // Find exact match first
  const exact = allSpecs.find((s) => s.width === width && s.height === height);
  if (exact) return exact;
  
  // Find closest aspect ratio match
  const targetAspect = width / height;
  let bestMatch: AssetSpec | null = null;
  let bestDiff = Infinity;
  
  for (const spec of allSpecs) {
    const specAspect = spec.width / spec.height;
    const diff = Math.abs(targetAspect - specAspect);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestMatch = spec;
    }
  }
  
  return bestMatch;
}
