import { computeCoachMood } from "@/lib/coach-mood";
import { defaultTargets, normalizeTransitionTargets, type Activity, type Contact, type Deal, type Task } from "@/lib/crm-store";

type CrmSnapshot = {
  contacts: Contact[];
  deals: Deal[];
  tasks: Task[];
  activities: Activity[];
  targets?: typeof defaultTargets;
};

const OPEN_DEAL_STAGES = new Set([
  "Warm intro booked",
  "Warm intro completed",
  "90-min disco booked",
  "90-min disco completed",
  "Proposal / commitment",
]);

const WON_DEAL_STAGE = "Launch paid (won)";
const LOST_DEAL_STAGE = "Lost";
const CONNECTOR_ACTIVE_STAGES = new Set(["Activated", "Intro Pending", "Intro Delivered"]);
const RECENT_ACTIVITY_LIMIT = 25;
const STALE_DEAL_DAYS = 7;
const ACTIVITY_SCORE_TARGET = 12;
const PIPELINE_SCORE_TARGET = 3;
const DEAL_SCORE_TARGET = 1;

export type AnalyticsWindowKey =
  | "today"
  | "yesterday"
  | "this_week"
  | "last_7_days"
  | "last_30_days";

export type AnalyticsWindow = {
  key: AnalyticsWindowKey;
  label: string;
  start: Date;
  end: Date;
};

function makeWindow(key: AnalyticsWindowKey, label: string, start: Date, end: Date): AnalyticsWindow {
  return { key, label, start, end };
}

