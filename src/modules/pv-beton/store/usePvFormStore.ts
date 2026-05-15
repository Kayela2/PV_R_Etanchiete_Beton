// src/modules/pv-beton/store/usePvFormStore.ts
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

  goToStep:    (step: number) => void;
  nextStep:    () => void;
  prevStep:    () => void;

  updateStep1: (data: Partial<PvStep1>) => void;
  updateStep2: (data: Partial<PvStep2>) => void;
  updateStep5: (data: Partial<PvStep5>) => void;

  addReserve:    (reserve: Reserve)  => void;
  updateReserve: (reserve: Reserve)  => void;
  removeReserve: (id: string)        => void;

  loadFromPv: (pv: Pv) => void;
  resetForm: () => void;
}

export const usePvFormStore = create<PvFormStore>()((set) => ({
  currentStep:  1,
  formData:     initialFormData,
  editingPvId:  undefined,

  goToStep: (step) => set({ currentStep: step }),
  nextStep: () =>
    set((state) => ({ currentStep: Math.min(state.currentStep + 1, 4) })),
  prevStep: () =>
    set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

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

  resetForm: () =>
    set({ currentStep: 1, formData: initialFormData, editingPvId: undefined }),
}));
