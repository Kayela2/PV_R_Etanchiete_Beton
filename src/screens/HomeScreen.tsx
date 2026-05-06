// src/screens/HomeScreen.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, User, Home, FileText } from "lucide-react";
import { usePvStore } from "../store";
import { PvCard } from "../components/shared";
import smacLogo from "../assets/SmacLogo.png";
import { generatePvPdf } from "../utils/generatePvPdf";

const HomeScreen = () => {
  const navigate   = useNavigate();
  const { pvList } = usePvStore();
  const [search, setSearch] = useState("");

  const filtered = pvList.filter((pv) =>
    (pv.step1?.chantier ?? "").toLowerCase().includes(search.toLowerCase()) ||
    pv.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100%",
      backgroundColor: "#F3F4F6",
      position: "relative",
    }}>

      {/* Header */}
      <div style={{
        backgroundColor: "#fff",
        padding: "24px 20px 16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo SMAC */}
          <img
            src={smacLogo}
            alt="SMAC"
            style={{ height: 30, width: "auto", objectFit: "contain" }}
          />

          {/* Titre centré */}
          <div style={{ textAlign: "center", flex: 1, padding: "0 8px" }}>
            <p style={{
              color: "#E3000F", fontWeight: 800, fontSize: 16,
              lineHeight: 1.0, textTransform: "uppercase", letterSpacing: "0.02em",
              margin: 0,
            }}>
              P.V DE RÉCEPTION SUPPORT
            </p>
            <p style={{
              color: "#E3000F", fontWeight: 800, fontSize: 16,
              lineHeight: 1.0, textTransform: "uppercase", letterSpacing: "0.02em",
              margin: 0,
            }}>
               BÉTON - ÉTANCHÉITÉ
            </p>
          </div>

          {/* Avatar */}
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            backgroundColor: "#111827",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <User size={18} color="#fff" />
          </div>
        </div>
      </div>

      {/* Contenu — état vide OU liste */}
      {pvList.length === 0 ? (
        /* ── État vide : centré, sans scroll ── */
        <EmptyState onAdd={() => navigate("/pv-form")} />
      ) : (
        /* ── Liste scrollable ── */
        <>
          <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: "16px 16px 80px" }}>
            <div style={{ position: "relative", marginBottom: 16 }}>
              <Search size={15} color="#6B7280" style={{
                position: "absolute", left: 12,
                top: "50%", transform: "translateY(-50%)",
                pointerEvents: "none",
              }} />
              <input
                type="text"
                placeholder="Rechercher un PV ou un chantier..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%", backgroundColor: "#fff",
                  borderRadius: 12, padding: "12px 16px 12px 38px",
                  fontSize: 14, color: "#111827",
                  border: "1px solid #E5E7EB", outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{
              display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 14,
            }}>
              <h2 style={{ fontSize: 22, fontWeight: 900, color: "#111827" }}>Liste des PV</h2>
              <span style={{ fontSize: 13, color: "#6B7280" }}>
                {filtered.length} rapport{filtered.length > 1 ? "s" : ""}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.map((pv) => (
                <PvCard
                  key={pv.id}
                  pv={pv}
                  onClick={() => navigate("/pv/" + pv.id)}
                  onPdfClick={() => void generatePvPdf(pv)}
                />
              ))}
              {filtered.length === 0 && (
                <p style={{ textAlign: "center", color: "#9CA3AF", fontSize: 14, padding: "32px 0" }}>
                  Aucun résultat pour « {search} »
                </p>
              )}
            </div>
          </div>

          {/* FAB */}
          <button onClick={() => navigate("/pv-form")} style={{
            position: "absolute", bottom: 72, right: 20,
            width: 56, height: 56, borderRadius: "50%",
            backgroundColor: "#E3000F", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(227,0,15,0.4)", zIndex: 10,
          }}>
            <Plus size={26} color="#fff" />
          </button>
        </>
      )}

      {/* Bottom nav */}
      <div style={{
        backgroundColor: "#fff", borderTop: "1px solid #E5E7EB",
        padding: "10px 24px 16px", flexShrink: 0,
        display: "flex", justifyContent: "center", alignItems: "center",
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <Home size={20} color="#E3000F" />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#E3000F", letterSpacing: "0.06em" }}>
            ACCUEIL PSA
          </span>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
  <div style={{
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    overflow: "hidden", gap: 28, padding: "0 32px",
  }}>
    <div style={{ position: "relative" }}>
      <div style={{
        width: 160, height: 176, backgroundColor: "#fff", borderRadius: 24,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)", border: "1px solid #E5E7EB",
      }}>
        <div style={{
          width: 68, height: 84, backgroundColor: "#F3F4F6", borderRadius: 14,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            border: "2px solid #E3000F",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Plus size={18} color="#E3000F" />
          </div>
        </div>
      </div>
      <div style={{
        position: "absolute", top: -12, right: -12,
        width: 40, height: 40, backgroundColor: "#fff", borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <FileText size={20} color="#3B82F6" />
      </div>
    </div>
    <div style={{ textAlign: "center" }}>
      <h2 style={{ fontSize: 20, fontWeight: 900, color: "#111827", marginBottom: 10 }}>
        Aucun PV trouvé.
      </h2>
      <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7 }}>
        Commencez votre première inspection dès maintenant pour générer votre premier procès-verbal.
      </p>
    </div>
    <button onClick={onAdd} style={{
      width: 56, height: 56, borderRadius: "50%",
      backgroundColor: "#E3000F", border: "none", cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 4px 16px rgba(227,0,15,0.4)",
    }}>
      <Plus size={26} color="#fff" />
    </button>
  </div>
);

export default HomeScreen;