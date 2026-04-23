// src/screens/pv/ReserveFormScreen.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Camera, Trash2, ArrowLeft, Plus, Pencil, Home, Loader2 } from "lucide-react";
import { usePvFormStore } from "../../store";
import { usePhotoCapture } from "../../hooks";
import type { Reserve, ReservePhoto } from "../../types";
import { ImageAnnotator } from "../../components/shared";

const MAX_PHOTOS = 8;

const ReserveFormScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { formData, addReserve, updateReserve } = usePvFormStore();
  const { importFromGallery, loading: loadingPhotos } = usePhotoCapture();

  const reserves = formData.step1.reserves ?? [];
  const existing = id ? reserves.find((r) => r.id === id) : undefined;
  const isEdit   = !!existing;

  const [localisation,       setLocalisation]       = useState(existing?.localisation ?? "");
  const [detail,             setDetail]             = useState(existing?.detail       ?? "");
  const [photos,             setPhotos]             = useState<ReservePhoto[]>(
    existing?.photos.filter(p => p.caption !== "__locPhoto") ?? []
  );
  const [locPhoto,           setLocPhoto]           = useState<ReservePhoto | null>(
    existing?.photos.find(p => p.caption === "__locPhoto") ?? null
  );
  const [errors,             setErrors]             = useState<{ detail?: string }>({});
  const [saving,             setSaving]             = useState(false);
  const [annotatingPhoto,    setAnnotatingPhoto]    = useState<ReservePhoto | null>(null);
  const [annotatingLocPhoto, setAnnotatingLocPhoto] = useState(false);

  useEffect(() => {
    const target = id ? reserves.find((r) => r.id === id) : undefined;
    setLocalisation(target?.localisation ?? "");
    setDetail(target?.detail ?? "");
    setPhotos(target?.photos.filter(p => p.caption !== "__locPhoto") ?? []);
    setLocPhoto(target?.photos.find(p => p.caption === "__locPhoto") ?? null);
    setErrors({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Handlers photo ────────────────────────────────────────────────────────
  const handleAddPhotos = async () => {
    const newPhotos = await importFromGallery(true);
    if (newPhotos.length > 0)
      setPhotos(prev => [...prev, ...newPhotos].slice(0, MAX_PHOTOS));
  };

  const handleAddLocPhoto = async () => {
    const result = await importFromGallery(false);
    if (result[0]) setLocPhoto({ ...result[0], caption: "__locPhoto" });
  };

  const handleReplacePhotoById = (targetId: string) => async () => {
    const result = await importFromGallery(false);
    if (result[0])
      setPhotos(prev => prev.map(p => p.id === targetId ? { ...result[0], id: p.id } : p));
  };

  const handleReplaceLocPhoto = async () => {
    const result = await importFromGallery(false);
    if (result[0]) setLocPhoto({ ...result[0], caption: "__locPhoto" });
  };

  // ── Annotation ────────────────────────────────────────────────────────────
  const handleAnnotationSave = (annotated: string) => {
    if (!annotatingPhoto) return;
    setPhotos(prev => prev.map(p => p.id === annotatingPhoto.id ? { ...p, url: annotated } : p));
    setAnnotatingPhoto(null);
  };

  const handleLocPhotoAnnotationSave = (annotated: string) => {
    if (!locPhoto) return;
    setLocPhoto({ ...locPhoto, url: annotated });
    setAnnotatingLocPhoto(false);
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const e: { detail?: string } = {};
    if (!detail.trim()) e.detail = "Le détail de la réserve est requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Construction de la réserve ────────────────────────────────────────────
  const buildReserve = (): Reserve => ({
    id:          existing?.id ?? crypto.randomUUID(),
    localisation,
    detail,
    photos:      locPhoto ? [...photos, locPhoto] : photos,
    createdAt:   existing?.createdAt ?? new Date().toISOString(),
  });

  // ── Sauvegarde ────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!validate()) return;
    setSaving(true);
    const reserve = buildReserve();
    if (isEdit) updateReserve(reserve);
    else        addReserve(reserve);
    setTimeout(() => navigate("/pv-form", { replace: true }), 300);
  };

  const resetForm = () => {
    setLocalisation(""); setDetail(""); setPhotos([]); setLocPhoto(null); setErrors({});
  };

  const handleSaveAndAddAnother = () => {
    if (!validate()) return;
    addReserve(buildReserve());
    resetForm();
  };

  const canAddMore = !isEdit;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", backgroundColor:"#fff", position:"relative" }}>

      {/* ── Annotateurs ── */}
      {annotatingPhoto && (
        <ImageAnnotator
          imageUrl={annotatingPhoto.url}
          onSave={handleAnnotationSave}
          onClose={() => setAnnotatingPhoto(null)}
        />
      )}
      {annotatingLocPhoto && locPhoto && (
        <ImageAnnotator
          imageUrl={locPhoto.url}
          onSave={handleLocPhotoAnnotationSave}
          onClose={() => setAnnotatingLocPhoto(false)}
        />
      )}

      {/* ── Header ── */}
      {(() => {
        const reserveNum = isEdit
          ? (reserves.findIndex((r) => r.id === id) + 1) || 1
          : reserves.length + 1;
        return (
          <div style={{
            display:"flex", alignItems:"center", gap:12,
            padding:"24px 20px 16px", borderBottom:"1px solid #E5E7EB",
            flexShrink: 0,
          }}>
            <button onClick={() => navigate(-1)} style={{
              width:36, height:36, borderRadius:"50%", backgroundColor:"#F3F4F6",
              border:"none", cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <ArrowLeft size={18} color="#E3000F" />
            </button>
            <div>
              <p style={{ fontSize:11, color:"#6B7280", fontWeight:600, marginBottom:1 }}>
                {isEdit ? "Modification" : "Création"}
              </p>
              <h2 style={{ fontSize:16, fontWeight:900, color:"#111827" }}>
                Réserve {reserveNum}
              </h2>
            </div>
          </div>
        );
      })()}

      <div style={{ flex:1, overflowY:"auto", padding:"20px 20px 0", minHeight:0 }}>

        <h3 style={{ fontSize:22, fontWeight:900, color:"#111827", marginBottom:8 }}>
          Réserves à ajouter
        </h3>
        <p style={{ fontSize:13, color:"#6B7280", lineHeight:1.6, marginBottom:20 }}>
          Veuillez ajouter vos réserves ici. Chaque réserve est accompagnée
          d&apos;une localisation précise et d&apos;une preuve photographique.
        </p>

        {/* ── Photos principales ── */}
        <div style={{ marginBottom:20 }}>
          <div style={{
            display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10,
          }}>
            <span style={{
              fontSize:11, fontWeight:700, textTransform:"uppercase",
              letterSpacing:"0.08em", color:"#6B7280",
            }}>
              Photos de la réserve
            </span>
            <span style={{
              fontSize:11, fontWeight:700,
              color: photos.length >= MAX_PHOTOS ? "#E3000F" : "#6B7280",
            }}>
              {photos.length} / {MAX_PHOTOS}
            </span>
          </div>

          {/* Indicateur de chargement */}
          {loadingPhotos && (
            <div style={{
              display:"flex", alignItems:"center", justifyContent:"center", gap:10,
              padding:"14px 16px", marginBottom:12,
              backgroundColor:"#F3F4F6", borderRadius:100,
              fontSize:14, fontWeight:700, color:"#6B7280",
            }}>
              <div style={{
                width:18, height:18, borderRadius:"50%",
                border:"3px solid #E5E7EB", borderTopColor:"#E3000F",
                animation:"spin 0.8s linear infinite",
              }} />
              Chargement de la photo…
            </div>
          )}

          {/* Bouton unique — 0 photo */}
          {photos.length === 0 && !loadingPhotos && (
            <button
              onClick={handleAddPhotos}
              style={{
                width:"100%", marginBottom:12,
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                backgroundColor:"#E3000F", color:"#fff",
                borderRadius:100, padding:"14px 16px",
                fontSize:14, fontWeight:700, border:"none", cursor:"pointer",
              }}
            >
              <Camera size={18} />
              Prendre / importer une photo
            </button>
          )}

          {/* Grille photos */}
          {photos.length > 0 && (
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {photos.map((photo) => (
                <div key={photo.id} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    onClick={() => setAnnotatingPhoto(photo)}
                    style={{
                      width:96, height:96, borderRadius:12,
                      objectFit:"cover", border:"1px solid #E5E7EB", display:"block",
                      cursor:"pointer",
                    }}
                  />
                  <div style={{ display:"flex", gap:4 }}>
                    {/* Annoter */}
                    <button
                      onClick={() => setAnnotatingPhoto(photo)}
                      title="Annoter"
                      style={{
                        width:28, height:28, borderRadius:6, backgroundColor:"#F3F4F6",
                        border:"none", cursor:"pointer",
                        display:"flex", alignItems:"center", justifyContent:"center",
                      }}
                    >
                      <Pencil size={12} color="#6B7280" />
                    </button>
                    {/* Remplacer */}
                    <button
                      onClick={handleReplacePhotoById(photo.id)}
                      title="Changer l'image"
                      style={{
                        width:28, height:28, borderRadius:6, backgroundColor:"#F3F4F6",
                        border:"none", cursor:"pointer",
                        display:"flex", alignItems:"center", justifyContent:"center",
                      }}
                    >
                      <Camera size={12} color="#6B7280" />
                    </button>
                    {/* Supprimer */}
                    <button
                      onClick={() => setPhotos(prev => prev.filter(p => p.id !== photo.id))}
                      title="Supprimer"
                      style={{
                        width:28, height:28, borderRadius:6, backgroundColor:"#FDECEA",
                        border:"none", cursor:"pointer",
                        display:"flex", alignItems:"center", justifyContent:"center",
                      }}
                    >
                      <Trash2 size={12} color="#E3000F" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Bouton ajouter d'autres photos */}
              {photos.length < MAX_PHOTOS && (
                <button
                  onClick={handleAddPhotos}
                  style={{
                    width:96, height:96, borderRadius:12,
                    border:"2px dashed #E5E7EB", backgroundColor:"#F3F4F6",
                    display:"flex", flexDirection:"column",
                    alignItems:"center", justifyContent:"center", gap:4,
                    cursor:"pointer",
                  }}
                >
                  <Plus size={20} color="#6B7280" />
                  <span style={{ fontSize:10, fontWeight:700, color:"#6B7280", textTransform:"uppercase" }}>
                    AJOUTER
                  </span>
                </button>
              )}
            </div>
          )}

          {photos.length >= MAX_PHOTOS && (
            <p style={{
              fontSize:11, color:"#E3000F", fontWeight:600,
              textAlign:"center", marginTop:8,
            }}>
              Limite de {MAX_PHOTOS} photos atteinte
            </p>
          )}
        </div>

        {/* ── Localisation ── */}
        <div style={{ marginBottom:16 }}>
          <label style={{
            fontSize:11, fontWeight:700, textTransform:"uppercase",
            letterSpacing:"0.08em", color:"#6B7280", display:"block", marginBottom:6,
          }}>
            Localisation
          </label>
          <input
            type="text"
            placeholder="Ex: Entrée principale"
            value={localisation}
            onChange={(e) => setLocalisation(e.target.value)}
            style={{
              width:"100%", backgroundColor:"#F3F4F6",
              border:"1.5px solid transparent", borderRadius:12,
              padding:"12px 16px", fontSize:14, color:"#111827",
              outline:"none", fontFamily:"inherit", boxSizing:"border-box",
            }}
          />
        </div>

        {/* ── Photo de localisation ── */}
        <div style={{ marginBottom:16 }}>
          {locPhoto ? (
            <div style={{ position:"relative" }}>
              <img src={locPhoto.url} alt="localisation" style={{
                width:"100%", height:160, borderRadius:16,
                objectFit:"cover", border:"1px solid #E5E7EB", display:"block",
              }} />
              <div style={{ position:"absolute", top:8, right:8, display:"flex", gap:6 }}>
                <button
                  onClick={() => setAnnotatingLocPhoto(true)}
                  title="Annoter"
                  style={{
                    width:32, height:32, borderRadius:8,
                    backgroundColor:"rgba(255,255,255,0.9)",
                    border:"none", cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    boxShadow:"0 1px 4px rgba(0,0,0,0.15)",
                  }}
                >
                  <Pencil size={14} color="#E3000F" />
                </button>
                <button
                  onClick={handleReplaceLocPhoto}
                  title="Changer l'image"
                  style={{
                    width:32, height:32, borderRadius:8,
                    backgroundColor:"rgba(255,255,255,0.9)",
                    border:"none", cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    boxShadow:"0 1px 4px rgba(0,0,0,0.15)",
                  }}
                >
                  <Camera size={14} color="#111827" />
                </button>
                <button
                  onClick={() => setLocPhoto(null)}
                  title="Supprimer"
                  style={{
                    width:32, height:32, borderRadius:8,
                    backgroundColor:"rgba(255,255,255,0.9)",
                    border:"none", cursor:"pointer",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    boxShadow:"0 1px 4px rgba(0,0,0,0.15)",
                  }}
                >
                  <Trash2 size={14} color="#E3000F" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleAddLocPhoto}
              style={{
                width:"100%", height:100, borderRadius:16,
                border:"2px dashed #E5E7EB", backgroundColor:"#F3F4F6",
                display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center", gap:6,
                cursor:"pointer",
              }}
            >
              <Camera size={24} color="#E3000F" />
              <span style={{
                fontSize:11, fontWeight:700, color:"#E3000F",
                textTransform:"uppercase", letterSpacing:"0.08em",
              }}>
                Ajouter une image de localisation
              </span>
            </button>
          )}
        </div>

        {/* ── Détail ── */}
        <div style={{ marginBottom:20 }}>
          <label style={{
            fontSize:11, fontWeight:700, textTransform:"uppercase",
            letterSpacing:"0.08em", color:"#6B7280", display:"block", marginBottom:6,
          }}>
            Détail de la réserve et actions à mener *
          </label>
          <textarea
            placeholder="Détail technique..."
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            rows={4}
            style={{
              width:"100%", backgroundColor:"#F3F4F6",
              border: errors.detail ? "1.5px solid #E3000F" : "1.5px solid transparent",
              borderRadius:12, padding:"12px 16px", fontSize:14, color:"#111827",
              outline:"none", fontFamily:"inherit", resize:"none",
              boxSizing:"border-box",
            }}
          />
          {errors.detail && (
            <p style={{
              fontSize:13, color:"#fff", fontWeight:700, marginTop:6,
              backgroundColor:"#E3000F", borderRadius:8, padding:"8px 12px",
            }}>
              ⚠ {errors.detail}
            </p>
          )}
        </div>

        {/* ── Bouton "Voir toutes les réserves" ── */}
        {reserves.length > 0 && (
          <button
            onClick={() => navigate("/pv-form/reserves")}
            style={{
              width:"100%", marginBottom:4,
              border:"1.5px solid #E3000F", borderRadius:14,
              padding:"13px 16px", background:"#fff", cursor:"pointer",
              fontSize:14, fontWeight:700, color:"#E3000F",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              boxSizing:"border-box",
            }}
          >
            Voir toutes les réserves ({reserves.length})
          </button>
        )}

        <div style={{ height:16 }} />
      </div>

      {/* ── Actions ── */}
      <div style={{
        display:"flex", flexDirection:"column", gap:8,
        padding:"12px 20px 16px", borderTop:"1px solid #F3F4F6",
        backgroundColor:"#fff", flexShrink:0,
      }}>
        {/* Sauvegarder — pleine largeur, CTA principal */}
        <button onClick={handleSave} disabled={saving} style={{
          width:"100%", backgroundColor:"#E3000F", color:"#fff", border:"none",
          borderRadius:100, padding:"14px 16px",
          fontSize:14, fontWeight:700,
          cursor: saving ? "not-allowed" : "pointer",
          opacity: saving ? 0.8 : 1,
          display:"flex", alignItems:"center", justifyContent:"center", gap:6,
        }}>
          {saving
            ? <><Loader2 size={16} style={{ animation:"spin 1s linear infinite" }} /> Enregistrement…</>
            : isEdit ? "Sauvegarder la réserve" : "Sauvegarder"
          }
        </button>

        {/* Retour + Nouvelle réserve */}
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => navigate(-1)} style={{
            flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
            background:"none", border:"1.5px solid #E5E7EB", borderRadius:100,
            color:"#6B7280", fontSize:14, fontWeight:600, cursor:"pointer", padding:"10px 8px",
          }}>
            <ArrowLeft size={15} /> Retour
          </button>
          {canAddMore && (
            <button onClick={handleSaveAndAddAnother} style={{
              flex:2, border:"1.5px dashed #D1D5DB", borderRadius:100,
              padding:"10px 8px", background:"none", cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:6,
            }}>
              <Plus size={14} color="#6B7280" />
              <span style={{
                fontSize:13, fontWeight:700, color:"#6B7280", whiteSpace:"nowrap",
              }}>
                Nouvelle réserve
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ── Bottom nav ── */}
      <div style={{
        backgroundColor:"#fff", borderTop:"1px solid #E5E7EB",
        padding:"10px 24px 16px",
        display:"flex", justifyContent:"center", alignItems:"center",
        flexShrink: 0,
      }}>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
          <Home size={20} color="#E3000F" />
          <span style={{ fontSize:11, fontWeight:700, color:"#E3000F", letterSpacing:"0.08em" }}>
            ACCUEIL PSA
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReserveFormScreen;
