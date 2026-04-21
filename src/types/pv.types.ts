// src/types/pv.types.ts
import type { Reserve } from "./reserve.types";

// ------- Données de référence -------

export interface Agence {
  id: string;
  nom: string;
}

export interface Etablissement {
  id: string;
  agenceId: string;
  nom: string;
}

// ------- Valeurs des toggles -------

export type ConformiteValue = "conforme" | "non-conforme" | "SO";

// ------- Étape 1 : Informations générales -------

export interface PvStep1 {
  agenceId:             string;
  etablissementId:      string;
  chantier:             string;
  zoneBatiment:         string;
  dateInspection:       string;
  responsableChantier:  string;
  planReperage?:        "oui" | "non";          // Plan de repérage joint à la réception
  natureTravaux?:       "etancheite-beton" | "autre-support"; // Nature des travaux
  reserves:             Reserve[];
}

// ------- Étape 2 : Nature / Surface / Support des relevés -------

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

// ------- Étape 5 : Participants -------

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

// ------- PV complet -------

export type PvStatut = "brouillon" | "enregistre";

export interface Pv {
  id:        string;
  statut:    PvStatut;
  createdAt: string;
  step1:     PvStep1;
  step2:     PvStep2;
  step5:     PvStep5;
}

// ------- Données du formulaire en cours -------

export type PvFormData = {
  step1: Partial<PvStep1>;
  step2: Partial<PvStep2>;
  step5: Partial<PvStep5>;
};
