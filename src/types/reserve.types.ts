// src/types/reserve.types.ts

export interface ReservePhoto {
  id: string;
  url: string;           // URL locale (blob) ou distante
  caption?: string;      // Légende optionnelle
}

export interface Reserve {
  id: string;
  localisation: string;  // Ex: "Toiture Zone Nord-Est"
  detail: string;        // Description du défaut + actions à mener
  photos: ReservePhoto[];
  createdAt: string;     // ISO date string
}

// Pour la création : pas encore d'id ni de date
export type ReserveFormData = Omit<Reserve, "id" | "createdAt">;