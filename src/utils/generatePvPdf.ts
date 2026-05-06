// src/utils/generatePvPdf.ts
import jsPDF from "jspdf";
import type { Pv, ConformiteValue } from "../types";
import { AGENCES, ETABLISSEMENTS } from "../data/referentiel";
import smacLogoUrl from "../assets/SmacLogo.png";

// ─────────────────────────────────────────────────────────────────────────────
// UTILITAIRES
// ─────────────────────────────────────────────────────────────────────────────

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

const fmtDate = (iso?: string, short = false) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", short
      ? { day: "2-digit", month: "2-digit", year: "numeric" }
      : { day: "2-digit", month: "long", year: "numeric" });
  } catch { return iso; }
};

const imgFmt = (url: string): "PNG" | "JPEG" =>
  url.startsWith("data:image/png") ? "PNG" : "JPEG";

// ─────────────────────────────────────────────────────────────────────────────
// PALETTE & CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────

const W  = 210;           // largeur A4 mm
const H  = 297;           // hauteur A4 mm
const ML = 14;            // marge gauche/droite
const CW = W - ML * 2;   // largeur contenu

type RGB = [number, number, number];
const RED:    RGB = [200,  16,  46];
const DARK:   RGB = [ 28,  28,  35];
const MID:    RGB = [ 80,  80,  90];
const GRAY:   RGB = [130, 130, 140];
const LGRAY:  RGB = [247, 248, 250];
const LLGRAY: RGB = [252, 253, 254];
const WHITE:  RGB = [255, 255, 255];
const GREEN:  RGB = [ 22, 163,  74];
const BORDER: RGB = [214, 216, 222];

// ─────────────────────────────────────────────────────────────────────────────
// CURSEUR VERTICAL
// ─────────────────────────────────────────────────────────────────────────────

class Cursor {
  y: number; doc: jsPDF;
  constructor(doc: jsPDF, startY = ML) { this.doc = doc; this.y = startY; }
  nl(h = 6) { this.y += h; }
  /** Ajoute une nouvelle page si l'espace manque */
  check(needed = 30) {
    if (this.y + needed > H - ML - 16) {
      this.doc.addPage();
      // Répéter le bandeau de page
      this.doc.setFillColor(...LGRAY);
      this.doc.rect(0, 0, W, 8, "F");
      this.y = 14;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EN-TÊTE DU DOCUMENT
// ─────────────────────────────────────────────────────────────────────────────

function drawHeader(doc: jsPDF, pv: Pv, logoBase64: string) {
  // Fond blanc
  doc.setFillColor(...WHITE);
  doc.rect(0, 0, W, 36, "F");

  // Logo sans fond (gauche)
  try {
    doc.addImage(logoBase64, "PNG", ML, 7, 30, 22);
  } catch {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...DARK);
    doc.text("SMAC", ML + 15, 20, { align: "center" });
  }

  // Titre principal (centré, sombre)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...DARK);
  doc.text("PROCÈS-VERBAL DE RÉCEPTION", W / 2, 14, { align: "center" });

  // Sous-titre rouge
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...RED);
  doc.text("DE SUPPORT BÉTON – ÉTANCHÉITÉ", W / 2, 22, { align: "center" });

  // Infos droite
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GRAY);
  doc.text(`RÉF : ${pv.id}`,                  W - ML, 11, { align: "right" });
  doc.text(`Date : ${fmtDate(pv.createdAt)}`,  W - ML, 18, { align: "right" });

  // Ligne rouge séparatrice
  doc.setFillColor(...RED);
  doc.rect(0, 36, W, 1.2, "F");
}

// ─────────────────────────────────────────────────────────────────────────────
// TITRE DE SECTION
// ─────────────────────────────────────────────────────────────────────────────

function secTitle(doc: jsPDF, cur: Cursor, label: string, note?: string) {
  cur.check(22);
  cur.nl(6);

  // Tiret rouge
  doc.setFillColor(...RED);
  doc.rect(ML, cur.y + 2.5, 7, 2, "F");

  // Texte
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  doc.text(label.toUpperCase(), ML + 11, cur.y + 5);

  // Note droite (ex: "*Conformité selon DTU 43.1")
  if (note) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(6.5);
    doc.setTextColor(...GRAY);
    doc.text(note, W - ML, cur.y + 5, { align: "right" });
  }

  // Ligne de séparation fine
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.3);
  doc.line(ML, cur.y + 8, W - ML, cur.y + 8);

  cur.nl(12);
}

