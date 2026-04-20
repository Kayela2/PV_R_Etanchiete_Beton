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

// ------- Étape 2 : État de surface -------

export interface PvStep2 {
  natureTravaux?: "etancheite-beton" | "autre-support";
  etatSurface: {
    regulariteSupport: ConformiteValue;
    propreteSupport:   ConformiteValue;
    pente?:            ConformiteValue;
  };
  partiesCourantes: {
    regulariteSupport: ConformiteValue;
    propreteSupport:   ConformiteValue;
  };
}

// ------- Étape 3 : Relevés d'étanchéité -------
// Note labels (les clés TypeScript restent stables) :
//   trousBanchesRebouches      → "Hauteur d'engravure"
//   remplissageJointsPanneaux  → "Profondeur d'engravure"
//   hauteurEngravure           → "Protection de la tête des relevés"
//   profondeurEngravure        → "Profondeur engravure"
//   protectionTeteReleves      → "Protection tête de relevés"
//   niveauxArase               → SUPPRIMÉ

export interface PvStep3 {
  releveEtancheite: {
    trousBanchesRebouches:     ConformiteValue;  // Hauteur d'engravure
    remplissageJointsPanneaux: ConformiteValue;  // Profondeur d'engravure
    hauteurEngravure:          ConformiteValue;  // Protection de la tête des relevés
    profondeurEngravure:       ConformiteValue;  // Profondeur engravure
    protectionTeteReleves:     ConformiteValue;  // Protection tête de relevés
  };
}

// ------- Étape 4 : Points singuliers -------
// Note labels :
//   deversoirs                         → "Ventilation"
//   reservationsSortiesPenetrations    → SUPPRIMÉ

export interface PvStep4 {
  pointsSinguliers: {
    tremiesLanterneaux: ConformiteValue;
    eauxPluviales:      ConformiteValue;
    deversoirs:         ConformiteValue;  // Ventilation
    tropPleins:         ConformiteValue;
    jointsDialatation:  ConformiteValue;
  };
  autresEcartsObservations: string;
}

// ------- Étape 5 : Participants -------

export interface Participant {
  id:         string;
  titre?:     string;
  nom:        string;
  signature?: string;
}

export interface PvStep5 {
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
  step3:     PvStep3;
  step4:     PvStep4;
  step5:     PvStep5;
}

// ------- Données du formulaire en cours -------

export type PvFormData = {
  step1: Partial<PvStep1>;
  step2: Partial<PvStep2>;
  step3: Partial<PvStep3>;
  step4: Partial<PvStep4>;
  step5: Partial<PvStep5>;
};
