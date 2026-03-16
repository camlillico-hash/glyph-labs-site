
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

export async function buildStrengthTestPdf(input: SubmissionPdfInput): Promise<Buffer> {
  const pdfkitModule = await import("pdfkit");
  const PDFDocumentCtor = ((pdfkitModule as unknown as { default?: new (opts?: object) => any }).default ||
    (pdfkitModule as unknown as new (opts?: object) => any));

  const doc = new PDFDocumentCtor({ size: "LETTER", margin: 50 });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Uint8Array) => chunks.push(Buffer.from(chunk)));

  doc.fontSize(20).text("BOS360 Strength Test Results", { align: "left" });
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor("#444").text(`Submitted: ${new Date(input.submittedAt).toLocaleString("en-CA", { timeZone: "UTC" })} UTC`);
  doc.text(`Name: ${input.name}`);
  doc.text(`Company: ${input.company}`);
  doc.text(`Email: ${input.email}`);
  if (input.phone) doc.text(`Phone: ${input.phone}`);

  doc.moveDown();
  doc.fillColor("#000").fontSize(16).text(`Overall Score: ${input.overallScore}% (${input.overallLabel})`);
  doc.moveDown(0.5);
  doc.fontSize(12).text("Section Scores", { underline: true });

  for (const [section, score] of Object.entries(input.sectionScores)) {
    const max = input.sectionMax[section] || 0;
    const pct = max > 0 ? Math.round((score / max) * 100) : 0;
    doc.text(`• ${section}: ${score}/${max} (${pct}%)`);
  }

  doc.moveDown();
  doc.fontSize(11).fillColor("#333").text("Summary: This page mirrors the high-level results shown to the prospect at completion.");

  doc.addPage();
  doc.fillColor("#000").fontSize(18).text("Question-by-Question Responses");
  doc.moveDown(0.6);

  for (const a of input.answers) {
    doc.fontSize(10).fillColor("#666").text(`${a.questionId}. [${a.section}]`);
    doc.fontSize(11).fillColor("#000").text(a.questionText);
    doc.fontSize(11).fillColor("#111").text(`Score: ${a.score}/5`);
    doc.moveDown(0.5);
  }

  doc.end();

  return await new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}
