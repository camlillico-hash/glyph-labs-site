import { NextResponse } from "next/server";
import { getLegacyUnscopedStrengthTestStore, getStrengthTestStore, migrateLegacyStrengthTests, saveStrengthTestStore } from "@/app/api/strength-test/_lib";
import { now } from "@/lib/crm-store";
import { requireCrmSession } from "@/lib/crm-scope";

export async function POST() {
  try {
    const session = await requireCrmSession();
    if (session.role !== "owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const legacyStore = await getLegacyUnscopedStrengthTestStore();
    const { accountId, store } = await getStrengthTestStore();
    const result = migrateLegacyStrengthTests({
      legacyStore,
      targetStore: store,
      timestamp: now(),
    });

    if (result.summary.submissionsMigrated === 0 && result.summary.contactsCreated === 0 && result.summary.activitiesAdded === 0) {
      return NextResponse.json({ ok: true, accountId, migrated: result.summary, changed: false });
    }

    await saveStrengthTestStore(store, accountId);
    return NextResponse.json({ ok: true, accountId, migrated: result.summary, changed: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to migrate legacy strength tests" }, { status: 500 });
  }
}
