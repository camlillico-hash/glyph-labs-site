import { NextResponse } from "next/server";
import { getStore } from "@/lib/crm-store";

function daysSince(iso?: string) {
  if (!iso) return 999;
  const ms = Date.now() - new Date(iso).getTime();
  return ms / (1000 * 60 * 60 * 24);
}

type Mood = "fired_up" | "on_it" | "crushing";

export async function GET() {
  const store = await getStore();
  const contacts = store.contacts || [];
  const deals = store.deals || [];
  const tasks = store.tasks || [];

  const openDeals = deals.filter((d) => d.stage !== "Client signed (won)" && d.stage !== "Lost");
  const wonDeals = deals.filter((d) => d.stage === "Client signed (won)");

  const overdueTasks = tasks.filter((t: any) => !t.done && t.dueDate && new Date(t.dueDate).getTime() < Date.now()).length;
  const doneTasks = tasks.filter((t: any) => t.done || t.status === "Complete").length;

  const lastUpdatedAt = [
    ...contacts.map((c) => c.updatedAt),
    ...deals.map((d) => d.updatedAt),
    ...tasks.map((t) => t.updatedAt),
  ].filter(Boolean).sort().reverse()[0];

  const staleDays = daysSince(lastUpdatedAt);
  const staleDeals = openDeals.filter((d) => daysSince(d.updatedAt) > 7).length;

  let mood: Mood = "on_it";
  let statusLabel = "So you think you're good?!";
  let icon = "hammer";
  let iconColor = "blue";
  let avatar = "/glyphy-mood-on-it.jpg";
  let message = "Nice pace. Now sharpen it: move 1 deal stage and complete 2 tasks before day-end.";

  // Fired up = behind/slacking
  if (overdueTasks > 0 || staleDeals > 0 || staleDays > 2 || openDeals.length === 0) {
    mood = "fired_up";
    statusLabel = "Fired up!";
    icon = "flame";
    iconColor = "red";
    avatar = "/glyphy-mood-fired-up.jpg";

    if (openDeals.length === 0 && contacts.length > 0) {
      message = "No open deals? That’s not a pipeline, that’s a wishlist. Promote a contact to Discovery now.";
    } else if (contacts.length === 0) {
      message = "Pipeline starts with people. Add 3 contacts today and stop hiding behind planning.";
    } else {
      message = `You’re drifting. ${overdueTasks} overdue task(s), ${staleDeals} stale deal(s). Execute now, excuses later.`;
    }
  }

  // Crushing it = exceeding expectations
  if (wonDeals.length >= 1 && doneTasks >= 5 && overdueTasks === 0 && staleDeals === 0 && staleDays <= 1) {
    mood = "crushing";
    statusLabel = "You're crushing it!";
    icon = "heart";
    iconColor = "green";
    avatar = "/glyphy-drill-sergeant.jpg";
    message = "Elite consistency. Keep pressure on: top up pipeline while conversion is hot.";
  }

  return NextResponse.json({
    name: "Sales Sgt. Glyphy",
    title: "Revenue Drill Sergeant",
    mood,
    statusLabel,
    icon,
    iconColor,
    avatar,
    message,
    stats: {
      contacts: contacts.length,
      openDeals: openDeals.length,
      wonDeals: wonDeals.length,
      overdueTasks,
      doneTasks,
      staleDeals,
      staleDays: Math.floor(staleDays),
    },
  });
}
