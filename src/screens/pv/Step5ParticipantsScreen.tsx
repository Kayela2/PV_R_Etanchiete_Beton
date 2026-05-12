// src/screens/pv/Step5ParticipantsScreen.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Loader2, Trash2 } from "lucide-react";
import { Input } from "../../components/ui";
import { ConfirmModal, SignatureCanvas } from "../../components/shared";
import { usePvFormStore, usePvStore } from "../../store";
import { usePvForm } from "../../hooks/usePvForm";
import { generatePvPdfBlob } from "../../utils/generatePvPdf";
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
  const { formData, updateStep5, prevStep, editingPvId } = usePvFormStore();
  const { savePv } = usePvForm();
  const step5       = formData.step5;
  const hasReserves = (formData.step1.reserves?.length ?? 0) > 0;

  // ── État SMAC ─────────────────────────────────────────────────────────────
  const [nomSmac,       setNomSmac]       = useState(step5.nomSmac       ?? "");
  const [signatureSmac, setSignatureSmac] = useState<string | null>(step5.signatureSmac ?? null);

  // ── État participants ──────────────────────────────────────────────────────
  const [participants, setParticipants] = useState<LocalParticipant[]>(() => {
    const saved = step5.participants ?? [];
    return saved.map((p) => ({
      id: p.id,
      titre: p.titre ?? "",
      nom: p.nom,
      signature: p.signature ?? null,
    }));
    // démarre vide — ajout manuel via le bouton
  });

  // ── Autres champs ──────────────────────────────────────────────────────────
  const receptionAcceptee = !hasReserves;
  const today = new Date().toISOString().split("T")[0];
  const [miseEnConformite, setMiseEnConformite] = useState(() => {
    const saved = step5.miseEnConformiteLe;
    if (!saved || saved < today) return today;
    return saved;
  });

  // Si on passe en mode "Réception reportée" avec une date passée, on réinitialise à aujourd'hui
  useEffect(() => {
    if (!receptionAcceptee && miseEnConformite < today) {
      setMiseEnConformite(today);
    }
  }, [receptionAcceptee]); // eslint-disable-line react-hooks/exhaustive-deps
  const [envoyerEmail, setEnvoyerEmail] = useState(step5.envoyerEmail ?? false);
  const [email, setEmail] = useState(step5.emailDestinataire ?? "");

  // Persistance immédiate dans le store — empêche la perte de données si le
  // composant se remonte (StrictMode, navigation aller-retour).
  useEffect(() => {
    updateStep5({
      nomSmac,
      signatureSmac: signatureSmac ?? undefined,
      participants: participants.map((p) => ({
        id:        p.id,
        titre:     p.titre || undefined,
        nom:       p.nom,
        signature: p.signature ?? undefined,
      })),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nomSmac, signatureSmac, participants]);

  // ── Validation / erreur ────────────────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Conditions d'affichage progressif ────────────────────────────────────
  const nomFilled      = nomSmac.trim() !== "";
  const smacComplete   = nomFilled && signatureSmac !== null;

  const participantComplete = (p: LocalParticipant) =>
    p.titre.trim() !== "" && p.nom.trim() !== "" && p.signature !== null;

  // ── Handlers participants ──────────────────────────────────────────────────
  const addParticipant = () => {
    if (participants.length < MAX_PARTICIPANTS) {
      setParticipants((prev) => [...prev, newParticipant()]);
    }
  };

  const removeParticipant = (id: string) => {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`${id}_titre`];
      delete next[`${id}_nom`];
      delete next[`${id}_signature`];
      return next;
    });
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

    if (!nomSmac.trim())    newErrors["nomSmac"]       = "Le nom SMAC est requis";
    if (!signatureSmac)     newErrors["signatureSmac"] = "La signature SMAC est requise";

    participants.forEach((p) => {
      if (!p.titre.trim())  newErrors[`${p.id}_titre`]     = "Le titre est requis";
      if (!p.nom.trim())    newErrors[`${p.id}_nom`]       = "Le nom est requis";
      if (!p.signature)     newErrors[`${p.id}_signature`] = "La signature est requise";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    // Capturer l'ID avant que savePv() appelle resetForm() (mode édition)
    const targetPvId = editingPvId ?? undefined;
    try {
      const mappedParticipants: Participant[] = participants
        .filter((p) => p.nom.trim())
        .map((p) => ({
          id: p.id,
          titre: p.titre || undefined,
          nom: p.nom,
          signature: p.signature ?? undefined,
        }));

      updateStep5({
        nomSmac,
        signatureSmac: signatureSmac ?? undefined,
        participants: mappedParticipants,
        receptionAcceptee,
        miseEnConformiteLe: receptionAcceptee ? today : (miseEnConformite || undefined),
        envoyerEmail,
        emailDestinataire: email || undefined,
      });

      savePv();

      // Envoi automatique par email si adresse renseignée
      if (envoyerEmail && email.trim()) {
        try {
          const lastPv = usePvStore.getState().pvList[0];
          if (lastPv) {
            const { blob, filename } = await generatePvPdfBlob(lastPv);
            const file = new File([blob], filename, { type: "application/pdf" });
            if (navigator.canShare?.({ files: [file] })) {
              await navigator.share({
                files: [file],
                title: `PV SMAC — ${lastPv.step1?.chantier ?? ""}`,
                text:  `Procès-verbal SMAC — Réf. : ${lastPv.id}`,
              });
            } else {
              const subject = encodeURIComponent(`PV SMAC — ${lastPv.step1?.chantier ?? ""}`);
              const body    = encodeURIComponent(`Bonjour,\n\nVeuillez trouver ci-joint le procès-verbal ${lastPv.id}.\n\nCordialement,\nSMAC`);
              window.open(`mailto:${email}?subject=${subject}&body=${body}`);
            }
          }
        } catch { /* silencieux si l'utilisateur annule le partage */ }
      }

      // Laisser le spinner visible 1.5 s pour l'UX puis afficher l'étape 4
      await new Promise<void>((r) => setTimeout(r, 1500));
      navigate("/pv-form/step6", { replace: true, state: { pvId: targetPvId } });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => setShowCancelModal(true);

  const confirmCancel = () => {
    setShowCancelModal(false);
    prevStep();
    navigate("/", { replace: true });
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
          <p style={{
            fontSize: 13, fontWeight: 900, color: "#111827",
            textTransform: "uppercase", letterSpacing: "0.08em",
            borderLeft: "3px solid #E3000F", paddingLeft: 10, margin: 0,
          }}>
            Participants
          </p>

          {/* ── Champs SMAC ── */}
          <div style={{
            display: "flex", flexDirection: "column", gap: 12,
            padding: 12, backgroundColor: "#F9FAFB", borderRadius: 12,
            border: "1px solid #E5E7EB",
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#E3000F",
              textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              SMAC
            </span>

            {/* Nom SMAC */}
            <div>
              <Input
                label="Noms SMAC *"
                placeholder="Nom du responsable SMAC"
                value={nomSmac}
                onChange={(e) => {
                  setNomSmac(e.target.value);
                  if (e.target.value.trim()) setErrors((prev) => { const n = { ...prev }; delete n["nomSmac"]; return n; });
                }}
              />
              {errors["nomSmac"] && (
                <p style={{ color: "#E3000F", fontSize: 11, margin: "4px 0 0 4px" }}>
                  {errors["nomSmac"]}
                </p>
              )}
            </div>

            {/* Signature SMAC — grisée jusqu'à nom rempli */}
            <div style={{
              opacity: nomFilled ? 1 : 0.4,
              pointerEvents: nomFilled ? "auto" : "none",
              transition: "opacity 0.2s",
            }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#374151",
                textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px",
              }}>
                Signature SMAC *
              </p>
              {/* Signature + bouton ajout côte à côte */}
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  <SignatureCanvas
                    value={signatureSmac ?? undefined}
                    onChange={(base64) => {
                      setSignatureSmac(base64);
                      if (base64) setErrors((prev) => { const n = { ...prev }; delete n["signatureSmac"]; return n; });
                    }}
                  />
                </div>
                {smacComplete && participants.length === 0 && participants.length < MAX_PARTICIPANTS && (
                  <button
                    type="button"
                    onClick={addParticipant}
                    style={{
                      flexShrink: 0, width: 40, height: 40,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "1.5px dashed #E3000F", borderRadius: 12,
                      background: "none", cursor: "pointer", color: "#E3000F",
                    }}
                  >
                    <UserPlus size={18} />
                  </button>
                )}
              </div>
              {errors["signatureSmac"] && (
                <p style={{ color: "#E3000F", fontSize: 11, margin: "4px 0 0 4px" }}>
                  {errors["signatureSmac"]}
                </p>
              )}
            </div>
          </div>

          {/* ── Participants (affichés après ajout) ── */}
          {participants.map((participant, index) => (
            <div
              key={participant.id}
              style={{
                display: "flex", flexDirection: "column", gap: 12,
                paddingBottom: index < participants.length - 1 ? 20 : 0,
                borderBottom: index < participants.length - 1 ? "1px solid #F3F4F6" : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#E3000F",
                  textTransform: "uppercase", letterSpacing: "0.08em",
                }}>
                  Participant {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeParticipant(participant.id)}
                  style={{
                    width: 28, height: 28, borderRadius: "50%",
                    backgroundColor: "#FEE2E2", border: "none",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={13} color="#E3000F" />
                </button>
              </div>

              {/* Titre — obligatoire en premier */}
              <div>
                <Input
                  label="Titre *"
                  placeholder="Ex: Conducteur de travaux"
                  value={participant.titre}
                  onChange={(e) => updateField(participant.id, "titre", e.target.value)}
                />
                {errors[`${participant.id}_titre`] && (
                  <p style={{ color: "#E3000F", fontSize: 11, margin: "4px 0 0 4px" }}>
                    {errors[`${participant.id}_titre`]}
                  </p>
                )}
              </div>

              {/* Nom — activé seulement si Titre rempli */}
              <div style={{
                opacity: participant.titre.trim() ? 1 : 0.4,
                pointerEvents: participant.titre.trim() ? "auto" : "none",
                transition: "opacity 0.2s",
              }}>
                <Input
                  label="Nom du participant *"
                  placeholder="Jean Dupont"
                  value={participant.nom}
                  onChange={(e) => updateField(participant.id, "nom", e.target.value)}
                />
                {errors[`${participant.id}_nom`] && (
                  <p style={{ color: "#E3000F", fontSize: 11, margin: "4px 0 0 4px" }}>
                    {errors[`${participant.id}_nom`]}
                  </p>
                )}
              </div>

              {/* Signature — activée seulement si Nom rempli */}
              <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                <div style={{
                  flex: 1,
                  opacity: participant.nom.trim() ? 1 : 0.4,
                  pointerEvents: participant.nom.trim() ? "auto" : "none",
                  transition: "opacity 0.2s",
                }}>
                  <SignatureCanvas
                    value={participant.signature ?? undefined}
                    onChange={(base64) => {
                      handleSignatureChange(participant.id, base64);
                      if (base64) setErrors((prev) => { const n = { ...prev }; delete n[`${participant.id}_signature`]; return n; });
                    }}
                  />
                  {errors[`${participant.id}_signature`] && (
                    <p style={{ color: "#E3000F", fontSize: 11, margin: "4px 0 0 4px" }}>
                      {errors[`${participant.id}_signature`]}
                    </p>
                  )}
                </div>
                {/* Bouton ajout suivant — uniquement sur le dernier participant complet */}
                {index === participants.length - 1 &&
                  participantComplete(participant) &&
                  participants.length < MAX_PARTICIPANTS && (
                  <button
                    type="button"
                    onClick={addParticipant}
                    style={{
                      flexShrink: 0, width: 40, height: 40,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "1.5px dashed #E3000F", borderRadius: 12,
                      background: "none", cursor: "pointer", color: "#E3000F",
                    }}
                  >
                    <UserPlus size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
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
          {/* Réception acceptée — automatique, toujours grisé */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            opacity: 0.45, pointerEvents: "none",
          }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
                Réception acceptée ?
              </span>
              <p style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
                {hasReserves ? "NON — réserves en cours" : "OUI — aucune réserve"}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {(["OUI", "NON"] as const).map((opt) => {
                const active = opt === "OUI" ? receptionAcceptee : !receptionAcceptee;
                return (
                  <button
                    key={opt}
                    type="button"
                    style={{
                      padding: "8px 16px", borderRadius: 10, border: "none",
                      fontWeight: 700, fontSize: 13, cursor: "default",
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

          {/* Date : "Mise en conformité" si OUI, "Réception reportée au" si NON */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#111827", flexShrink: 0 }}>
              {receptionAcceptee ? "Mise en conformité le :" : "Réception reportée au :"}
            </span>
            <input
              type="date"
              lang="fr"
              value={receptionAcceptee ? today : miseEnConformite}
              readOnly={receptionAcceptee}
              min={receptionAcceptee ? undefined : today}
              onChange={(e) => {
                if (!receptionAcceptee) setMiseEnConformite(e.target.value);
              }}
              style={{
                backgroundColor: receptionAcceptee ? "#E5E7EB" : "#F3F4F6",
                borderRadius: 10,
                padding: "8px 12px", fontSize: 13,
                color: receptionAcceptee ? "#6B7280" : "#111827",
                outline: "none", border: "1.5px solid transparent",
                cursor: receptionAcceptee ? "not-allowed" : "pointer",
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
            disabled={saving}
            style={{
              flex: 2,
              backgroundColor: "#E3000F",
              color: "#fff",
              border: "none",
              borderRadius: 100,
              padding: "14px 20px",
              fontSize: 15,
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.8 : 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {saving
              ? <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Enregistrement…</>
              : "Enregistrer le PV"
            }
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
