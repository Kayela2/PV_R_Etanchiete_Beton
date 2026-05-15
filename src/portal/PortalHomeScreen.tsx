// src/portal/PortalHomeScreen.tsx
import { useNavigate } from "react-router-dom";
import { Home, Grid, BarChart2, ChevronRight, Droplets, Truck, FileText, Shield, ClipboardCheck, Layers } from "lucide-react";
import { MODULES, type AppModule } from "../navigation/moduleRegistry";

/* ── Bottom Nav (shared, exported) ───────────────────── */
const NAV = [
  { key: "home",  label: "ACCUEIL", icon: Home,      route: "/" },
  { key: "apps",  label: "APPS",    icon: Grid,      route: "/apps" },
  { key: "stats", label: "STATS",   icon: BarChart2, route: "/stats" },
] as const;

export const BottomNav = ({ active }: { active: "home" | "apps" | "stats" }) => {
  const navigate = useNavigate();
  return (
    <div style={{
      backgroundColor: "#fff",
      borderTop: "1px solid #F3F4F6",
      display: "flex",
      flexShrink: 0,
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      {NAV.map((item) => {
        const isActive = item.key === active;
        return (
          <button
            key={item.key}
            onClick={() => navigate(item.route)}
            style={{
              flex: 1,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 3,
              padding: "10px 0 8px",
              background: "none", border: "none", cursor: "pointer",
              position: "relative",
            }}
          >
            <item.icon size={22} color={isActive ? "#E3000F" : "#9CA3AF"} />
            <span style={{
              fontSize: 9, fontWeight: 700,
              color: isActive ? "#E3000F" : "#9CA3AF",
              letterSpacing: "0.08em",
            }}>
              {item.label}
            </span>
            {isActive && (
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                backgroundColor: "#E3000F",
                marginTop: 1,
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
};

/* ── Module icon map ──────────────────────────────────── */
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  "pv-beton":             Droplets,
  "pv-charpente":         Layers,
  "pv-facade":            Shield,
  "pv-bardage":           Layers,
  "pv-couverture":        FileText,
  "etat-lieux":           ClipboardCheck,
  "inspection-securite":  Shield,
  "fourgon":              Truck,
};

const ModuleIcon = ({ id, available }: { id: string; available: boolean }) => {
  const Icon = ICON_MAP[id] ?? FileText;
  return (
    <div style={{
      width: 44, height: 44, borderRadius: 14,
      backgroundColor: available ? "#FDECEA" : "#F3F4F6",
      display: "flex", alignItems: "center", justifyContent: "center",
      marginBottom: 10,
    }}>
      <Icon size={22} color={available ? "#E3000F" : "#C4C8CF"} />
    </div>
  );
};

/* ── Module Grid Card ────────────────────────────────── */
const ModuleCard = ({ mod, onClick }: { mod: AppModule; onClick: () => void }) => (
  <div
    onClick={mod.available ? onClick : undefined}
    style={{
      backgroundColor: "#fff",
      borderRadius: 18,
      padding: "18px 14px 16px",
      display: "flex", flexDirection: "column",
      cursor: mod.available ? "pointer" : "default",
      opacity: mod.available ? 1 : 0.45,
      boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
      border: "1px solid #F3F4F6",
      minHeight: 120,
    }}
  >
    <ModuleIcon id={mod.id} available={mod.available} />
    <p style={{
      fontSize: 12, fontWeight: 700, color: "#111827",
      lineHeight: 1.4,
    }}>
      {mod.name}
    </p>
  </div>
);

/* ── Portal Home Screen ───────────────────────────────── */
const PortalHomeScreen = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100%", backgroundColor: "#F3F4F6",
    }}>

      {/* Header */}
      <div style={{
        backgroundColor: "#F3F4F6",
        padding: "20px 20px 0",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 18, fontWeight: 900, color: "#E3000F", letterSpacing: "-0.02em" }}>
          SMAC PSA
        </span>
        <div style={{
          width: 38, height: 38, borderRadius: "50%",
          backgroundColor: "#374151",
          display: "flex", alignItems: "center", justifyContent: "center",
          overflow: "hidden",
        }}>
          <span style={{ fontSize: 18 }}>👤</span>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "16px 20px 0" }}>

        {/* Hero banner */}
        <div style={{
          borderRadius: 22,
          background: "linear-gradient(135deg, #C0000B 0%, #E3000F 60%, #FF3B3B 100%)",
          padding: "28px 24px",
          marginBottom: 24,
          position: "relative",
          overflow: "hidden",
          minHeight: 150,
        }}>
          {/* decorative circles */}
          <div style={{
            position: "absolute", right: -20, top: -20,
            width: 130, height: 130, borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.08)",
          }} />
          <div style={{
            position: "absolute", right: 30, bottom: -30,
            width: 100, height: 100, borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.06)",
          }} />
          <p style={{
            fontSize: 26, fontWeight: 900, color: "#fff",
            lineHeight: 1.2, marginBottom: 10, position: "relative",
          }}>
            Bienvenue,<br />Opérateur
          </p>
          <p style={{
            fontSize: 12, color: "rgba(255,255,255,0.85)",
            lineHeight: 1.6, position: "relative", maxWidth: 220,
          }}>
            Consultez, gérez et suivez l'intégralité de vos procès-verbaux de chantier en temps réel.
          </p>
        </div>

        {/* Section header */}
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: 14,
        }}>
          <p style={{ fontSize: 17, fontWeight: 900, color: "#111827" }}>
            Tous Vos PV
          </p>
          <button
            onClick={() => navigate("/apps")}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 11, fontWeight: 700, color: "#9CA3AF",
              letterSpacing: "0.06em", textTransform: "uppercase",
              display: "flex", alignItems: "center", gap: 2,
            }}
          >
            VOIR TOUT <ChevronRight size={13} />
          </button>
        </div>

        {/* 2-column grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}>
          {MODULES.map((mod) => (
            <ModuleCard
              key={mod.id}
              mod={mod}
              onClick={() => navigate(mod.route)}
            />
          ))}
        </div>

        <div style={{ height: 24 }} />
      </div>

      <BottomNav active="home" />
    </div>
  );
};

export default PortalHomeScreen;
