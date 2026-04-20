// src/screens/pv/Step3EtancheiteScreen.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Droplets } from "lucide-react";
import { ToggleGroup } from "../../components/ui";
import { usePvFormStore } from "../../store";
import type { ConformiteValue, PvStep3 } from "../../types";

type ReleveKey = keyof PvStep3["releveEtancheite"];

// Labels mis à jour selon la demande
const FIELDS: { key: ReleveKey; label: string }[] = [
  { key: "trousBanchesRebouches",     label: "Hauteur d'engravure"                  },
  { key: "remplissageJointsPanneaux", label: "Profondeur d'engravure"               },
  { key: "hauteurEngravure",          label: "Protection de la tête des relevés"    },
  { key: "profondeurEngravure",       label: "Profondeur engravure"                 },
  { key: "protectionTeteReleves",     label: "Protection tête de relevés"           },
  // niveauxArase supprimé
];

const Step3EtancheiteScreen = () => {
  const navigate = useNavigate();
  const { formData, updateStep3, nextStep, prevStep } = usePvFormStore();

  const initReleve = () => Object.fromEntries(
    FIELDS.map(({ key }) => [key, formData.step3?.releveEtancheite?.[key] ?? "SO"])
  ) as PvStep3["releveEtancheite"];

  const [releve, setReleve] = useState(initReleve);

  const handleChange = (key: ReleveKey, value: ConformiteValue) =>
    setReleve((prev) => ({ ...prev, [key]: value }));

  const handleNext = () => {
    updateStep3({ releveEtancheite: releve });
    nextStep();
    navigate("/pv-form/step4");
  };

  return (
    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{
        backgroundColor: "#fff", borderRadius: 16, border: "1px solid #E5E7EB",
        padding: 16, display: "flex", flexDirection: "column", gap: 14,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
          <Droplets size={18} color="#E3000F" />
          <span style={{ fontSize: 13, fontWeight: 900, color: "#111827", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Relevés d'Étanchéité
          </span>
        </div>
        {FIELDS.map(({ key, label }, i) => (
          <div key={key}>
            {i > 0 && <div style={{ height: 1, backgroundColor: "#E5E7EB", marginBottom: 14 }} />}
            <ToggleGroup label={label} value={releve[key]}
              onChange={(v) => handleChange(key, v)} />
          </div>
        ))}
      </div>
      <NavButtons
        onPrev={() => { prevStep(); navigate(-1); }}
        onNext={handleNext}
      />
    </div>
  );
};

export default Step3EtancheiteScreen;

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
