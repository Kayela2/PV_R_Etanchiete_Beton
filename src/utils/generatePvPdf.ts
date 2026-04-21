// src/utils/generatePvPdf.ts
import jsPDF from "jspdf";
import type { Pv, ConformiteValue } from "../types";
import { AGENCES, ETABLISSEMENTS } from "../data/referentiel";
import smacLogoUrl from "../assets/smac-white-without-bg.png";

async function fetchBase64(url: string): Promise<string> {
  const res  = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ── Constantes mise en page ──────────────────────────────────────────────────
const PAGE_W  = 210;
const PAGE_H  = 297;
const MARGIN  = 14;
const COL_W   = PAGE_W - MARGIN * 2;
const LINE_H  = 6.5;

const RED:   [number, number, number] = [227, 0, 15];
const DARK:  [number, number, number] = [17, 24, 39];
const GRAY:  [number, number, number] = [107, 114, 128];
const WHITE: [number, number, number] = [255, 255, 255];
const GREEN: [number, number, number] = [22, 163, 74];
const ROW_A: [number, number, number] = [249, 250, 251];   // fond lignes paires
const BORDER:[number, number, number] = [229, 231, 235];

// ── Helpers texte / conformité ────────────────────────────────────────────────
const conformiteLabel = (v?: ConformiteValue) =>
  v === "conforme" ? "Conforme" : v === "non-conforme" ? "Non conforme" : "S/O";

const conformiteColor = (v?: ConformiteValue): [number, number, number] =>
  v === "conforme" ? GREEN : v === "non-conforme" ? RED : GRAY;

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit", month: "long", year: "numeric",
    });
  } catch { return iso; }
};

// ── Curseur vertical ─────────────────────────────────────────────────────────
class Cursor {
  y: number;
  doc: jsPDF;
  constructor(doc: jsPDF, startY = MARGIN) {
    this.doc = doc; this.y = startY;
  }
  nl(h = LINE_H) { this.y += h; }
  check(needed = 20) {
    if (this.y + needed > PAGE_H - MARGIN - 10) {
      this.doc.addPage();
      this.y = MARGIN + 4;
    }
  }
}

// ── En-tête de page ───────────────────────────────────────────────────────────
function drawHeader(doc: jsPDF, pv: Pv, logoBase64: string) {
  const H = 32;

  // Fond rouge pleine largeur
  doc.setFillColor(...RED);
  doc.rect(0, 0, PAGE_W, H, "F");

  // Logo (blanc, gauche)
  try {
    doc.addImage(logoBase64, "PNG", MARGIN, 5, 30, 18);
  } catch {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...WHITE);
    doc.text("SMAC", MARGIN, 18);
  }

  // Titre principal
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...WHITE);
  doc.text("P.V DE RÉCEPTION SUPPORT BÉTON – ÉTANCHÉITÉ", PAGE_W / 2, 11, { align: "center" });

  // Référence PV
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(255, 200, 200);
  doc.text(`Réf. : ${pv.id}`, PAGE_W / 2, 19, { align: "center" });

  // Chantier
  const chantier = pv.step1?.chantier ?? "—";
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...WHITE);
  doc.text(chantier, PAGE_W / 2, 27, { align: "center" });

  // Date (coin droit)
  const now = new Date().toLocaleDateString("fr-FR");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(255, 200, 200);
  doc.text(now, PAGE_W - MARGIN, 11, { align: "right" });
}

// ── Titre de section (bandeau sombre pleine largeur) ─────────────────────────
function sectionTitle(doc: jsPDF, cur: Cursor, label: string) {
  cur.check(18);
  const bandH = 8;
  doc.setFillColor(...DARK);
  doc.rect(MARGIN, cur.y, COL_W, bandH, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...WHITE);
  doc.text(label.toUpperCase(), MARGIN + 5, cur.y + 5.5);
  cur.nl(bandH + 2);
}

// ── Ligne clé–valeur (fond alterné) ──────────────────────────────────────────
let _rowIndex = 0;
function resetRowIndex() { _rowIndex = 0; }

function rowKV(
  doc: jsPDF, cur: Cursor,
  label: string, value: string,
  bold = false,
) {
  const rowH = 7.5;
  cur.check(rowH + 2);

  if (_rowIndex % 2 === 0) {
    doc.setFillColor(...ROW_A);
    doc.rect(MARGIN, cur.y - 0.5, COL_W, rowH, "F");
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(label, MARGIN + 3, cur.y + 5);

  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK);
  doc.text(value || "—", MARGIN + 70, cur.y + 5);

  _rowIndex++;
  cur.nl(rowH);
}

