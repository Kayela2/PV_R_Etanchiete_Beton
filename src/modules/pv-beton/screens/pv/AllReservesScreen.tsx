// src/modules/pv-beton/screens/pv/AllReservesScreen.tsx
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, Plus } from "lucide-react";
import { usePvFormStore } from "../../store";
import type { Reserve } from "../../types";

const MAX_RESERVES = 8;

const AllReservesScreen = () => {
  const navigate = useNavigate();
  const { formData, removeReserve } = usePvFormStore();
  const reserves = formData.step1.reserves ?? [];

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      minHeight: "100%", backgroundColor: "#fff",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "24px 20px 16px", borderBottom: "1px solid #E5E7EB",
        flexShrink: 0,
      }}>
        <button
          onClick={() => navigate("/apps/pv-beton/form")}
          style={{
            width: 36, height: 36, borderRadius: "50%", backgroundColor: "#F3F4F6",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <ArrowLeft size={18} color="#E3000F" />
        </button>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827", flex: 1 }}>
          Toutes les réserves
        </h2>
        <span style={{
          fontSize: 13, fontWeight: 700,
          color: reserves.length >= MAX_RESERVES ? "#E3000F" : "#6B7280",
        }}>
          {String(reserves.length).padStart(2, "0")} / {String(MAX_RESERVES).padStart(2, "0")}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "16px 20px" }}>
        {reserves.length === 0 ? (
          <p style={{ textAlign: "center", color: "#9CA3AF", fontSize: 14, padding: "40px 0" }}>
            Aucune réserve ajoutée.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {reserves.map((reserve, index) => (
              <ReserveCard
                key={reserve.id}
                reserve={reserve}
                index={index + 1}
                onEdit={() => navigate("/apps/pv-beton/form/reserve/" + reserve.id)}
                onDelete={() => removeReserve(reserve.id)}
              />
            ))}
          </div>
        )}

        {reserves.length < MAX_RESERVES && (
          <button
            onClick={() => navigate("/apps/pv-beton/form/reserve")}
            style={{
              width: "100%", marginTop: 16,
              border: "2px dashed #E3000F", borderRadius: 16,
              padding: "18px 16px", background: "none", cursor: "pointer",
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 8,
              boxSizing: "border-box",
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              border: "1.5px solid #E3000F",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Plus size={18} color="#E3000F" />
            </div>
            <span style={{
              fontSize: 13, fontWeight: 700, color: "#E3000F",
              textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              Ajouter une réserve
            </span>
          </button>
        )}

        {reserves.length >= MAX_RESERVES && (
          <p style={{
            fontSize: 12, color: "#E3000F", fontWeight: 600,
            textAlign: "center", marginTop: 12,
          }}>
            Limite de {MAX_RESERVES} réserves atteinte
          </p>
        )}

        <div style={{ height: 32 }} />
      </div>
    </div>
  );
};

const ReserveCard = ({
  reserve, index, onEdit, onDelete,
}: {
  reserve: Reserve;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <div
    onClick={onEdit}
    style={{
      backgroundColor: "#fff", borderRadius: 16,
      border: "1px solid #E5E7EB", borderLeft: "4px solid #E3000F",
      padding: 16, cursor: "pointer",
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
      <div style={{ flex: 1 }}>
        <p style={{
          fontSize: 11, fontWeight: 700, color: "#E3000F",
          textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2,
        }}>
          Réserve #{String(index).padStart(2, "0")}
        </p>
        <p style={{ fontSize: 14, fontWeight: 900, color: "#111827", marginBottom: 2 }}>
          {reserve.localisation || "Sans localisation"}
        </p>
        <p style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.5 }}>{reserve.detail}</p>
      </div>
      <div style={{ display: "flex", gap: 8, marginLeft: 12, flexShrink: 0 }}>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          style={{
            width: 32, height: 32, borderRadius: 8, backgroundColor: "#F3F4F6",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Pencil size={14} color="#6B7280" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{
            width: 32, height: 32, borderRadius: 8, backgroundColor: "#FDECEA",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Trash2 size={14} color="#E3000F" />
        </button>
      </div>
    </div>
    {reserve.photos.length > 0 && (
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {reserve.photos.slice(0, 3).map((photo) => (
          <img
            key={photo.id}
            src={photo.url}
            alt={photo.caption}
            style={{ width: 60, height: 60, borderRadius: 8, objectFit: "cover", border: "1px solid #E5E7EB" }}
          />
        ))}
        {reserve.photos.length > 3 && (
          <div style={{
            width: 60, height: 60, borderRadius: 8,
            backgroundColor: "#F3F4F6", border: "1px solid #E5E7EB",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280" }}>
              +{reserve.photos.length - 3}
            </span>
          </div>
        )}
      </div>
    )}
  </div>
);

export default AllReservesScreen;
