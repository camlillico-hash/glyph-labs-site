import { NextResponse } from "next/server";
import { buildStrengthTestPdf } from "@/lib/strength-test-pdf";
import { getStore, id, now, saveStore, type StrengthTestAnswer, type StrengthTestSubmission } from "@/lib/crm-store";

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
    const store = await getStore();

    let contact = store.contacts.find((c) => (c.email || "").toLowerCase() === email);
    if (!contact) {
      contact = {
        id: id(),
        firstName,
        lastName,
        company,
        email,
        phone,
        type: "Prospect",
        leadSource: "Strength Test",
        status: "New",
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      store.contacts.unshift(contact);
    }

    const submissionId = id();
    const pdfFilename = `strength-test-${contact.lastName || "lead"}-${submissionId}.pdf`.replace(/\s+/g, "-").toLowerCase();

    const pdfBuffer = await buildStrengthTestPdf({
      name: `${firstName} ${lastName}`.trim(),
      company,
      email,
      phone,
      submittedAt: timestamp,
      overallScore,
      overallLabel: scoreLabel(overallScore),
      sectionScores,
      sectionMax,
      answers,
    });

    const submission: StrengthTestSubmission = {
      id: submissionId,
      contactId: contact.id,
      submittedAt: timestamp,
      overallScore,
      sectionScores,
      answers,
      status: "complete",
      pdfBase64: pdfBuffer.toString("base64"),
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

    await saveStore(store);

    return NextResponse.json({ ok: true, submissionId, pdfUrl: `/api/strength-test/submissions/${submissionId}/pdf` });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save strength test";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
