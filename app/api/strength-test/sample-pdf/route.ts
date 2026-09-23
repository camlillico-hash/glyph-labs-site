import { buildStrengthTestPdf } from "@/lib/strength-test-pdf";
import { questions } from "@/app/strength-test/questions";
import { scoreLabel, sectionMax, strengthSections } from "@/lib/strength-test-score";

const sampleScores = [5, 5, 4, 4, 2, 2, 2, 4, 4, 3, 3, 2, 2, 4, 4, 3, 3, 5, 5, 4];
const sampleAnswers = questions.map((question, index) => ({
  questionId: question.id,
  section: question.section,
  questionText: question.text,
  score: sampleScores[index],
}));
const sampleSectionScores = Object.fromEntries(
  strengthSections.map((section) => [
    section,
    sampleAnswers.filter((answer) => answer.section === section).reduce((sum, answer) => sum + answer.score, 0),
  ]),
);

export async function GET() {
  const totalRaw = Object.values(sampleSectionScores).reduce((a, b) => a + b, 0);
  const overallScore = Math.round((totalRaw / 100) * 100);
  const overallLabel = scoreLabel(overallScore);

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
