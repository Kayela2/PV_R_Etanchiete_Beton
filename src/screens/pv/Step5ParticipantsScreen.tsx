// src/screens/pv/Step5ParticipantsScreen.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { Input } from "../../components/ui";
import { ConfirmModal, SignatureCanvas } from "../../components/shared";
import { usePvFormStore } from "../../store";
import { usePvForm } from "../../hooks/usePvForm";
import type { Participant } from "../../types";

// ── Types locaux ──────────────────────────────────────────────────────────────

interface LocalParticipant {
  id: string;
  titre: string;
  nom: string;
  signature: string | null;  // null = non encore signé
}

const MAX_PARTICIPANTS = 3;

// Crée un participant vierge
const newParticipant = (): LocalParticipant => ({
  id: crypto.randomUUID(),
  titre: "",
  nom: "",
  signature: null,
});

// ── Composant ─────────────────────────────────────────────────────────────────

const Step5ParticipantsScreen = () => {
  const navigate = useNavigate();
  const { formData, updateStep5, prevStep } = usePvFormStore();
  const { savePv } = usePvForm();
  const step5 = formData.step5;

  // ── État participants ──────────────────────────────────────────────────────
  const [participants, setParticipants] = useState<LocalParticipant[]>(() => {
    const saved = step5.participants ?? [];
    if (saved.length > 0) {
      return saved.map((p) => ({
        id: p.id,
        titre: p.titre ?? "",
        nom: p.nom,
        signature: p.signature ?? null,
      }));
    }
    return [newParticipant()];
  });

  // ── Autres champs ──────────────────────────────────────────────────────────
  const [receptionAcceptee, setReceptionAcceptee] = useState(
    step5.receptionAcceptee ?? true
  );
  const [miseEnConformite, setMiseEnConformite] = useState(
    step5.miseEnConformiteLe ?? ""
  );
  const [envoyerEmail, setEnvoyerEmail] = useState(step5.envoyerEmail ?? false);
  const [email, setEmail] = useState(step5.emailDestinataire ?? "");

  // ── Validation / erreur ────────────────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCancelModal, setShowCancelModal] = useState(false);

  // ── Handlers participants ──────────────────────────────────────────────────
  const addParticipant = () => {
    if (participants.length < MAX_PARTICIPANTS) {
      setParticipants((prev) => [...prev, newParticipant()]);
    }
  };

  const updateField = (
    id: string,
    field: keyof Omit<LocalParticipant, "id">,
    value: string | null
  ) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
    // Effacer l'erreur liée à ce participant/champ
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`${id}_${field}`];
      return next;
    });
  };

  const handleSignatureChange = (id: string, base64: string | null) => {
    updateField(id, "signature", base64);
  };

  // ── Validation et sauvegarde ───────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    // Valider uniquement les participants qui ont commencé à être remplis
    participants.forEach((p) => {
      const hasAnyData = p.nom.trim() || p.titre.trim() || p.signature;
      if (hasAnyData && !p.nom.trim()) {
        newErrors[`${p.id}_nom`] = "Le nom est requis";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    // Garder uniquement les participants avec au moins un nom
    const mappedParticipants: Participant[] = participants
      .filter((p) => p.nom.trim())
      .map((p) => ({
        id: p.id,
        titre: p.titre || undefined,
        nom: p.nom,
        signature: p.signature ?? undefined,
      }));

    updateStep5({
      participants: mappedParticipants,
      receptionAcceptee,
      miseEnConformiteLe: miseEnConformite || undefined,
      envoyerEmail,
      emailDestinataire: email || undefined,
    });
    // Naviguer AVANT savePv pour éviter que resetForm() déclenche
    // un re-render qui court-circuite la navigation
    navigate("/pv-form/step6", { replace: true });
    savePv();
  };

  const handleCancel = () => setShowCancelModal(true);

  const confirmCancel = () => {
    setShowCancelModal(false);
    prevStep();
    navigate(-1);
  };

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <>
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── Section Participants ── */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid #E5E7EB",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* Titre section */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 900,
                color: "#111827",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                borderLeft: "3px solid #E3000F",
                paddingLeft: 10,
                margin: 0,
              }}
            >
              Participants
            </p>
            {participants.length < MAX_PARTICIPANTS && (
              <button
                type="button"
                onClick={addParticipant}
                title="Ajouter un participant"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#E3000F",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 13,
                  fontWeight: 600,
                  padding: 0,
                }}
              >
                <UserPlus size={18} />
              </button>
            )}
          </div>

          {/* Cartes participants */}
          {participants.map((participant, index) => (
            <div
              key={participant.id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                paddingBottom: index < participants.length - 1 ? 20 : 0,
                borderBottom:
                  index < participants.length - 1
                    ? "1px solid #F3F4F6"
                    : "none",
              }}
            >
              {/* Numéro du participant */}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#E3000F",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Participant {index + 1}
              </span>

              {/* Titre (optionnel) */}
              <Input
                label="Titre"
                placeholder="Ex: Conducteur de travaux"
                value={participant.titre}
                onChange={(e) =>
                  updateField(participant.id, "titre", e.target.value)
                }
              />

              {/* Nom (requis) */}
              <div>
                <Input
                  label="Nom du participant *"
                  placeholder="Jean Dupont"
                  value={participant.nom}
                  onChange={(e) =>
                    updateField(participant.id, "nom", e.target.value)
                  }
                />
                {errors[`${participant.id}_nom`] && (
                  <p style={{ color: "#E3000F", fontSize: 11, margin: "4px 0 0 4px" }}>
                    {errors[`${participant.id}_nom`]}
                  </p>
                )}
              </div>

              {/* Signature */}
              <SignatureCanvas
                value={participant.signature ?? undefined}
                onChange={(base64) =>
                  handleSignatureChange(participant.id, base64)
                }
              />
            </div>
          ))}

          {/* Bouton ajouter (si < 3) */}
          {participants.length < MAX_PARTICIPANTS && (
            <button
              type="button"
              onClick={addParticipant}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                border: "1.5px dashed #E3000F",
                borderRadius: 12,
                padding: "10px",
                background: "none",
                cursor: "pointer",
                color: "#E3000F",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <UserPlus size={16} />
              Ajouter un participant ({participants.length}/{MAX_PARTICIPANTS})
            </button>
          )}
        </div>

        {/* ── Section Réception ── */}
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid #E5E7EB",
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Réception acceptée */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
              Réception acceptée ?
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              {(["OUI", "NON"] as const).map((opt) => {
                const active = opt === "OUI" ? receptionAcceptee : !receptionAcceptee;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setReceptionAcceptee(opt === "OUI")}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 10,
                      border: "none",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                      backgroundColor: active ? "#E3000F" : "#F3F4F6",
                      color: active ? "#fff" : "#6B7280",
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mise en conformité */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span
              style={{ fontSize: 14, fontWeight: 600, color: "#111827", flexShrink: 0 }}
            >
              Mise en conformité le :
            </span>
            <input
              type="date"
              value={miseEnConformite}
              onChange={(e) => setMiseEnConformite(e.target.value)}
              style={{
                backgroundColor: "#F3F4F6",
                borderRadius: 10,
                padding: "8px 12px",
                fontSize: 13,
                color: "#111827",
                outline: "none",
                border: "1.5px solid transparent",
              }}
            />
          </div>

          {/* Toggle email */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
              Envoi automatique par email
            </span>
            <button
              type="button"
              onClick={() => setEnvoyerEmail((v) => !v)}
              style={{
                width: 48,
                height: 26,
                borderRadius: 100,
                border: "none",
                cursor: "pointer",
                position: "relative",
                backgroundColor: envoyerEmail ? "#E3000F" : "#E5E7EB",
                transition: "background 0.2s",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: envoyerEmail ? 25 : 3,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  backgroundColor: "#fff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  transition: "left 0.2s",
                }}
              />
            </button>
          </div>

          {/* Champ email */}
          {envoyerEmail && (
            <Input
              label="Adresse mail destinataire"
              type="email"
              placeholder="exemple@smac.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
        </div>

        {/* ── Actions ── */}
        <div style={{ display: "flex", gap: 12, paddingBottom: 16 }}>
          <button
            type="button"
            onClick={handleCancel}
            style={{
              flex: 1,
              backgroundColor: "#F3F4F6",
              color: "#111827",
              border: "1px solid #E5E7EB",
              borderRadius: 100,
              padding: "14px 20px",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              flex: 2,
              backgroundColor: "#E3000F",
              color: "#fff",
              border: "none",
              borderRadius: 100,
              padding: "14px 20px",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Enregistrer le PV
          </button>
        </div>
      </div>

      {/* ── Modale confirmation annulation ── */}
      <ConfirmModal
        isOpen={showCancelModal}
        title="Quitter le formulaire ?"
        message="Souhaitez-vous vraiment quitter ce formulaire ? Cette action est irréversible pour la session en cours."
        confirmLabel="Quitter"
        cancelLabel="Rester"
        onConfirm={confirmCancel}
        onCancel={() => setShowCancelModal(false)}
      />
    </>
  );
};

export default Step5ParticipantsScreen;