// ─────────────────────────────────────────────────────────────────────────────
// FICHE INFORMATIONS GÉNÉRALES
// ─────────────────────────────────────────────────────────────────────────────

type Cell = { label: string; value: string; full?: boolean };

function infoGrid(doc: jsPDF, cur: Cursor, cells: Cell[]) {
  // Organise en lignes (2 col sauf si full)
  const rows: Cell[][] = [];
  let i = 0;
  while (i < cells.length) {
    if (cells[i].full) { rows.push([cells[i]]); i++; }
    else if (i + 1 < cells.length && !cells[i + 1].full) { rows.push([cells[i], cells[i + 1]]); i += 2; }
    else { rows.push([cells[i]]); i++; }
  }

  const ROW_H  = 14;
  const PAD_V  = 8;
  const TOTAL  = rows.length * ROW_H + PAD_V * 2;

  cur.check(TOTAL + 6);

  // Fond + bordure de la carte
  doc.setFillColor(...LGRAY);
  doc.roundedRect(ML, cur.y, CW, TOTAL, 3, 3, "F");
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.25);
  doc.roundedRect(ML, cur.y, CW, TOTAL, 3, 3, "S");

  let ry = cur.y + PAD_V;

  rows.forEach((row, ri) => {
    const colW = CW / row.length;
    row.forEach((cell, ci) => {
      const x   = ML + 8 + ci * colW;
      const maxW = colW - 16;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(...GRAY);
      doc.text(cell.label.toUpperCase(), x, ry + 4);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(...DARK);
      const lines = doc.splitTextToSize(cell.value || "—", maxW) as string[];
      doc.text(lines[0], x, ry + 10.5);
    });

    // Séparateur horizontal (sauf dernière ligne)
    if (ri < rows.length - 1) {
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.15);
      doc.line(ML + 4, ry + ROW_H, ML + CW - 4, ry + ROW_H);
    }

    ry += ROW_H;
  });

  cur.nl(TOTAL + 6);
}

// ─────────────────────────────────────────────────────────────────────────────
// BADGE NATURE DES TRAVAUX
// ─────────────────────────────────────────────────────────────────────────────

function natureTravauxBadge(doc: jsPDF, cur: Cursor, value: string) {
  cur.check(16);

  const label = value === "etancheite-beton" ? "Étanchéité sur béton" : "Autre support";

  // Fond carte
  doc.setFillColor(...LGRAY);
  doc.roundedRect(ML, cur.y, CW, 12, 2, 2, "F");
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.2);
  doc.roundedRect(ML, cur.y, CW, 12, 2, 2, "S");

  // Label gauche
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text("TYPE DE SUPPORT", ML + 8, cur.y + 5);

  // Badge rouge droite
  const BW = 52;
  doc.setFillColor(...RED);
  doc.roundedRect(ML + CW - BW - 6, cur.y + 2, BW, 8, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...WHITE);
  doc.text(label, ML + CW - BW / 2 - 6, cur.y + 7.2, { align: "center" });

  cur.nl(16);
}

// ─────────────────────────────────────────────────────────────────────────────
// TABLEAU CONFORMITÉ
// ─────────────────────────────────────────────────────────────────────────────

