// src/store/usePvFormStore.ts
import { create } from "zustand";
import type {
  Pv,
  PvFormData,
  PvStep1,
  PvStep2,
  PvStep5,
  Reserve,
} from "../types";

const initialFormData: PvFormData = {
  step1: { reserves: [] },
  step2: {},
  step5: {
    nomSmac:           "",
    participants:      [],
    receptionAcceptee: true,
    envoyerEmail:      false,
  },
};

interface PvFormStore {
  currentStep:  number;
  formData:     PvFormData;
  editingPvId?: string;

  // Navigation
  goToStep:    (step: number) => void;
  nextStep:    () => void;
  prevStep:    () => void;

  // Mise à jour par étape
  updateStep1: (data: Partial<PvStep1>) => void;
  updateStep2: (data: Partial<PvStep2>) => void;
  updateStep5: (data: Partial<PvStep5>) => void;

  // Gestion des réserves
  addReserve:    (reserve: Reserve)  => void;
  updateReserve: (reserve: Reserve)  => void;
  removeReserve: (id: string)        => void;

  // Charger un PV existant pour le modifier
  loadFromPv: (pv: Pv) => void;

  // Réinitialiser après enregistrement
  resetForm: () => void;
}

export const usePvFormStore = create<PvFormStore>()((set) => ({
  currentStep:  1,
  formData:     initialFormData,
  editingPvId:  undefined,

  // ── Navigation ──────────────────────────────────────────────────────────────
  goToStep: (step) => set({ currentStep: step }),
  nextStep: () =>
    set((state) => ({ currentStep: Math.min(state.currentStep + 1, 4) })),
  prevStep: () =>
    set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

  // ── Mise à jour des steps ────────────────────────────────────────────────────
  updateStep1: (data) =>
    set((state) => ({
      formData: { ...state.formData, step1: { ...state.formData.step1, ...data } },
    })),
  updateStep2: (data) =>
    set((state) => ({
      formData: { ...state.formData, step2: { ...state.formData.step2, ...data } },
    })),
  updateStep5: (data) =>
    set((state) => ({
      formData: { ...state.formData, step5: { ...state.formData.step5, ...data } },
    })),

  // ── Réserves ─────────────────────────────────────────────────────────────────
  addReserve: (reserve) =>
    set((state) => ({
      formData: {
        ...state.formData,
        step1: {
          ...state.formData.step1,
          reserves: [...(state.formData.step1.reserves ?? []), reserve],
        },
      },
    })),
  updateReserve: (reserve) =>
    set((state) => ({
      formData: {
        ...state.formData,
        step1: {
          ...state.formData.step1,
          reserves: (state.formData.step1.reserves ?? []).map((r) =>
            r.id === reserve.id ? reserve : r
          ),
        },
      },
    })),
  removeReserve: (id) =>
    set((state) => ({
      formData: {
        ...state.formData,
        step1: {
          ...state.formData.step1,
          reserves: (state.formData.step1.reserves ?? []).filter((r) => r.id !== id),
        },
      },
    })),

  // ── Charger un PV existant ────────────────────────────────────────────────────
  loadFromPv: (pv) =>
    set({
      currentStep:  1,
      editingPvId:  pv.id,
      formData: {
        step1: pv.step1,
        step2: pv.step2,
        step5: pv.step5,
      },
    }),

  // ── Reset ─────────────────────────────────────────────────────────────────────
  resetForm: () =>
    set({ currentStep: 1, formData: initialFormData, editingPvId: undefined }),
}));
