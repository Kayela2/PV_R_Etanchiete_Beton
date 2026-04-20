// src/store/usePvStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Pv } from "../types";

interface PvStore {
  pvList: Pv[];
  addPv:    (pv: Pv)          => void;
  updatePv: (pv: Pv)          => void;
  removePv: (id: string)      => void;
  getPvById:(id: string)      => Pv | undefined;
}

export const usePvStore = create<PvStore>()(
  persist(
    (set, get) => ({
      pvList: [],

      addPv: (pv) =>
        set((state) => ({ pvList: [pv, ...state.pvList] })),

      updatePv: (pv) =>
        set((state) => ({
          pvList: state.pvList.map((p) => (p.id === pv.id ? pv : p)),
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