function conformiteTable(doc: jsPDF, cur: Cursor, rows: { label: string; value?: ConformiteValue }[]) {
  const ROW_H      = 9.5;
  const HEAD_H     = 8;
  const TOTAL      = HEAD_H + rows.length * ROW_H;
  const BADGE_COL  = 40;              // largeur colonne résultat
  const LBL_W      = CW - BADGE_COL;
  const SEP_X      = ML + LBL_W;

  cur.check(TOTAL + 8);

  // Bordure globale
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.25);
  doc.roundedRect(ML, cur.y, CW, TOTAL, 2, 2, "S");

  // Header
  doc.setFillColor(234, 236, 240);
  doc.roundedRect(ML, cur.y, CW, HEAD_H + 2, 2, 2, "F");
  doc.rect(ML, cur.y + 4, CW, HEAD_H - 2, "F");

  // Séparateur vertical
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.2);
  doc.line(SEP_X, cur.y + 2, SEP_X, cur.y + TOTAL);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(...MID);
  doc.text("ÉLÉMENT DE CONTRÔLE", ML + 5, cur.y + 5.5);
  doc.text("RÉSULTAT", SEP_X + BADGE_COL / 2, cur.y + 5.5, { align: "center" });

  let ry = cur.y + HEAD_H;

  rows.forEach((row, i) => {
    if (i % 2 === 1) {
      doc.setFillColor(...LGRAY);
      doc.rect(ML, ry, CW, ROW_H, "F");
    }

    // Label
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    const llines = doc.splitTextToSize(row.label, LBL_W - 10) as string[];
    doc.text(llines[0], ML + 5, ry + ROW_H / 2 + 2.5);

    // Badge résultat
    const isConforme    = row.value === "conforme";
    const isNonConforme = row.value === "non-conforme";
    const badgeText:  string = isConforme ? "Conforme" : isNonConforme ? "Non conforme" : "S/O";
    const badgeColor: RGB    = isConforme ? GREEN : isNonConforme ? RED : GRAY;
    const BADGE_W = 32;
    const bx = SEP_X + (BADGE_COL - BADGE_W) / 2;
    const by = ry + (ROW_H - 6) / 2;

    doc.setFillColor(...badgeColor);
    doc.roundedRect(bx, by, BADGE_W, 6, 1.5, 1.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(...WHITE);
    doc.text(badgeText, bx + BADGE_W / 2, by + 4.2, { align: "center" });

    if (i < rows.length - 1) {
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.15);
      doc.line(ML, ry + ROW_H, ML + CW, ry + ROW_H);
    }
    ry += ROW_H;
  });

  cur.nl(TOTAL + 6);
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOC OBSERVATIONS
// ─────────────────────────────────────────────────────────────────────────────

function observationsBlock(doc: jsPDF, cur: Cursor, text: string) {
  const lines  = doc.splitTextToSize(text, CW - 16) as string[];
  const blockH = lines.length * 4.8 + 14;
  cur.check(blockH + 6);

  doc.setFillColor(...LGRAY);
  doc.roundedRect(ML, cur.y, CW, blockH, 2, 2, "F");
  doc.setDrawColor(RED[0], RED[1], RED[2]);
  doc.setLineWidth(2.5);
  doc.line(ML + 1.25, cur.y + 4, ML + 1.25, cur.y + blockH - 4);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  doc.text("OBSERVATIONS", ML + 8, cur.y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...DARK);
  doc.text(lines, ML + 8, cur.y + 12);

  cur.nl(blockH + 5);
}

// ─────────────────────────────────────────────────────────────────────────────
// CARTE RÉSERVE
// ─────────────────────────────────────────────────────────────────────────────

function reserveCard(
  doc: jsPDF, cur: Cursor,
  reserve: { localisation?: string; detail: string; photos: { url: string }[] },
  index: number,
) {
  const HAS_PHOTO  = reserve.photos.length > 0;
  const PHOTO_W    = HAS_PHOTO ? 40 : 0;
  const PHOTO_H    = 32;
  const TEXT_W     = CW - PHOTO_W - (HAS_PHOTO ? 16 : 10);
  const descLines  = doc.splitTextToSize(reserve.detail || "—", TEXT_W) as string[];
  const innerH     = Math.max(HAS_PHOTO ? PHOTO_H + 2 : 0, 8 + 7 + descLines.length * 4.5 + 6);
  const CARD_H     = innerH + 12;

  cur.check(CARD_H + 6);

  // Fond carte
  doc.setFillColor(...LLGRAY);
  doc.roundedRect(ML, cur.y, CW, CARD_H, 3, 3, "F");
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.25);
  doc.roundedRect(ML, cur.y, CW, CARD_H, 3, 3, "S");

  // Barre rouge gauche
  doc.setFillColor(...RED);
  doc.roundedRect(ML, cur.y, 4, CARD_H, 2, 2, "F");
  doc.rect(ML + 2, cur.y, 2, CARD_H, "F");

  // Photo (si présente)
  if (HAS_PHOTO) {
    const py = cur.y + (CARD_H - PHOTO_H) / 2;
    try {
      doc.addImage(reserve.photos[0].url, imgFmt(reserve.photos[0].url), ML + 8, py, PHOTO_W, PHOTO_H);
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.2);
      doc.rect(ML + 8, py, PHOTO_W, PHOTO_H);
    } catch { /* silencieux */ }
  }

  const TX = ML + 8 + (HAS_PHOTO ? PHOTO_W + 5 : 0);
  let   TY = cur.y + 8;

  // Badge "RÉSERVE #01"
  const BADGE_LABEL = `RÉSERVE #${String(index + 1).padStart(2, "0")}`;
  const BADGE_W     = 28;
  doc.setFillColor(...RED);
  doc.roundedRect(TX, TY - 4, BADGE_W, 6.5, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.5);
  doc.setTextColor(...WHITE);
  doc.text(BADGE_LABEL, TX + BADGE_W / 2, TY + 0.8, { align: "center" });

  // Zone (droite)
  if (reserve.localisation) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...MID);
    doc.text(`Zone : ${reserve.localisation}`, ML + CW - 4, TY + 0.8, { align: "right" });
  }

  TY += 9;

  // Détail
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...DARK);
  doc.text(descLines, TX, TY);

  // Photos supplémentaires (miniatures)
  if (reserve.photos.length > 1) {
    TY += descLines.length * 4.5 + 3;
    let px = TX;
    reserve.photos.slice(1, 4).forEach((ph) => {
      cur.check(18);
      try {
        doc.addImage(ph.url, imgFmt(ph.url), px, TY, 20, 16);
        doc.setDrawColor(...BORDER);
        doc.setLineWidth(0.15);
        doc.rect(px, TY, 20, 16);
      } catch { /* silencieux */ }
      px += 22;
    });
  }

  cur.nl(CARD_H + 4);
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION SIGNATURES (SMAC + participants en grille 2 col)
// ─────────────────────────────────────────────────────────────────────────────

