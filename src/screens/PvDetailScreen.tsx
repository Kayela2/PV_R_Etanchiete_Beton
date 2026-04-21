// src/screens/PvDetailScreen.tsx
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileText, Pencil, Home } from "lucide-react";
import { usePvStore, usePvFormStore } from "../store";
import { AGENCES, ETABLISSEMENTS } from "../data/referentiel";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import type { ConformiteValue } from "../types";
import { generatePvPdf } from "../utils/generatePvPdf";

const PvDetailScreen = () => {
  const navigate        = useNavigate();
  const { id }          = useParams<{ id: string }>();
  const { pvList }      = usePvStore();
  const { loadFromPv }  = usePvFormStore();
  const pv              = pvList.find((p) => p.id === id);

  if (!pv) return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      minHeight: "844px", gap: 16, padding: 40,
    }}>
      <p style={{ fontSize: 15, color: "#6B7280" }}>PV introuvable.</p>
      <button onClick={() => navigate("/")} style={{
        backgroundColor: "#E3000F", color: "#fff", border: "none",
        borderRadius: 100, padding: "12px 24px",
        fontSize: 14, fontWeight: 700, cursor: "pointer",
      }}>
        Retour à l'accueil
      </button>
    </div>
  );

  const agence        = AGENCES.find((a) => a.id === pv.step1?.agenceId);
  const etablissement = ETABLISSEMENTS.find((e) => e.id === pv.step1?.etablissementId);
  const dateLabel     = pv.step1?.dateInspection
    ? format(new Date(pv.step1.dateInspection), "dd MMMM yyyy", { locale: fr }) : "—";
  const createdLabel  = pv.createdAt
    ? format(new Date(pv.createdAt), "dd MMM yyyy à HH:mm", { locale: fr }) : "—";

  const handleEdit = () => {
    loadFromPv(pv);          // pré-remplit le formulaire avec toutes les données
    navigate("/pv-form");    // démarre le formulaire à l'étape 1
  };

  // Libellé Nature des travaux
  const natureTravauxLabel =
    pv.step2?.natureTravaux === "etancheite-beton" ? "Étanchéité sur béton"
    : pv.step2?.natureTravaux === "autre-support"  ? "Autre support"
    : "—";

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100%", backgroundColor: "#F3F4F6",
    }}>

      {/* ── Header ── */}
      <div style={{
        backgroundColor: "#fff", padding: "24px 20px 16px",
        borderBottom: "1px solid #E5E7EB",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <button onClick={() => navigate("/")} style={{
          width: 36, height: 36, borderRadius: "50%",
          backgroundColor: "#F3F4F6", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <ArrowLeft size={18} color="#111827" />
        </button>

        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, marginBottom: 2 }}>
            Détail du PV
          </p>
          <p style={{ fontSize: 13, fontWeight: 900, color: "#111827" }}>
            {pv.step1?.chantier || pv.id}
          </p>
        </div>

        {/* Bouton Modifier — charge le PV dans le formulaire */}
        <button onClick={handleEdit} style={{
          width: 36, height: 36, borderRadius: "50%",
          backgroundColor: "#FDECEA", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Pencil size={16} color="#E3000F" />
        </button>
      </div>

      {/* ── Contenu scrollable ── */}
      <div style={{
        flex: 1, overflowY: "auto", minHeight: 0,
        padding: "16px 20px",
        display: "flex", flexDirection: "column", gap: 14,
      }}>

        {/* Référence + date */}
        <div style={{
          backgroundColor: "#fff", borderRadius: 16,
          border: "1px solid #E5E7EB", padding: 16,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <p style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, marginBottom: 4 }}>Référence PV</p>
            <p style={{ fontSize: 14, fontWeight: 900, color: "#111827" }}>{pv.id}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, marginBottom: 4 }}>Créé le</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{createdLabel}</p>
          </div>
        </div>

        {/* Informations générales */}
        <Section title="Informations générales">
          <Row label="Chantier"      value={pv.step1?.chantier ?? "—"} bold />
          <Row label="Zone"          value={pv.step1?.zoneBatiment ?? "—"} />
          <Row label="Agence"        value={agence?.nom ?? "—"} />
          <Row label="Établissement" value={etablissement?.nom ?? "—"} />
          <Row label="Date"          value={dateLabel} />
          <Row label="Responsable"   value={pv.step1?.responsableChantier ?? "—"} />
          {pv.step1?.planReperage && (
            <Row label="Plan de repérage"
              value={pv.step1.planReperage === "oui" ? "Oui" : "Non"} />
          )}
          {pv.step2?.natureTravaux && (
            <Row label="Nature des travaux" value={natureTravauxLabel} />
          )}
        </Section>

        {/* Réserves */}
        {(pv.step1?.reserves?.length ?? 0) > 0 && (
          <Section title={`Réserves — ${pv.step1!.reserves!.length} / 8`}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {pv.step1!.reserves!.map((r, i) => (
                <div key={r.id} style={{
                  borderLeft: "3px solid #E3000F", paddingLeft: 12,
                  paddingBottom: i < pv.step1!.reserves!.length - 1 ? 12 : 0,
                  borderBottom: i < pv.step1!.reserves!.length - 1 ? "1px solid #F3F4F6" : "none",
                }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#E3000F", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
                    Réserve #{String(i + 1).padStart(2, "0")}
                  </p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
                    {r.localisation || "Sans localisation"}
                  </p>
                  <p style={{ fontSize: 12, color: "#6B7280", marginBottom: 8, lineHeight: 1.5 }}>
                    {r.detail}
                  </p>
                  {r.photos.length > 0 && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {r.photos.slice(0, 3).map((ph) => (
                        <img key={ph.id} src={ph.url} alt={ph.caption}
                          style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover", border: "1px solid #E5E7EB" }} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* État de surface */}
        {pv.step2?.etatSurface && (
          <Section title="État de surface">
            <Conformite label="Régularité du support" value={pv.step2.etatSurface.regulariteSupport} />
            <Conformite label="Propreté du support"   value={pv.step2.etatSurface.propreteSupport} />
            <Conformite label="Pente"                 value={pv.step2.etatSurface.pente} />
          </Section>
        )}

        {/* Support des relevés */}
        {pv.step2?.supportReleves && (
          <Section title="Support des relevés">
            <Conformite label="Hauteur engravure"                 value={pv.step2.supportReleves.hauteurEngravure} />
            <Conformite label="Profondeur engravure"              value={pv.step2.supportReleves.profondeurEngravure} />
            <Conformite label="Protection de la tête des relevés" value={pv.step2.supportReleves.protectionTeteReleves} />
            <Conformite label="Propreté du support des relevés"   value={pv.step2.supportReleves.propreteSupportReleves} />
            <Conformite label="Trémie / lanterneau"               value={pv.step2.supportReleves.tremiesLanterneaux} />
            <Conformite label="Eau pluviale"                      value={pv.step2.supportReleves.eauxPluviales} />
            <Conformite label="Ventilation"                       value={pv.step2.supportReleves.ventilation} />
            <Conformite label="Trop-plein"                        value={pv.step2.supportReleves.tropPleins} />
            <Conformite label="Joint de dilatation"               value={pv.step2.supportReleves.jointsDialatation} />
            {pv.step2.supportReleves.autresEcartsObservations && (
              <Row label="Observations" value={pv.step2.supportReleves.autresEcartsObservations} />
            )}
          </Section>
        )}

        {/* SMAC */}
        {pv.step5?.nomSmac && (
          <Section title="SMAC">
            <Row label="Nom SMAC" value={pv.step5.nomSmac} bold />
            {pv.step5.signatureSmac && (
              <div style={{ marginTop: 8 }}>
                <p style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, marginBottom: 6 }}>
                  Signature SMAC
                </p>
                <img src={pv.step5.signatureSmac} alt="signature SMAC"
                  style={{ height: 64, maxWidth: "100%", borderRadius: 8,
                    border: "1px solid #E5E7EB", backgroundColor: "#fff", display: "block" }} />
              </div>
            )}
          </Section>
        )}

        {/* Participants */}
        {(pv.step5?.participants?.length ?? 0) > 0 && (
          <Section title="Participants">
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 12 }}>
              {pv.step5!.participants!.map((p, i) => (
                <div key={p.id} style={{
                  paddingBottom: i < pv.step5!.participants!.length - 1 ? 12 : 0,
                  borderBottom: i < pv.step5!.participants!.length - 1 ? "1px solid #F3F4F6" : "none",
                }}>
                  {p.titre && (
                    <p style={{ fontSize: 11, color: "#6B7280", fontWeight: 500, marginBottom: 2 }}>
                      {p.titre}
                    </p>
                  )}
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 6 }}>
                    {p.nom}
                  </p>
                  {p.signature && (
                    <img src={p.signature} alt="signature"
                      style={{
                        height: 64, maxWidth: "100%", borderRadius: 8,
                        border: "1px solid #E5E7EB", backgroundColor: "#fff", display: "block",
                      }} />
                  )}
                </div>
              ))}
            </div>
            <Row label="Réception acceptée" value={pv.step5?.receptionAcceptee ? "Oui" : "Non"} />
            {pv.step5?.miseEnConformiteLe && (
              <Row label="Mise en conformité le"
                value={format(new Date(pv.step5.miseEnConformiteLe), "dd MMM yyyy", { locale: fr })} />
            )}
          </Section>
        )}

        {/* Bouton PDF */}
        <button
          onClick={() => void generatePvPdf(pv)}
          style={{
            width: "100%", backgroundColor: "#E3000F", color: "#fff",
            border: "none", borderRadius: 100, padding: "16px 20px",
            fontSize: 15, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
          <FileText size={18} color="#fff" /> Télécharger le PDF
        </button>

        <div style={{ height: 20 }} />
      </div>

      {/* ── Bottom nav ── */}
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

/* ── Helpers ── */
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ backgroundColor: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", padding: 16 }}>
    <p style={{
      fontSize: 12, fontWeight: 900, color: "#111827",
      textTransform: "uppercase", letterSpacing: "0.06em",
      marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid #F3F4F6",
    }}>
      {title}
    </p>
    {children}
  </div>
);

const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <div style={{
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    paddingBottom: 8, marginBottom: 8, borderBottom: "1px solid #F3F4F6",
  }}>
    <span style={{ fontSize: 12, color: "#6B7280", flex: 1 }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: bold ? 700 : 500, color: "#111827", textAlign: "right", flex: 1 }}>
      {value}
    </span>
  </div>
);

const Conformite = ({ label, value }: { label: string; value?: ConformiteValue }) => {
  const isConforme    = value === "conforme";
  const isNonConforme = value === "non-conforme";
  const color  = isConforme ? "#16a34a" : isNonConforme ? "#E3000F" : "#6B7280";
  const bg     = isConforme ? "#EAF3DE" : isNonConforme ? "#FDECEA" : "#F3F4F6";
  const label_ = isConforme ? "Conforme" : isNonConforme ? "Non Conforme" : "SO";

  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      paddingBottom: 8, marginBottom: 8, borderBottom: "1px solid #F3F4F6",
    }}>
      <span style={{ fontSize: 12, color: "#6B7280", flex: 1, paddingRight: 8 }}>{label}</span>
      <span style={{
        fontSize: 11, fontWeight: 700, color, backgroundColor: bg,
        borderRadius: 100, padding: "4px 12px",
        textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap",
      }}>
        {label_}
      </span>
    </div>
  );
};

export default PvDetailScreen;
