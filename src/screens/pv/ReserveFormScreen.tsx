// src/screens/pv/ReserveFormScreen.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Camera, Trash2, ArrowLeft, Plus, Pencil, X, Home, Loader2 } from "lucide-react";
import { usePvFormStore } from "../../store";
import type { Reserve, ReservePhoto } from "../../types";
import { ImageAnnotator } from "../../components/shared";

const MAX_PHOTOS = 8;

/**
 * Input superposé sur le bouton visible.
 * NE PAS utiliser `inset: 0` — non supporté sur Android WebView < Chrome 87.
 * Utiliser top/left/right/bottom explicitement pour compatibilité maximale.
 */
const fileOverlay = {
  position: "absolute" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  opacity: 0,
  width: "100%",
  height: "100%",
  cursor: "pointer",
};

const ReserveFormScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { formData, addReserve, updateReserve, removeReserve } = usePvFormStore();

  const reserves = formData.step1.reserves ?? [];
  const existing = id ? reserves.find((r) => r.id === id) : undefined;
  const isEdit   = !!existing;

  const [localisation,       setLocalisation]       = useState(existing?.localisation ?? "");
  const [detail,             setDetail]             = useState(existing?.detail       ?? "");
  // Séparer les photos normales de la photo de localisation dès l'init.
  // existing?.photos contient les deux types — on les split ici pour éviter les doublons dans buildReserve.
  const [photos,             setPhotos]             = useState<ReservePhoto[]>(
    existing?.photos.filter(p => p.caption !== "__locPhoto") ?? []
  );
  const [locPhoto,           setLocPhoto]           = useState<ReservePhoto | null>(
    existing?.photos.find(p => p.caption === "__locPhoto") ?? null
  );
  const [errors,             setErrors]             = useState<{ detail?: string }>({});
  const [saving,             setSaving]             = useState(false);
  const [loadingPhotos,      setLoadingPhotos]      = useState(false);
  const [annotatingPhoto,    setAnnotatingPhoto]    = useState<ReservePhoto | null>(null);
  const [annotatingLocPhoto, setAnnotatingLocPhoto] = useState(false);

  // Resync form fields when navigating to a different reserve (id change)
  useEffect(() => {
    const target = id ? reserves.find((r) => r.id === id) : undefined;
    setLocalisation(target?.localisation ?? "");
    setDetail(target?.detail ?? "");
    setPhotos(target?.photos.filter(p => p.caption !== "__locPhoto") ?? []);
    setLocPhoto(target?.photos.find(p => p.caption === "__locPhoto") ?? null);
    setErrors({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Lecture de fichiers ───────────────────────────────────────────────────────
  // On extrait les File objects en tableau AVANT tout reset de l'input.
  // Sur certains WebViews Android, e.target.value="" invalide e.target.files.
  const readFileArray = (arr: File[], cb: (p: ReservePhoto[]) => void) => {
    if (arr.length === 0) return;
    setLoadingPhotos(true);
    Promise.all(
      arr.map(
        (file) =>
          new Promise<ReservePhoto>((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
              resolve({
                id:      crypto.randomUUID(),
                url:     (ev.target?.result as string) ?? "",
                caption: file.name,
              });
            };
            reader.onerror = () =>
              resolve({ id: crypto.randomUUID(), url: "", caption: file.name });
            reader.readAsDataURL(file);
          })
      )
    ).then((results) => {
      setLoadingPhotos(false);
      const valid = results.filter((p) => p.url !== "");
      if (valid.length > 0) cb(valid);
    });
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Extraire les fichiers en tableau immédiatement
    const arr = Array.from(e.target.files ?? []);
    // 2. Réinitialiser APRÈS extraction (permet de re-sélectionner le même fichier)
    e.target.value = "";
    readFileArray(arr, (newPhotos) =>
      setPhotos((prev) => [...prev, ...newPhotos].slice(0, MAX_PHOTOS))
    );
  };

  const handleLocPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arr = Array.from(e.target.files ?? []);
    e.target.value = "";
    readFileArray(arr, (p) => setLocPhoto({ ...p[0], caption: "__locPhoto" }));
  };

  // ── Validation ────────────────────────────────────────────────────────────────
  const validate = () => {
    const e: { detail?: string } = {};
    if (!detail.trim()) e.detail = "Le détail de la réserve est requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Construction de la réserve ────────────────────────────────────────────────
  const buildReserve = (): Reserve => {
    const allPhotos = locPhoto ? [...photos, locPhoto] : photos;
    return {
      id:        existing?.id ?? crypto.randomUUID(),
      localisation,
      detail,
      photos:    allPhotos,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };
  };

  // ── Sauvegarde ────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!validate()) return;
    setSaving(true);
    const reserve = buildReserve();
    if (isEdit) updateReserve(reserve);
    else        addReserve(reserve);
    setTimeout(() => {
      navigate("/pv-form", { replace: true });
    }, 300);
  };

  const resetForm = () => {
    setLocalisation("");
    setDetail("");
    setPhotos([]);
    setLocPhoto(null);
    setErrors({});
  };

  const handleSaveAndAddAnother = () => {
    if (!validate()) return;
    addReserve(buildReserve());
    resetForm();
  };

  // En mode édition, on met à jour — pas ajouter une nouvelle réserve en parallèle.
  const canAddMore = !isEdit;

  // ── Annotation ────────────────────────────────────────────────────────────────
  const handleAnnotationSave = (annotated: string) => {
    if (!annotatingPhoto) return;
    setPhotos((prev) =>
      prev.map((p) => p.id === annotatingPhoto.id ? { ...p, url: annotated } : p)
    );
    setAnnotatingPhoto(null);
  };

  const handleLocPhotoAnnotationSave = (annotated: string) => {
    if (!locPhoto) return;
    setLocPhoto({ ...locPhoto, url: annotated });
    setAnnotatingLocPhoto(false);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", backgroundColor:"#fff", position:"relative" }}>

      {/* ── Annotateur photo galerie ── */}
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
        <h2 style={{ fontSize:16, fontWeight:700, color:"#111827" }}>
          {isEdit ? "Modification de la Réserve" : "Réserve"}
        </h2>
      </div>

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
            <div style={{ position:"relative", marginBottom:12 }}>
              <div style={{
                width:"100%",
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                backgroundColor:"#E3000F", color:"#fff",
                borderRadius:100, padding:"14px 16px",
                fontSize:14, fontWeight:700, pointerEvents:"none",
              }}>
                <Camera size={18} />
                Prendre / importer une photo
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                style={fileOverlay}
                onChange={handlePhotoCapture}
              />
            </div>
          )}

          {/* Grille photos */}
          {photos.length > 0 && (
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {photos.map((photo) => (
                <div key={photo.id}>
                  <div style={{ position:"relative" }}>
                    <img src={photo.url} alt={photo.caption} style={{
                      width:96, height:96, borderRadius:12,
                      objectFit:"cover", border:"1px solid #E5E7EB", display:"block",
                    }} />
                    <button
                      onClick={() => setPhotos(prev => prev.filter(p => p.id !== photo.id))}
                      style={{
                        position:"absolute", top:-6, right:-6,
                        width:22, height:22, borderRadius:"50%",
                        backgroundColor:"#E3000F", border:"2px solid #fff",
                        cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                      }}
                    >
                      <X size={11} color="#fff" />
                    </button>
                  </div>
                  <div style={{ display:"flex", gap:6, justifyContent:"center", marginTop:4 }}>
                    <button
                      onClick={() => setAnnotatingPhoto(photo)}
                      style={{
                        width:28, height:28, borderRadius:6, backgroundColor:"#F3F4F6",
                        border:"none", cursor:"pointer",
                        display:"flex", alignItems:"center", justifyContent:"center",
                      }}
                    >
                      <Pencil size={12} color="#6B7280" />
                    </button>
                    <button
                      onClick={() => setPhotos(prev => prev.filter(p => p.id !== photo.id))}
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
                <div style={{ position:"relative", width:96, height:96 }}>
                  <div style={{
                    width:"100%", height:"100%", borderRadius:12,
                    border:"2px dashed #E5E7EB", backgroundColor:"#F3F4F6",
                    display:"flex", flexDirection:"column",
                    alignItems:"center", justifyContent:"center", gap:4,
                    pointerEvents:"none",
                  }}>
                    <Plus size={20} color="#6B7280" />
                    <span style={{ fontSize:10, fontWeight:700, color:"#6B7280", textTransform:"uppercase" }}>
                      AJOUTER
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    style={fileOverlay}
                    onChange={handlePhotoCapture}
                  />
                </div>
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
                {/* Annoter */}
                <button
                  onClick={() => setAnnotatingLocPhoto(true)}
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
                {/* Remplacer — overlay */}
                <div style={{ position:"relative", width:32, height:32 }}>
                  <div style={{
                    width:"100%", height:"100%", borderRadius:8,
                    backgroundColor:"rgba(255,255,255,0.9)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    boxShadow:"0 1px 4px rgba(0,0,0,0.15)",
                    pointerEvents:"none",
                  }}>
                    <Camera size={14} color="#111827" />
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    style={fileOverlay}
                    onChange={handleLocPhoto}
                  />
                </div>
                {/* Supprimer */}
                <button
                  onClick={() => setLocPhoto(null)}
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
            /* Bouton ajouter photo localisation — overlay */
            <div style={{ position:"relative", height:100 }}>
              <div style={{
                width:"100%", height:"100%", borderRadius:16,
                border:"2px dashed #E5E7EB", backgroundColor:"#F3F4F6",
                display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center", gap:6,
                pointerEvents:"none",
              }}>
                <Camera size={24} color="#E3000F" />
                <span style={{
                  fontSize:11, fontWeight:700, color:"#E3000F",
                  textTransform:"uppercase", letterSpacing:"0.08em",
                }}>
                  Ajouter une image de localisation
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                style={fileOverlay}
                onChange={handleLocPhoto}
              />
            </div>
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

        {reserves.length > 0 && (
          <p style={{ fontSize:12, color:"#6B7280", textAlign:"center", marginBottom:16 }}>
            {reserves.length} réserve{reserves.length > 1 ? "s" : ""}
          </p>
        )}

        {/* ── Liste des réserves (max 2) ── */}
        {reserves.length > 0 && (
          <div>
            <div style={{
              display:"flex", justifyContent:"space-between",
              alignItems:"center", marginBottom:16,
            }}>
              <h4 style={{ fontSize:20, fontWeight:900, color:"#111827" }}>
                Liste de Réserves
              </h4>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                {reserves.length > 2 && (
                  <button
                    onClick={() => navigate("/pv-form/reserves")}
                    style={{
                      background:"none", border:"none", cursor:"pointer",
                      fontSize:13, fontWeight:700, color:"#E3000F",
                      textDecoration:"underline", padding:0,
                    }}
                  >
                    Voir plus ({reserves.length})
                  </button>
                )}
                <span style={{ fontSize:16, fontWeight:700, color:"#6B7280" }}>
                  {String(reserves.length).padStart(2, "0")}
                </span>
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {reserves.slice(0, 2).map((reserve, index) => (
                <ReserveCard
                  key={reserve.id}
                  reserve={reserve}
                  index={index + 1}
                  isActive={reserve.id === id}
                  onEdit={() => navigate("/pv-form/reserve/" + reserve.id)}
                  onDelete={() => removeReserve(reserve.id)}
                />
              ))}
            </div>

            {reserves.length > 2 && (
              <button
                onClick={() => navigate("/pv-form/reserves")}
                style={{
                  width:"100%", marginTop:12,
                  border:"1px solid #E5E7EB", borderRadius:12,
                  padding:"12px 16px", background:"#F3F4F6", cursor:"pointer",
                  fontSize:13, fontWeight:700, color:"#6B7280",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                  boxSizing:"border-box",
                }}
              >
                Voir toutes les réserves ({reserves.length})
              </button>
            )}
          </div>
        )}

        <div style={{ height:16 }} />
      </div>

      {/* ── Retour / Ajouter / Sauvegarder ── */}
      <div style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"12px 20px", borderTop:"1px solid #F3F4F6",
        backgroundColor:"#fff", flexShrink:0, gap:8,
      }}>
        <button onClick={() => navigate(-1)} style={{
          display:"flex", alignItems:"center", gap:6,
          background:"none", border:"none", color:"#E3000F",
          fontSize:14, fontWeight:600, cursor:"pointer", padding:0,
        }}>
          <ArrowLeft size={15} /> Retour
        </button>

        {canAddMore && (
          <button onClick={handleSaveAndAddAnother} style={{
            border:"1.5px dashed #D1D5DB", borderRadius:12,
            padding:"8px 14px", background:"none", cursor:"pointer",
            display:"flex", alignItems:"center", gap:6,
          }}>
            <div style={{
              width:22, height:22, borderRadius:"50%",
              border:"1.5px solid #D1D5DB",
              display:"flex", alignItems:"center", justifyContent:"center",
              flexShrink:0,
            }}>
              <Plus size={12} color="#6B7280" />
            </div>
            <span style={{
              fontSize:10, fontWeight:700, color:"#6B7280",
              textTransform:"uppercase", letterSpacing:"0.07em",
              whiteSpace:"nowrap",
            }}>
              Nouvelle réserve
            </span>
          </button>
        )}

        <button onClick={handleSave} disabled={saving} style={{
          backgroundColor:"#E3000F", color:"#fff", border:"none",
          borderRadius:100, padding:"12px 24px",
          fontSize:14, fontWeight:700,
          cursor: saving ? "not-allowed" : "pointer",
          whiteSpace:"nowrap", opacity: saving ? 0.8 : 1,
          display:"flex", alignItems:"center", gap:6,
        }}>
          {saving
            ? <><Loader2 size={16} style={{ animation:"spin 1s linear infinite" }} /> Enregistrement…</>
            : isEdit ? "Sauvegarder la réserve" : "Sauvegarder"
          }
        </button>
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

/* ── Carte réserve ── */
const ReserveCard = ({
  reserve, index, isActive, onEdit, onDelete,
}: {
  reserve: Reserve; index: number; isActive: boolean;
  onEdit: () => void; onDelete: () => void;
}) => (
  <div
    onClick={onEdit}
    style={{
      backgroundColor:"#fff", borderRadius:16,
      border:"1px solid #E5E7EB",
      borderLeft:"4px solid #E3000F",
      padding:16,
      opacity: isActive ? 0.7 : 1,
      cursor:"pointer",
    }}
  >
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
      <div style={{ flex:1 }}>
        <p style={{
          fontSize:11, fontWeight:700, color:"#E3000F",
          textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:2,
        }}>
          Réserve #{String(index).padStart(2, "0")}
        </p>
        <p style={{ fontSize:15, fontWeight:900, color:"#111827", marginBottom:2 }}>
          {reserve.localisation || "Sans localisation"}
        </p>
        <p style={{ fontSize:12, color:"#6B7280", lineHeight:1.5 }}>{reserve.detail}</p>
      </div>
      <div style={{ display:"flex", gap:8, marginLeft:12, flexShrink:0 }}>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          style={{
            width:32, height:32, borderRadius:8, backgroundColor:"#F3F4F6",
            border:"none", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}
        >
          <Pencil size={14} color="#6B7280" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{
            width:32, height:32, borderRadius:8, backgroundColor:"#FDECEA",
            border:"none", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}
        >
          <Trash2 size={14} color="#E3000F" />
        </button>
      </div>
    </div>

    {reserve.photos.filter(p => p.caption !== "__locPhoto").length > 0 && (
      <div style={{ display:"flex", gap:8 }}>
        {reserve.photos.filter(p => p.caption !== "__locPhoto").slice(0, 2).map((photo) => (
          <img key={photo.id} src={photo.url} alt={photo.caption}
            style={{ width:80, height:80, borderRadius:10, objectFit:"cover" }} />
        ))}
        <div style={{
          width:80, height:80, borderRadius:10,
          border:"1.5px dashed #E5E7EB", backgroundColor:"#F3F4F6",
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center", gap:3,
        }}>
          <Plus size={16} color="#6B7280" />
          <span style={{ fontSize:9, fontWeight:700, color:"#6B7280", textTransform:"uppercase" }}>
            AJOUTER
          </span>
        </div>
      </div>
    )}
  </div>
);

export default ReserveFormScreen;
