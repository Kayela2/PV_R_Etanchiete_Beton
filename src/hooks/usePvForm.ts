// src/hooks/usePvForm.ts
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
    // Lire le state le plus récent au moment de l'appel (évite la closure périmée)
    const { formData: latest, editingPvId: editId, resetForm } =
      usePvFormStore.getState();

    if (editId) {
      // ── Mode édition : on met à jour le PV existant ──────────────────────────
      const existing = getPvById(editId);
      const updatedPv: Pv = {
        id:        editId,
        statut:    "enregistre",
        createdAt: existing?.createdAt ?? new Date().toISOString(),
        step1:     latest.step1 as Pv["step1"],
        step2:     latest.step2 as Pv["step2"],
        step3:     latest.step3 as Pv["step3"],
        step4:     latest.step4 as Pv["step4"],
        step5:     latest.step5 as Pv["step5"],
      };
      updatePv(updatedPv);
      resetForm();
      return updatedPv;
    }

    // ── Mode création : on crée un nouveau PV ────────────────────────────────
    const newPv: Pv = {
      id:        generatePvId(),
      statut:    "enregistre",
      createdAt: new Date().toISOString(),
      step1:     latest.step1 as Pv["step1"],
      step2:     latest.step2 as Pv["step2"],
      step3:     latest.step3 as Pv["step3"],
      step4:     latest.step4 as Pv["step4"],
      step5:     latest.step5 as Pv["step5"],
    };
    addPv(newPv);
    resetForm();
    return newPv;
  };

  return { savePv, formData, editingPvId };
};
