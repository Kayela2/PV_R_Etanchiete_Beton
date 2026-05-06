// src/screens/pv/Step6SuccessScreen.tsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, FileText, Calendar, ArrowRight, Mail, Download, Loader2, CheckCircle, XCircle } from "lucide-react";
import { usePvStore } from "../../store";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { generatePvPdf, generatePvPdfBlob } from "../../utils/generatePvPdf";

type ActionType = "pdf" | "email";
type ActionResult = { success: boolean; message: string } | null;

const Step6SuccessScreen = () => {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { pvList } = usePvStore();
  // En mode édition, l'ID du PV édité est transmis via navigate state
  const pvId   = (location.state as { pvId?: string } | null)?.pvId;
  const lastPv = pvId ? (pvList.find((p) => p.id === pvId) ?? pvList[0]) : pvList[0];

  const [loading, setLoading] = useState<ActionType | null>(null);
  const [result,  setResult]  = useState<ActionResult>(null);

  const dateLabel = lastPv?.createdAt
    ? format(new Date(lastPv.createdAt), "dd MMM yyyy • HH:mm", { locale: fr })
    : "—";

  // ── Téléchargement PDF ───────────────────────────────────────────────────
  const handleDownloadPdf = async () => {
    if (!lastPv) return;
    setLoading("pdf");
    setResult(null);
    try {
      await generatePvPdf(lastPv);
      setResult({ success: true, message: "PDF téléchargé avec succès !" });
    } catch {
      setResult({ success: false, message: "Erreur lors de la génération du PDF." });
    } finally {
      setLoading(null);
    }
  };

  // ── Partage par email (Web Share API → fallback mailto) ──────────────────
  const handleShareEmail = async () => {
    if (!lastPv) return;
    setLoading("email");
    setResult(null);
    try {
      const { blob, filename } = await generatePvPdfBlob(lastPv);
      const file = new File([blob], filename, { type: "application/pdf" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `PV SMAC — ${lastPv.step1?.chantier ?? ""}`,
          text:  `Procès-verbal SMAC — Réf. : ${lastPv.id}`,
        });
        setResult({ success: true, message: "PV partagé avec succès !" });
      } else {
        const dest    = lastPv.step5?.emailDestinataire ?? "";
        const subject = encodeURIComponent(`PV SMAC — ${lastPv.step1?.chantier ?? ""}`);
        const body    = encodeURIComponent(`Bonjour,\n\nVeuillez trouver ci-joint le procès-verbal ${lastPv.id}.\n\nCordialement,\nSMAC`);
        window.open(`mailto:${dest}?subject=${subject}&body=${body}`);
        setResult({ success: true, message: "Client mail ouvert." });
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setResult({ success: false, message: "Échec du partage par email." });
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{
      padding: "24px 20px 32px",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 24,
    }}>

      {/* Icône succès */}
      <div style={{ position: "relative", marginTop: 8 }}>
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
      <div style={{
        width: "100%", backgroundColor: "#F3F4F6",
        borderRadius: 16, padding: 16,
        display: "flex", flexDirection: "column", gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <FileText size={20} color="#E3000F" />
          <div>
            <p style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
              Référence PV
            </p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{lastPv?.id ?? "—"}</p>
          </div>
        </div>
        <div style={{ height: 1, backgroundColor: "#E5E7EB" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Calendar size={20} color="#E3000F" />
          <div>
            <p style={{ fontSize: 11, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
              Horodatage
            </p>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{dateLabel}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>

        {/* Télécharger PDF */}
        <button
          onClick={handleDownloadPdf}
          disabled={!lastPv || loading !== null}
          style={{
            width: "100%", backgroundColor: "#E3000F", color: "#fff",
            border: "none", borderRadius: 100, padding: "16px 20px",
            fontSize: 15, fontWeight: 700,
            cursor: !lastPv || loading !== null ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            opacity: loading !== null ? 0.7 : 1,
          }}
        >
          {loading === "pdf"
            ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Génération en cours…</>
            : <><Download size={18} /> Télécharger le PDF</>
          }
        </button>

        {/* Partager par email */}
        <button
          onClick={handleShareEmail}
          disabled={!lastPv || loading !== null}
          style={{
            width: "100%", backgroundColor: "#F3F4F6", color: "#111827",
            border: "1px solid #E5E7EB", borderRadius: 100, padding: "16px 20px",
            fontSize: 15, fontWeight: 600,
            cursor: !lastPv || loading !== null ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            opacity: loading !== null ? 0.7 : 1,
          }}
        >
          {loading === "email"
            ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Préparation…</>
            : <><Mail size={18} /> Partager par email</>
          }
        </button>

        {/* Message de résultat */}
        {result && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            backgroundColor: result.success ? "#F0FDF4" : "#FEF2F2",
            border: `1px solid ${result.success ? "#BBF7D0" : "#FECACA"}`,
            borderRadius: 12, padding: "10px 14px",
          }}>
            {result.success
              ? <CheckCircle size={16} color="#16a34a" style={{ flexShrink: 0 }} />
              : <XCircle    size={16} color="#E3000F" style={{ flexShrink: 0 }} />
            }
            <span style={{
              fontSize: 13, fontWeight: 600,
              color: result.success ? "#15803d" : "#E3000F",
            }}>
              {result.message}
            </span>
          </div>
        )}
      </div>

      {/* Aperçu rapide du PV */}
      {lastPv && (
        <button
          onClick={() => navigate(`/pv/${lastPv.id}`)}
          style={{
            width: "100%", backgroundColor: "#fff",
            border: "1px solid #E5E7EB", borderRadius: 16, padding: 16,
            display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
            textAlign: "left",
          }}
        >
          <div style={{
            width: 52, height: 52, borderRadius: 12, backgroundColor: "#F3F4F6",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <FileText size={22} color="#E3000F" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>
              Aperçu rapide du PV
            </p>
            <p style={{ fontSize: 12, color: "#6B7280" }}>
              {lastPv.step1?.reserves?.length ?? 0} réserve{(lastPv.step1?.reserves?.length ?? 0) > 1 ? "s" : ""} · {lastPv.step1?.chantier ?? "—"}
            </p>
          </div>
          <ArrowRight size={18} color="#6B7280" />
        </button>
      )}

      {/* Retour liste */}
      <button
        onClick={() => navigate("/", { replace: true })}
        style={{
          background: "none", border: "none", color: "#E3000F",
          fontSize: 12, fontWeight: 700, cursor: "pointer",
          letterSpacing: "0.1em", textTransform: "uppercase",
        }}
      >
        Retour sur la liste de PV
      </button>
    </div>
  );
};

export default Step6SuccessScreen;
