// src/screens/pv/Step2SurfaceScreen.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToggleGroup } from "../../components/ui";
import { usePvFormStore } from "../../store";
import { useFormBack } from "./PvFormLayout";
import type { ConformiteValue, PvStep2 } from "../../types";

const SO: ConformiteValue = "SO";

const S = {
  page:    { padding: "16px 20px", display: "flex", flexDirection: "column" as const, gap: 16 },
  card:    { backgroundColor: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", padding: 16, display: "flex", flexDirection: "column" as const, gap: 14 },
  cardTop: { display: "flex", alignItems: "center", gap: 8, marginBottom: 2 },
  title:   { fontSize: 13, fontWeight: 900 as const, color: "#111827", textTransform: "uppercase" as const, letterSpacing: "0.05em" },
  divider: { height: 1, backgroundColor: "#E5E7EB" },
};

// ── Toggle 2 options (pilule) ────────────────────────────────────────────────
const TwoOptionToggle = ({
  label, options, value, onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#6B7280" }}>
      {label}
    </span>
    <div style={{ display: "flex", backgroundColor: "#F3F4F6", borderRadius: 12, padding: 4, gap: 4 }}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1, padding: "10px 8px", borderRadius: 10, border: "none",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              backgroundColor: active ? "#E3000F" : "transparent",
              color: active ? "#fff" : "#6B7280",
              transition: "all 0.15s",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  </div>
);

// ── Écran ────────────────────────────────────────────────────────────────────
const Step2SurfaceScreen = () => {
  const navigate = useNavigate();
  const handleBack = useFormBack();
  const { formData, updateStep2, nextStep } = usePvFormStore();
  const s2 = formData.step2;

  // ── Nature des travaux ───────────────────────────────────────────────────
  const [natureTravaux, setNatureTravaux] = useState<string>(s2?.natureTravaux ?? "");

  // ── État de surface ──────────────────────────────────────────────────────
  const [etatSurface, setEtatSurface] = useState<PvStep2["etatSurface"]>({
    regulariteSupport: s2?.etatSurface?.regulariteSupport ?? SO,
    propreteSupport:   s2?.etatSurface?.propreteSupport   ?? SO,
    pente:             s2?.etatSurface?.pente              ?? SO,
  });

  // ── Support des relevés ──────────────────────────────────────────────────
  const [supportReleves, setSupportReleves] = useState<PvStep2["supportReleves"]>({
    hauteurEngravure:          s2?.supportReleves?.hauteurEngravure          ?? SO,
    profondeurEngravure:       s2?.supportReleves?.profondeurEngravure       ?? SO,
    protectionTeteReleves:     s2?.supportReleves?.protectionTeteReleves     ?? SO,
    propreteSupportReleves:    s2?.supportReleves?.propreteSupportReleves    ?? SO,
    tremiesLanterneaux:        s2?.supportReleves?.tremiesLanterneaux        ?? SO,
    eauxPluviales:             s2?.supportReleves?.eauxPluviales             ?? SO,
    ventilation:               s2?.supportReleves?.ventilation               ?? SO,
    tropPleins:                s2?.supportReleves?.tropPleins                ?? SO,
    jointsDialatation:         s2?.supportReleves?.jointsDialatation         ?? SO,
    autresEcartsObservations:  s2?.supportReleves?.autresEcartsObservations  ?? "",
  });

  const setEtat = (field: keyof PvStep2["etatSurface"], value: ConformiteValue) =>
    setEtatSurface((prev) => ({ ...prev, [field]: value }));

  const setReleve = (field: keyof Omit<PvStep2["supportReleves"], "autresEcartsObservations">, value: ConformiteValue) =>
    setSupportReleves((prev) => ({ ...prev, [field]: value }));

  const handleNext = () => {
    updateStep2({
      natureTravaux: (natureTravaux as PvStep2["natureTravaux"]) || undefined,
      etatSurface,
      supportReleves,
    });
    nextStep();
    navigate("/pv-form/step5");
  };

  return (
    <div style={S.page}>

      {/* ── CARTE 1 : Nature des travaux ── */}
      <div style={S.card}>
        <div style={S.cardTop}>
          <span style={{ fontSize: 18, color: "#E3000F" }}>⚙</span>
          <span style={S.title}>Nature des travaux</span>
        </div>
        <div style={S.divider} />
        <TwoOptionToggle
          label="Type de support"
          options={[
            { value: "etancheite-beton", label: "Étanchéité sur béton" },
            { value: "autre-support",    label: "Autre support" },
          ]}
          value={natureTravaux}
          onChange={setNatureTravaux}
        />
      </div>

      {/* ── CARTE 2 : État de surface ── */}
      <div style={S.card}>
        <div style={S.cardTop}>
          <span style={{ fontSize: 20 }}>≡</span>
          <span style={S.title}>État de surface</span>
        </div>
        <div style={S.divider} />
        <ToggleGroup label="Régularité du support" value={etatSurface.regulariteSupport}
          onChange={(v) => setEtat("regulariteSupport", v)} />
        <div style={S.divider} />
        <ToggleGroup label="Propreté du support"   value={etatSurface.propreteSupport}
          onChange={(v) => setEtat("propreteSupport", v)} />
        <div style={S.divider} />
        <ToggleGroup label="Pente"                  value={etatSurface.pente}
          onChange={(v) => setEtat("pente", v)} />
      </div>

      {/* ── CARTE 3 : Support des relevés ── */}
      <div style={S.card}>
        <div style={S.cardTop}>
          <span style={{ fontSize: 18, color: "#E3000F" }}>△</span>
          <span style={S.title}>Support des relevés</span>
        </div>
        <div style={S.divider} />

        <ToggleGroup label="Hauteur engravure"                  value={supportReleves.hauteurEngravure}
          onChange={(v) => setReleve("hauteurEngravure", v)} />
        <div style={S.divider} />
        <ToggleGroup label="Profondeur engravure"               value={supportReleves.profondeurEngravure}
          onChange={(v) => setReleve("profondeurEngravure", v)} />
        <div style={S.divider} />
        <ToggleGroup label="Protection de la tête des relevés"  value={supportReleves.protectionTeteReleves}
          onChange={(v) => setReleve("protectionTeteReleves", v)} />
        <div style={S.divider} />
        <ToggleGroup label="Propreté du support des relevés"    value={supportReleves.propreteSupportReleves}
          onChange={(v) => setReleve("propreteSupportReleves", v)} />
        <div style={S.divider} />
        <ToggleGroup label="Trémie / lanterneau"                value={supportReleves.tremiesLanterneaux}
          onChange={(v) => setReleve("tremiesLanterneaux", v)} />
        <div style={S.divider} />
        <ToggleGroup label="Eau pluviale"                       value={supportReleves.eauxPluviales}
          onChange={(v) => setReleve("eauxPluviales", v)} />
        <div style={S.divider} />
        <ToggleGroup label="Ventilation"                        value={supportReleves.ventilation}
          onChange={(v) => setReleve("ventilation", v)} />
        <div style={S.divider} />
        <ToggleGroup label="Trop-plein"                         value={supportReleves.tropPleins}
          onChange={(v) => setReleve("tropPleins", v)} />
        <div style={S.divider} />
        <ToggleGroup label="Joint de dilatation"                value={supportReleves.jointsDialatation}
          onChange={(v) => setReleve("jointsDialatation", v)} />

        <div style={S.divider} />
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6B7280", marginBottom: 8 }}>
            Autres écarts &amp; observations
          </p>
          <textarea
            placeholder="Précisez toute observation complémentaire..."
            value={supportReleves.autresEcartsObservations ?? ""}
            onChange={(e) => setSupportReleves((prev) => ({ ...prev, autresEcartsObservations: e.target.value }))}
            rows={4}
            style={{
              width: "100%", backgroundColor: "#F3F4F6", border: "1.5px solid transparent",
              borderRadius: 12, padding: "12px 16px", fontSize: 14, color: "#111827",
              outline: "none", fontFamily: "inherit", resize: "none", boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      <NavButtons onPrev={handleBack} onNext={handleNext} />
    </div>
  );
};

export default Step2SurfaceScreen;

const NavButtons = ({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) => (
  <div style={{ display: "flex", gap: 12, paddingBottom: 16 }}>
    <button onClick={onPrev} style={{
      flex: 1, backgroundColor: "#F3F4F6", color: "#111827",
      border: "1px solid #E5E7EB", borderRadius: 100,
      padding: "14px 20px", fontSize: 15, fontWeight: 600, cursor: "pointer",
    }}>← Précédent</button>
    <button onClick={onNext} style={{
      flex: 1, backgroundColor: "#E3000F", color: "#fff",
      border: "none", borderRadius: 100,
      padding: "14px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer",
    }}>Suivant →</button>
  </div>
);
