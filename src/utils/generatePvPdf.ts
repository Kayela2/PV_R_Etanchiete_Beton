// src/utils/generatePvPdf.ts
import jsPDF from "jspdf";
import type { Pv, ConformiteValue } from "../types";
import { AGENCES, ETABLISSEMENTS } from "../data/referentiel";
import smacLogoUrl from "../assets/SmacLogo.png";

/** Charge une URL image et la retourne en data-URL base64 */
async function fetchBase64(url: string): Promise<string> {
  const res    = await fetch(url);
  const blob   = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ── Constantes mise en page ──────────────────────────────────────────────────
const PAGE_W   = 210;  // A4 mm
const PAGE_H   = 297;
const MARGIN   = 14;
const COL_W    = PAGE_W - MARGIN * 2;
const LINE_H   = 6;    // interligne normal
const SMAC_RED: [number, number, number] = [227, 0, 15];
const DARK:     [number, number, number] = [17, 24, 39];
const GRAY:     [number, number, number] = [107, 114, 128];
const GRAY_BG:  [number, number, number] = [243, 244, 246];
const WHITE:    [number, number, number] = [255, 255, 255];
const GREEN:    [number, number, number] = [22, 163, 74];

// ── Helpers ──────────────────────────────────────────────────────────────────
const conformiteLabel = (v?: ConformiteValue) =>
  v === "conforme" ? "Conforme" : v === "non-conforme" ? "Non conforme" : "S/O";

const conformiteColor = (v?: ConformiteValue): [number, number, number] =>
  v === "conforme" ? GREEN : v === "non-conforme" ? SMAC_RED : GRAY;

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit", month: "long", year: "numeric",
    });
  } catch { return iso; }
};

// ── Classe helper pour le curseur Y ─────────────────────────────────────────
class Cursor {
  y: number;
  doc: jsPDF;
  constructor(doc: jsPDF, startY = MARGIN + 10) {
    this.doc = doc;
    this.y   = startY;
  }
  /** Ajoute un saut de ligne */
  nl(h = LINE_H) { this.y += h; }
  /** Vérifie si une nouvelle page est nécessaire */
  check(needed = 20) {
    if (this.y + needed > PAGE_H - MARGIN) {
      this.doc.addPage();
      this.y = MARGIN + 6;
    }
  }
}

// ── En-tête de page ──────────────────────────────────────────────────────────
function drawHeader(doc: jsPDF, pvId: string, logoBase64: string) {
  const headerH = 26;

  // Fond blanc
  doc.setFillColor(...WHITE);
  doc.rect(0, 0, PAGE_W, headerH, "F");

  // Logo SMAC (gauche)
  try {
    doc.addImage(logoBase64, "PNG", MARGIN, 4, 28, 16);
  } catch {
    // fallback texte si logo invalide
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...SMAC_RED);
    doc.text("SMAC", MARGIN, 16);
  }

  // Titre centré (en rouge)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...SMAC_RED);
  doc.text("P.V DE RÉCEPTION DE SUPPORT BÉTON – ÉTANCHÉITÉ", PAGE_W / 2, 11, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...DARK);
  doc.text(pvId, PAGE_W / 2, 18, { align: "center" });

  // Date (droite)
  const now = new Date().toLocaleDateString("fr-FR");
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.text(now, PAGE_W - MARGIN, 11, { align: "right" });

  // Ligne rouge séparatrice
  doc.setFillColor(...SMAC_RED);
  doc.rect(0, headerH, PAGE_W, 1.2, "F");
}

// ── Section titre ─────────────────────────────────────────────────────────────
function sectionTitle(doc: jsPDF, cur: Cursor, label: string) {
  cur.check(14);
  doc.setFillColor(...SMAC_RED);
  doc.rect(MARGIN, cur.y, 3, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text(label.toUpperCase(), MARGIN + 6, cur.y + 4.5);
  cur.nl(10);
}

// ── Ligne clé–valeur ─────────────────────────────────────────────────────────
function rowKV(doc: jsPDF, cur: Cursor, label: string, value: string, bold = false) {
  cur.check(8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  doc.text(label, MARGIN, cur.y);
  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setTextColor(...DARK);
  doc.text(value || "—", MARGIN + 55, cur.y);
  // Trait séparateur
  doc.setDrawColor(230, 232, 235);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, cur.y + 2, MARGIN + COL_W, cur.y + 2);
  cur.nl(LINE_H + 1);
}

// ── Ligne conformité ─────────────────────────────────────────────────────────
function rowConformite(doc: jsPDF, cur: Cursor, label: string, value?: ConformiteValue) {
  cur.check(8);
  const lbl  = conformiteLabel(value);
  const col  = conformiteColor(value);
  const colW = 26;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GRAY);
  doc.text(label, MARGIN, cur.y);

  // Badge
  const badgeX = MARGIN + COL_W - colW;
  doc.setFillColor(...col);
  doc.roundedRect(badgeX, cur.y - 3.5, colW, 5.5, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...WHITE);
  doc.text(lbl, badgeX + colW / 2, cur.y + 0.3, { align: "center" });

  doc.setDrawColor(230, 232, 235);
  doc.setLineWidth(0.2);
  doc.line(MARGIN, cur.y + 2, MARGIN + COL_W, cur.y + 2);
  cur.nl(LINE_H + 1);
}

