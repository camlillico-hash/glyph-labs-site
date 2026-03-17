export function daysSince(iso?: string) {
  if (!iso) return 999;
  const ms = Date.now() - new Date(iso).getTime();
  return ms / (1000 * 60 * 60 * 24);
}

export type CoachMood = "fired_up" | "on_it" | "crushing";

export function computeCoachMood(store: any) {
  const contacts = store?.contacts || [];
  const deals = store?.deals || [];
  const tasks = store?.tasks || [];

  const openDeals = deals.filter((d: any) => d.stage !== "Launch paid (won)" && d.stage !== "Lost");
  const wonDeals = deals.filter((d: any) => d.stage === "Launch paid (won)");
  const latestWonAt = wonDeals
    .map((d: any) => d.updatedAt || d.createdAt)
    .filter(Boolean)
    .sort()
    .reverse()[0];
  const latestWonHours = latestWonAt ? (Date.now() - new Date(latestWonAt).getTime()) / (1000 * 60 * 60) : 999;

  const overdueTasks = tasks.filter((t: any) => !t.done && t.dueDate && new Date(t.dueDate).getTime() < Date.now()).length;
  const doneTasks = tasks.filter((t: any) => t.done || t.status === "Completed").length;

  const lastUpdatedAt = [
    ...contacts.map((c: any) => c.updatedAt),
    ...deals.map((d: any) => d.updatedAt),
    ...tasks.map((t: any) => t.updatedAt),
  ].filter(Boolean).sort().reverse()[0];

  const staleDays = daysSince(lastUpdatedAt);
  const staleDeals = openDeals.filter((d: any) => daysSince(d.updatedAt) > 7).length;

  let mood: CoachMood = "on_it";
  let statusLabel = "So you think you're good?!";
  let icon = "hammer";
  let iconColor = "blue";
  let avatar = "/glyphy-mood-on-it.jpg";
  let message = "Not bad, but not legendary. Move 1 deal stage and clear 2 tasks before day-end.";

  if (overdueTasks > 0 || staleDeals > 0 || staleDays > 2 || openDeals.length === 0) {
    mood = "fired_up";
    statusLabel = "This is pathetic!";
    icon = "flame";
    iconColor = "red";
    avatar = "/glyphy-drill-sergeant.jpg";

    if (openDeals.length === 0 && contacts.length > 0) {
      message = "No open deals? That’s not a pipeline, that’s fan fiction. Promote a contact to Discovery right now.";
    } else if (contacts.length === 0) {
      message = "Pipeline starts with people. Add 3 contacts today and stop pretending strategy is outreach.";
    } else {
      message = `You’re coasting. ${overdueTasks} overdue task(s), ${staleDeals} stale deal(s). Quit flirting with the to-do list and execute.`;
    }
  }

  if (wonDeals.length >= 1 && doneTasks >= 5 && overdueTasks === 0 && staleDeals === 0 && staleDays <= 1) {
    mood = "crushing";
    statusLabel = "You're crushing it!";
    icon = "heart";
    iconColor = "green";
    avatar = "/glyphy-mood-fired-up.jpg";
    message = "Elite consistency. Celebrate for 30 seconds, then top up pipeline while conversion is hot.";
  }

  if (latestWonHours <= 24) {
    mood = "crushing";
    statusLabel = "You're crushing it!";
    icon = "heart";
    iconColor = "green";
    avatar = "/glyphy-mood-fired-up.jpg";
    message = "New client closed — nasty work. Take a breath, then get back to prospecting before comfort makes you soft.";
  }

  return {
    name: "Sales Sgt. Glyph",
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
  };
}
