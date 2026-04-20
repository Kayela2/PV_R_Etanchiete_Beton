// src/screens/pv/Step4PointsScreen.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToggleGroup } from "../../components/ui";
import { usePvFormStore } from "../../store";
import type { ConformiteValue, PvStep4 } from "../../types";

type PointKey = keyof PvStep4["pointsSinguliers"];

// Déversoirs renommé Ventilation ; Réservations supprimé
const FIELDS: { key: PointKey; label: string }[] = [
  { key: "tremiesLanterneaux", label: "Trémies lanterneaux"  },
  { key: "eauxPluviales",      label: "Eaux pluviales"       },
  { key: "deversoirs",         label: "Ventilation"          },  // renommé
  { key: "tropPleins",         label: "Trop-pleins"          },
  { key: "jointsDialatation",  label: "Joints de dilatation" },
  // reservationsSortiesPenetrations supprimé
];

const Step4PointsScreen = () => {
  const navigate = useNavigate();
  const { formData, updateStep4, nextStep, prevStep } = usePvFormStore();

  const initPoints = () => Object.fromEntries(
    FIELDS.map(({ key }) => [key, formData.step4?.pointsSinguliers?.[key] ?? "SO"])
  ) as PvStep4["pointsSinguliers"];

  const [points, setPoints]             = useState(initPoints);
  const [observations, setObservations] = useState(formData.step4?.autresEcartsObservations ?? "");

  const handleNext = () => {
    updateStep4({ pointsSinguliers: points, autresEcartsObservations: observations });
    nextStep();
    navigate("/pv-form/step5");
  };

  return (
    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Points singuliers */}
      <div style={{
        backgroundColor: "#fff", borderRadius: 16, border: "1px solid #E5E7EB",
        padding: 16, display: "flex", flexDirection: "column", gap: 14,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <span style={{ fontSize: 18, color: "#E3000F" }}>△</span>
          <span style={{ fontSize: 13, fontWeight: 900, color: "#111827", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Points Singuliers
          </span>
        </div>
        {FIELDS.map(({ key, label }, i) => (
          <div key={key}>
            {i > 0 && <div style={{ height: 1, backgroundColor: "#E5E7EB", marginBottom: 14 }} />}
            <ToggleGroup label={label} value={points[key]}
              onChange={(v: ConformiteValue) => setPoints((p) => ({ ...p, [key]: v }))} />
          </div>
        ))}
      </div>

      {/* Autres écarts */}
      <div style={{
        backgroundColor: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", padding: 16,
      }}>
        <p style={{ fontSize: 12, fontWeight: 900, color: "#111827", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>
          Autres écarts &amp; observations
        </p>
        <textarea
          placeholder="Précisez ici toute observation complémentaire..."
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          rows={4}
          style={{
            width: "100%", backgroundColor: "#F3F4F6", border: "1.5px solid transparent",
            borderRadius: 12, padding: "12px 16px", fontSize: 14, color: "#111827",
            outline: "none", fontFamily: "inherit", resize: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      <NavButtons
        onPrev={() => { prevStep(); navigate(-1); }}
        onNext={handleNext}
      />
    </div>
  );
};

export default Step4PointsScreen;

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