// ── Photo en base64 ──────────────────────────────────────────────────────────
function addPhoto(doc: jsPDF, cur: Cursor, base64: string, w = 40, h = 30) {
  cur.check(h + 4);
  try {
    // jsPDF accepte directement les data-URL base64
    const fmt = base64.startsWith("data:image/png") ? "PNG" : "JPEG";
    doc.addImage(base64, fmt, MARGIN, cur.y, w, h);
    cur.nl(h + 4);
  } catch {
    // Si l'image échoue, on continue sans
    cur.nl(2);
  }
}

// ── Grille de photos ─────────────────────────────────────────────────────────
function photoGrid(doc: jsPDF, cur: Cursor, photos: { url: string }[]) {
  if (!photos.length) return;
  const pw = 40, ph = 30, gap = 4;
  const perRow = Math.floor(COL_W / (pw + gap));
  let col = 0;
  const startY = cur.y;

  photos.forEach((p, i) => {
    if (i > 0 && i % perRow === 0) {
      cur.nl(ph + gap);
      col = 0;
    }
    cur.check(ph + 4);
    try {
      const fmt = p.url.startsWith("data:image/png") ? "PNG" : "JPEG";
      doc.addImage(p.url, fmt, MARGIN + col * (pw + gap), cur.y, pw, ph);
    } catch { /* silencieux */ }
    col++;
  });
  void startY;
  cur.nl(ph + 4);
}

