// src/navigation/moduleRegistry.ts

export interface AppModule {
  id: string;
  name: string;
  description: string;
  route: string;
  color: string;
  available: boolean;
}

export const MODULES: AppModule[] = [
  {
    id: "pv-beton",
    name: "PV Réception Support Béton – Étanchéité",
    description: "Procès-verbal de réception support béton",
    route: "/apps/pv-beton",
    color: "#E3000F",
    available: true,
  },
  {
    id: "pv-charpente",
    name: "PV de Réception Support Charpente",
    description: "Procès-verbal de réception charpente",
    route: "/apps/pv-charpente",
    color: "#E3000F",
    available: false,
  },
  {
    id: "pv-facade",
    name: "PV de Réception Facade Béton",
    description: "Procès-verbal de réception façade béton",
    route: "/apps/pv-facade",
    color: "#E3000F",
    available: false,
  },
  {
    id: "pv-bardage",
    name: "PV Charpente Béton Bardage",
    description: "Procès-verbal charpente béton bardage",
    route: "/apps/pv-bardage",
    color: "#E3000F",
    available: false,
  },
  {
    id: "etat-lieux",
    name: "Etat Des Lieux",
    description: "Fiche d'état des lieux",
    route: "/apps/etat-lieux",
    color: "#E3000F",
    available: false,
  },
  {
    id: "inspection-securite",
    name: "Inspection Sécurité",
    description: "Fiche d'inspection sécurité chantier",
    route: "/apps/inspection-securite",
    color: "#E3000F",
    available: false,
  },
  {
    id: "fourgon",
    name: "Fiche de Vérification Fourgon",
    description: "Vérification journalière du fourgon",
    route: "/apps/fourgon",
    color: "#E3000F",
    available: false,
  },
];
