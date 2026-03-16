import { buildStrengthTestPdf } from "@/lib/strength-test-pdf";

const sectionMax: Record<string, number> = {
  Business: 20,
  Brand: 15,
  Team: 15,
  Strategy: 15,
  Execution: 20,
  Culture: 15,
};

const sampleSectionScores: Record<string, number> = {
  Business: 18,
  Brand: 6,
  Team: 11,
  Strategy: 7,
  Execution: 14,
  Culture: 14,
};

const sampleAnswers = Array.from({ length: 20 }).map((_, i) => {
  const id = i + 1;
  const sections = ["Business", "Business", "Business", "Business", "Brand", "Brand", "Brand", "Team", "Team", "Team", "Strategy", "Strategy", "Strategy", "Execution", "Execution", "Execution", "Execution", "Culture", "Culture", "Culture"];
  return {
    questionId: id,
    section: sections[i],
    questionText: `Sample question ${id} for ${sections[i]}.`,
    score: (id % 5) + 1,
  };
});

export async function GET() {
  const totalRaw = Object.values(sampleSectionScores).reduce((a, b) => a + b, 0);
  const overallScore = Math.round((totalRaw / 100) * 100);
  const overallLabel = overallScore <= 50 ? "Weak" : overallScore <= 84 ? "Moderate" : "Strong";

  const buffer = await buildStrengthTestPdf({
    name: "Sample Prospect",
    company: "Sample Co",
    email: "sample@company.com",
    phone: "+1 555 0100",
    submittedAt: new Date().toISOString(),
    overallScore,
    overallLabel,
    sectionScores: sampleSectionScores,
    sectionMax,
    answers: sampleAnswers,
  });

  return new Response(buffer as unknown as BodyInit, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": 'inline; filename="strength-test-sample.pdf"',
      "cache-control": "no-store",
    },
  });
}
