"use client";

import { useState, useCallback } from "react";
import {
  ALL_SPECS,
  validateAsset,
  resizeImage,
  type AssetSpec,
  type ValidatedAsset,
} from "@/lib/browser-scanner/asset-validator";

type Platform = "ios" | "android";
type AssetCategory = "screenshots" | "icons" | "features";

interface UploadedAsset extends ValidatedAsset {
  id: string;
}

export default function AssetsPage() {
  const [platform, setPlatform] = useState<Platform>("ios");
  const [category, setCategory] = useState<AssetCategory>("screenshots");
  const [assets, setAssets] = useState<Map<string, UploadedAsset[]>>(new Map());
  const [isProcessing, setIsProcessing] = useState(false);

  const getSpecs = useCallback((): AssetSpec[] => {
    if (category === "screenshots") {
      return platform === "ios"
        ? ALL_SPECS.iosScreenshots
        : ALL_SPECS.androidScreenshots;
    } else if (category === "icons") {
      return ALL_SPECS.icons.filter(
        (s) => s.platform === platform || s.platform === "both"
      );
    } else {
      return ALL_SPECS.features.filter(
        (s) => s.platform === platform || s.platform === "both"
      );
    }
  }, [platform, category]);

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    spec: AssetSpec
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);

    try {
      const newAssets: UploadedAsset[] = [];

      for (const file of Array.from(files)) {
        const result = await validateAsset(file, spec);
        newAssets.push({
          ...result.asset,
          id: `${spec.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        });
      }

      setAssets((prev) => {
        const next = new Map(prev);
        const existing = next.get(spec.id) || [];
        next.set(spec.id, [...existing, ...newAssets]);
        return next;
      });
    } catch (err) {
      console.error("Failed to process files:", err);
    } finally {
      setIsProcessing(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleResize = async (asset: UploadedAsset) => {
    setIsProcessing(true);
    try {
      const resized = await resizeImage(
        asset.file,
        asset.spec.width,
        asset.spec.height,
        asset.spec.formats.includes("image/png") ? "image/png" : "image/jpeg"
      );

      const result = await validateAsset(resized, asset.spec);
      const newAsset: UploadedAsset = {
        ...result.asset,
        id: asset.id,
      };

      setAssets((prev) => {
        const next = new Map(prev);
        const existing = next.get(asset.spec.id) || [];
        const updated = existing.map((a) => (a.id === asset.id ? newAsset : a));
        next.set(asset.spec.id, updated);
        return next;
      });
    } catch (err) {
      console.error("Failed to resize:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = (specId: string, assetId: string) => {
    setAssets((prev) => {
      const next = new Map(prev);
      const existing = next.get(specId) || [];
      const filtered = existing.filter((a) => a.id !== assetId);
      if (filtered.length === 0) {
        next.delete(specId);
      } else {
        next.set(specId, filtered);
      }
      return next;
    });
  };

  const handleDownload = (asset: UploadedAsset) => {
    const a = document.createElement("a");
    a.href = asset.preview;
    a.download = asset.file.name;
    a.click();
  };

  const specs = getSpecs();

  // Calculate summary
  const requiredSpecs = specs.filter((s) => s.required);
  const completedRequired = requiredSpecs.filter((s) => {
    const specAssets = assets.get(s.id) || [];
    return specAssets.some((a) => a.isValid);
  });
  const totalAssets = Array.from(assets.values()).flat().length;
  const validAssets = Array.from(assets.values())
    .flat()
    .filter((a) => a.isValid).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Assets</h1>
      <p className="text-gray-600 mb-8">
        Upload and validate screenshots, icons, and feature graphics for store
        submission.
      </p>

      {/* Platform & Category Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setPlatform("ios")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              platform === "ios"
                ? "bg-brand text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            🍎 iOS
          </button>
          <button
            onClick={() => setPlatform("android")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              platform === "android"
                ? "bg-brand text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            🤖 Android
          </button>
        </div>

        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setCategory("screenshots")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              category === "screenshots"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            📸 Screenshots
          </button>
          <button
            onClick={() => setCategory("icons")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              category === "icons"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            🎨 Icons
          </button>
          <button
            onClick={() => setCategory("features")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              category === "features"
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            🖼️ Feature Graphic
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="card mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {platform === "ios" ? "App Store Connect" : "Google Play Console"}{" "}
              - {category.charAt(0).toUpperCase() + category.slice(1)}
            </h2>
            <p className="text-sm text-gray-500">
              {completedRequired.length} of {requiredSpecs.length} required
              assets • {validAssets} of {totalAssets} uploaded valid
            </p>
          </div>
          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin w-4 h-4 border-2 border-brand border-t-transparent rounded-full"></div>
              Processing...
            </div>
          )}
        </div>
      </div>

      {/* Asset Specs */}
      <div className="space-y-6">
        {specs.map((spec) => (
          <AssetSpecCard
            key={spec.id}
            spec={spec}
            assets={assets.get(spec.id) || []}
            onFileSelect={(e) => handleFileSelect(e, spec)}
            onResize={handleResize}
            onRemove={(assetId) => handleRemove(spec.id, assetId)}
            onDownload={handleDownload}
          />
        ))}
      </div>
    </div>
  );
}

function AssetSpecCard({
  spec,
  assets,
  onFileSelect,
  onResize,
  onRemove,
  onDownload,
}: {
  spec: AssetSpec;
  assets: UploadedAsset[];
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResize: (asset: UploadedAsset) => void;
  onRemove: (assetId: string) => void;
  onDownload: (asset: UploadedAsset) => void;
}) {
  const hasValidAsset = assets.some((a) => a.isValid);
  const maxUploads = spec.type === "screenshot" ? 8 : 1;
  const canUploadMore = assets.length < maxUploads;

  return (
    <div
      className={`card border-2 ${
        spec.required && !hasValidAsset
          ? "border-red-200"
          : hasValidAsset
          ? "border-green-200"
          : "border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{spec.name}</h3>
            {spec.required && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                Required
              </span>
            )}
            {hasValidAsset && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                ✓ Ready
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">{spec.description}</p>
          <p className="text-xs text-gray-400 mt-1">
            {spec.width}×{spec.height}px •{" "}
            {spec.formats.map((f) => f.replace("image/", "")).join("/")} • Max{" "}
            {spec.maxSizeKB}KB
          </p>
        </div>

        {canUploadMore && (
          <label className="btn-primary cursor-pointer text-sm">
            Upload
            <input
              type="file"
              accept={spec.formats.join(",")}
              multiple={spec.type === "screenshot"}
              onChange={onFileSelect}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Uploaded Assets */}
      {assets.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
          {assets.map((asset) => (
            <AssetPreview
              key={asset.id}
              asset={asset}
              onResize={() => onResize(asset)}
              onRemove={() => onRemove(asset.id)}
              onDownload={() => onDownload(asset)}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {assets.length === 0 && (
        <label className="block border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-brand hover:bg-green-50/50 transition-colors">
          <div className="text-gray-400 text-3xl mb-2">📤</div>
          <p className="text-sm text-gray-500">
            Drag & drop or click to upload
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {spec.width}×{spec.height}px{" "}
            {spec.formats.map((f) => f.replace("image/", ".")).join(" ")}
          </p>
          <input
            type="file"
            accept={spec.formats.join(",")}
            multiple={spec.type === "screenshot"}
            onChange={onFileSelect}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}

function AssetPreview({
  asset,
  onResize,
  onRemove,
  onDownload,
}: {
  asset: UploadedAsset;
  onResize: () => void;
  onRemove: () => void;
  onDownload: () => void;
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className={`relative rounded-lg overflow-hidden border-2 ${
        asset.isValid ? "border-green-300" : "border-red-300"
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Preview Image */}
      <div className="aspect-[9/16] bg-gray-100 relative">
        <img
          src={asset.preview}
          alt={asset.file.name}
          className="w-full h-full object-contain"
        />

        {/* Status Badge */}
        <div
          className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${
            asset.isValid
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {asset.isValid ? "✓ Valid" : "✗ Invalid"}
        </div>

        {/* Dimensions Badge */}
        <div className="absolute bottom-2 left-2 px-2 py-1 rounded text-xs bg-black/70 text-white">
          {asset.width}×{asset.height}
        </div>

        {/* Actions Overlay */}
        {showActions && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2">
            {!asset.isValid && asset.errors.some((e) => e.includes("dimensions")) && (
              <button
                onClick={onResize}
                className="p-2 bg-white rounded-full text-sm hover:bg-gray-100"
                title="Resize to fit"
              >
                📐
              </button>
            )}
            <button
              onClick={onDownload}
              className="p-2 bg-white rounded-full text-sm hover:bg-gray-100"
              title="Download"
            >
              💾
            </button>
            <button
              onClick={onRemove}
              className="p-2 bg-white rounded-full text-sm hover:bg-gray-100"
              title="Remove"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Errors */}
      {asset.errors.length > 0 && (
        <div className="p-2 bg-red-50 text-xs text-red-700">
          {asset.errors.map((err, i) => (
            <div key={i}>• {err}</div>
          ))}
        </div>
      )}

      {/* Warnings */}
      {asset.warnings.length > 0 && asset.errors.length === 0 && (
        <div className="p-2 bg-amber-50 text-xs text-amber-700">
          {asset.warnings.map((warn, i) => (
            <div key={i}>• {warn}</div>
          ))}
        </div>
      )}

      {/* File Info */}
      <div className="p-2 text-xs text-gray-500 truncate">
        {asset.file.name} ({asset.sizeKB.toFixed(0)}KB)
      </div>
    </div>
  );
}
