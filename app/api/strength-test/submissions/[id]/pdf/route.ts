import { NextResponse } from "next/server";
import { buildStrengthTestPdf } from "@/lib/strength-test-pdf";
import { getStrengthTestStore } from "@/app/api/strength-test/_lib";

const sectionMax: Record<string, number> = {
  Business: 20,
  Brand: 15,
  Team: 15,
  Strategy: 15,
  Execution: 20,
  Culture: 15,
};

function scoreLabel(total: number) {
  if (total <= 50) return "Weak";
  if (total <= 84) return "Moderate";
  return "Strong";
}

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const { store } = await getStrengthTestStore();
    const submission = (store.strengthTests || []).find((s) => s.id === id);

    if (!submission) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 });
    }

    const contact = (store.contacts || []).find((c) => c.id === submission.contactId);
    const name = `${contact?.firstName || ""} ${contact?.lastName || ""}`.trim() || "Lead";

    const buffer = await buildStrengthTestPdf({
      name,
      company: contact?.company || "",
      email: contact?.email || "",
      phone: contact?.phone || "",
      submittedAt: submission.submittedAt,
      overallScore: submission.overallScore,
      overallLabel: scoreLabel(submission.overallScore),
      sectionScores: submission.sectionScores,
      sectionMax,
      answers: submission.answers,
    });

    const filename = submission.pdfFilename || `strength-test-${submission.id}.pdf`;

    return new Response(buffer as unknown as BodyInit, {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `inline; filename="${filename}"`,
        "cache-control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load PDF" }, { status: 500 });
  }
}
