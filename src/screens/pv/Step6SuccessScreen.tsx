// src/screens/pv/Step6SuccessScreen.tsx
import { useNavigate } from "react-router-dom";
import { ShieldCheck, FileText, Calendar, ArrowRight, Mail } from "lucide-react";
import { usePvStore } from "../../store";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { generatePvPdf } from "../../utils/generatePvPdf";

const Step6SuccessScreen = () => {
  const navigate   = useNavigate();
  const { pvList } = usePvStore();
  const lastPv     = pvList[0];

  const dateLabel = lastPv?.createdAt
    ? format(new Date(lastPv.createdAt), "dd MMM yyyy • HH:mm", { locale: fr })
    : "—";

  return (
    <div style={{ padding: "24px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>

      {/* Icône succès */}
      <div style={{ position: "relative", marginTop: 16 }}>
        <div style={{
          width: 96, height: 96, borderRadius: 28, backgroundColor: "#E3000F",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 24px rgba(227,0,15,0.3)",
        }}>
          <ShieldCheck size={48} color="#fff" />
        </div>
        <div style={{
          position: "absolute", bottom: -8, right: -8,
          width: 28, height: 28, borderRadius: "50%", backgroundColor: "#16a34a",
          border: "2px solid #fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, color: "#fff", fontWeight: 900,
        }}>✓</div>
      </div>

      {/* Titre */}
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: "#111827", lineHeight: 1.2 }}>
          PV Enregistré avec<br />Succès !
        </h2>
        <p style={{ fontSize: 13, color: "#6B7280", marginTop: 10, lineHeight: 1.6 }}>
          Le procès-verbal pour le chantier{" "}
          <strong style={{ color: "#111827" }}>{lastPv?.step1?.chantier ?? "—"}</strong>{" "}
          a été généré et sauvegardé en toute sécurité.
        </p>
      </div>

      {/* Métadonnées */}
      <div style={{ width: "100%", backgroundColor: "#F3F4F6", borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <FileText size={20} color="#E3000F" />
          <div>
            <p style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Référence PV</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{lastPv?.id ?? "—"}</p>
          </div>
        </div>
        <div style={{ height: 1, backgroundColor: "#E5E7EB" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Calendar size={20} color="#E3000F" />
          <div>
            <p style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Horodatage</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{dateLabel}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          onClick={() => lastPv && void generatePvPdf(lastPv)}
          disabled={!lastPv}
          style={{
            width: "100%", backgroundColor: "#E3000F", color: "#fff",
            border: "none", borderRadius: 100, padding: "16px 20px",
            fontSize: 15, fontWeight: 700, cursor: lastPv ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            opacity: lastPv ? 1 : 0.5,
          }}>
          <FileText size={18} /> Télécharger le PDF
        </button>
        <button style={{
          width: "100%", backgroundColor: "#F3F4F6", color: "#111827",
          border: "1px solid #E5E7EB", borderRadius: 100, padding: "16px 20px",
          fontSize: 15, fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          <Mail size={18} /> Partager par email
        </button>
      </div>

      {/* Retour liste */}
      <button onClick={() => navigate("/", { replace: true })}
        style={{ background: "none", border: "none", color: "#E3000F", fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        Retour sur la liste de PV
      </button>

      {/* Aperçu rapide */}
      {lastPv && (
        <div style={{
          width: "100%", backgroundColor: "#fff", borderRadius: 16,
          border: "1px solid #E5E7EB", padding: 16,
          display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 12, backgroundColor: "#F3F4F6",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <FileText size={22} color="#6B7280" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Aperçu rapide du PV</p>
            <p style={{ fontSize: 12, color: "#6B7280" }}>
              Le document contient {lastPv.step1?.reserves?.length ?? 0} réserve{(lastPv.step1?.reserves?.length ?? 0) > 1 ? "s" : ""}...
            </p>
          </div>
          <ArrowRight size={18} color="#6B7280" />
        </div>
      )}
    </div>
  );
};

export default Step6SuccessScreen;