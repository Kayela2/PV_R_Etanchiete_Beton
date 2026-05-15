# SMAC PSA — PV Réception Support Béton Étanchéité

Application mobile et web destinée aux opérateurs SMAC pour créer, gérer et exporter des **procès-verbaux de réception support béton** (étanchéité).

---

## Présentation

L'application centralise l'ensemble des PV de chantier dans un portail unique. Le module **PV Béton** (seul actif à ce jour) permet de rédiger un PV en 4 étapes guidées, d'y joindre des réserves avec photos annotées, de collecter les signatures des participants, puis de générer un PDF exportable.

Les autres modules (Charpente, Façade, Bardage, État des lieux, Inspection Sécurité, Fourgon) sont prévus mais pas encore disponibles.

---

## Fonctionnalités

### Module PV Béton (`/apps/pv-beton`)
- **Étape 1** — Informations générales : agence, établissement, chantier, zone bâtiment, date d'inspection, responsable, plan de repérage, nature des travaux.
- **Étape 2** — État de la surface et support des relevés : conformité (conforme / non-conforme / SO) pour chaque point d'inspection (régularité, propreté, pente, engravures, trémies, etc.).
- **Réserves** — Ajout illimité de réserves avec description, photos et annotations sur image.
- **Étape 3 (Participants)** — Nom, titre et signature numérique de chaque participant + signature SMAC.
- **Génération PDF** — Export du PV complet via `jspdf`.
- **Historique** — Sauvegarde locale des PV avec versionnage (jusqu'à 5 snapshots par PV).
- **IDs uniques** — Format `PV-AAAA-XXXX-SMAC` généré automatiquement.

### Portail
- Accueil avec liste des modules disponibles.
- Navigation par onglets : Accueil / Apps / Stats.
- Écran Splash au démarrage (2,5 s).

---

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | React 19 + TypeScript |
| Bundler | Vite 8 |
| Navigation | React Router DOM 7 |
| State | Zustand 5 |
| Formulaires | React Hook Form 7 + Zod 4 |
| Styles | Tailwind CSS 4 (inline styles + utilitaires) |
| Icônes | Lucide React |
| PDF | jsPDF 4 |
| Signature | react-signature-canvas |
| Dates | date-fns 4 |
| Mobile | Capacitor 8 (iOS + Android) |
| Caméra | @capacitor/camera |
| Fichiers | @capacitor/filesystem |

---

## Structure du projet

```
src/
├── App.tsx
├── main.tsx
├── navigation/
│   ├── AppNavigator.tsx       # Routeur principal + splash
│   ├── RootNavigator.tsx
│   ├── moduleRegistry.ts      # Registre des modules de l'application
│   └── types.ts
├── portal/
│   ├── PortalHomeScreen.tsx   # Écran d'accueil du portail
│   ├── AppsScreen.tsx
│   └── StatsScreen.tsx
├── modules/
│   └── pv-beton/              # Module PV Réception Béton
│       ├── data/referentiel.ts
│       ├── hooks/
│       │   ├── usePvForm.ts   # Sauvegarde / mise à jour d'un PV
│       │   └── usePhotoCapture.ts
│       ├── screens/
│       │   ├── HomeScreen.tsx
│       │   ├── PvDetailScreen.tsx
│       │   └── pv/
│       │       ├── PvFormLayout.tsx      # Layout multi-étapes
│       │       ├── Step1InfoScreen.tsx
│       │       ├── Step2SurfaceScreen.tsx
│       │       ├── Step5ParticipantsScreen.tsx
│       │       ├── Step6SuccessScreen.tsx
│       │       ├── PvHistoryScreen.tsx
│       │       ├── PvReservesScreen.tsx
│       │       ├── AllReservesScreen.tsx
│       │       └── ReserveFormScreen.tsx
│       ├── store/
│       │   ├── usePvStore.ts       # CRUD des PV sauvegardés
│       │   └── usePvFormStore.ts   # État du formulaire en cours
│       ├── types/
│       └── utils/generatePvPdf.ts
├── components/
│   ├── ui/         # Button, Input, TextArea, Select, ToggleGroup
│   └── shared/     # StepIndicator, ConfirmModal, SignatureCanvas,
│                   # ImageAnnotator, PvCard
├── schemas/        # Schémas Zod (step1, réserves)
├── theme/          # Couleurs, espacements, typographie
└── types/          # Types globaux (Pv, Reserve, etc.)
```

---

## Installation et démarrage

### Prérequis
- Node.js ≥ 18
- npm ≥ 9

### Web (développement)

```bash
npm install
npm run dev
```

L'application est accessible sur `http://localhost:5173`.

### Build de production

```bash
npm run build
npm run preview
```

### Mobile (Capacitor)

```bash
# Synchroniser le build web vers les projets natifs
npm run build
npx cap sync

# iOS (macOS requis)
npx cap open ios

# Android
npx cap open android
```

---

## Informations Capacitor

| Propriété | Valeur |
|---|---|
| App ID | `com.smac.pv` |
| App Name | `PV-DE-RECEPTION-SUPPORT-BETON-ETANCHEITE` |
| Web Dir | `dist` |
| Permissions | Caméra, Photos |

---

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Lance le serveur de développement Vite |
| `npm run build` | Compile TypeScript puis build Vite |
| `npm run preview` | Prévisualise le build de production |
| `npm run lint` | Analyse le code avec ESLint |

---

## Modèle de données

Un PV (`Pv`) est composé de :

```
Pv
├── id          string          (PV-AAAA-XXXX-SMAC)
├── statut      "brouillon" | "enregistre"
├── createdAt   ISO datetime
├── step1       PvStep1         Informations générales + réserves[]
├── step2       PvStep2         Conformités surface / relevés
├── step5       PvStep5         Participants + signatures + envoi email
└── versions[]  PvVersion[]     Snapshots précédents (max 5)
```

---

## Conventions

- **Langue** : interface et code en français.
- **Couleur primaire** : `#E3000F` (rouge SMAC).
- **Styles** : inline styles React (pas de classes Tailwind dans les composants métier).
- **Zustand** : un store par domaine (`usePvStore` pour la persistance, `usePvFormStore` pour le formulaire en cours).