// ── Générateur principal ──────────────────────────────────────────────────────
export async function generatePvPdf(pv: Pv): Promise<void> {
  const logoBase64 = await fetchBase64(smacLogoUrl).catch(() => "");

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const cur = new Cursor(doc, 30);

  const agence        = AGENCES.find((a) => a.id === pv.step1?.agenceId);
  const etablissement = ETABLISSEMENTS.find((e) => e.id === pv.step1?.etablissementId);

  drawHeader(doc, pv.id, logoBase64);

  // ── 1. Informations générales ─────────────────────────────────────────────
  sectionTitle(doc, cur, "Informations générales");
  rowKV(doc, cur, "Référence PV",       pv.id,                             true);
  rowKV(doc, cur, "Chantier",           pv.step1?.chantier ?? "—",         true);
  rowKV(doc, cur, "Zone / Bâtiment",    pv.step1?.zoneBatiment ?? "—");
  rowKV(doc, cur, "Agence",             agence?.nom ?? "—");
  rowKV(doc, cur, "Établissement",      etablissement?.nom ?? "—");
  rowKV(doc, cur, "Date d'inspection",  formatDate(pv.step1?.dateInspection));
  rowKV(doc, cur, "Responsable",        pv.step1?.responsableChantier ?? "—");
  if (pv.step1?.planReperage)
    rowKV(doc, cur, "Plan de repérage", pv.step1.planReperage === "oui" ? "Oui" : "Non");
  if (pv.step2?.natureTravaux)
    rowKV(doc, cur, "Nature des travaux",
      pv.step2.natureTravaux === "etancheite-beton" ? "Étanchéité sur béton" : "Autre support");
  cur.nl(4);

  // ── 2. Réserves ──────────────────────────────────────────────────────────
  if ((pv.step1?.reserves?.length ?? 0) > 0) {
    sectionTitle(doc, cur, `Réserves (${pv.step1!.reserves!.length} / 8)`);
    pv.step1!.reserves!.forEach((r, i) => {
      cur.check(24);

      // Numéro + localisation
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...SMAC_RED);
      doc.text(`Réserve #${String(i + 1).padStart(2, "0")}`, MARGIN, cur.y);
      cur.nl(5);

      doc.setTextColor(...DARK);
      doc.text(r.localisation || "Sans localisation", MARGIN, cur.y);
      cur.nl(5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...GRAY);
      const lines = doc.splitTextToSize(r.detail, COL_W);
      doc.text(lines, MARGIN, cur.y);
      cur.nl(lines.length * 4 + 2);

      if (r.photos.length > 0) {
        photoGrid(doc, cur, r.photos);
      }

      // Séparateur entre réserves
      if (i < pv.step1!.reserves!.length - 1) {
        doc.setDrawColor(...SMAC_RED);
        doc.setLineWidth(0.3);
        doc.line(MARGIN, cur.y, MARGIN + COL_W, cur.y);
        cur.nl(4);
      }
    });
    cur.nl(4);
  }

  // ── 3. État de surface ───────────────────────────────────────────────────
  if (pv.step2) {
    sectionTitle(doc, cur, "État de surface");

    // Fond gris pour sous-titre
    doc.setFillColor(...GRAY_BG);
    doc.rect(MARGIN, cur.y - 1, COL_W, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    doc.text("Etat de surface", MARGIN + 2, cur.y + 3.5);
    cur.nl(8);

    rowConformite(doc, cur, "Régularité du support", pv.step2.etatSurface?.regulariteSupport);
    rowConformite(doc, cur, "Propreté du support",   pv.step2.etatSurface?.propreteSupport);
    if (pv.step2.etatSurface?.pente)
      rowConformite(doc, cur, "Pente",               pv.step2.etatSurface.pente);

    doc.setFillColor(...GRAY_BG);
    doc.rect(MARGIN, cur.y, COL_W, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    doc.text("Parties courantes", MARGIN + 2, cur.y + 4);
    cur.nl(8);

    rowConformite(doc, cur, "Régularité du support", pv.step2.partiesCourantes?.regulariteSupport);
    rowConformite(doc, cur, "Propreté du support",   pv.step2.partiesCourantes?.propreteSupport);
    cur.nl(4);
  }

  // ── 4. Relevés d'étanchéité ──────────────────────────────────────────────
  if (pv.step3?.releveEtancheite) {
    sectionTitle(doc, cur, "Relevés d'étanchéité");
    const r = pv.step3.releveEtancheite;
    rowConformite(doc, cur, "Hauteur d'engravure",               r.trousBanchesRebouches);
    rowConformite(doc, cur, "Profondeur d'engravure",            r.remplissageJointsPanneaux);
    rowConformite(doc, cur, "Protection de la tête des relevés", r.hauteurEngravure);
    rowConformite(doc, cur, "Profondeur engravure",              r.profondeurEngravure);
    rowConformite(doc, cur, "Protection tête de relevés",        r.protectionTeteReleves);
    cur.nl(4);
  }

  // ── 5. Points singuliers ────────────────────────────────────────────────
  if (pv.step4?.pointsSinguliers) {
    sectionTitle(doc, cur, "Points singuliers");
    const p = pv.step4.pointsSinguliers;
    rowConformite(doc, cur, "Trémies lanterneaux",  p.tremiesLanterneaux);
    rowConformite(doc, cur, "Eaux pluviales",        p.eauxPluviales);
    rowConformite(doc, cur, "Ventilation",           p.deversoirs);
    rowConformite(doc, cur, "Trop-pleins",           p.tropPleins);
    rowConformite(doc, cur, "Joints de dilatation",  p.jointsDialatation);
    if (pv.step4.autresEcartsObservations) {
      cur.nl(2);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...GRAY);
      doc.text("Observations :", MARGIN, cur.y);
      cur.nl(5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...DARK);
      const obsLines = doc.splitTextToSize(pv.step4.autresEcartsObservations, COL_W);
      doc.text(obsLines, MARGIN, cur.y);
      cur.nl(obsLines.length * 4 + 2);
    }
    cur.nl(4);
  }

  // ── 6. Participants & Signatures ─────────────────────────────────────────
  if ((pv.step5?.participants?.length ?? 0) > 0) {
    sectionTitle(doc, cur, "Participants");
    pv.step5!.participants!.forEach((p, i) => {
      cur.check(50);
      if (p.titre) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...GRAY);
        doc.text(p.titre, MARGIN, cur.y);
        cur.nl(4.5);
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...DARK);
      doc.text(p.nom, MARGIN, cur.y);
      cur.nl(5);

      if (p.signature) {
        addPhoto(doc, cur, p.signature, 60, 24);
      }

      if (i < pv.step5!.participants!.length - 1) {
        doc.setDrawColor(230, 232, 235);
        doc.setLineWidth(0.2);
        doc.line(MARGIN, cur.y, MARGIN + COL_W, cur.y);
        cur.nl(4);
      }
    });
    cur.nl(4);

    rowKV(doc, cur, "Réception acceptée",
      pv.step5?.receptionAcceptee ? "Oui" : "Non");
    if (pv.step5?.miseEnConformiteLe)
      rowKV(doc, cur, "Mise en conformité le", formatDate(pv.step5.miseEnConformiteLe));
  }

  // ── Pied de page ──────────────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(`Document généré par SMAC — ${pv.id}`, MARGIN, PAGE_H - 6);
    doc.text(`Page ${i} / ${totalPages}`, PAGE_W - MARGIN, PAGE_H - 6, { align: "right" });
    doc.setDrawColor(230, 232, 235);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, PAGE_H - 10, PAGE_W - MARGIN, PAGE_H - 10);
  }

  // ── Téléchargement ────────────────────────────────────────────────────────
  const filename = `${pv.id}_${pv.step1?.chantier?.replace(/\s+/g, "_") ?? "PV"}.pdf`;
  doc.save(filename);
}
