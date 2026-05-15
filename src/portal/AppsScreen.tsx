// src/portal/AppsScreen.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight, Menu, Droplets, Layers, Shield, FileText, Truck, ClipboardCheck } from "lucide-react";
import { MODULES, type AppModule } from "../navigation/moduleRegistry";
import { BottomNav } from "./PortalHomeScreen";

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

const AppRow = ({ mod, onClick }: { mod: AppModule; onClick: () => void }) => {
  const Icon = ICON_MAP[mod.id] ?? FileText;
  return (
    <button
      onClick={mod.available ? onClick : undefined}
      style={{
        width: "100%",
        backgroundColor: "#fff",
        borderRadius: 16,
        border: "none",
        padding: "16px 18px",
        cursor: mod.available ? "pointer" : "default",
        display: "flex", alignItems: "center", gap: 14,
        textAlign: "left",
        opacity: mod.available ? 1 : 0.5,
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        backgroundColor: mod.available ? "#FDECEA" : "#F3F4F6",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={20} color={mod.available ? "#E3000F" : "#9CA3AF"} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 14, fontWeight: 700, color: "#111827",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {mod.name}
        </p>
        {!mod.available && (
          <p style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
            Bientôt disponible
          </p>
        )}
      </div>
      <ChevronRight size={18} color="#C4C8CF" style={{ flexShrink: 0 }} />
    </button>
  );
};

const AppsScreen = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filtered = MODULES.filter((m) =>
    m.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100%", backgroundColor: "#F3F4F6",
    }}>

      {/* Header */}
      <div style={{
        backgroundColor: "#F3F4F6",
        padding: "20px 20px 0",
        display: "flex", alignItems: "center", gap: 12,
        flexShrink: 0,
      }}>
        <button style={{
          background: "none", border: "none", cursor: "pointer",
          padding: 4, display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Menu size={22} color="#111827" />
        </button>
        <span style={{ flex: 1, fontSize: 18, fontWeight: 900, color: "#E3000F", letterSpacing: "-0.02em" }}>
          SMAC PSA
        </span>
        <div style={{
          width: 38, height: 38, borderRadius: "50%",
          backgroundColor: "#374151",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <span style={{ fontSize: 18 }}>👤</span>
        </div>
      </div>

      {/* Title */}
      <div style={{ padding: "18px 20px 0", flexShrink: 0 }}>
        <p style={{ fontSize: 26, fontWeight: 900, color: "#111827", marginBottom: 4 }}>
          Toutes les Applications
        </p>
        <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 16 }}>
          Sélectionnez un formulaire pour commencer
        </p>

        {/* Search bar */}
        <div style={{
          backgroundColor: "#fff",
          borderRadius: 14,
          padding: "12px 14px",
          display: "flex", alignItems: "center", gap: 10,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          marginBottom: 4,
        }}>
          <Search size={16} color="#9CA3AF" style={{ flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une application..."
            style={{
              flex: 1, border: "none", outline: "none",
              fontSize: 14, color: "#111827", backgroundColor: "transparent",
            }}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "16px 20px 0" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.length === 0 ? (
            <p style={{ textAlign: "center", color: "#9CA3AF", fontSize: 14, padding: "40px 0" }}>
              Aucune application trouvée
            </p>
          ) : (
            filtered.map((mod) => (
              <AppRow
                key={mod.id}
                mod={mod}
                onClick={() => navigate(mod.route)}
              />
            ))
          )}
        </div>
        <div style={{ height: 24 }} />
      </div>

      <BottomNav active="apps" />
    </div>
  );
};

export default AppsScreen;
