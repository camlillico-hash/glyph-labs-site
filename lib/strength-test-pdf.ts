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
const MARGIN = 48;
const LINE = 16;

function drawLine(page: any, font: any, text: string, x: number, y: number, size = 11) {
  page.drawText(text, { x, y, size, font, color: rgb(0.08, 0.08, 0.08) });
}

function wrapText(text: string, maxChars = 95) {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const next = current ? `${current} ${w}` : w;
    if (next.length > maxChars) {
      if (current) lines.push(current);
      current = w;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function buildStrengthTestPdf(input: SubmissionPdfInput): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const page1 = pdf.addPage([PAGE_W, PAGE_H]);
  let y = PAGE_H - MARGIN;

  drawLine(page1, bold, "BOS360 Strength Test Results", MARGIN, y, 20);
  y -= 28;
  drawLine(page1, font, `Submitted: ${new Date(input.submittedAt).toLocaleString("en-CA", { timeZone: "UTC" })} UTC`, MARGIN, y);
  y -= LINE;
  drawLine(page1, font, `Name: ${input.name}`, MARGIN, y);
  y -= LINE;
  drawLine(page1, font, `Company: ${input.company}`, MARGIN, y);
  y -= LINE;
  drawLine(page1, font, `Email: ${input.email}`, MARGIN, y);
  if (input.phone) {
    y -= LINE;
    drawLine(page1, font, `Phone: ${input.phone}`, MARGIN, y);
  }

  y -= 28;
  drawLine(page1, bold, `Overall Score: ${input.overallScore}% (${input.overallLabel})`, MARGIN, y, 15);
  y -= 26;
  drawLine(page1, bold, "Section Scores", MARGIN, y, 12);
  y -= 18;

  for (const [section, score] of Object.entries(input.sectionScores)) {
    const max = input.sectionMax[section] || 0;
    const pct = max > 0 ? Math.round((score / max) * 100) : 0;
    drawLine(page1, font, `• ${section}: ${score}/${max} (${pct}%)`, MARGIN, y);
    y -= LINE;
  }

  y -= 10;
  drawLine(page1, font, "Summary: This page mirrors the high-level results shown to the prospect at completion.", MARGIN, y, 10);

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  y = PAGE_H - MARGIN;
  drawLine(page, bold, "Question-by-Question Responses", MARGIN, y, 18);
  y -= 26;

  for (const a of input.answers) {
    if (y < MARGIN + 80) {
      page = pdf.addPage([PAGE_W, PAGE_H]);
      y = PAGE_H - MARGIN;
    }
    drawLine(page, bold, `${a.questionId}. [${a.section}]`, MARGIN, y, 10);
    y -= 14;
    for (const line of wrapText(a.questionText)) {
      drawLine(page, font, line, MARGIN, y, 11);
      y -= 14;
    }
    drawLine(page, font, `Score: ${a.score}/5`, MARGIN, y, 11);
    y -= 18;
  }

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}
