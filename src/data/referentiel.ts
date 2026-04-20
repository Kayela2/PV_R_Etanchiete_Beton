// src/data/referentiel.ts
import type { Agence, Etablissement } from "../types";

export const AGENCES: Agence[] = [
  { id: "ag-1", nom: "Agence Nantes" },
  { id: "ag-2", nom: "Agence Rennes" },
  { id: "ag-3", nom: "Agence Bordeaux" },
  { id: "ag-4", nom: "Agence Paris" },
];

export const ETABLISSEMENTS: Etablissement[] = [
  { id: "et-1", agenceId: "ag-1", nom: "Établissement Nord-Ouest" },
  { id: "et-2", agenceId: "ag-1", nom: "Établissement Centre" },
  { id: "et-3", agenceId: "ag-2", nom: "Établissement Ouest" },
  { id: "et-4", agenceId: "ag-3", nom: "Établissement Sud-Ouest" },
  { id: "et-5", agenceId: "ag-4", nom: "Établissement Île-de-France" },
];

// Utilitaire : filtre les établissements selon l'agence choisie
export const getEtablissementsByAgence = (agenceId: string): Etablissement[] =>
  ETABLISSEMENTS.filter((e) => e.agenceId === agenceId);