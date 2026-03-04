import { NextResponse } from "next/server";
import { getStore } from "@/lib/crm-store";

function daysSince(iso?: string) {
  if (!iso) return 999;
  const ms = Date.now() - new Date(iso).getTime();
  return ms / (1000 * 60 * 60 * 24);
}

export async function GET() {
  const store = await getStore();
  const contacts = store.contacts || [];
  const deals = store.deals || [];
  const tasks = store.tasks || [];

  const openDeals = deals.filter((d) => d.stage !== "Client signed (won)" && d.stage !== "Lost");
  const wonDeals = deals.filter((d) => d.stage === "Client signed (won)");
  const lostDeals = deals.filter((d) => d.stage === "Lost");

  const overdueTasks = tasks.filter((t: any) => !t.done && t.dueDate && new Date(t.dueDate).getTime() < Date.now()).length;
  const doneTasks = tasks.filter((t: any) => t.done || t.status === "Complete").length;

  const lastUpdatedAt = [
    ...contacts.map((c) => c.updatedAt),
    ...deals.map((d) => d.updatedAt),
    ...tasks.map((t) => t.updatedAt),
  ].filter(Boolean).sort().reverse()[0];

  const staleDays = daysSince(lastUpdatedAt);
  const staleDeals = openDeals.filter((d) => daysSince(d.updatedAt) > 7).length;

  let mood: "push" | "praise" | "warning" = "push";
  let message = "Move one deal, complete one task, and stop negotiating with your potential.";

  if (wonDeals.length > 0 && doneTasks >= 3) {
    mood = "praise";
    message = "Good. You executed. Now do it again before your comfort zone files a comeback.";
  }

  if (overdueTasks > 0 || staleDeals > 0 || staleDays > 2) {
    mood = "warning";
    message = `Board check: ${overdueTasks} overdue task(s), ${staleDeals} stale deal(s). Less scrolling, more closing.`;
  }

  if (openDeals.length === 0 && contacts.length > 0) {
    mood = "push";
    message = "No open deals. Promote a contact to Discovery today — pipeline is built, not wished into existence.";
  }

  if (contacts.length === 0) {
    mood = "warning";
    message = "Recruit leads. Add 3 contacts today. Strategy without outreach is just decorative thinking.";
  }


  return NextResponse.json({
    name: "Sales Coach Glyphy",
    title: "Revenue Drill Sergeant",
    avatar: "/glyphord-coach.svg",
    mood,
    message,
    stats: {
      contacts: contacts.length,
      openDeals: openDeals.length,
      wonDeals: wonDeals.length,
      lostDeals: lostDeals.length,
      overdueTasks,
      doneTasks,
      staleDeals,
      staleDays: Math.floor(staleDays),
    },
  });
}
