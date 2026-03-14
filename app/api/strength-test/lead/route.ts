import { NextResponse } from "next/server";
import { getStore, id, now, saveStore } from "@/lib/crm-store";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const firstName = String(body?.firstName || "").trim();
    const lastName = String(body?.lastName || "").trim();
    const company = String(body?.company || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const phone = String(body?.phone || "").trim();

    if (!firstName || !lastName || !company || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValid) {
      return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
    }

    if (phone) {
      const phoneValid = /^\+?[0-9()\-\s]{7,20}$/.test(phone);
      if (!phoneValid) {
        return NextResponse.json({ error: "Please enter a valid phone number" }, { status: 400 });
      }
    }

    const timestamp = now();
    const store = await getStore();

    const existing = store.contacts.find((c) => (c.email || "").toLowerCase() === email);
    if (existing) {
      existing.firstName = firstName;
      existing.lastName = lastName;
      existing.company = company;
      existing.phone = phone || existing.phone;
      existing.type = existing.type || "Prospect";
      existing.leadSource = "Strength Test";
      existing.updatedAt = timestamp;
      existing.status = existing.status || "New";
    } else {
      store.contacts.unshift({
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
      });
    }

    await saveStore(store);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to save lead" }, { status: 500 });
  }
}
