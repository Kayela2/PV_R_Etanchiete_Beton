// src/screens/pv/PvReservesScreen.tsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Home, ChevronRight, X } from "lucide-react";
import { usePvStore } from "../../store";
import type { Reserve } from "../../types";

type Selected = { reserve: Reserve; index: number } | null;

const PvReservesScreen = () => {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const { pvList } = usePvStore();
  const pv         = pvList.find((p) => p.id === id);

  const [selected, setSelected] = useState<Selected>(null);

  if (!pv) return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      height: "100%", gap: 16, padding: 40,
    }}>
      <p style={{ fontSize: 15, color: "#6B7280" }}>PV introuvable.</p>
      <button onClick={() => navigate("/")} style={{
        backgroundColor: "#E3000F", color: "#fff", border: "none",
        borderRadius: 100, padding: "12px 24px",
        fontSize: 14, fontWeight: 700, cursor: "pointer",
      }}>
        Retour à l'accueil
      </button>
    </div>
  );

  const reserves = pv.step1?.reserves ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", backgroundColor: "#F3F4F6", position: "relative", overflow: "hidden" }}>

      {/* ── Header ── */}
      <div style={{
        backgroundColor: "#fff", padding: "24px 20px 16px",
        borderBottom: "1px solid #E5E7EB",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <button
          onClick={() => navigate(`/pv/${id}`)}
          style={{
            width: 36, height: 36, borderRadius: "50%",
            backgroundColor: "#F3F4F6", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}
        >
          <ArrowLeft size={18} color="#111827" />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, marginBottom: 2 }}>
            Réserves
          </p>
          <p style={{
            fontSize: 13, fontWeight: 900, color: "#111827",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {pv.step1?.chantier || pv.id}
          </p>
        </div>
        <div style={{
          backgroundColor: "#E3000F", borderRadius: 100,
          padding: "4px 10px",
          fontSize: 11, fontWeight: 700, color: "#fff", whiteSpace: "nowrap",
        }}>
          {reserves.length} / 8
        </div>
      </div>

      {/* ── Liste ── */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>

        {reserves.length === 0 && (
          <div style={{
            backgroundColor: "#fff", borderRadius: 16, border: "1px solid #E5E7EB",
            padding: "32px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          }}>
            <p style={{ fontSize: 14, color: "#9CA3AF", textAlign: "center" }}>
              Aucune réserve enregistrée pour ce PV.
            </p>
          </div>
        )}

        {reserves.map((r, i) => {
          const mainPhotos = r.photos.filter(p => p.caption !== "__locPhoto");
          return (
            <div
              key={r.id}
              onClick={() => setSelected({ reserve: r, index: i })}
              style={{
                backgroundColor: "#fff", borderRadius: 14,
                border: "1px solid #E5E7EB",
                padding: "12px 14px",
                display: "flex", alignItems: "center", gap: 12,
                cursor: "pointer",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              {/* Badge numéro */}
              <div style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                backgroundColor: "#FDECEA",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontSize: 13, fontWeight: 900, color: "#E3000F" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Texte */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 14, fontWeight: 700, color: "#111827",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  marginBottom: 2,
                }}>
                  {r.localisation || "Sans localisation"}
                </p>
                <p style={{
                  fontSize: 12, color: "#6B7280", lineHeight: 1.4,
                  display: "-webkit-box", WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical" as const, overflow: "hidden",
                }}>
                  {r.detail}
                </p>
              </div>

              {/* Miniature + compteur + flèche */}
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                {mainPhotos[0] && (
                  <img src={mainPhotos[0].url} alt=""
                    style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", border: "1px solid #E5E7EB" }} />
                )}
                {mainPhotos.length > 1 && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280" }}>
                    +{mainPhotos.length - 1}
                  </span>
                )}
                <ChevronRight size={16} color="#9CA3AF" />
              </div>
            </div>
          );
        })}

        <div style={{ height: 20 }} />
      </div>

      {/* ── Bottom nav ── */}
      <div style={{
        backgroundColor: "#fff", borderTop: "1px solid #E5E7EB",
        padding: "10px 24px 16px",
        display: "flex", justifyContent: "center", alignItems: "center",
      }}>
        <button onClick={() => navigate("/")} style={{
          background: "none", border: "none", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        }}>
          <Home size={20} color="#E3000F" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#E3000F", letterSpacing: "0.08em" }}>
            ACCUEIL PSA
          </span>
        </button>
      </div>

      {/* ── Modal détail réserve ── */}
      {selected && (
        <ReserveModal
          reserve={selected.reserve}
          index={selected.index}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
};

/* ── Modal bottom-sheet ── */
const ReserveModal = ({
  reserve, index, onClose,
}: {
  reserve: Reserve;
  index:   number;
  onClose: () => void;
}) => {
  const mainPhotos = reserve.photos.filter(p => p.caption !== "__locPhoto");
  const locPhoto   = reserve.photos.find(p => p.caption === "__locPhoto");

  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 200,
      display: "flex", flexDirection: "column", justifyContent: "flex-end",
    }}>
      {/* Fond sombre */}
      <div onClick={onClose} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)" }} />

      {/* Feuille */}
      <div style={{
        position: "relative", backgroundColor: "#fff",
        borderRadius: "20px 20px 0 0",
        maxHeight: "82vh", display: "flex", flexDirection: "column",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.15)",
      }}>
        {/* Poignée */}
        <div style={{ display: "flex", justifyContent: "center", padding: "10px 0 4px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "#E5E7EB" }} />
        </div>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 20px 14px", borderBottom: "1px solid #F3F4F6",
        }}>
          <div>
            <p style={{
              fontSize: 10, fontWeight: 700, color: "#E3000F",
              textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2,
            }}>
              Réserve #{String(index + 1).padStart(2, "0")}
            </p>
            <p style={{ fontSize: 17, fontWeight: 900, color: "#111827" }}>
              {reserve.localisation || "Sans localisation"}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              backgroundColor: "#F3F4F6", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={16} color="#6B7280" />
          </button>
        </div>

        {/* Contenu scrollable */}
        <div style={{ overflowY: "auto", padding: "16px 20px 40px", display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Détail */}
          <div>
            <p style={{
              fontSize: 10, fontWeight: 700, color: "#6B7280",
              textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8,
            }}>
              Détail &amp; actions à mener
            </p>
            <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7 }}>
              {reserve.detail}
            </p>
          </div>

          {/* Photos principales */}
          {mainPhotos.length > 0 && (
            <div>
              <p style={{
                fontSize: 10, fontWeight: 700, color: "#6B7280",
                textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8,
              }}>
                Photos ({mainPhotos.length})
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {mainPhotos.map((ph) => (
                  <img key={ph.id} src={ph.url} alt="photo réserve"
                    style={{ width: 100, height: 100, borderRadius: 12, objectFit: "cover", border: "1px solid #E5E7EB" }} />
                ))}
              </div>
            </div>
          )}

          {/* Plan de localisation */}
          {locPhoto && (
            <div>
              <p style={{
                fontSize: 10, fontWeight: 700, color: "#6B7280",
                textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8,
              }}>
                Plan de localisation
              </p>
              <img src={locPhoto.url} alt="localisation"
                style={{ width: "100%", height: 190, borderRadius: 14, objectFit: "cover", border: "1px solid #E5E7EB", display: "block" }} />
            </div>
          )}

          {mainPhotos.length === 0 && !locPhoto && (
            <p style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", fontStyle: "italic" }}>
              Aucune photo jointe
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PvReservesScreen;
