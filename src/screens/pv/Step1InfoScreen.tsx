// src/screens/pv/Step1InfoScreen.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FileText, User, Plus } from "lucide-react";
import { Input, Select } from "../../components/ui";
import { usePvFormStore } from "../../store";
import { AGENCES, getEtablissementsByAgence } from "../../data/referentiel";

const schema = z.object({
  agenceId:            z.string(),
  etablissementId:     z.string(),
  chantier:            z.string(),
  zoneBatiment:        z.string(),
  dateInspection:      z.string(),
  responsableChantier: z.string(),
});
type FormValues = z.infer<typeof schema>;

// ── Composant bouton toggle 2 options ───────────
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
      fontSize: 11, fontWeight: 700, textTransform: "uppercase",
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

// ── Écran ─────────────────────────
const Step1InfoScreen = () => {
  const navigate = useNavigate();
  const { formData, updateStep1, nextStep } = usePvFormStore();
  const step1 = formData.step1;

  const [planReperage, setPlanReperage] = useState<string>(step1.planReperage ?? "");

  const { register, handleSubmit, control, watch, getValues, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
        agenceId:            step1.agenceId            ?? "",
        etablissementId:     step1.etablissementId     ?? "",
        chantier:            step1.chantier            ?? "",
        zoneBatiment:        step1.zoneBatiment        ?? "",
        dateInspection:      step1.dateInspection      ?? "",
        responsableChantier: step1.responsableChantier ?? "",
      },
    });

  const agenceId      = watch("agenceId");
  const etablissements = agenceId ? getEtablissementsByAgence(agenceId) : [];

  const onSubmit = (data: FormValues) => {
    updateStep1({
      ...data,
      planReperage: planReperage as "oui" | "non" | undefined || undefined,
    });
    nextStep();
    navigate("/pv-form/step2");
  };

  return (
    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Bannière */}
      <div style={{
        display: "flex", gap: 12, backgroundColor: "#FDECEA",
        borderRadius: 16, padding: 16, alignItems: "flex-start",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, backgroundColor: "#E3000F",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <FileText size={16} color="#fff" />
        </div>
        <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.6 }}>
          Veuillez renseigner les informations d'identification du chantier
          pour débuter le PV de réception.
        </p>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", minWidth: 0 }}>

        <Controller name="agenceId" control={control} render={({ field }) => (
          <Select label="Agence" placeholder="Sélectionner une agence"
            options={AGENCES.map((a) => ({ value: a.id, label: a.nom }))}
            error={errors.agenceId?.message} {...field} />
        )} />

        <Controller name="etablissementId" control={control} render={({ field }) => (
          <Select label="Établissement" placeholder="Sélectionner l'établissement"
            options={etablissements.map((e) => ({ value: e.id, label: e.nom }))}
            disabled={!agenceId} error={errors.etablissementId?.message} {...field} />
        )} />

        <Input label="Chantier" placeholder="Nom du projet ou référence client"
          error={errors.chantier?.message} {...register("chantier")} />

        <Input label="Zone / Bâtiment" placeholder="Ex: Bâtiment B - Toiture"
          {...register("zoneBatiment")} />

        <Input label="Date d'inspection" type="date"
          {...register("dateInspection")} />

        <Input label="Responsable chantier" placeholder="Nom du conducteur de travaux"
          leftIcon={<User size={15} />}
          {...register("responsableChantier")} />

        {/* Plan de repérage */}
        <TwoOptionToggle
          label="Plan de repérage joint à la réception"
          options={[
            { value: "oui", label: "Oui" },
            { value: "non", label: "Non" },
          ]}
          value={planReperage}
          onChange={setPlanReperage}
        />

        {/* Bloc réserves */}
        <div style={{
          backgroundColor: "#F3F4F6", borderRadius: 16, padding: 16,
          display: "flex", flexDirection: "column", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, backgroundColor: "#E3000F",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <FileText size={18} color="#fff" />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 900, color: "#111827", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Gestion des Réserves
              </p>
              <p style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
                Ajoutez les détails et actions à mener sur vos réserves
              </p>
            </div>
          </div>
          {(() => {
            const count       = step1.reserves?.length ?? 0;
            const hasReserves = count > 0;
            return (
              <button
                type="button"
                onClick={() => {
                  updateStep1({
                    ...getValues(),
                    planReperage: planReperage as "oui" | "non" | undefined || undefined,
                  });
                  navigate(hasReserves ? "/pv-form/reserves" : "/pv-form/reserve");
                }}
                style={{
                  width: "100%",
                  backgroundColor: hasReserves ? "#fff" : "#E3000F",
                  color: hasReserves ? "#E3000F" : "#fff",
                  border: hasReserves ? "2px solid #E3000F" : "none",
                  borderRadius: 14, padding: "14px 20px",
                  fontSize: 15, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                <Plus size={18} />
                {hasReserves ? `Voir les réserves (${count})` : "Ajouter une réserve"}
              </button>
            );
          })()}
        </div>

        {/* Suivant */}
        <div style={{ display: "flex", justifyContent: "flex-end", paddingBottom: 16 }}>
          <button type="submit" style={{
            backgroundColor: "#E3000F", color: "#fff", border: "none",
            borderRadius: 100, padding: "14px 28px", fontSize: 15, fontWeight: 700,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
          }}>
            Suivant →
          </button>
        </div>
      </form>
    </div>
  );
};

export default Step1InfoScreen;
