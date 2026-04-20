// src/hooks/usePhotoCapture.ts
import { useState } from "react";
import type { ReservePhoto } from "../types";

/**
 * Hook utilitaire pour capturer des photos via l'API fichier du navigateur.
 * Fonctionne sur desktop, mobile PWA, iOS Safari et Android Chrome.
 * Non utilisé directement dans les écrans — ceux-ci gèrent leurs propres inputs overlay.
 */
export const usePhotoCapture = () => {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const readFileArray = (files: File[]): Promise<ReservePhoto[]> =>
    Promise.all(
      files.map(
        (file) =>
          new Promise<ReservePhoto>((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) =>
              resolve({
                id:      crypto.randomUUID(),
                url:     (ev.target?.result as string) ?? "",
                caption: file.name,
              });
            reader.onerror = () =>
              resolve({ id: crypto.randomUUID(), url: "", caption: file.name });
            reader.readAsDataURL(file);
          })
      )
    ).then((results) => results.filter((p) => p.url !== ""));

  const capture = async (multiple = true): Promise<ReservePhoto[]> => {
    setLoading(true);
    setError(null);
    return new Promise((resolve) => {
      const input    = document.createElement("input");
      input.type     = "file";
      input.accept   = "image/*";
      input.multiple = multiple;

      input.onchange = async () => {
        const arr = Array.from(input.files ?? []);
        const photos = await readFileArray(arr);
        setLoading(false);
        resolve(photos);
      };

      input.oncancel = () => { setLoading(false); resolve([]); };
      input.click();
    });
  };

  const takePhoto          = () => capture(false);
  const importFromGallery  = (multiple = true) => capture(multiple);

  return { takePhoto, importFromGallery, loading, error };
};
