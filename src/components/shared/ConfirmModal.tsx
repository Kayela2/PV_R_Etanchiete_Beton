import React from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Composant de modale de confirmation centré.
 * Design contraint à l'espace du simulateur mobile.
 */
export const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modalCard}>
        {/* Icône d'avertissement SMAC */}
        <div style={styles.iconContainer}>
          <AlertTriangle size={32} color="#E3000F" />
        </div>
        
        {/* Contenu textuel */}
        <div style={styles.content}>
          <h3 style={styles.title}>{title}</h3>
          <p style={styles.message}>{message}</p>
        </div>

        {/* Actions de la modale */}
        <div style={styles.actionContainer}>
          <button 
            onClick={onConfirm} 
            style={styles.confirmButton}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#c2000d")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#E3000F")}
          >
            {confirmLabel}
          </button>
          <button 
            onClick={onCancel} 
            style={styles.cancelButton}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#e5e7eb")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#F3F4F6")}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    // Utilisation de absolute au lieu de fixed pour rester dans le parent (le mobile)
    position: "absolute", 
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(5px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 9999,
    borderRadius: "inherit", // Pour respecter les bords arrondis du simulateur
  },
  modalCard: {
    backgroundColor: "#ffffff",
    width: "100%",
    // Largeur maximale légèrement réduite pour laisser de l'air sur les côtés du mobile
    maxWidth: "300px", 
    borderRadius: "28px",
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    textAlign: "center",
  },
  iconContainer: {
    width: "64px",
    height: "64px",
    backgroundColor: "#FDECEA",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
  },
  content: {
    marginBottom: "32px",
  },
  title: {
    fontSize: "17px",
    fontWeight: 900,
    color: "#111827",
    margin: "0 0 10px 0",
    textTransform: "uppercase",
    letterSpacing: "0.02em",
  },
  message: {
    fontSize: "14px",
    color: "#4B5563",
    lineHeight: "1.5",
    margin: 0,
    fontWeight: 500,
  },
  actionContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  confirmButton: {
    width: "100%",
    backgroundColor: "#E3000F",
    color: "#ffffff",
    border: "none",
    borderRadius: "16px",
    padding: "16px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  cancelButton: {
    width: "100%",
    backgroundColor: "#F3F4F6",
    color: "#374151",
    border: "none",
    borderRadius: "16px",
    padding: "16px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
};

export default ConfirmModal;