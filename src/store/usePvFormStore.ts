// src/store/usePvFormStore.ts
import { create } from "zustand";
import type {
  Pv,
  PvFormData,
  PvStep1,
  PvStep2,
  PvStep3,
  PvStep4,
  PvStep5,
  Reserve,
} from "../types";

const initialFormData: PvFormData = {
  step1: { reserves: [] },
  step2: {},
  step3: {},
  step4: {},
  step5: {
    participants:      [],
    receptionAcceptee: true,
    envoyerEmail:      false,
  },
};

interface PvFormStore {
  currentStep:  number;
  formData:     PvFormData;
  editingPvId?: string;          // défini = mode édition

  // Navigation
  goToStep:    (step: number) => void;
  nextStep:    () => void;
  prevStep:    () => void;

  // Mise à jour par étape
  updateStep1: (data: Partial<PvStep1>) => void;
  updateStep2: (data: Partial<PvStep2>) => void;
  updateStep3: (data: Partial<PvStep3>) => void;
  updateStep4: (data: Partial<PvStep4>) => void;
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
    set((state) => ({ currentStep: Math.min(state.currentStep + 1, 6) })),
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
  updateStep3: (data) =>
    set((state) => ({
      formData: { ...state.formData, step3: { ...state.formData.step3, ...data } },
    })),
  updateStep4: (data) =>
    set((state) => ({
      formData: { ...state.formData, step4: { ...state.formData.step4, ...data } },
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
        step3: pv.step3,
        step4: pv.step4,
        step5: pv.step5,
      },
    }),

  // ── Reset ─────────────────────────────────────────────────────────────────────
  resetForm: () =>
    set({ currentStep: 1, formData: initialFormData, editingPvId: undefined }),
}));
