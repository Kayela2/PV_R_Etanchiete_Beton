// src/store/usePvStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Pv, PvVersion } from "../types";

const MAX_VERSIONS = 5;

interface PvStore {
  pvList:    Pv[];
  addPv:     (pv: Pv)     => void;
  updatePv:  (pv: Pv)     => void;
  removePv:  (id: string) => void;
  getPvById: (id: string) => Pv | undefined;
}

export const usePvStore = create<PvStore>()(
  persist(
    (set, get) => ({
      pvList: [],

      addPv: (pv) =>
        set((state) => ({
          pvList: [{ ...pv, versions: [] }, ...state.pvList],
        })),

      updatePv: (pv) =>
        set((state) => ({
          pvList: state.pvList.map((p) => {
            if (p.id !== pv.id) return p;

            // Snapshot de l'état actuel AVANT la mise à jour
            const { versions: _v, ...rest } = p;
            const versionId = typeof crypto?.randomUUID === "function"
              ? crypto.randomUUID()
              : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
            const newVersion: PvVersion = {
              versionId,
              savedAt:   new Date().toISOString(),
              snapshot:  rest,
            };

            const updatedVersions = [
              ...(p.versions ?? []),
              newVersion,
            ].slice(-MAX_VERSIONS);

            return {
              ...pv,
              updatedAt: new Date().toISOString(),
              versions:  updatedVersions,
            };
          }),
        })),

      removePv: (id) =>
        set((state) => ({
          pvList: state.pvList.filter((pv) => pv.id !== id),
        })),

      getPvById: (id) =>
        get().pvList.find((pv) => pv.id === id),
    }),
    { name: "smac-pv-storage" }
  )
);
