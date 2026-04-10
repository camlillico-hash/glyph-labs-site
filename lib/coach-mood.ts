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
  const activities = store?.activities || [];

  const openDeals = deals.filter((d: any) => d.stage !== "Launch paid (won)" && d.stage !== "Lost");
  const overdueTasks = tasks.filter((t: any) => !t.done && t.dueDate && new Date(t.dueDate).getTime() < Date.now()).length;

  const lastUpdatedAt = [
    ...contacts.map((c: any) => c.updatedAt),
    ...deals.map((d: any) => d.updatedAt),
    ...tasks.map((t: any) => t.updatedAt),
  ].filter(Boolean).sort().reverse()[0];

  const staleDays = daysSince(lastUpdatedAt);
  const staleDeals = openDeals.filter((d: any) => daysSince(d.updatedAt) > 7).length;
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const weeklyActivities = activities.filter((a: any) => {
    const ms = new Date(a.occurredAt || a.createdAt || a.updatedAt).getTime();
    return Number.isFinite(ms) && ms >= oneWeekAgo;
  }).length;

  const weeklyPipeline = contacts.filter((c: any) => {
    const ms = new Date(c.createdAt || c.updatedAt).getTime();
    return Number.isFinite(ms) && ms >= oneWeekAgo;
  }).length;

  const weeklyDeals = deals.filter((d: any) => {
    const ms = new Date(d.createdAt || d.updatedAt).getTime();
    return Number.isFinite(ms) && ms >= oneWeekAgo;
  }).length;

  const activityTarget = 12;
  const pipelineTarget = 3;
  const dealTarget = 1;
  const weeklyScoreHits =
    Number(weeklyActivities >= activityTarget) +
    Number(weeklyPipeline >= pipelineTarget) +
    Number(weeklyDeals >= dealTarget);
  const weeklyBehind = weeklyScoreHits === 0;
  const weeklyHappy = weeklyActivities >= activityTarget && weeklyPipeline >= pipelineTarget && weeklyDeals >= dealTarget;

  let mood: CoachMood = "on_it";
  let statusLabel = "On the board.";
  let icon = "hammer";
  let iconColor = "blue";
  let avatar = "/glyphy-mood-on-it.jpg";
  let message = "Weekly scorecard hit. Keep stacking activities and pipeline entries.";

  if (weeklyBehind || overdueTasks > 0 || staleDeals > 0 || staleDays > 2) {
    mood = "fired_up";
    statusLabel = "Behind weekly scorecard.";
    icon = "flame";
    iconColor = "red";
    avatar = "/glyphy-drill-sergeant.jpg";

    if (contacts.length === 0) {
      message = "Pipeline starts with people. Add leads/connectors this week and log activity daily.";
    } else if (weeklyScoreHits === 0) {
      message = `No weekly targets hit yet. Aim for ${activityTarget} activities and ${pipelineTarget} new pipeline records this week.`;
    } else {
      message = `Execution gap: ${overdueTasks} overdue task(s), ${staleDeals} stale deal(s). Clean up and get back to scorecard pace.`;
    }
  }

  if (weeklyHappy) {
    mood = "crushing";
    statusLabel = "Weekly momentum unlocked.";
    icon = "heart";
    iconColor = "green";
    avatar = "/glyphy-mood-fired-up.jpg";
    message = "Strong week: pipeline growth, deal creation, and activity volume are all on target.";
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
      overdueTasks,
      staleDeals,
      staleDays: Math.floor(staleDays),
      weeklyActivities,
      weeklyPipeline,
      weeklyDeals,
      weeklyScoreHits,
    },
  };
}
