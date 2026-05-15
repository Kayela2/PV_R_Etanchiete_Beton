// src/modules/pv-beton/types/reserve.types.ts

export interface ReservePhoto {
  id: string;
  url: string;
  caption?: string;
}

export interface Reserve {
  id: string;
  localisation: string;
  detail: string;
  photos: ReservePhoto[];
  createdAt: string;
}

export type ReserveFormData = Omit<Reserve, "id" | "createdAt">;
