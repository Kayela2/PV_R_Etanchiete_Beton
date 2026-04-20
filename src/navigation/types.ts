// navigation/types.ts
/*export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  PvForm: { step?: number };
  ReserveDetail: { reserveId?: string };
};*/
// src/navigation/types.ts
export type AppRoute =
  | "splash"
  | "home"
  | "pv-form"
  | "reserve-form"
  | "reserve-detail";