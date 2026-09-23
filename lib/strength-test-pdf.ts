import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { scoreLabel, strengthSections, type StrengthSection } from "@/lib/strength-test-score";

export type SubmissionPdfInput = {
  name: string;
  company: string;
  email: string;
  phone?: string;
  submittedAt: string;
  overallScore: number;
  overallLabel: string;
  sectionScores: Record<string, number>;
  sectionMax: Record<string, number>;
  answers: Array<{
    questionId: number;
    section: string;
    questionText: string;
    score: number;
  }>;
};

const W = 612;
const H = 792;
const M = 46;
const ink = rgb(0.145, 0.153, 0.141);
const muted = rgb(0.37, 0.385, 0.36);
const paper = rgb(0.98, 0.976, 0.965);
const warm = rgb(0.953, 0.937, 0.91);
const line = rgb(0.84, 0.85, 0.82);
const orange = rgb(0.929, 0.49, 0.192);

function linesFor(text: string, font: PDFFont, size: number, width: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? current + " " + word : word;
    if (font.widthOfTextAtSize(candidate, size) > width && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawTextLines(page: PDFPage, lines: string[], x: number, y: number, size: number, font: PDFFont, color = ink, leading = size * 1.5) {
  lines.forEach((text, index) => page.drawText(text, { x, y: y - index * leading, size, font, color }));
}

function drawFooter(page: PDFPage, font: PDFFont, pageNumber: number) {
  page.drawLine({ start: { x: M, y: 45 }, end: { x: W - M, y: 45 }, thickness: 0.7, color: line });
  page.drawText("Cam Lillico  ·  camlillico.com", { x: M, y: 29, size: 8.5, font, color: muted });
  const label = String(pageNumber);
  page.drawText(label, { x: W - M - font.widthOfTextAtSize(label, 8.5), y: 29, size: 8.5, font, color: muted });
}

function percentFor(input: SubmissionPdfInput, section: StrengthSection) {
  const max = Number(input.sectionMax[section] || 0);
  return max ? Math.round((Number(input.sectionScores[section] || 0) / max) * 100) : 0;
}

function drawSectionRow(page: PDFPage, input: SubmissionPdfInput, section: StrengthSection, y: number, font: PDFFont, bold: PDFFont) {
  const percent = percentFor(input, section);
  page.drawText(section, { x: M, y, size: 11, font: bold, color: ink });
  page.drawText(scoreLabel(percent), { x: 258, y: y + 1, size: 9, font, color: muted });
  const score = String(percent) + "%";
  page.drawText(score, { x: W - M - bold.widthOfTextAtSize(score, 11), y, size: 11, font: bold, color: ink });
  page.drawRectangle({ x: M, y: y - 15, width: W - M * 2, height: 6, color: warm });
  page.drawRectangle({ x: M, y: y - 15, width: (W - M * 2) * percent / 100, height: 6, color: orange });
}

export async function buildStrengthTestPdf(input: SubmissionPdfInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const page = pdf.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: paper });

  try {
    const logoBytes = await readFile(path.join(process.cwd(), "public", "bos360-logo-white-bg.png"));
    const logo = await pdf.embedPng(logoBytes);
    page.drawImage(logo, { x: M, y: H - 80, width: 129, height: 32 });
  } catch {
    page.drawText("BOS360", { x: M, y: H - 63, size: 20, font: bold, color: ink });
  }
  page.drawText("CAM LILLICO", { x: W - M - 88, y: H - 62, size: 9, font: bold, color: ink });
  page.drawLine({ start: { x: M, y: H - 91 }, end: { x: W - M, y: H - 91 }, thickness: 0.8, color: line });

  page.drawText("BOS360 STRENGTH TEST", { x: M, y: H - 124, size: 9, font: bold, color: rgb(0.64, 0.28, 0.08) });
  page.drawText("Your results, at a glance", { x: M, y: H - 160, size: 24, font: bold, color: ink });
  const companyLine = input.company ? input.name + "  ·  " + input.company : input.name;
  drawTextLines(page, linesFor(companyLine, font, 10, W - M * 2), M, H - 181, 10, font, muted, 14);
  page.drawText("Submitted " + new Date(input.submittedAt).toLocaleDateString("en-CA", { timeZone: "UTC" }), { x: M, y: H - 198, size: 9, font, color: muted });

  page.drawRectangle({ x: M, y: 455, width: W - M * 2, height: 110, color: warm });
  page.drawText("OVERALL SCORE", { x: M + 18, y: 538, size: 9, font: bold, color: muted });
  page.drawText(String(input.overallScore) + "%", { x: M + 18, y: 485, size: 44, font: bold, color: ink });
  page.drawRectangle({ x: 313, y: 488, width: 1, height: 52, color: line });
  page.drawText(input.overallLabel, { x: 333, y: 520, size: 17, font: bold, color: rgb(0.59, 0.26, 0.05) });
  page.drawText("A starting point for a sharper conversation.", { x: 333, y: 500, size: 9, font, color: muted });

  page.drawText("WHERE YOU STAND", { x: M, y: 425, size: 9, font: bold, color: rgb(0.64, 0.28, 0.08) });
  strengthSections.forEach((section, index) => drawSectionRow(page, input, section, 403 - index * 39, font, bold));

  const ranked = [...strengthSections].sort((a, b) => percentFor(input, b) - percentFor(input, a));
  const strongest = ranked[0];
  const focus = ranked[ranked.length - 1];
  const focusTied = percentFor(input, focus) === percentFor(input, ranked[ranked.length - 2]);
  page.drawLine({ start: { x: M, y: 155 }, end: { x: W - M, y: 155 }, thickness: 0.8, color: line });
  page.drawText("YOUR NEXT CONVERSATION", { x: M, y: 136, size: 9, font: bold, color: rgb(0.64, 0.28, 0.08) });
  page.drawText("Highest-scoring area: " + strongest, { x: M, y: 117, size: 10, font: bold, color: ink });
  if (focus !== strongest) page.drawText((focusTied ? "One lower-scoring area: " : "Lowest-scoring area: ") + focus, { x: M, y: 101, size: 10, font, color: ink });
  page.drawText("Discuss your results with Cam: camlillico.com", { x: M, y: 77, size: 9, font, color: muted });
  drawFooter(page, font, 1);

  let detailPage = pdf.addPage([W, H]);
  let pageNumber = 2;
  let y = H - 65;
  const addDetailHeader = (continued: boolean) => {
    detailPage.drawRectangle({ x: 0, y: 0, width: W, height: H, color: paper });
    detailPage.drawText(continued ? "Your responses (continued)" : "Your responses", { x: M, y: H - 66, size: 21, font: bold, color: ink });
    detailPage.drawText("Each statement was rated from 0 (not in place) to 5 (consistently true).", { x: M, y: H - 84, size: 9, font, color: muted });
    drawFooter(detailPage, font, pageNumber);
    y = H - 115;
  };
  addDetailHeader(false);

  for (const answer of input.answers) {
    const answerLines = linesFor(answer.questionText, font, 10, W - M * 2 - 20);
    const blockHeight = 31 + answerLines.length * 15;
    if (y - blockHeight < 69) {
      detailPage = pdf.addPage([W, H]);
      pageNumber += 1;
      addDetailHeader(true);
    }
    detailPage.drawLine({ start: { x: M, y: y + 8 }, end: { x: W - M, y: y + 8 }, thickness: 0.6, color: line });
    detailPage.drawText(String(answer.questionId).padStart(2, "0") + "  " + answer.section.toUpperCase(), { x: M, y: y - 6, size: 8, font: bold, color: rgb(0.64, 0.28, 0.08) });
    const scoreText = String(answer.score) + " / 5";
    detailPage.drawText(scoreText, { x: W - M - bold.widthOfTextAtSize(scoreText, 9), y: y - 6, size: 9, font: bold, color: ink });
    drawTextLines(detailPage, answerLines, M, y - 23, 10, font, ink, 15);
    y -= blockHeight + 11;
  }

  return await pdf.save();
}
