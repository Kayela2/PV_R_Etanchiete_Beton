// src/modules/pv-beton/types/pv.types.ts
import type { Reserve } from "./reserve.types";

export interface Agence {
  id: string;
  nom: string;
}

export interface Etablissement {
  id: string;
  agenceId: string;
  nom: string;
}

export type ConformiteValue = "conforme" | "non-conforme" | "SO";

export interface PvStep1 {
  agenceId:             string;
  etablissementId:      string;
  chantier:             string;
  zoneBatiment:         string;
  dateInspection:       string;
  responsableChantier:  string;
  planReperage?:        "oui" | "non";
  natureTravaux?:       "etancheite-beton" | "autre-support";
  reserves:             Reserve[];
}

export interface PvStep2 {
  natureTravaux?: "etancheite-beton" | "autre-support";
  etatSurface: {
    regulariteSupport: ConformiteValue;
    propreteSupport:   ConformiteValue;
    pente:             ConformiteValue;
  };
  supportReleves: {
    hauteurEngravure:          ConformiteValue;
    profondeurEngravure:       ConformiteValue;
    protectionTeteReleves:     ConformiteValue;
    propreteSupportReleves:    ConformiteValue;
    tremiesLanterneaux:        ConformiteValue;
    eauxPluviales:             ConformiteValue;
    ventilation:               ConformiteValue;
    tropPleins:                ConformiteValue;
    jointsDialatation:         ConformiteValue;
    autresEcartsObservations?: string;
  };
}

export interface Participant {
  id:         string;
  titre?:     string;
  nom:        string;
  signature?: string;
}

export interface PvStep5 {
  nomSmac:             string;
  signatureSmac?:      string;
  participants:        Participant[];
  receptionAcceptee:   boolean;
  miseEnConformiteLe?: string;
  envoyerEmail:        boolean;
  emailDestinataire?:  string;
}

export type PvStatut = "brouillon" | "enregistre";

export interface PvVersion {
  versionId: string;
  savedAt:   string;
  snapshot:  Omit<Pv, "versions">;
}

export interface Pv {
  id:        string;
  statut:    PvStatut;
  createdAt: string;
  updatedAt?: string;
  step1:     PvStep1;
  step2:     PvStep2;
  step5:     PvStep5;
  versions?: PvVersion[];
}

export type PvFormData = {
  step1: Partial<PvStep1>;
  step2: Partial<PvStep2>;
  step5: Partial<PvStep5>;
};