function startOfDay(value: Date) {
  const next = new Date(value);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(value: Date) {
  const next = new Date(value);
  next.setHours(23, 59, 59, 999);
  return next;
}

function startOfWeekMonday(value: Date) {
  const next = startOfDay(value);
  const weekday = next.getDay();
  const shift = weekday === 0 ? 6 : weekday - 1;
  next.setDate(next.getDate() - shift);
  return next;
}

function dateOnly(value: Date) {
  return value.toISOString().slice(0, 10);
}

function parseIsoDate(input?: string | null) {
  const raw = String(input || "").trim();
  if (!raw) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const date = new Date(`${raw}T00:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function timestampOf(value?: string | null) {
  const parsed = parseIsoDate(value);
  return parsed ? parsed.getTime() : Number.NaN;
}

function clampLimit(limit?: number, fallback = 10, max = 50) {
  const parsed = Number(limit);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(max, Math.max(1, Math.floor(parsed)));
}

function contactName(contact?: Partial<Contact> | null) {
  const first = String(contact?.firstName || "").trim();
  const last = String(contact?.lastName || "").trim();
  const full = `${first} ${last}`.trim();
  if (full) return full;
  if (contact?.company) return String(contact.company);
  if (contact?.email) return String(contact.email);
  return String(contact?.id || "Unknown contact");
}

function dealName(deal?: Partial<Deal> | null) {
  return String(deal?.name || deal?.company || deal?.id || "Unknown deal");
}

function taskDueBucket(task: Task, today: string) {
  if (task.done || task.status === "Completed" || task.status === "Canceled" || !task.dueDate) return "none";
  if (task.dueDate < today) return "overdue";
  if (task.dueDate === today) return "today";
  return "upcoming";
}

function isWithinWindow(value: string | undefined, window: AnalyticsWindow) {
  const ts = timestampOf(value);
  if (!Number.isFinite(ts)) return false;
  return ts >= window.start.getTime() && ts <= window.end.getTime();
}

function getActivityTimestamp(activity: Activity) {
  return activity.occurredAt || activity.createdAt || activity.updatedAt;
}

export function resolveAnalyticsWindow(window?: string, explicitDate?: string) {
  const today = startOfDay(new Date());
  const normalized = String(window || "").trim().toLowerCase() as AnalyticsWindowKey;
  const date = parseIsoDate(explicitDate);

  if (date) {
    const start = startOfDay(date);
    return makeWindow("today", dateOnly(start), start, endOfDay(start));
  }

  switch (normalized) {
    case "yesterday": {
      const start = startOfDay(new Date(today.getTime() - 24 * 60 * 60 * 1000));
      return makeWindow("yesterday", "Yesterday", start, endOfDay(start));
    }
    case "this_week": {
      const start = startOfWeekMonday(today);
      return makeWindow("this_week", "This week", start, endOfDay(new Date()));
    }
    case "last_30_days": {
      const start = startOfDay(new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000));
      return makeWindow("last_30_days", "Last 30 days", start, endOfDay(new Date()));
    }
    case "today": {
      return makeWindow("today", "Today", today, endOfDay(today));
    }
    case "last_7_days":
    default: {
      const start = startOfDay(new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000));
      return makeWindow("last_7_days", "Last 7 days", start, endOfDay(new Date()));
    }
  }
}

function buildIndex(snapshot: CrmSnapshot) {
  const contactsById = new Map(snapshot.contacts.map((contact) => [contact.id, contact]));
  const dealsById = new Map(snapshot.deals.map((deal) => [deal.id, deal]));
  return { contactsById, dealsById };
}

function summarizeTopContacts(snapshot: CrmSnapshot, windowActivities: Activity[]) {
  const { contactsById } = buildIndex(snapshot);
  const counts = new Map<string, number>();
  for (const activity of windowActivities) {
    counts.set(activity.contactId, (counts.get(activity.contactId) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([contactId, activityCount]) => {
      const contact = contactsById.get(contactId);
      return {
        contactId,
        name: contactName(contact),
        company: String(contact?.company || ""),
        activityCount,
      };
    });
}

function summarizeStaleDeals(snapshot: CrmSnapshot) {
  const cutoff = Date.now() - STALE_DEAL_DAYS * 24 * 60 * 60 * 1000;
  return snapshot.deals
    .filter((deal) => OPEN_DEAL_STAGES.has(String(deal.stage || "")))
    .filter((deal) => {
      const ts = timestampOf(deal.lastActivityAt || deal.updatedAt);
      return Number.isFinite(ts) && ts < cutoff;
    })
    .sort((a, b) => timestampOf(a.lastActivityAt || a.updatedAt) - timestampOf(b.lastActivityAt || b.updatedAt))
    .slice(0, 5)
    .map((deal) => ({
      dealId: deal.id,
      name: dealName(deal),
      stage: deal.stage,
      lastTouchedAt: deal.lastActivityAt || deal.updatedAt,
    }));
}

function summarizeDueTasks(snapshot: CrmSnapshot, limit = 10) {
  const { contactsById, dealsById } = buildIndex(snapshot);
  const today = dateOnly(new Date());
  return snapshot.tasks
    .filter((task) => taskDueBucket(task, today) !== "none")
    .sort((a, b) => String(a.dueDate || "").localeCompare(String(b.dueDate || "")))
    .slice(0, limit)
    .map((task) => ({
      taskId: task.id,
      title: task.title,
      status: task.status || (task.done ? "Completed" : "Not started"),
      dueDate: task.dueDate || null,
      dueBucket: taskDueBucket(task, today),
      relatedType: task.relatedType || null,
      relatedName:
        task.relatedType === "deal"
          ? dealName(dealsById.get(String(task.relatedId || "")))
          : contactName(contactsById.get(String(task.relatedId || ""))),
    }));
}

export function buildDailyDigest(snapshot: CrmSnapshot, date?: string) {
  const window = resolveAnalyticsWindow(undefined, date);
  const today = dateOnly(new Date());
  const activities = snapshot.activities.filter((activity) => isWithinWindow(getActivityTimestamp(activity), window));
  const activityByType = Object.fromEntries(
    ["email", "call", "text", "linkedin", "in_person", "meeting", "task_completed"].map((type) => [
      type,
      activities.filter((activity) => activity.type === type).length,
    ])
  );
  const contactsTouched = new Set(activities.map((activity) => activity.contactId)).size;
  const newContacts = snapshot.contacts.filter((contact) => isWithinWindow(contact.createdAt, window)).length;
  const wonDeals = snapshot.deals.filter((deal) => deal.stage === WON_DEAL_STAGE && isWithinWindow(deal.updatedAt, window)).length;
  const overdueTasks = snapshot.tasks.filter((task) => taskDueBucket(task, today) === "overdue").length;
  const dueToday = snapshot.tasks.filter((task) => taskDueBucket(task, today) === "today").length;
  const staleDeals = summarizeStaleDeals(snapshot);
  const topContacts = summarizeTopContacts(snapshot, activities);
  const coach = computeCoachMood(snapshot);

  const focusItems: string[] = [];
  if (activities.length < 3) focusItems.push("Activity volume is light for the day. Push outreach before the day closes.");
  if (dueToday > 0) focusItems.push(`${dueToday} task${dueToday === 1 ? "" : "s"} due today still need attention.`);
  if (overdueTasks > 0) focusItems.push(`${overdueTasks} overdue task${overdueTasks === 1 ? "" : "s"} are dragging follow-through.`);
  if (staleDeals.length > 0) focusItems.push(`${staleDeals.length} open deal${staleDeals.length === 1 ? "" : "s"} look stale and need movement.`);
  if (!focusItems.length) focusItems.push("Execution is in a healthy state today. Keep the pace steady.");

  return {
    window,
    summary: {
      activityCount: activities.length,
      contactsTouched,
      newContacts,
      wonDeals,
      dueToday,
      overdueTasks,
      staleDealCount: staleDeals.length,
      coachMood: coach.mood,
      coachMessage: coach.message,
    },
    activityByType,
    topContacts,
    staleDeals,
    dueTasks: summarizeDueTasks(snapshot, 10),
    focusItems,
  };
}

export function buildActivitySummary(snapshot: CrmSnapshot, windowKey?: string) {
  const window = resolveAnalyticsWindow(windowKey);
  const activities = snapshot.activities
    .filter((activity) => isWithinWindow(getActivityTimestamp(activity), window))
    .sort((a, b) => timestampOf(getActivityTimestamp(b)) - timestampOf(getActivityTimestamp(a)));
  const byType = Object.fromEntries(
    ["email", "call", "text", "linkedin", "in_person", "meeting", "task_completed"].map((type) => [
      type,
      activities.filter((activity) => activity.type === type).length,
    ])
  );
  return {
    window,
    totals: {
      activityCount: activities.length,
      contactsTouched: new Set(activities.map((activity) => activity.contactId)).size,
      meetingCount: byType.meeting || 0,
      followThroughCount: byType.task_completed || 0,
    },
    byType,
    topContacts: summarizeTopContacts(snapshot, activities),
    recentActivities: listRecentActivities(snapshot, {
      limit: Math.min(RECENT_ACTIVITY_LIMIT, activities.length || 10),
      source: activities,
    }),
  };
}

export function buildPipelineHealth(snapshot: CrmSnapshot, windowKey?: string) {
  const window = resolveAnalyticsWindow(windowKey || "last_7_days");
  const recentActivities = snapshot.activities.filter((activity) => isWithinWindow(getActivityTimestamp(activity), window));
  const openDeals = snapshot.deals.filter((deal) => OPEN_DEAL_STAGES.has(String(deal.stage || "")));
  const newContacts = snapshot.contacts.filter((contact) => isWithinWindow(contact.createdAt, window)).length;
  const dealCreations = snapshot.deals.filter((deal) => isWithinWindow(deal.createdAt, window)).length;
  const weeklyPace = {
    activities: recentActivities.length,
    newContacts,
    newDeals: dealCreations,
  };
  const aheadBehind = {
    activities: weeklyPace.activities >= ACTIVITY_SCORE_TARGET ? "ahead" : "behind",
    pipeline: weeklyPace.newContacts >= PIPELINE_SCORE_TARGET ? "ahead" : "behind",
    deals: weeklyPace.newDeals >= DEAL_SCORE_TARGET ? "ahead" : "behind",
  };

  return {
    window,
    counts: {
      openDeals: openDeals.length,
      wonDeals: snapshot.deals.filter((deal) => deal.stage === WON_DEAL_STAGE).length,
      lostDeals: snapshot.deals.filter((deal) => deal.stage === LOST_DEAL_STAGE).length,
      overdueTasks: summarizeDueTasks(snapshot, 100).filter((task) => task.dueBucket === "overdue").length,
      staleDeals: summarizeStaleDeals(snapshot).length,
      connectorContacts: snapshot.contacts.filter((contact) => contact.pipelineType === "connector").length,
      leadContacts: snapshot.contacts.filter((contact) => contact.pipelineType !== "connector").length,
    },
    weeklyPace,
    aheadBehind,
    staleDeals: summarizeStaleDeals(snapshot),
    dueTasks: summarizeDueTasks(snapshot, 10),
    notes: [
      aheadBehind.activities === "behind"
        ? `Activity pace is below the weekly scorecard target of ${ACTIVITY_SCORE_TARGET}.`
        : "Activity pace is on or above weekly scorecard target.",
      aheadBehind.pipeline === "behind"
        ? `New pipeline creation is below the weekly target of ${PIPELINE_SCORE_TARGET}.`
        : "New pipeline creation is on pace.",
      aheadBehind.deals === "behind"
        ? `Deal creation is below the weekly target of ${DEAL_SCORE_TARGET}.`
        : "Deal creation is on pace.",
    ],
  };
}

export function listRecentActivities(
  snapshot: CrmSnapshot,
  options?: {
    limit?: number;
    contactId?: string;
    type?: string;
    source?: Activity[];
  }
) {
  const { contactsById } = buildIndex(snapshot);
  const limit = clampLimit(options?.limit, 10, 100);
  const source = options?.source || snapshot.activities;
  return source
    .filter((activity) => !options?.contactId || activity.contactId === options.contactId)
    .filter((activity) => !options?.type || activity.type === options.type)
    .sort((a, b) => timestampOf(getActivityTimestamp(b)) - timestampOf(getActivityTimestamp(a)))
    .slice(0, limit)
    .map((activity) => ({
      id: activity.id,
      type: activity.type,
      note: activity.note || "",
      occurredAt: activity.occurredAt,
      contactId: activity.contactId,
      contactName: contactName(contactsById.get(activity.contactId)),
      company: String(contactsById.get(activity.contactId)?.company || ""),
    }));
}

export function listDueOrOverdueTasks(snapshot: CrmSnapshot, limit?: number) {
  return summarizeDueTasks(snapshot, clampLimit(limit, 10, 100));
}

export function buildContactBrief(snapshot: CrmSnapshot, contactId: string) {
  const { dealsById } = buildIndex(snapshot);
  const contact = snapshot.contacts.find((entry) => entry.id === contactId);
  if (!contact) return null;
  const activities = listRecentActivities(snapshot, { contactId, limit: 15 });
  const tasks = snapshot.tasks
    .filter((task) => task.relatedType === "contact" && task.relatedId === contactId)
    .sort((a, b) => String(a.dueDate || "").localeCompare(String(b.dueDate || "")))
    .slice(0, 10)
    .map((task) => ({
      id: task.id,
      title: task.title,
      dueDate: task.dueDate || null,
      status: task.status || (task.done ? "Completed" : "Not started"),
      done: task.done,
    }));
  const deals = snapshot.deals
    .filter((deal) => deal.contactId === contactId)
    .map((deal) => ({
      id: deal.id,
      name: dealName(deal),
      stage: deal.stage,
      nextStep: deal.nextStep || "",
      value: deal.value || 0,
      lastActivityAt: deal.lastActivityAt || null,
    }));

  return {
    contact: {
      id: contact.id,
      name: contactName(contact),
      company: contact.company || "",
      email: contact.email || "",
      title: contact.title || "",
      pipelineType: contact.pipelineType || "icp",
      status: contact.status || "",
      leadSource: contact.leadSource || "",
      lastActivityDate: contact.lastActivityDate || null,
      lastActivityType: contact.lastActivityType || null,
      nextReachOutAt: contact.nextReachOutAt || null,
      notes: contact.notes || "",
    },
    activities,
    tasks,
    deals,
    relatedDealNames: deals.map((deal) => dealName(dealsById.get(deal.id))),
  };
}

function stageAtOrBeyond(stage: string, threshold: string) {
  const stageOrder = [
    "Warm intro booked",
    "Warm intro completed",
    "90-min disco booked",
    "90-min disco completed",
    "Proposal / commitment",
    "Launch paid (won)",
  ];
  return stageOrder.indexOf(stage) >= stageOrder.indexOf(threshold);
}

export function buildDealBrief(snapshot: CrmSnapshot, dealId: string) {
  const { contactsById } = buildIndex(snapshot);
  const deal = snapshot.deals.find((entry) => entry.id === dealId);
  if (!deal) return null;
  const contact = contactsById.get(String(deal.contactId || ""));
  const contactActivities = deal.contactId ? listRecentActivities(snapshot, { contactId: deal.contactId, limit: 10 }) : [];
  const tasks = snapshot.tasks
    .filter((task) => task.relatedType === "deal" && task.relatedId === dealId)
    .sort((a, b) => String(a.dueDate || "").localeCompare(String(b.dueDate || "")))
    .slice(0, 10)
    .map((task) => ({
      id: task.id,
      title: task.title,
      dueDate: task.dueDate || null,
      status: task.status || (task.done ? "Completed" : "Not started"),
      done: task.done,
    }));

  return {
    deal: {
      id: deal.id,
      name: dealName(deal),
      stage: deal.stage,
      company: deal.company || "",
      value: deal.value || 0,
      probability: deal.probability || 0,
      expectedCloseDate: deal.expectedCloseDate || null,
      nextStep: deal.nextStep || "",
      lastActivityAt: deal.lastActivityAt || null,
      notes: deal.notes || "",
    },
    contact: contact
      ? {
          id: contact.id,
          name: contactName(contact),
          email: contact.email || "",
          status: contact.status || "",
        }
      : null,
    tasks,
    recentContactActivities: contactActivities,
  };
}

function safeDivide(base: number, ratePercent: number) {
  const rate = ratePercent / 100;
  if (!Number.isFinite(rate) || rate <= 0) return 0;
  return Math.ceil(base / rate);
}

export function compareActualsToTargets(snapshot: CrmSnapshot) {
  const targets = normalizeTransitionTargets({ ...defaultTargets, ...(snapshot.targets || {}) });
  const targetLaunches = Math.ceil(targets.revenueGoalAnnual / Math.max(1, targets.avgRevenuePerClientAnnual));
  const requiredDiscoveries = safeDivide(targetLaunches, targets.convDiscoveryToLaunch);
  const requiredWarmIntros = safeDivide(requiredDiscoveries, targets.convWarmIntroToDiscovery);
  const requiredLeads = safeDivide(requiredWarmIntros, targets.convLeadToWarmIntro);
  const requiredActivatedConnectors = safeDivide(requiredWarmIntros, targets.convConnectorActivatedToIntroDelivered);

  const actualLaunches = snapshot.deals.filter((deal) => deal.stage === WON_DEAL_STAGE).length;
  const actualDiscoveryReady = snapshot.deals.filter((deal) => stageAtOrBeyond(String(deal.stage || ""), "90-min disco booked") && deal.stage !== LOST_DEAL_STAGE).length;
  const actualWarmIntros = snapshot.deals.filter((deal) => stageAtOrBeyond(String(deal.stage || ""), "Warm intro booked") && deal.stage !== LOST_DEAL_STAGE).length;
  const actualLeads = snapshot.contacts.filter((contact) => contact.pipelineType !== "connector" && contact.status !== "Closed Lost").length;
  const actualActivatedConnectors = snapshot.contacts.filter((contact) => contact.pipelineType === "connector" && CONNECTOR_ACTIVE_STAGES.has(String(contact.status || ""))).length;

  const stages = [
    { key: "launches", label: "Launches won", required: targetLaunches, actual: actualLaunches },
    { key: "discoveries", label: "Discovery-stage deals", required: requiredDiscoveries, actual: actualDiscoveryReady },
    { key: "warm_intros", label: "Warm intros", required: requiredWarmIntros, actual: actualWarmIntros },
    { key: "leads", label: "Active leads", required: requiredLeads, actual: actualLeads },
    { key: "activated_connectors", label: "Activated connectors", required: requiredActivatedConnectors, actual: actualActivatedConnectors },
  ].map((stage) => ({
    ...stage,
    gap: stage.actual - stage.required,
    status: stage.actual >= stage.required ? "ahead" : "behind",
  }));

  return {
    targets,
    funnelRequirements: {
      targetLaunches,
      requiredDiscoveries,
      requiredWarmIntros,
      requiredLeads,
      requiredActivatedConnectors,
    },
    currentState: {
      actualLaunches,
      actualDiscoveryReady,
      actualWarmIntros,
      actualLeads,
      actualActivatedConnectors,
    },
    stages,
  };
}
