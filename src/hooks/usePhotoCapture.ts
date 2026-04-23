// src/hooks/usePhotoCapture.ts
import { useState } from "react";
import { Camera, MediaTypeSelection, type MediaResult } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import type { ReservePhoto } from "../types";

const toReservePhoto = (dataUrl: string, name = "photo"): ReservePhoto => ({
  id:      crypto.randomUUID(),
  url:     dataUrl,
  caption: name,
});

// Convertit un webPath Capacitor (capacitor:// ou blob:) en data URL base64
const webPathToDataUrl = (webPath: string): Promise<string> =>
  fetch(webPath)
    .then((r) => r.blob())
    .then(
      (blob) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload  = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    );

const mediaResultToPhoto = async (result: MediaResult): Promise<ReservePhoto | null> => {
  if (!result.webPath) return null;
  const dataUrl = await webPathToDataUrl(result.webPath);
  return dataUrl ? toReservePhoto(dataUrl) : null;
};

// Fallback web : <input type="file"> invisible
const webFilePicker = (multiple: boolean, capture?: string): Promise<File[]> =>
  new Promise((resolve) => {
    const input    = document.createElement("input");
    input.type     = "file";
    input.accept   = "image/*";
    input.multiple = multiple;
    if (capture) input.setAttribute("capture", capture);
    input.onchange = () => resolve(Array.from(input.files ?? []));
    input.oncancel = () => resolve([]);
    input.click();
  });

const filesToPhotos = (files: File[]): Promise<ReservePhoto[]> =>
  Promise.all(
    files.map(
      (file) =>
        new Promise<ReservePhoto>((resolve) => {
          const reader   = new FileReader();
          reader.onload  = (ev) =>
            resolve(toReservePhoto((ev.target?.result as string) ?? "", file.name));
          reader.onerror = () => resolve(toReservePhoto("", file.name));
          reader.readAsDataURL(file);
        })
    )
  ).then((results) => results.filter((p) => p.url !== ""));

const isCancellation = (err: unknown) => {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  return msg.includes("cancel") || msg.includes("denied by user") || msg.includes("user cancelled");
};

export const usePhotoCapture = () => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const isNative = Capacitor.isNativePlatform();

  // ── Prendre une photo avec la caméra ─────────────────────────────────────
  const takePhoto = async (): Promise<ReservePhoto[]> => {
    setLoading(true);
    setError(null);
    try {
      if (isNative) {
        const result = await Camera.takePhoto({ quality: 85 });
        const photo  = await mediaResultToPhoto(result);
        return photo ? [photo] : [];
      }
      // Web : file input avec ouverture directe de la caméra
      const files = await webFilePicker(false, "environment");
      return filesToPhotos(files);
    } catch (err) {
      if (!isCancellation(err)) setError(err instanceof Error ? err.message : String(err));
      return [];
    } finally {
      setLoading(false);
    }
  };

  // ── Importer depuis la galerie ────────────────────────────────────────────
  const importFromGallery = async (multiple = true): Promise<ReservePhoto[]> => {
    setLoading(true);
    setError(null);
    try {
      if (isNative) {
        const { results } = await Camera.chooseFromGallery({
          mediaType:             MediaTypeSelection.Photo,
          allowMultipleSelection: multiple,
          quality:               85,
        });
        const photos = await Promise.all(results.map(mediaResultToPhoto));
        return photos.filter((p): p is ReservePhoto => p !== null);
      }
      // Web : file input standard
      const files = await webFilePicker(multiple);
      return filesToPhotos(files);
    } catch (err) {
      if (!isCancellation(err)) setError(err instanceof Error ? err.message : String(err));
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { takePhoto, importFromGallery, loading, error };
};
