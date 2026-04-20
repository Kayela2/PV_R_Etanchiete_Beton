// src/components/shared/PvCard.tsx
import { Building2, Calendar, Landmark } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { Pv } from "../../types";
import { AGENCES, ETABLISSEMENTS } from "../../data/referentiel";

// ── Icône PDF personnalisée (fidèle au Figma) ─────────────────────────────────
const PdfIcon = () => (
  <div style={{
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: "#FDECEA",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  }}>
    {/* Mini document SVG avec badge PDF */}
    <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
      <rect x="1" y="1" width="13" height="17" rx="2" fill="#fff" stroke="#E3000F" strokeWidth="1.5"/>
      <path d="M4 5h7M4 8h7M4 11h4" stroke="#E3000F" strokeWidth="1.2" strokeLinecap="round"/>
      <rect x="9" y="13" width="10" height="7" rx="2" fill="#E3000F"/>
      <text x="14" y="18.5" textAnchor="middle" fontSize="4.5" fontWeight="800" fill="#fff" fontFamily="Arial, sans-serif">PDF</text>
    </svg>
  </div>
);

// ── Composant ─────────────────────────────────────────────────────────────────
export const PvCard = ({ pv, onClick }: { pv: Pv; onClick?: () => void }) => {
  const agence        = AGENCES.find((a) => a.id === pv.step1?.agenceId);
  const etablissement = ETABLISSEMENTS.find((e) => e.id === pv.step1?.etablissementId);

  const dateLabel = pv.step1?.dateInspection
    ? format(new Date(pv.step1.dateInspection), "dd MMM. yyyy", { locale: fr })
    : "—";

  // Formatage de l'ID : "PV-2024-0892-SMAC" → "PV #2024-0892"
  const idLabel = pv.id.replace(/-SMAC$/, "").replace(/^PV-/, "PV #");

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: "14px 16px",
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      {/* Ligne 1 : référence PV + icône PDF */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 6,
      }}>
        <span style={{
          fontSize: 11,
          color: "#6B7280",
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}>
          {idLabel}
        </span>
        <PdfIcon />
      </div>

      {/* Nom du chantier */}
      <p style={{
        fontSize: 17,
        fontWeight: 900,
        color: "#111827",
        margin: "0 0 12px 0",
        lineHeight: 1.3,
      }}>
        {pv.step1?.chantier || "Chantier sans nom"}
      </p>

      {/* Ligne : Agence + Date */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        color: "#6B7280",
        marginBottom: 6,
      }}>
        <Building2 size={13} color="#6B7280" />
        <span style={{ fontWeight: 500 }}>{agence?.nom ?? "—"}</span>
        <Calendar size={13} color="#6B7280" style={{ marginLeft: 8 }} />
        <span style={{ fontWeight: 500 }}>{dateLabel}</span>
      </div>

      {/* Ligne : Établissement */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 12,
        color: "#6B7280",
      }}>
        <Landmark size={13} color="#6B7280" />
        <span style={{ fontWeight: 500 }}>{etablissement?.nom ?? "—"}</span>
      </div>
    </div>
  );
};
