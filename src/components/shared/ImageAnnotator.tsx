// src/components/shared/ImageAnnotator.tsx
import { useRef, useState, useEffect, useCallback } from "react";
import { X, Minus, Square, Circle, Type, Pen, Trash2, RotateCcw } from "lucide-react";

type Tool  = "draw" | "arrow" | "rect" | "circle" | "text";
type Color = string;

interface Point { x: number; y: number }

interface Annotation {
  tool:   Tool;
  color:  Color;
  size:   number;
  // freehand
  points?: Point[];
  // shapes
  start?: Point;
  end?:   Point;
  // text
  pos?:   Point;
  text?:  string;
}

interface Props {
  imageUrl: string;
  onSave:   (annotatedUrl: string) => void;
  onClose:  () => void;
}

const COLORS: Color[] = ["#E3000F", "#F59E0B", "#16A34A", "#3B82F6", "#FFFFFF", "#111827"];
const SIZES  = [3, 5, 8];

const TOOLS: { id: Tool; icon: React.ReactNode; label: string }[] = [
  { id: "draw",   icon: <Pen    size={17} />, label: "Dessin" },
  { id: "arrow",  icon: <Minus  size={17} />, label: "Flèche" },
  { id: "rect",   icon: <Square size={17} />, label: "Rect."  },
  { id: "circle", icon: <Circle size={17} />, label: "Cercle" },
  { id: "text",   icon: <Type   size={17} />, label: "Texte"  },
];

