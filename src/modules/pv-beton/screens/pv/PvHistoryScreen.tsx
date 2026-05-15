// src/modules/pv-beton/screens/pv/PvHistoryScreen.tsx
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Home, History } from "lucide-react";
import { usePvStore } from "../../store";
import { generatePvPdf } from "../../utils/generatePvPdf";
import { format } from "date-fns";
import type { Pv } from "../../types";

const fmtDate = (iso: string) =>
  format(new Date(iso), "dd/MM/yyyy à HH:mm");

const PvHistoryScreen = () => {
  const { id }      = useParams<{ id: string }>();
  const navigate    = useNavigate();
  const { pvList }  = usePvStore();
  const pv          = pvList.find((p) => p.id === id);

  if (!pv) return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      height: "100%", gap: 16, padding: 40,
    }}>
      <p style={{ fontSize: 15, color: "#6B7280" }}>PV introuvable.</p>
      <button onClick={() => navigate("/apps/pv-beton")} style={{
        backgroundColor: "#E3000F", color: "#fff", border: "none",
        borderRadius: 100, padding: "12px 24px",
        fontSize: 14, fontWeight: 700, cursor: "pointer",
      }}>
        Retour à la liste
      </button>
    </div>
  );

  const snapshots  = [...(pv.versions ?? [])].reverse();
  const total      = snapshots.length + 1;

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100%", backgroundColor: "#F3F4F6",
    }}>

      <div style={{
        backgroundColor: "#fff", padding: "24px 20px 16px",
        borderBottom: "1px solid #E5E7EB",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <button
          onClick={() => navigate(`/apps/pv-beton/pv/${id}`)}
          style={{
            width: 36, height: 36, borderRadius: "50%",
            backgroundColor: "#F3F4F6", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={18} color="#111827" />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, marginBottom: 2 }}>
            Historique des versions
          </p>
          <p style={{ fontSize: 13, fontWeight: 900, color: "#111827",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {pv.step1?.chantier || pv.id}
          </p>
        </div>
        <div style={{
          backgroundColor: "#E3000F", borderRadius: 100,
          padding: "4px 10px",
          fontSize: 11, fontWeight: 700, color: "#fff", whiteSpace: "nowrap",
        }}>
          {total} version{total > 1 ? "s" : ""}
        </div>
      </div>

      <div style={{
        flex: 1, overflowY: "auto", minHeight: 0,
        padding: "16px 20px",
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6, marginBottom: 4 }}>
          Chaque modification du PV crée une nouvelle version. Vous pouvez
          télécharger le PDF correspondant à n'importe quelle version.
        </p>

        <VersionCard
          versionNum={total}
          label="Version actuelle"
          date={pv.updatedAt ?? pv.createdAt}
          isCurrent
          onDownload={() => void generatePvPdf(pv)}
        />

        {snapshots.map((v, i) => (
          <VersionCard
            key={v.versionId}
            versionNum={total - 1 - i}
            label={i === snapshots.length - 1 ? "Version initiale" : undefined}
            date={v.savedAt}
            onDownload={() => void generatePvPdf(v.snapshot as Pv)}
          />
        ))}

        {snapshots.length === 0 && (
          <div style={{
            backgroundColor: "#fff", borderRadius: 16,
            border: "1px solid #E5E7EB", padding: "32px 20px",
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 12,
          }}>
            <History size={32} color="#D1D5DB" />
            <p style={{ fontSize: 14, color: "#9CA3AF", textAlign: "center", lineHeight: 1.6 }}>
              Aucune version antérieure disponible.{"\n"}
              L'historique sera créé à la prochaine modification.
            </p>
          </div>
        )}

        <div style={{ height: 20 }} />
      </div>

      <div style={{
        backgroundColor: "#fff", borderTop: "1px solid #E5E7EB",
        padding: "10px 24px 16px",
        display: "flex", justifyContent: "center", alignItems: "center",
      }}>
        <button onClick={() => navigate("/")} style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        }}>
          <Home size={20} color="#E3000F" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#E3000F", letterSpacing: "0.08em" }}>
            ACCUEIL PSA
          </span>
        </button>
      </div>
    </div>
  );
};

const VersionCard = ({
  versionNum, label, date, isCurrent = false, onDownload,
}: {
  versionNum: number;
  label?:     string;
  date:       string;
  isCurrent?: boolean;
  onDownload: () => void;
}) => (
  <div style={{
    backgroundColor: "#fff", borderRadius: 16,
    border: `1px solid ${isCurrent ? "#E3000F" : "#E5E7EB"}`,
    borderLeft: `4px solid ${isCurrent ? "#E3000F" : "#D1D5DB"}`,
    padding: "14px 16px",
    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
  }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 900, color: isCurrent ? "#E3000F" : "#111827" }}>
          Version {versionNum}
        </span>
        {isCurrent && (
          <span style={{
            fontSize: 10, fontWeight: 700, color: "#fff",
            backgroundColor: "#E3000F", borderRadius: 100,
            padding: "2px 8px", textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            actuelle
          </span>
        )}
        {label && !isCurrent && (
          <span style={{
            fontSize: 10, fontWeight: 700, color: "#6B7280",
            backgroundColor: "#F3F4F6", borderRadius: 100,
            padding: "2px 8px",
          }}>
            {label}
          </span>
        )}
      </div>
      <p style={{ fontSize: 12, color: "#6B7280" }}>{fmtDate(date)}</p>
    </div>
    <button
      onClick={onDownload}
      style={{
        flexShrink: 0,
        width: 40, height: 40, borderRadius: 12,
        backgroundColor: isCurrent ? "#E3000F" : "#F3F4F6",
        border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <Download size={16} color={isCurrent ? "#fff" : "#6B7280"} />
    </button>
  </div>
);

export default PvHistoryScreen;