interface SignatoryBlock {
  header:     string;                            // ex: "SMAC" | "PARTICIPANT 1"
  rows:       { label: string; value: string }[];// champs texte avec leur libellé exact
  sigLabel:   string;                            // ex: "Signature SMAC" | "Signature"
  signature?: string;
}

function signaturesGrid(doc: jsPDF, cur: Cursor, blocks: SignatoryBlock[]) {
  const COL_W2    = (CW - 8) / 2;
  const SIG_H     = 22;
  const HEAD_H    = 8;
  const ROW_H     = 11;   // hauteur par champ texte (label + valeur)
  const SIG_LBL_H = 5;

  // Hauteur uniforme basée sur le bloc le plus chargé en champs
  const maxRows = Math.max(...blocks.map((b) => b.rows.length), 1);
  const BLK_H   = HEAD_H + maxRows * ROW_H + SIG_LBL_H + SIG_H + 8;

  for (let i = 0; i < blocks.length; i += 2) {
    cur.check(BLK_H + 6);

    [blocks[i], blocks[i + 1]].forEach((blk, ci) => {
      if (!blk) return;
      const x = ML + ci * (COL_W2 + 8);

      // En-tête (fond gris)
      doc.setFillColor(...LGRAY);
      doc.roundedRect(x, cur.y, COL_W2, HEAD_H, 1.5, 1.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(...MID);
      doc.text(blk.header.toUpperCase(), x + 4, cur.y + 5.5);

      // Champs texte avec libellés exacts du formulaire
      let ty = cur.y + HEAD_H + 4;
      blk.rows.forEach((row) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.setTextColor(...GRAY);
        doc.text(row.label.toUpperCase(), x, ty);

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...DARK);
        doc.text(row.value || "—", x, ty + 6);

        ty += ROW_H;
      });

      // Libellé signature (aligné sous le dernier champ texte de la carte la plus haute)
      const sigLabelY = cur.y + HEAD_H + maxRows * ROW_H + 4;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6.5);
      doc.setTextColor(...GRAY);
      doc.text(blk.sigLabel.toUpperCase(), x, sigLabelY);

      // Boîte signature
      const BY = sigLabelY + SIG_LBL_H;
      doc.setFillColor(...LLGRAY);
      doc.roundedRect(x, BY, COL_W2, SIG_H, 2, 2, "F");
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, BY, COL_W2, SIG_H, 2, 2, "S");

      if (blk.signature) {
        try {
          doc.addImage(blk.signature, imgFmt(blk.signature), x + 2, BY + 1, COL_W2 - 4, SIG_H - 2);
        } catch { /* silencieux */ }
      } else {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(7);
        doc.setTextColor(...RED);
        doc.text("BON POUR ACCORD", x + COL_W2 / 2, BY + SIG_H / 2 + 2, { align: "center" });
      }

      // Légende
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.setTextColor(...GRAY);
      doc.text("Signature Numérique Certifiée", x + COL_W2 / 2, BY + SIG_H + 4, { align: "center" });
    });

    cur.nl(BLK_H + 6);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOC RÉCEPTION / CONFORMITÉ / EMAIL
