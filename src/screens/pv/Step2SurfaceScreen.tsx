// src/screens/pv/Step2SurfaceScreen.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToggleGroup } from "../../components/ui";
import { usePvFormStore } from "../../store";
import type { ConformiteValue, PvStep2 } from "../../types";

const S = {
  page:    { padding: "16px 20px", display: "flex", flexDirection: "column" as const, gap: 16 },
  card:    { backgroundColor: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", padding: 16, display: "flex", flexDirection: "column" as const, gap: 14 },
  cardTop: { display: "flex", alignItems: "center", gap: 8, marginBottom: 2 },
  title:   { fontSize: 13, fontWeight: 900, color: "#111827", textTransform: "uppercase" as const, letterSpacing: "0.05em" },
  divider: { height: 1, backgroundColor: "#E5E7EB" },
};

// ── Toggle 2 options (pilule) ────────────────────────────────────────────────
const TwoOptionToggle = ({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <span style={{
      fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const,
      letterSpacing: "0.08em", color: "#6B7280",
    }}>
      {label}
    </span>
    <div style={{
      display: "flex", backgroundColor: "#F3F4F6",
      borderRadius: 12, padding: 4, gap: 4,
    }}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1, padding: "10px 8px",
              borderRadius: 10, border: "none",
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
  const { formData, updateStep2, nextStep, prevStep } = usePvFormStore();

  const [natureTravaux, setNatureTravaux] = useState<string>(
    formData.step2?.natureTravaux ?? ""
  );

  const [data, setData] = useState<Omit<PvStep2, "natureTravaux">>({
    etatSurface: {
      regulariteSupport: formData.step2?.etatSurface?.regulariteSupport ?? "SO",
      propreteSupport:   formData.step2?.etatSurface?.propreteSupport   ?? "SO",
      pente:             formData.step2?.etatSurface?.pente              ?? "SO",
    },
    partiesCourantes: {
      regulariteSupport: formData.step2?.partiesCourantes?.regulariteSupport ?? "SO",
      propreteSupport:   formData.step2?.partiesCourantes?.propreteSupport   ?? "SO",
    },
  });

  const setEtat = (field: keyof PvStep2["etatSurface"], value: ConformiteValue) =>
    setData((prev) => ({ ...prev, etatSurface: { ...prev.etatSurface, [field]: value } }));

  const setParties = (field: keyof PvStep2["partiesCourantes"], value: ConformiteValue) =>
    setData((prev) => ({ ...prev, partiesCourantes: { ...prev.partiesCourantes, [field]: value } }));

  const handleNext = () => {
    updateStep2({
      ...data,
      natureTravaux: (natureTravaux as PvStep2["natureTravaux"]) || undefined,
    });
    nextStep();
    navigate("/pv-form/step3");
  };

  const handlePrev = () => { prevStep(); navigate(-1); };

  return (
    <div style={S.page}>

      {/* NATURE DES TRAVAUX */}
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

      {/* ETAT DE SURFACE */}
      <div style={S.card}>
        <div style={S.cardTop}>
          <span style={{ fontSize: 20 }}>≡</span>
          <span style={S.title}>Etat de Surface</span>
        </div>

        <div style={S.divider} />
        <ToggleGroup label="Régularité du support"
          value={data.etatSurface.regulariteSupport}
          onChange={(v) => setEtat("regulariteSupport", v)} />

        <div style={S.divider} />
        <ToggleGroup label="Propreté du support"
          value={data.etatSurface.propreteSupport}
          onChange={(v) => setEtat("propreteSupport", v)} />

        <div style={S.divider} />
        <ToggleGroup label="Pente"
          value={data.etatSurface.pente ?? "SO"}
          onChange={(v) => setEtat("pente", v)} />
      </div>

      {/* PARTIE COURANTE */}
      <div style={S.card}>
        <div style={S.cardTop}>
          <span style={{ fontSize: 18, color: "#E3000F" }}>⊞</span>
          <span style={S.title}>Partie Courante</span>
        </div>

        <ToggleGroup label="Régularité du support"
          value={data.partiesCourantes.regulariteSupport}
          onChange={(v) => setParties("regulariteSupport", v)} />

        <div style={S.divider} />
        <ToggleGroup label="Propreté du support"
          value={data.partiesCourantes.propreteSupport}
          onChange={(v) => setParties("propreteSupport", v)} />
      </div>

      <NavButtons onPrev={handlePrev} onNext={handleNext} />
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
