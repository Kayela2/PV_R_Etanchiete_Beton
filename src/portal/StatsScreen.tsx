// src/portal/StatsScreen.tsx
import { BarChart2 } from "lucide-react";
import { BottomNav } from "./PortalHomeScreen";

const StatsScreen = () => (
  <div style={{
    display: "flex", flexDirection: "column",
    height: "100%", backgroundColor: "#F3F4F6",
  }}>

    {/* Header */}
    <div style={{
      backgroundColor: "#fff",
      padding: "24px 20px 20px",
      borderBottom: "1px solid #E5E7EB",
      flexShrink: 0,
    }}>
      <p style={{ fontSize: 13, color: "#6B7280", fontWeight: 600, marginBottom: 2 }}>SMAC PSA</p>
      <p style={{ fontSize: 20, fontWeight: 900, color: "#111827" }}>Statistiques</p>
    </div>

    {/* Placeholder */}
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 16, padding: "40px 20px",
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        backgroundColor: "#F3F4F6",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <BarChart2 size={32} color="#D1D5DB" />
      </div>
      <p style={{ fontSize: 16, fontWeight: 700, color: "#374151", textAlign: "center" }}>
        Statistiques
      </p>
      <p style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", lineHeight: 1.6, maxWidth: 260 }}>
        Cette section sera disponible prochainement.
        Elle affichera les indicateurs clés de vos PV.
      </p>
    </div>

    <BottomNav active="stats" />
  </div>
);

export default StatsScreen;
