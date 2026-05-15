// src/modules/pv-beton/hooks/usePvForm.ts
import { usePvStore, usePvFormStore } from "../store";
import type { Pv } from "../types";

export const usePvForm = () => {
  const { addPv, updatePv, getPvById } = usePvStore();
  const { formData, editingPvId } = usePvFormStore();

  const generatePvId = (): string => {
    const year = new Date().getFullYear();
    const num  = Math.floor(Math.random() * 9000) + 1000;
    return `PV-${year}-${num}-SMAC`;
  };

  const savePv = (): Pv => {
    const { formData: latest, editingPvId: editId, resetForm } =
      usePvFormStore.getState();

    if (editId) {
      const existing = getPvById(editId);
      const updatedPv: Pv = {
        id:        editId,
        statut:    "enregistre",
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        step1:     latest.step1 as Pv["step1"],
        step2:     latest.step2 as Pv["step2"],
        step5:     latest.step5 as Pv["step5"],
      };
      updatePv(updatedPv);
      resetForm();
      return updatedPv;
    }

    const newPv: Pv = {
      id:        generatePvId(),
      statut:    "enregistre",
      createdAt: new Date().toISOString(),
      step1:     latest.step1 as Pv["step1"],
      step2:     latest.step2 as Pv["step2"],
      step5:     latest.step5 as Pv["step5"],
    };
    addPv(newPv);
    resetForm();
    return newPv;
  };

  return { savePv, formData, editingPvId };
};
