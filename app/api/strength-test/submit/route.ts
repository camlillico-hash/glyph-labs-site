import { NextResponse } from "next/server";
import { id, now, type StrengthTestAnswer, type StrengthTestSubmission } from "@/lib/crm-store";
import { ensureStrengthTestLead, getStrengthTestStore, saveStrengthTestStore } from "@/app/api/strength-test/_lib";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const firstName = String(body?.firstName || "").trim();
    const lastName = String(body?.lastName || "").trim();
    const company = String(body?.company || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const phone = String(body?.phone || "").trim();
    const overallScore = Number(body?.overallScore || 0);
    const sectionScores = (body?.sectionScores || {}) as Record<string, number>;
    const answers = (Array.isArray(body?.answers) ? body.answers : []) as StrengthTestAnswer[];

    if (!firstName || !lastName || !company || !email || answers.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const timestamp = now();
    const { accountId, store } = await getStrengthTestStore();

    const contact = ensureStrengthTestLead({
      store,
      timestamp,
      firstName,
      lastName,
      company,
      email,
      phone,
    });
    contact.strengthTest = "Yes";
    contact.updatedAt = timestamp;

    const submissionId = id();
    const pdfFilename = `strength-test-${contact.lastName || "lead"}-${submissionId}.pdf`.replace(/\s+/g, "-").toLowerCase();

    const submission: StrengthTestSubmission = {
      id: submissionId,
      contactId: contact.id,
      submittedAt: timestamp,
      overallScore,
      sectionScores,
      answers,
      status: "complete",
      pdfFilename,
    };

    store.strengthTests = [submission, ...(store.strengthTests || [])];

    store.activities.unshift({
      id: id(),
      contactId: contact.id,
      type: "meeting",
      note: `Strength Test submitted — Overall ${overallScore}%. PDF: /api/strength-test/submissions/${submissionId}/pdf`,
      occurredAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    await saveStrengthTestStore(store, accountId);

    return NextResponse.json({ ok: true, submissionId, pdfUrl: `/api/strength-test/submissions/${submissionId}/pdf` });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save strength test";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
