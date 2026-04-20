// src/components/shared/ImageAnnotator.tsx
import { useRef } from "react";
import { X } from "lucide-react";

interface ImageAnnotatorProps {
  imageUrl: string;
  onSave:   (annotatedUrl: string) => void;
  onClose:  () => void;
}

export const ImageAnnotator = ({ imageUrl, onSave, onClose }: ImageAnnotatorProps) => {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const isDrawing  = useRef(false);

  const getPos = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top)  * scaleY,
    };
  };

  const startDraw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawing.current = true;
    const ctx = canvas.getContext("2d")!;
    ctx.strokeStyle = "#E3000F";
    ctx.lineWidth   = 4 * (canvas.width / canvas.getBoundingClientRect().width);
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    ctx.beginPath();
    const { x, y } = getPos(e, canvas);
    ctx.moveTo(x, y);
    e.preventDefault();
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx      = canvas.getContext("2d")!;
    const { x, y } = getPos(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
    e.preventDefault();
  };

  const stopDraw = () => { isDrawing.current = false; };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d")!.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img    = new Image();
    img.crossOrigin = "anonymous";
    img.onload   = () => {
      const merge   = document.createElement("canvas");
      merge.width   = img.naturalWidth;
      merge.height  = img.naturalHeight;
      const ctx     = merge.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      // Redimensionne le canvas d'annotation aux dimensions réelles de l'image
      ctx.drawImage(canvas, 0, 0, merge.width, merge.height);
      onSave(merge.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = () => {
      // Fallback si l'image ne charge pas via crossOrigin
      onSave(imageUrl);
    };
    img.src = imageUrl;
  };

  return (
    <div style={{
      position:        "fixed",
      inset:           0,
      zIndex:          999,
      backgroundColor: "rgba(0,0,0,0.92)",
      display:         "flex",
      flexDirection:   "column",
      alignItems:      "center",
      justifyContent:  "center",
      gap:             16,
      padding:         20,
    }}>

      {/* Header */}
      <div style={{
        width:          "100%",
        maxWidth:       360,
        display:        "flex",
        justifyContent: "space-between",
        alignItems:     "center",
      }}>
        <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>
          Annoter la photo
        </span>
        <button onClick={onClose} style={{
          background: "none", border: "none",
          cursor: "pointer", padding: 4,
          display: "flex", alignItems: "center",
        }}>
          <X size={24} color="#fff" />
        </button>
      </div>

      {/* Image + canvas superposés */}
      <div style={{
        position:  "relative",
        width:     "100%",
        maxWidth:  360,
        borderRadius: 12,
        overflow:  "hidden",
      }}>
        {/* Image de fond */}
        <img
          src={imageUrl}
          alt="annotation"
          style={{
            width:       "100%",
            display:     "block",
            borderRadius: 12,
            userSelect:  "none",
            pointerEvents: "none",
          }}
        />

        {/* Canvas de dessin superposé */}
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          style={{
            position:     "absolute",
            inset:        0,
            width:        "100%",
            height:       "100%",
            borderRadius: 12,
            cursor:       "crosshair",
            touchAction:  "none",
          }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      </div>

      {/* Aide */}
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
        Dessinez sur la photo avec votre doigt ou la souris
      </p>

      {/* Actions */}
      <div style={{
        display:  "flex",
        gap:      12,
        width:    "100%",
        maxWidth: 360,
      }}>
        <button onClick={clearCanvas} style={{
          flex:            1,
          backgroundColor: "rgba(255,255,255,0.15)",
          color:           "#fff",
          border:          "none",
          borderRadius:    100,
          padding:         "13px 16px",
          fontSize:        14,
          fontWeight:      600,
          cursor:          "pointer",
        }}>
          Effacer
        </button>
        <button onClick={handleSave} style={{
          flex:            2,
          backgroundColor: "#E3000F",
          color:           "#fff",
          border:          "none",
          borderRadius:    100,
          padding:         "13px 16px",
          fontSize:        14,
          fontWeight:      700,
          cursor:          "pointer",
        }}>
          Sauvegarder
        </button>
      </div>
    </div>
  );
};