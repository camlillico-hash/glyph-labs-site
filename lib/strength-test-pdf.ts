import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

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

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 44;

const SECTION_COLORS: Record<string, ReturnType<typeof rgb>> = {
  Business: rgb(0.93, 0.49, 0.19),
  Brand: rgb(0.23, 0.64, 0.94),
  Team: rgb(0.52, 0.67, 0.17),
  Strategy: rgb(0.59, 0.33, 0.78),
  Execution: rgb(0.07, 0.73, 0.74),
  Culture: rgb(0.95, 0.62, 0.16),
};

function wrapText(text: string, maxChars = 95) {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const next = current ? `${current} ${w}` : w;
    if (next.length > maxChars) {
      if (current) lines.push(current);
      current = w;
    } else current = next;
  }
  if (current) lines.push(current);
  return lines;
}

function scoreColor(score: number) {
  if (score <= 50) return rgb(0.88, 0.16, 0.26); // rose
  if (score <= 84) return rgb(0.96, 0.62, 0.14); // amber
  return rgb(0.45, 0.70, 0.16); // green
}

function drawFooter(page: any, font: any) {
  page.drawText("Prepared by Cam Lillico Coaching", { x: MARGIN, y: 22, size: 9.5, font, color: rgb(0.4, 0.4, 0.45) });
  page.drawText("camlillico.com", { x: PAGE_W - MARGIN - 75, y: 22, size: 9.5, font, color: rgb(0.4, 0.4, 0.45) });
}

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutSlicePath(cx: number, cy: number, rOuter: number, rInner: number, startDeg: number, endDeg: number) {
  const startOuter = polar(cx, cy, rOuter, startDeg);
  const endOuter = polar(cx, cy, rOuter, endDeg);
  const startInner = polar(cx, cy, rInner, startDeg);
  const endInner = polar(cx, cy, rInner, endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;

  return `M ${startOuter.x} ${startOuter.y} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y} L ${endInner.x} ${endInner.y} A ${rInner} ${rInner} 0 ${largeArc} 0 ${startInner.x} ${startInner.y} Z`;
}

export async function buildStrengthTestPdf(input: SubmissionPdfInput): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  // PAGE 1 — branded summary
  const page1 = pdf.addPage([PAGE_W, PAGE_H]);

  page1.drawRectangle({ x: 0, y: PAGE_H - 96, width: PAGE_W, height: 96, color: rgb(0.03, 0.06, 0.10) });

  let brandTextX = MARGIN;
  try {
    const logoPath = path.join(process.cwd(), "public", "logos", "glyphlabs-coaching-mark.png");
    const logoBytes = await readFile(logoPath);
    const logo = await pdf.embedPng(logoBytes);
    const logoHeight = 20;
    const logoWidth = (logo.width / logo.height) * logoHeight;
    const logoY = PAGE_H - 44;
    page1.drawImage(logo, { x: MARGIN, y: logoY, width: logoWidth, height: logoHeight });
    brandTextX = MARGIN + logoWidth + 10;
  } catch {
    // non-fatal if logo is unavailable
  }

  page1.drawText("Cam Lillico Business Coaching", { x: brandTextX, y: PAGE_H - 38, size: 12, font: bold, color: rgb(1, 1, 1) });
  page1.drawText("BOS360™ Strength Test Report", { x: MARGIN, y: PAGE_H - 66, size: 22, font: bold, color: rgb(1, 1, 1) });

  let y = PAGE_H - 130;

  page1.drawRectangle({ x: MARGIN, y: y - 72, width: PAGE_W - MARGIN * 2, height: 72, color: rgb(0.95, 0.97, 1) });
  page1.drawText(`Name: ${input.name}`, { x: MARGIN + 12, y: y - 24, size: 11, font: bold, color: rgb(0.1, 0.1, 0.12) });
  page1.drawText(`Company: ${input.company || "—"}`, { x: MARGIN + 12, y: y - 40, size: 10.5, font, color: rgb(0.2, 0.2, 0.25) });
  page1.drawText(`Email: ${input.email || "—"}`, { x: MARGIN + 12, y: y - 55, size: 10.5, font, color: rgb(0.2, 0.2, 0.25) });
  page1.drawText(`Submitted: ${new Date(input.submittedAt).toLocaleString("en-CA", { timeZone: "UTC" })} UTC`, {
    x: PAGE_W - MARGIN - 250,
    y: y - 24,
    size: 10,
    font,
    color: rgb(0.2, 0.2, 0.25),
  });
  if (input.phone) {
    page1.drawText(`Phone: ${input.phone}`, { x: PAGE_W - MARGIN - 250, y: y - 40, size: 10.5, font, color: rgb(0.2, 0.2, 0.25) });
  }

  y -= 98;

  page1.drawRectangle({ x: MARGIN, y: y - 84, width: PAGE_W - MARGIN * 2, height: 84, color: rgb(0.07, 0.10, 0.16) });
  page1.drawText("Overall Rating", { x: MARGIN + 12, y: y - 22, size: 11, font, color: rgb(0.72, 0.79, 0.89) });
  page1.drawText(`${input.overallScore}%  (${input.overallLabel})`, {
    x: MARGIN + 12,
    y: y - 54,
    size: 26,
    font: bold,
    color: scoreColor(input.overallScore),
  });

  y -= 108;
  page1.drawText("Section Scores", { x: MARGIN, y, size: 14, font: bold, color: rgb(0.1, 0.1, 0.12) });

  const entries = Object.entries(input.sectionScores);
  const total = entries.reduce((sum, [, val]) => sum + Number(val || 0), 0) || 1;
  const cx = PAGE_W - MARGIN - 96;
  const cy = y - 66;
  const rOuter = 54;
  const rInner = 30;

  let angle = -90;
  for (const [section, rawScore] of entries) {
    const score = Number(rawScore || 0);
    const sweep = (score / total) * 360;
    const path = donutSlicePath(cx, cy, rOuter, rInner, angle, angle + sweep);
    page1.drawSvgPath(path, { color: SECTION_COLORS[section] || rgb(0.6, 0.6, 0.7), borderColor: rgb(1, 1, 1), borderWidth: 0.6 });
    angle += sweep;
  }

  page1.drawText("Legend", { x: MARGIN, y: y - 20, size: 10.5, font: bold, color: rgb(0.2, 0.2, 0.25) });
  let ly = y - 36;
  for (const [section, score] of entries) {
    const max = input.sectionMax[section] || 0;
    const pct = max ? Math.round((Number(score) / max) * 100) : 0;
    const c = SECTION_COLORS[section] || rgb(0.6, 0.6, 0.7);
    page1.drawCircle({ x: MARGIN + 4, y: ly + 3, size: 3.5, color: c });
    page1.drawText(section, { x: MARGIN + 14, y: ly, size: 10.2, font: bold, color: rgb(0.15, 0.15, 0.2) });
    page1.drawText(`${score}/${max} (${pct}%)`, { x: MARGIN + 120, y: ly, size: 10.2, font, color: rgb(0.15, 0.15, 0.2) });
    ly -= 17;
  }

  drawFooter(page1, font);

  // PAGE 2+ — detailed Q&A
  let page = pdf.addPage([PAGE_W, PAGE_H]);
  drawFooter(page, font);
  let qy = PAGE_H - MARGIN;
  page.drawText("Question-by-Question Responses", { x: MARGIN, y: qy, size: 18, font: bold, color: rgb(0.1, 0.1, 0.12) });
  qy -= 26;

  for (const a of input.answers) {
    const lines = wrapText(a.questionText, 88);
    const blockHeight = 18 + lines.length * 13 + 18;

    if (qy < MARGIN + blockHeight) {
      page = pdf.addPage([PAGE_W, PAGE_H]);
      drawFooter(page, font);
      qy = PAGE_H - MARGIN;
      page.drawText("Question-by-Question Responses (cont.)", { x: MARGIN, y: qy, size: 14, font: bold, color: rgb(0.1, 0.1, 0.12) });
      qy -= 22;
    }

    page.drawRectangle({ x: MARGIN, y: qy - blockHeight + 6, width: PAGE_W - MARGIN * 2, height: blockHeight, color: rgb(0.98, 0.98, 0.99) });
    page.drawText(`${a.questionId}. ${a.section}`, { x: MARGIN + 10, y: qy - 12, size: 10.5, font: bold, color: rgb(0.18, 0.18, 0.24) });
    let ly = qy - 26;
    for (const line of lines) {
      page.drawText(line, { x: MARGIN + 10, y: ly, size: 10.5, font, color: rgb(0.15, 0.15, 0.2) });
      ly -= 13;
    }
    page.drawText(`Score: ${a.score}/5`, { x: MARGIN + 10, y: ly - 2, size: 10.5, font: bold, color: scoreColor(Math.round((a.score / 5) * 100)) });

    qy -= blockHeight + 10;
  }

  return await pdf.save();
}
