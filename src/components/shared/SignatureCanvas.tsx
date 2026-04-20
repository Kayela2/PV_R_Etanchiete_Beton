// src/components/shared/SignatureCanvas.tsx
import { useRef, useEffect, useState, useCallback } from "react";

interface SignatureCanvasProps {
  /** Valeur initiale (base64 PNG). Si fournie, dessinée au chargement. */
  value?: string;
  /** Appelé chaque fois que l'utilisateur lève le stylo avec la donnée base64. */
  onChange: (base64: string | null) => void;
  /** Hauteur du canvas en px (défaut 130). */
  height?: number;
}

/**
 * Zone de signature dessinable (souris + tactile).
 * Renvoie null via onChange quand le canvas est vide.
 */
export const SignatureCanvas = ({
  value,
  onChange,
  height = 130,
}: SignatureCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [isEmpty, setIsEmpty] = useState(true);

  // ── Initialisation du canvas ────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;                      // getContext peut retourner null sur mobile

    // Résolution physique = résolution CSS × devicePixelRatio pour la netteté
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    // Éviter canvas de taille 0 (layout pas encore calculé)
    const w = Math.max(rect.width, 1);
    const h = Math.max(rect.height, 1);
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Restaurer une signature existante
    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, w, h);
        setIsEmpty(false);
      };
      img.src = value;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Helpers coordonnées ─────────────────────────────────────────────────────
  const getPos = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const t = e.touches[0];
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    return { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
  };

  // ── Dessin ──────────────────────────────────────────────────────────────────
  const startDraw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawing.current = true;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    if (isEmpty) setIsEmpty(false);
  };

  const endDraw = useCallback(() => {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL("image/png"));
  }, [onChange]);

  // ── Effacer ─────────────────────────────────────────────────────────────────
  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onChange(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#6B7280",
        }}
      >
        Signature <span style={{ color: "#E3000F" }}>*</span>
      </label>

      {/* Zone de dessin */}
      <div
        style={{
          position: "relative",
          borderRadius: 12,
          border: "2px dashed #E5E7EB",
          backgroundColor: "#F9FAFB",
          overflow: "hidden",
          height,
        }}
      >
        {/* Placeholder "Signer ici" */}
        {isEmpty && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <span style={{ color: "#9CA3AF", fontSize: 14 }}>Signer ici</span>
          </div>
        )}

        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "100%", display: "block", cursor: "crosshair", touchAction: "none" }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>

      {/* Bouton Effacer */}
      <button
        type="button"
        onClick={clear}
        style={{
          alignSelf: "flex-end",
          background: "none",
          border: "none",
          color: "#E3000F",
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          padding: "2px 0",
        }}
      >
        Effacer
      </button>
    </div>
  );
};

export default SignatureCanvas;