export const ImageAnnotator = ({ imageUrl, onSave, onClose }: Props) => {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const imgRef     = useRef<HTMLImageElement>(null);

  const [tool,        setTool]        = useState<Tool>("draw");
  const [color,       setColor]       = useState<Color>("#E3000F");
  const [size,        setSize]        = useState(5);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [current,     setCurrent]     = useState<Annotation | null>(null);
  const [imgLoaded,   setImgLoaded]   = useState(false);

  // ── Coordonnées canvas normalisées ──────────────────────────────────────────
  const getPos = useCallback((
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement,
  ): Point => {
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const src    = "touches" in e ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top)  * scaleY,
    };
  }, []);

  // ── Rendu canvas ─────────────────────────────────────────────────────────────
  const redraw = useCallback((extra?: Annotation | null) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    [...annotations, ...(extra ? [extra] : [])].forEach((a) => drawAnnotation(ctx, a, canvas));
  }, [annotations]);

  useEffect(() => { redraw(); }, [redraw]);

  // ── Dessin d'une annotation ─────────────────────────────────────────────────
  const drawAnnotation = (ctx: CanvasRenderingContext2D, a: Annotation, canvas: HTMLCanvasElement) => {
    const scale = canvas.width / canvas.getBoundingClientRect().width;
    ctx.strokeStyle = a.color;
    ctx.fillStyle   = a.color;
    ctx.lineWidth   = a.size * scale;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";

    if (a.tool === "draw" && a.points && a.points.length > 1) {
      ctx.beginPath();
      ctx.moveTo(a.points[0].x, a.points[0].y);
      a.points.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    }

    if ((a.tool === "arrow" || a.tool === "rect" || a.tool === "circle") && a.start && a.end) {
      const { start: s, end: e } = a;

      if (a.tool === "arrow") {
        const angle   = Math.atan2(e.y - s.y, e.x - s.x);
        const headLen = 18 * scale;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(e.x, e.y);
        ctx.stroke();
        // Tête de flèche
        ctx.beginPath();
        ctx.moveTo(e.x, e.y);
        ctx.lineTo(e.x - headLen * Math.cos(angle - Math.PI / 6), e.y - headLen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(e.x, e.y);
        ctx.lineTo(e.x - headLen * Math.cos(angle + Math.PI / 6), e.y - headLen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
      }

      if (a.tool === "rect") {
        ctx.beginPath();
        ctx.strokeRect(s.x, s.y, e.x - s.x, e.y - s.y);
      }

      if (a.tool === "circle") {
        const rx = Math.abs(e.x - s.x) / 2;
        const ry = Math.abs(e.y - s.y) / 2;
        const cx = (s.x + e.x) / 2;
        const cy = (s.y + e.y) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    if (a.tool === "text" && a.pos && a.text) {
      const fs = a.size * 8 * scale;
      ctx.font      = `bold ${fs}px sans-serif`;
      ctx.fillStyle = a.color;
      ctx.fillText(a.text, a.pos.x, a.pos.y);
    }
  };

  // ── Événements souris / tactile ──────────────────────────────────────────────
  const onStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getPos(e, canvas);

    if (tool === "text") {
      const input = prompt("Texte à ajouter :");
      if (input?.trim()) {
        setAnnotations((prev) => [...prev, { tool, color, size, pos, text: input.trim() }]);
      }
      return;
    }

    const ann: Annotation = { tool, color, size };
    if (tool === "draw") { ann.points = [pos]; }
    else                  { ann.start = pos; ann.end = pos; }
    setCurrent(ann);
  };

  const onMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getPos(e, canvas);

    const updated: Annotation = current.tool === "draw"
      ? { ...current, points: [...(current.points ?? []), pos] }
      : { ...current, end: pos };

    setCurrent(updated);
    redraw(updated);
  };

  const onEnd = () => {
    if (!current) return;
    setAnnotations((prev) => [...prev, current]);
    setCurrent(null);
  };

  // ── Effacer la dernière annotation ───────────────────────────────────────────
  const undo = () => setAnnotations((prev) => prev.slice(0, -1));
  const clear = () => setAnnotations([]);

  // ── Sauvegarder (fusion image + annotations) ──────────────────────────────
  const handleSave = () => {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    if (!canvas || !img) return;

    const merge = document.createElement("canvas");
    merge.width  = img.naturalWidth  || img.width;
    merge.height = img.naturalHeight || img.height;
    const ctx = merge.getContext("2d")!;
    ctx.drawImage(img, 0, 0, merge.width, merge.height);

    // Redimensionner le canvas d'annotations aux dimensions réelles
    const tmp = document.createElement("canvas");
    tmp.width  = merge.width;
    tmp.height = merge.height;
    tmp.getContext("2d")!.drawImage(canvas, 0, 0, merge.width, merge.height);
    ctx.drawImage(tmp, 0, 0);

    onSave(merge.toDataURL("image/jpeg", 0.92));
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      backgroundColor: "#0F0F10",
      display: "flex", flexDirection: "column",
    }}>

      {/* ── Barre supérieure ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", backgroundColor: "#1A1A1C", flexShrink: 0,
      }}>
        <span style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>Annoter la photo</span>
        <button onClick={onClose} style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 32, height: 32, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.1)",
        }}>
          <X size={18} color="#fff" />
        </button>
      </div>

      {/* ── Image + canvas ── */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", minHeight: 0 }}>
        <img
          ref={imgRef}
          src={imageUrl}
          alt="annotation"
          onLoad={() => setImgLoaded(true)}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "contain", userSelect: "none", pointerEvents: "none",
          }}
        />
        {imgLoaded && (
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            style={{
              position: "absolute", inset: 0, width: "100%", height: "100%",
              cursor: tool === "text" ? "text" : "crosshair",
              touchAction: "none",
            }}
            onMouseDown={onStart}
            onMouseMove={onMove}
            onMouseUp={onEnd}
            onMouseLeave={onEnd}
            onTouchStart={onStart}
            onTouchMove={onMove}
            onTouchEnd={onEnd}
          />
        )}
      </div>

      {/* ── Outils ── */}
      <div style={{
        backgroundColor: "#1A1A1C", padding: "10px 12px",
        display: "flex", flexDirection: "column", gap: 10, flexShrink: 0,
      }}>

        {/* Sélecteur d'outils */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          {TOOLS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTool(t.id)}
              title={t.label}
              style={{
                flex: 1, padding: "8px 4px", borderRadius: 10, border: "none",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                backgroundColor: tool === t.id ? "#E3000F" : "rgba(255,255,255,0.1)",
                color: "#fff", cursor: "pointer", fontSize: 9, fontWeight: 700,
              }}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Couleurs */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center" }}>
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: color === c ? 30 : 24, height: color === c ? 30 : 24,
                borderRadius: "50%", border: color === c ? "3px solid #fff" : "2px solid rgba(255,255,255,0.2)",
                backgroundColor: c, cursor: "pointer", flexShrink: 0,
                transition: "all 0.15s",
              }}
            />
          ))}
          <div style={{ width: 1, height: 20, backgroundColor: "rgba(255,255,255,0.2)" }} />
          {/* Épaisseur */}
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              style={{
                width: 28, height: 28, borderRadius: "50%", border: "none",
                backgroundColor: size === s ? "rgba(255,255,255,0.25)" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <div style={{
                width: s * 2.5, height: s * 2.5, borderRadius: "50%",
                backgroundColor: color,
              }} />
            </button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={undo} style={{
            width: 40, height: 40, borderRadius: 10, border: "none",
            backgroundColor: "rgba(255,255,255,0.1)", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: annotations.length === 0 ? "not-allowed" : "pointer",
            opacity: annotations.length === 0 ? 0.4 : 1,
          }}>
            <RotateCcw size={16} />
          </button>
          <button onClick={clear} style={{
            width: 40, height: 40, borderRadius: 10, border: "none",
            backgroundColor: "rgba(227,0,15,0.2)", color: "#E3000F",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}>
            <Trash2 size={16} />
          </button>
          <button onClick={handleSave} style={{
            flex: 1, height: 40, borderRadius: 100, border: "none",
            backgroundColor: "#E3000F", color: "#fff",
            fontSize: 14, fontWeight: 700, cursor: "pointer",
          }}>
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
};
