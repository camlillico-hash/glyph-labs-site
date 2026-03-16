import { NextResponse } from "next/server";
import { getStore } from "@/lib/crm-store";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const store = await getStore();
    const submission = (store.strengthTests || []).find((s) => s.id === id);

    if (!submission || !submission.pdfBase64) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 });
    }

    const filename = submission.pdfFilename || `strength-test-${submission.id}.pdf`;
    const buffer = Buffer.from(submission.pdfBase64, "base64");

    return new NextResponse(buffer, {
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