// ─────────────────────────────────────────────────────────────────────────────

function receptionBlock(doc: jsPDF, cur: Cursor, pv: Pv) {
  const rows: { label: string; value: string; badge?: boolean; badgeOk?: boolean }[] = [];

  rows.push({
    label:   "Réception acceptée",
    value:   pv.step5?.receptionAcceptee ? "OUI" : "NON",
    badge:   true,
    badgeOk: !!pv.step5?.receptionAcceptee,
  });
  if (pv.step5?.miseEnConformiteLe)
    rows.push({ label: "Mise en conformité le", value: fmtDate(pv.step5.miseEnConformiteLe) });

  const ROW_H = 9;
  const TOTAL = rows.length * ROW_H + 6;
  cur.check(TOTAL + 6);

  doc.setFillColor(...LGRAY);
  doc.roundedRect(ML, cur.y, CW, TOTAL, 2, 2, "F");
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.2);
  doc.roundedRect(ML, cur.y, CW, TOTAL, 2, 2, "S");

  let ry = cur.y + 4;

  rows.forEach((row, i) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...DARK);
    doc.text(row.label, ML + 6, ry + 6);

    if (row.badge) {
      const color: RGB = row.badgeOk ? GREEN : RED;
      const BW = row.value.length * 2.2 + 8;
      doc.setFillColor(...color);
      doc.roundedRect(ML + CW - BW - 6, ry + 0.5, BW, 7, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(...WHITE);
      doc.text(row.value, ML + CW - BW / 2 - 6, ry + 5.5, { align: "center" });
    } else {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...DARK);
      doc.text(row.value, ML + CW - 6, ry + 6, { align: "right" });
    }

    if (i < rows.length - 1) {
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.15);
      doc.line(ML + 3, ry + ROW_H, ML + CW - 3, ry + ROW_H);
    }
    ry += ROW_H;
  });

  cur.nl(TOTAL + 5);
}

// ─────────────────────────────────────────────────────────────────────────────
// PIED DE PAGE SUR TOUTES LES PAGES
// ─────────────────────────────────────────────────────────────────────────────

function drawFooters(doc: jsPDF, pv: Pv) {
  const total = doc.getNumberOfPages();
  const year  = new Date().getFullYear();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);

    // Ligne fine
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.35);
    doc.line(ML, H - 16, W - ML, H - 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...GRAY);
    doc.text(
      `© SMAC ${year}  ·  100-110 Boulevard du Midi, 92000 Nanterre  ·  Document confidentiel`,
      ML, H - 10,
    );
    doc.setFont("helvetica", "bold");
    doc.text(
      `PAGE ${p} / ${total}`,
      W - ML, H - 10, { align: "right" },
    );
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(180, 180, 190);
    doc.text(pv.id, W / 2, H - 10, { align: "center" });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTRUCTION DU DOCUMENT
// ─────────────────────────────────────────────────────────────────────────────