// ── Ligne conformité (fond alterné + badge coloré) ────────────────────────────
function rowConformite(doc: jsPDF, cur: Cursor, label: string, value?: ConformiteValue) {
  const rowH = 7.5;
  cur.check(rowH + 2);

  if (_rowIndex % 2 === 0) {
    doc.setFillColor(...ROW_A);
    doc.rect(MARGIN, cur.y - 0.5, COL_W, rowH, "F");
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(label, MARGIN + 3, cur.y + 5);

  const lbl   = conformiteLabel(value);
  const color = conformiteColor(value);
  const bW = lbl === "Non conforme" ? 28 : 22;
  const bX = MARGIN + COL_W - bW - 3;

  doc.setFillColor(...color);
  doc.roundedRect(bX, cur.y + 0.5, bW, 5.5, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(...WHITE);
  doc.text(lbl.toUpperCase(), bX + bW / 2, cur.y + 4.5, { align: "center" });

  _rowIndex++;
  cur.nl(rowH);
}

// ── Grille de photos ──────────────────────────────────────────────────────────
function photoGrid(doc: jsPDF, cur: Cursor, photos: { url: string; caption?: string }[]) {
  if (!photos.length) return;
  const pw = 42, ph = 32, gap = 5;
  const perRow = Math.floor(COL_W / (pw + gap));
  let col = 0;

  photos.forEach((p, i) => {
    if (i > 0 && i % perRow === 0) {
      cur.nl(ph + gap);
      col = 0;
    }
    cur.check(ph + 6);
    try {
      const fmt = p.url.startsWith("data:image/png") ? "PNG" : "JPEG";
      const x = MARGIN + col * (pw + gap);
      doc.addImage(p.url, fmt, x, cur.y, pw, ph);
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.3);
      doc.rect(x, cur.y, pw, ph);
    } catch { /* silencieux */ }
    col++;
  });
  cur.nl(ph + gap);
}

// ── Bloc signature (boîte encadrée avec label) ────────────────────────────────
function signatureBox(
  doc: jsPDF, cur: Cursor,
  titre: string, nom: string,
  signatureBase64?: string,
) {
  const boxH = signatureBase64 ? 38 : 28;
  cur.check(boxH + 6);

  // Contour
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.4);
  doc.rect(MARGIN, cur.y, COL_W, boxH);

  // Label titre
  doc.setFillColor(...ROW_A);
  doc.rect(MARGIN, cur.y, COL_W, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.text(titre.toUpperCase(), MARGIN + 4, cur.y + 5.5);

  // Nom
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text(nom || "—", MARGIN + 4, cur.y + 15);

  // Signature
  if (signatureBase64) {
    try {
      const fmt = signatureBase64.startsWith("data:image/png") ? "PNG" : "JPEG";
      doc.addImage(signatureBase64, fmt, MARGIN + 4, cur.y + 18, 60, 16);
    } catch { /* silencieux */ }
  }

  cur.nl(boxH + 4);
}

// ── Grille de signatures côte à côte ─────────────────────────────────────────
function signatureGrid(
  doc: jsPDF, cur: Cursor,
  participants: Array<{ titre?: string; nom: string; signature?: string }>,
) {
  const cols   = 2;
  const colW   = (COL_W - 6) / cols;
  const boxH   = 38;

  for (let row = 0; row < Math.ceil(participants.length / cols); row++) {
    cur.check(boxH + 6);
    for (let c = 0; c < cols; c++) {
      const idx = row * cols + c;
      if (idx >= participants.length) break;
      const p  = participants[idx];
      const x  = MARGIN + c * (colW + 6);

      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.3);
      doc.rect(x, cur.y, colW, boxH);

      doc.setFillColor(...ROW_A);
      doc.rect(x, cur.y, colW, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(...GRAY);
      doc.text((p.titre ?? "Participant").toUpperCase(), x + 3, cur.y + 5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(...DARK);
      doc.text(p.nom || "—", x + 3, cur.y + 14);

      if (p.signature) {
        try {
          const fmt = p.signature.startsWith("data:image/png") ? "PNG" : "JPEG";
          doc.addImage(p.signature, fmt, x + 3, cur.y + 17, 50, 17);
        } catch { /* silencieux */ }
      }
    }
    cur.nl(boxH + 4);
  }
}

// ── Construction interne du document ─────────────────────────────────────────
async function buildPvDoc(pv: Pv): Promise<{ doc: jsPDF; filename: string }> {
  const logoBase64 = await fetchBase64(smacLogoUrl).catch(() => "");

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const cur = new Cursor(doc, 36);

  const agence        = AGENCES.find((a) => a.id === pv.step1?.agenceId);
  const etablissement = ETABLISSEMENTS.find((e) => e.id === pv.step1?.etablissementId);

  drawHeader(doc, pv, logoBase64);

  // ── 1. Informations générales ─────────────────────────────────────────────
  resetRowIndex();
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
  rowKV(doc, cur, "Date de création",   formatDate(pv.createdAt));
  cur.nl(5);

  // ── 2. Réserves ───────────────────────────────────────────────────────────
  const reserves = pv.step1?.reserves ?? [];
  if (reserves.length > 0) {
    sectionTitle(doc, cur, `Réserves (${reserves.length} / 8)`);
    reserves.forEach((r, i) => {
      cur.check(28);

      // Numéro de réserve
      doc.setFillColor(...RED);
      doc.rect(MARGIN, cur.y, COL_W, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...WHITE);
      doc.text(
        `Réserve #${String(i + 1).padStart(2, "0")}  —  ${r.localisation || "Sans localisation"}`,
        MARGIN + 4, cur.y + 5,
      );
      cur.nl(9);

      // Détail
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...DARK);
      const lines = doc.splitTextToSize(r.detail || "—", COL_W - 6);
      doc.text(lines, MARGIN + 3, cur.y);
      cur.nl(lines.length * 4.5 + 2);

      // Photos
      if (r.photos.length > 0) photoGrid(doc, cur, r.photos);

      // Séparateur (sauf dernier)
      if (i < reserves.length - 1) {
        doc.setDrawColor(...BORDER);
        doc.setLineWidth(0.3);
        doc.line(MARGIN, cur.y, MARGIN + COL_W, cur.y);
        cur.nl(5);
      }
    });
    cur.nl(5);
  }

  // ── 3. État de surface ────────────────────────────────────────────────────
  if (pv.step2?.etatSurface) {
    resetRowIndex();
    sectionTitle(doc, cur, "État de surface");
    rowConformite(doc, cur, "Régularité du support", pv.step2.etatSurface.regulariteSupport);
    rowConformite(doc, cur, "Propreté du support",   pv.step2.etatSurface.propreteSupport);
    rowConformite(doc, cur, "Pente",                 pv.step2.etatSurface.pente);
    cur.nl(5);
  }

  // ── 4. Support des relevés ────────────────────────────────────────────────
  if (pv.step2?.supportReleves) {
    resetRowIndex();
    sectionTitle(doc, cur, "Support des relevés");
    const sr = pv.step2.supportReleves;
    rowConformite(doc, cur, "Hauteur engravure",                 sr.hauteurEngravure);
    rowConformite(doc, cur, "Profondeur engravure",              sr.profondeurEngravure);
    rowConformite(doc, cur, "Protection de la tête des relevés", sr.protectionTeteReleves);
    rowConformite(doc, cur, "Propreté du support des relevés",   sr.propreteSupportReleves);
    rowConformite(doc, cur, "Trémie / lanterneau",               sr.tremiesLanterneaux);
    rowConformite(doc, cur, "Eau pluviale",                      sr.eauxPluviales);
    rowConformite(doc, cur, "Ventilation",                       sr.ventilation);
    rowConformite(doc, cur, "Trop-plein",                        sr.tropPleins);
    rowConformite(doc, cur, "Joint de dilatation",               sr.jointsDialatation);

    if (sr.autresEcartsObservations) {
      cur.nl(2);
      doc.setFillColor(...ROW_A);
      doc.rect(MARGIN, cur.y, COL_W, 7, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(...GRAY);
      doc.text("OBSERVATIONS", MARGIN + 3, cur.y + 5);
      cur.nl(9);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...DARK);
      const obsLines = doc.splitTextToSize(sr.autresEcartsObservations, COL_W - 6);
      doc.text(obsLines, MARGIN + 3, cur.y);
      cur.nl(obsLines.length * 4.5 + 4);
    }
    cur.nl(5);
  }

  // ── 5. Signatures ─────────────────────────────────────────────────────────
  const hasSmac = !!(pv.step5?.nomSmac);
  const hasParticipants = (pv.step5?.participants?.length ?? 0) > 0;

  if (hasSmac || hasParticipants) {
    sectionTitle(doc, cur, "Signatures");

    // SMAC
    if (hasSmac) {
      signatureBox(doc, cur, "SMAC", pv.step5!.nomSmac, pv.step5?.signatureSmac);
    }

    // Participants côte à côte
    if (hasParticipants) {
      signatureGrid(doc, cur, pv.step5!.participants!);
    }

    // Réception + mise en conformité
    resetRowIndex();
    if (pv.step5?.receptionAcceptee !== undefined)
      rowKV(doc, cur, "Réception acceptée", pv.step5.receptionAcceptee ? "Oui" : "Non");
    if (pv.step5?.miseEnConformiteLe)
      rowKV(doc, cur, "Mise en conformité le", formatDate(pv.step5.miseEnConformiteLe));
  }

  // ── Pied de page sur toutes les pages ────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Bandeau pied de page
    doc.setFillColor(...ROW_A);
    doc.rect(0, PAGE_H - 12, PAGE_W, 12, "F");
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.4);
    doc.line(0, PAGE_H - 12, PAGE_W, PAGE_H - 12);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(`SMAC — Document officiel — ${pv.id}`, MARGIN, PAGE_H - 5);
    doc.text(`Page ${i} / ${totalPages}`, PAGE_W - MARGIN, PAGE_H - 5, { align: "right" });
  }

  const filename = `PV_${pv.id}_${(pv.step1?.chantier ?? "SMAC").replace(/\s+/g, "_")}.pdf`;
  return { doc, filename };
}

// ── Exports publics ───────────────────────────────────────────────────────────
export async function generatePvPdf(pv: Pv): Promise<void> {
  const { doc, filename } = await buildPvDoc(pv);
  doc.save(filename);
}

export async function generatePvPdfBlob(pv: Pv): Promise<{ blob: Blob; filename: string }> {
  const { doc, filename } = await buildPvDoc(pv);
  return { blob: doc.output("blob") as Blob, filename };
}