async function buildPvDoc(pv: Pv): Promise<{ doc: jsPDF; filename: string }> {
  const logoBase64    = await fetchBase64(smacLogoUrl).catch(() => "");
  const doc           = new jsPDF({ unit: "mm", format: "a4" });
  const cur           = new Cursor(doc, 40);
  const agence        = AGENCES.find((a) => a.id === pv.step1?.agenceId);
  const etablissement = ETABLISSEMENTS.find((e) => e.id === pv.step1?.etablissementId);

  // ── EN-TÊTE ──────────────────────────────────────────────────────────────
  drawHeader(doc, pv, logoBase64);

  // ── 1. INFORMATIONS GÉNÉRALES ─────────────────────────────────────────────
  secTitle(doc, cur, "Informations générales");

  const infoCells: Cell[] = [
    { label: "Agence",              value: agence?.nom ?? "—" },
    { label: "Établissement",       value: etablissement?.nom ?? "—" },
    { label: "Chantier / Projet",   value: pv.step1?.chantier ?? "—",              full: true },
    { label: "Zone de contrôle",    value: pv.step1?.zoneBatiment ?? "—" },
    { label: "Date d'inspection",   value: fmtDate(pv.step1?.dateInspection) },
    { label: "Responsable de site", value: pv.step1?.responsableChantier ?? "—",   full: true },
    { label: "Référence PV",        value: pv.id },
    { label: "Date de création",    value: fmtDate(pv.createdAt) },
  ];
  if (pv.step1?.planReperage)
    infoCells.push({ label: "Plan de repérage", value: pv.step1.planReperage === "oui" ? "Oui" : "Non" });

  infoGrid(doc, cur, infoCells);

  // ── 2. NATURE DES TRAVAUX ─────────────────────────────────────────────────
  if (pv.step2?.natureTravaux) {
    secTitle(doc, cur, "Nature des travaux");
    natureTravauxBadge(doc, cur, pv.step2.natureTravaux);
  }

  // ── 3. ÉTAT DE SURFACE ────────────────────────────────────────────────────
  if (pv.step2?.etatSurface) {
    secTitle(doc, cur, "État de surface & partie courante");
    conformiteTable(doc, cur, [
      { label: "Régularité du support (absence de flèches)", value: pv.step2.etatSurface.regulariteSupport },
      { label: "Propreté et absence de corps étrangers",     value: pv.step2.etatSurface.propreteSupport   },
      { label: "Pente vers les évacuations",                 value: pv.step2.etatSurface.pente              },
    ]);
  }

  // ── 4. RELEVÉS & POINTS SINGULIERS ────────────────────────────────────────
  if (pv.step2?.supportReleves) {
    const sr = pv.step2.supportReleves;
    secTitle(doc, cur, "Relevés & points singuliers");
    conformiteTable(doc, cur, [
      { label: "Hauteur engravure",                  value: sr.hauteurEngravure          },
      { label: "Profondeur engravure",               value: sr.profondeurEngravure        },
      { label: "Protection de la tête des relevés",  value: sr.protectionTeteReleves      },
      { label: "Propreté du support des relevés",    value: sr.propreteSupportReleves     },
      { label: "Trémie / lanterneau",                value: sr.tremiesLanterneaux         },
      { label: "Eau pluviale",                       value: sr.eauxPluviales              },
      { label: "Ventilation",                        value: sr.ventilation                },
      { label: "Trop-plein",                         value: sr.tropPleins                 },
      { label: "Joint de dilatation",                value: sr.jointsDialatation          },
    ]);

    if (sr.autresEcartsObservations) {
      observationsBlock(doc, cur, sr.autresEcartsObservations);
    }
  }

  // ── 5. ÉTAT DES RÉSERVES ──────────────────────────────────────────────────
  const reserves = pv.step1?.reserves ?? [];
  if (reserves.length > 0) {
    secTitle(doc, cur, `État des réserves  (${reserves.length} / 8)`);
    reserves.forEach((r, i) => reserveCard(doc, cur, r, i));
  }

  // ── 6. SIGNATURES ─────────────────────────────────────────────────────────
  const hasSmac      = !!(pv.step5?.nomSmac);
  const participants = pv.step5?.participants ?? [];

  if (hasSmac || participants.length > 0) {
    secTitle(doc, cur, "Signatures");

    const blocks: SignatoryBlock[] = [];

    if (hasSmac) {
      blocks.push({
        header:    "SMAC",
        rows:      [{ label: "Noms SMAC", value: pv.step5!.nomSmac }],
        sigLabel:  "Signature SMAC",
        signature: pv.step5!.signatureSmac,
      });
    }

    participants.forEach((p, i) => {
      const rows: SignatoryBlock["rows"] = [];
      if (p.titre) rows.push({ label: "Titre",               value: p.titre });
      rows.push(    { label: "Nom du participant", value: p.nom   });
      blocks.push({
        header:    `Participant ${i + 1}`,
        rows,
        sigLabel:  "Signature",
        signature: p.signature,
      });
    });

    signaturesGrid(doc, cur, blocks);
  }

  // ── 7. RÉCEPTION & CLÔTURE ────────────────────────────────────────────────
  secTitle(doc, cur, "Réception & clôture du procès-verbal");
  receptionBlock(doc, cur, pv);

  // ── PIEDS DE PAGE ─────────────────────────────────────────────────────────
  drawFooters(doc, pv);

  const filename = `PV_${pv.id}_${(pv.step1?.chantier ?? "SMAC").replace(/\s+/g, "_")}.pdf`;
  return { doc, filename };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export async function generatePvPdf(pv: Pv): Promise<void> {
  const { doc } = await buildPvDoc(pv);
  const url = doc.output("bloburl") as unknown as string;
  window.open(url, "_blank");
}

export async function generatePvPdfBlob(pv: Pv): Promise<{ blob: Blob; filename: string }> {
  const { doc, filename } = await buildPvDoc(pv);
  return { blob: doc.output("blob") as Blob, filename };
}
