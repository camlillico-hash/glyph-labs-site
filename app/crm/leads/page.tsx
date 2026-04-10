"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Target, Users, Save, Pencil, Trash2, X, SquareArrowOutUpRight, LayoutGrid, List, Plus, Upload, Download, Mail, Phone, MessageSquare, Linkedin, CalendarCheck2, CheckCheck, ChevronDown, ChevronRight, Paperclip } from "lucide-react";
import ConfirmDialog from "../ConfirmDialog";
import Papa from "papaparse";

type Contact = any;
const CONNECTOR_STAGES = ["Identified", "Attempting", "Connected", "Positioned", "Activated", "Intro Pending", "Intro Delivered", "Nurture", "Closed Lost"];
const ICP_STAGES = ["New", "Attempting", "Connected", "Warm intro booked", "Nurture", "Closed Lost"];
const CONTACT_TYPES = ["Influencer", "Decision maker", "Networker", "Other"];
const PIPELINE_LABELS = {
  connector: "Connector",
  icp: "Lead",
} as const;
const PRIMARY_PAIN_OPTIONS = ["Execution", "Strategy", "Culture"];
const DISQUALIFICATION_REASONS = ["Couldn't connect", "Went cold", "Said no", "Not the right person", "Timing not right", "Relationship not viable right now", "Bad data / test lead", "Other"];
const WHAT_NOW_OPTIONS = ["Leave them", "Nurture (future)"];
const contactFields: Array<[string, string, string]> = [
  ["firstName", "First name", "text"], ["lastName", "Last name", "text"], ["email", "Email", "email"],
  ["phone", "Phone", "text"],
  ["linkedin", "LinkedIn", "text"], ["website", "Website", "text"], ["company", "Company", "text"], ["industry", "Industry", "text"], ["employeeSize", "Employee size", "text"], ["areaGeo", "Area/Geo", "text"], ["linkedinConnectRequest", "LinkedIn connect request", "textarea"], ["liAccepted", "LI Accepted", "checkbox"], ["title", "Title", "text"], ["type", "Type", "select"], ["primaryPain", "Primary pain", "select"], ["leadSource", "Lead source", "text"], ["strengthTest", "Strength Test", "select"], ["referralCount", "Referral count", "number"], ["nextReachOutAt", "Next reach-out", "date"], ["seederNotes", "Seeder notes", "text"],
];
const stageLabel = (stage: string, idx: number) => `${idx + 1}. ${stage}`;
const stageColorClass = (stage: string) => {
  if (["Identified", "New"].includes(stage)) return "text-slate-300";
  if (["Attempting", "Connected", "Positioned"].includes(stage)) return "text-sky-300";
  if (["Activated", "Intro Pending", "Intro Delivered", "Warm intro booked"].includes(stage)) return "text-emerald-300";
  if (["Nurture", "Closed Lost"].includes(stage)) return "text-amber-300";
  return "text-slate-300";
};
const prettyType = (v?: string) => String(v || "").split("_").map((s) => s ? s[0].toUpperCase() + s.slice(1) : s).join(" ");
const openPicker = (e: React.MouseEvent<HTMLInputElement> | React.FocusEvent<HTMLInputElement>) => {
  const el = e.currentTarget as HTMLInputElement & { showPicker?: () => void };
  el.showPicker?.();
};
const gmailComposeUrl = (email?: string) => `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(String(email || ""))}`;
const activityTypeIcon = (v?: string) => {
  const t = String(v || "");
  if (t === "email") return Mail;
  if (t === "call") return Phone;
  if (t === "text") return MessageSquare;
  if (t === "linkedin") return Linkedin;
  if (t === "in_person") return Users;
  if (t === "meeting") return CalendarCheck2;
  if (t === "task_completed") return CheckCheck;
  return CalendarCheck2;
};
const defaultStatusForPipeline = (pipelineType?: string) => pipelineType === "connector" ? "Identified" : "New";
const stageOptionsForPipeline = (pipelineType?: string) => pipelineType === "connector" ? CONNECTOR_STAGES : ICP_STAGES;
const pipelineLabel = (pipelineType?: string) => PIPELINE_LABELS[(pipelineType || "connector") as "connector" | "icp"] || "Lead";
const TABLE_MAX_HEIGHT_CLASS = "overflow-y-auto min-w-0 overscroll-contain [scrollbar-gutter:stable] touch-pan-x touch-pan-y";
const BOARD_LANE_MAX_HEIGHT_CLASS = "max-h-[740px] overflow-y-auto pr-1 min-w-0 overscroll-contain [scrollbar-gutter:stable] touch-pan-y";

const EXPORT_HEADERS = [
  "contactId",
  "firstName",
  "lastName",
  "email",
  "phone",
  "linkedin",
  "website",
  "company",
  "industry",
  "employeeSize",
  "areaGeo",
  "linkedinConnectRequest",
  "title",
  "type",
  "primaryPain",
  "leadSource",
  "pipelineType",
  "status",
  "notes",
];
const csvEscape = (value: any) => {
  const stringValue = String(value ?? "");
  if (!/[",\n]/.test(stringValue)) return stringValue;
  return '"' + stringValue.replace(/"/g, '""') + '"';
};


export default function LeadsPage() {
  const [items, setItems] = useState<Contact[]>([]);
  const [gmail, setGmail] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [activityDraft, setActivityDraft] = useState<any>({ type: "email" });
  const [activityError, setActivityError] = useState("");
  const [draggingContactId, setDraggingContactId] = useState<string | null>(null);
  const [hoverLane, setHoverLane] = useState<string | null>(null);
  const [hoverDrop, setHoverDrop] = useState<{ laneKey: string; index: number } | null>(null);
  const [view, setView] = useState<"bucket" | "table">("table");

  const [selected, setSelected] = useState<Contact | null>(null);
  const [draft, setDraft] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [createMode, setCreateMode] = useState(false);
  const [trayError, setTrayError] = useState("");
  const [confirmState, setConfirmState] = useState<{ open: boolean; message: string; action: (() => void) | null; confirmLabel?: string }>({ open: false, message: "", action: null, confirmLabel: "Delete" });
  const [movePicker, setMovePicker] = useState<{ open: boolean; contactId?: string }>({ open: false });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [inlineDraft, setInlineDraft] = useState<any>(null);
  const [inlineError, setInlineError] = useState("");
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDeleteProgress, setBulkDeleteProgress] = useState<{ total: number; completed: number } | null>(null);
  const [tableSort, setTableSort] = useState<{ key: "name" | "pipeline" | "email" | "company" | "type" | "stage" | "liAccepted" | "employeeSize" | "areaGeo" | "activityCount" | "lastActivityDate" | "lastActivityType" | "createdAt"; direction: "asc" | "desc" }>({
    key: "name",
    direction: "asc",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [tableViewportHeight, setTableViewportHeight] = useState(560);
  const [importOpen, setImportOpen] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [importError, setImportError] = useState("");
  const [showOpenContacts, setShowOpenContacts] = useState(true);
  const [showConverted, setShowConverted] = useState(false);
  const [showClients, setShowClients] = useState(false);
  const [showDisqualified, setShowDisqualified] = useState(false);
  const [showDetailSection, setShowDetailSection] = useState(true);
  const [showActivitiesSection, setShowActivitiesSection] = useState(true);
  const [showDealsSection, setShowDealsSection] = useState(true);
  const [removingFromOpenIds, setRemovingFromOpenIds] = useState<string[]>([]);
  const [dqModal, setDqModal] = useState<{ open: boolean; contactId?: string; status?: string; targetIndex?: number; disqualificationReason: string; whatNow: string; error?: string; saving?: boolean }>({
    open: false,
    disqualificationReason: "",
    whatNow: "",
    error: "",
    saving: false,
  });

  const checkboxClassName = "h-4 w-4 cursor-pointer rounded border border-neutral-600 bg-neutral-300/70 text-sky-700 accent-slate-400 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] shadow-black/20 transition hover:border-neutral-500 hover:bg-neutral-300/85 disabled:cursor-not-allowed disabled:opacity-50";

  const loadContacts = async () => {
    const contactsRes = await (await fetch("/api/crm/contacts", { cache: "no-store" })).json();
    setItems(Array.isArray(contactsRes) ? contactsRes : contactsRes.contacts || []);
  };

  const loadRelated = async () => {
    const [gmailRes, activitiesRes, tasksRes, dealsRes] = await Promise.all([
      fetch("/api/crm/gmail/messages", { cache: "no-store" }),
      fetch("/api/crm/activities", { cache: "no-store" }),
      fetch("/api/crm/tasks", { cache: "no-store" }),
      fetch("/api/crm/deals", { cache: "no-store" }),
    ]);
    const [gmailData, activitiesData, tasksData, dealsData] = await Promise.all([
      gmailRes.json(),
      activitiesRes.json(),
      tasksRes.json(),
      dealsRes.json(),
    ]);
    setGmail(gmailData);
    setActivities(activitiesData);
    setTasks(tasksData.tasks || []);
    setDeals(dealsData.deals || []);
  };

  const load = async () => {
    await Promise.all([loadContacts(), loadRelated()]);
  };
  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const updateTableViewportHeight = () => {
      const nextHeight = Math.max(280, window.innerHeight - 260);
      setTableViewportHeight(nextHeight);
    };
    updateTableViewportHeight();
    window.addEventListener("resize", updateTableViewportHeight);
    return () => window.removeEventListener("resize", updateTableViewportHeight);
  }, []);

  function exportContacts(rows: Contact[]) {
    const csv = [
      EXPORT_HEADERS.join(","),
      ...rows.map((contact) => EXPORT_HEADERS.map((header) => {
        if (header === "contactId") return csvEscape(contact.id || "");
        return csvEscape(contact[header] ?? "");
      }).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const prefix = window.location.pathname.includes("connectors") ? "crm-connectors" : "crm-leads";
    link.download = prefix + "-" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }


  useEffect(() => {
    if (!selected?.id) return;
    const fresh = items.find((c) => c.id === selected.id);
    if (!fresh) {
      setSelected(null);
      setDraft(null);
      setEditMode(false);
      setCreateMode(false);
      return;
    }
    setSelected(fresh);
    if (!editMode) setDraft({ ...fresh });
  }, [items, selected?.id, editMode]);

  const icpItems = useMemo(() => items.filter((c) => (c.pipelineType || "connector") === "icp"), [items]);
  const icpOpenItems = useMemo(() => icpItems.filter((c) => !["Warm intro booked", "Nurture", "Closed Lost"].includes(c.status || "New") || !c.openBoardHidden), [icpItems]);
  const convertedItems = useMemo(() => icpItems.filter((c) => (c.status || "New") === "Warm intro booked" && c.openBoardHidden), [icpItems]);
  const clientContactIds = useMemo(() => {
    const ids = new Set<string>();
    for (const d of deals || []) {
      if (d.stage === "Launch paid (won)" && d.contactId) ids.add(d.contactId);
    }
    return ids;
  }, [deals]);
  const clientItems = useMemo(() => items.filter((c) => clientContactIds.has(c.id)), [items, clientContactIds]);
  const disqualifiedItems = useMemo(() => items.filter((c) => (["Nurture", "Closed Lost"].includes(c.status || defaultStatusForPipeline(c.pipelineType)) && c.openBoardHidden)), [items]);
  const sortedIcpItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filtered = normalizedSearch
      ? icpItems.filter((contact) => {
          const haystack = [
            `${contact.firstName || ""} ${contact.lastName || ""}`.trim(),
            contact.email || "",
            contact.company || "",
            contact.title || "",
            contact.linkedin || "",
            contact.status || defaultStatusForPipeline(contact.pipelineType),
            contact.type || "",
            contact.areaGeo || "",
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(normalizedSearch);
        })
      : icpItems;

    const getValue = (contact: Contact, key: typeof tableSort.key) => {
      switch (key) {
        case "name":
          return `${contact.firstName || ""} ${contact.lastName || ""}`.trim();
        case "pipeline":
          return pipelineLabel(contact.pipelineType);
        case "email":
          return contact.email || "";
        case "company":
          return contact.company || "";
        case "type":
          return contact.type || "";
        case "stage":
          return contact.status || defaultStatusForPipeline(contact.pipelineType);
        case "liAccepted":
          return contact.liAccepted ? "yes" : "no";
        case "employeeSize":
          return contact.employeeSize || "";
        case "areaGeo":
          return contact.areaGeo || "";
        case "activityCount":
          return (activities || []).filter((activity: any) => activity.contactId === contact.id).length;
        case "lastActivityDate":
          return contact.lastActivityDate || "";
        case "lastActivityType":
          return contact.lastActivityType || "";
        case "createdAt":
          return contact.createdAt || "";
        default:
          return "";
      }
    };

    const sorted = [...filtered].sort((a, b) => {
      const aValue = getValue(a, tableSort.key);
      const bValue = getValue(b, tableSort.key);
      const aText = String(aValue || "").trim().toLowerCase();
      const bText = String(bValue || "").trim().toLowerCase();
      const comparison = aText.localeCompare(bText, undefined, { numeric: true, sensitivity: "base" });
      if (comparison !== 0) return tableSort.direction === "asc" ? comparison : -comparison;
      return `${a.firstName || ""} ${a.lastName || ""}`.trim().localeCompare(`${b.firstName || ""} ${b.lastName || ""}`.trim(), undefined, { sensitivity: "base" });
    });

    return sorted;
  }, [icpItems, tableSort, searchTerm, activities]);

  const boardSections = [
    {
      key: "icp",
      title: "Lead funnel",
      subtitle: "Prospects before the deal board takes over.",
      pipelineType: "icp",
      stages: ICP_STAGES,
      items: icpOpenItems,
    },
  ] as const;

  useEffect(() => {
    setSelectedLeadIds((prev) => prev.filter((id) => icpItems.some((c) => c.id === id)));
  }, [icpItems]);

  const selectedActivities = useMemo(() => {
    if (!selected?.id) return [];
    return (activities || [])
      .filter((a: any) => a.contactId === selected.id)
      .sort((a: any, b: any) => new Date(b.occurredAt || b.createdAt).getTime() - new Date(a.occurredAt || a.createdAt).getTime());
  }, [activities, selected]);

  function openCreate(pipelineType: "connector" | "icp" = "icp") {
    setCreateMode(true);
    setEditMode(true);
    setSelected(null);
    setDraft({ pipelineType, status: defaultStatusForPipeline(pipelineType) });
    setTrayError("");
    setActivityDraft({ type: "email", occurredAtLocal: "" });
    setActivityError("");
    setShowDetailSection(true);
    setShowActivitiesSection(true);
    setShowDealsSection(true);
  }
  function openTray(contact: Contact) {
    setSelected(contact);
    setDraft({ ...contact });
    setEditMode(false);
    setCreateMode(false);
    setTrayError("");
    setActivityDraft({ type: "email", contactId: contact.id, occurredAtLocal: "" });
    setActivityError("");
    setShowDetailSection(true);
    setShowActivitiesSection(true);
    setShowDealsSection(true);
  }
  function closeTray() {
    setSelected(null);
    setDraft(null);
    setEditMode(false);
    setCreateMode(false);
    setTrayError("");
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.has("contactId")) {
        url.searchParams.delete("contactId");
        window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
      }
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const targetId = new URLSearchParams(window.location.search).get("contactId");
    if (!targetId || selected?.id === targetId || items.length === 0) return;
    const target = items.find((c) => c.id === targetId);
    if (target) openTray(target);
  }, [items, selected?.id]);

  function startInlineEdit(c: any) { setInlineError(""); setEditingId(c.id); setInlineDraft({ ...c }); }
  function cancelInlineEdit() { setInlineError(""); setEditingId(null); setInlineDraft(null); }
  async function saveInlineEdit() {
    if (!inlineDraft) return;
    const res = await fetch('/api/crm/contacts', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(inlineDraft) });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setInlineError(j.error || "Could not save contact");
      return;
    }
    setInlineError("");
    await loadContacts();
    cancelInlineEdit();
  }

  async function moveContactStage(contactId: string, status: string, targetIndex?: number) {
    const contact = items.find((c) => c.id === contactId);
    if (!contact || (contact.status || defaultStatusForPipeline(contact.pipelineType)) === status) return;

    if (["Nurture", "Closed Lost"].includes(status)) {
      const hasDQ = Boolean(String(contact.disqualificationReason || "").trim());
      const hasWhatNow = Boolean(String(contact.whatNow || "").trim());
      if (!hasDQ || !hasWhatNow) {
        setMovePicker({ open: false });
        setDqModal({
          open: true,
          contactId,
          status,
          targetIndex,
          disqualificationReason: String(contact.disqualificationReason || ""),
          whatNow: String(contact.whatNow || ""),
          error: "",
          saving: false,
        });
        return;
      }
    }

    setItems((prev) => {
      const moving = prev.find((c) => c.id === contactId);
      if (!moving) return prev;
      const others = prev.filter((c) => c.id !== contactId);
      const updated = { ...moving, status, openBoardHidden: false };
      if (targetIndex === undefined) return [...others, updated];

      const next: any[] = [];
      let statusCount = 0;
      let inserted = false;
      for (const c of others) {
        const sameStage = (c.status || defaultStatusForPipeline(c.pipelineType)) === status;
        if (sameStage && statusCount === targetIndex) {
          next.push(updated);
          inserted = true;
        }
        next.push(c);
        if (sameStage) statusCount++;
      }
      if (!inserted) next.push(updated);
      return next;
    });
    await fetch("/api/crm/contacts", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...contact, status, openBoardHidden: false }) });
    await loadContacts();
  }

  async function saveDisqualificationModal() {
    if (!dqModal.contactId) return;
    const disqualificationReason = String(dqModal.disqualificationReason || "").trim();
    const whatNow = String(dqModal.whatNow || "").trim();
    if (!disqualificationReason || !whatNow) {
      setDqModal((prev) => ({ ...prev, error: "Both fields are required." }));
      return;
    }

    const contact = items.find((c) => c.id === dqModal.contactId);
    if (!contact) {
      setDqModal({ open: false, disqualificationReason: "", whatNow: "", error: "", saving: false });
      return;
    }

    setDqModal((prev) => ({ ...prev, saving: true, error: "" }));

    const payload = {
      ...contact,
      status: dqModal.status || "Closed Lost",
      disqualificationReason,
      whatNow,
      openBoardHidden: false,
    };

    const res = await fetch('/api/crm/contacts', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setDqModal((prev) => ({ ...prev, saving: false, error: j.error || "Could not move contact." }));
      return;
    }

    setDqModal({ open: false, disqualificationReason: "", whatNow: "", error: "", saving: false });
    await loadContacts();
  }

  async function removeFromOpen(contact: any) {
    setRemovingFromOpenIds((prev) => [...prev, contact.id]);
    setTimeout(async () => {
      const payload = { ...contact, openBoardHidden: true };
      setItems((prev) => prev.map((c) => (c.id === contact.id ? payload : c)));
      await fetch('/api/crm/contacts', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      await loadContacts();
      setRemovingFromOpenIds((prev) => prev.filter((id) => id !== contact.id));
    }, 220);
  }

  async function saveContact(createAnother = false) {
    if (!draft) return;
    setTrayError("");
    const isCreate = createMode;
    const res = await fetch("/api/crm/contacts", { method: isCreate ? "POST" : "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(draft) });
    if (!res.ok) { const j = await res.json().catch(() => ({})); setTrayError(j.error || "Could not save contact"); return; }
    await loadContacts();
    if (isCreate && createAnother) {
      const pipelineType = draft.pipelineType || "icp";
      setDraft({ pipelineType, status: defaultStatusForPipeline(pipelineType) });
      setCreateMode(true);
      setEditMode(true);
      return;
    }
    closeTray();
  }

  async function deleteFromTray() {
    if (!selected?.id) return;
    setTrayError("");
    const res = await fetch(`/api/crm/contacts?id=${selected.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setTrayError(data?.error || "Could not delete contact");
      return;
    }
    setSelectedLeadIds((prev) => prev.filter((id) => id !== selected.id));
    closeTray();
    await loadContacts();
  }

  function toggleLeadSelection(contactId: string, checked: boolean) {
    if (bulkDeleting) return;
    setSelectedLeadIds((prev) => {
      if (checked) return prev.includes(contactId) ? prev : [...prev, contactId];
      return prev.filter((id) => id !== contactId);
    });
  }

  function toggleSelectAllLeads(rows: Contact[], checked: boolean) {
    if (bulkDeleting) return;
    const rowIds = rows.map((c) => c.id);
    setSelectedLeadIds((prev) => {
      if (checked) return Array.from(new Set([...prev, ...rowIds]));
      const rowSet = new Set(rowIds);
      return prev.filter((id) => !rowSet.has(id));
    });
  }

  async function bulkDeleteSelectedLeads(idsOverride?: string[]) {
    const ids = (idsOverride || selectedLeadIds).filter((id) => icpItems.some((c) => c.id === id));
    if (!ids.length || bulkDeleting) return;
    setBulkDeleting(true);
    setBulkDeleteProgress({ total: ids.length, completed: 0 });
    setTrayError("");
    setConfirmState((prev) => ({ ...prev, confirmLabel: "Deleting…" }));
    try {
      const res = await fetch("/api/crm/contacts", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      setBulkDeleteProgress({ total: ids.length, completed: ids.length });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const missingIds = Array.isArray(data?.missingIds) ? data.missingIds.length : 0;
        setTrayError(data?.error || (missingIds ? `${missingIds} selected leads could not be found.` : "Could not delete selected leads"));
        return;
      }
      setSelectedLeadIds((prev) => prev.filter((selectedId) => !ids.includes(selectedId)));
      await loadContacts();
      setConfirmState({ open: false, message: "", action: null, confirmLabel: "Delete" });
      closeTray();
    } finally {
      setBulkDeleting(false);
      setBulkDeleteProgress(null);
      setConfirmState((prev) => prev.open ? { ...prev, confirmLabel: "Delete" } : prev);
    }
  }

  async function unconvertFromTray() {
    if (!selected?.id) return;
    const payload = {
      ...selected,
      status: "Connected",
      openBoardHidden: false,
      disqualificationReason: undefined,
      whatNow: undefined,
    };
    const res = await fetch('/api/crm/contacts', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const updated = await res.json().catch(() => null);
    if (!res.ok) {
      setTrayError(updated?.error || 'Could not unconvert contact');
      return;
    }
    await loadContacts();
    setSelected(updated);
    setDraft({ ...updated });
  }

  function askConfirm(message: string, action: () => void, confirmLabel = "Delete") {
    setConfirmState({ open: true, message, action, confirmLabel });
  }

  function updateTableSort(
    key: "name" | "pipeline" | "email" | "company" | "type" | "stage" | "liAccepted" | "employeeSize" | "areaGeo" | "activityCount" | "lastActivityDate" | "lastActivityType" | "createdAt",
  ) {
    setTableSort((prev) => ({
      key,
      direction: prev.key === key ? (prev.direction === "asc" ? "desc" : "asc") : "asc",
    }));
  }

  const renderContactsTable = (rows: Contact[]) => {
    const tableViewportStyle: CSSProperties = { maxHeight: `${tableViewportHeight}px` };
    const rowIds = rows.map((c) => c.id);
    const selectedCount = rowIds.filter((id) => selectedLeadIds.includes(id)).length;
    const allSelected = rowIds.length > 0 && selectedCount === rowIds.length;
    const someSelected = selectedCount > 0 && !allSelected;
    const renderSortableHeader = (
      label: string,
      key: "name" | "pipeline" | "email" | "company" | "type" | "stage" | "liAccepted" | "employeeSize" | "areaGeo" | "activityCount" | "lastActivityDate" | "lastActivityType" | "createdAt",
    ) => {
      const active = tableSort.key === key;
      const directionLabel = active ? (tableSort.direction === "asc" ? "A-Z" : "Z-A") : "A-Z";
      return (
        <th className="px-3 py-2 text-left" key={key}>
          <button
            type="button"
            className={`inline-flex items-center gap-1 ${active ? "text-sky-300" : "text-slate-400 hover:text-slate-200"}`}
            onClick={() => updateTableSort(key)}
            aria-label={`Sort by ${label} ${directionLabel}`}
            title={`Sort by ${label} ${directionLabel}`}
          >
            <span>{label}</span>
            <span className="text-[10px] uppercase tracking-wide">{active ? (tableSort.direction === "asc" ? "A-Z" : "Z-A") : "↕"}</span>
          </button>
        </th>
      );
    };

    return (
      <div className={TABLE_MAX_HEIGHT_CLASS} style={tableViewportStyle}>
        <div className="crm-card min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-contain" data-no-pull-to-refresh>
          <table className="w-full min-w-[1240px] text-sm">
          <thead className="border-b border-neutral-800 text-slate-400">
            <tr>
              <th className="px-3 py-2 text-left">
                <input
                  type="checkbox"
                  className={checkboxClassName}
                  aria-label="Select all leads in this section"
                  checked={allSelected}
                  disabled={bulkDeleting}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={(e) => toggleSelectAllLeads(rows, e.target.checked)}
                />
              </th>
              <th className="px-3 py-2 text-left">Actions</th>
              {renderSortableHeader("Name", "name")}
              {renderSortableHeader("Company", "company")}
              {renderSortableHeader("Stage", "stage")}
              {renderSortableHeader("Email", "email")}
              <th className="px-3 py-2 text-left">LinkedIn</th>
              {renderSortableHeader("LI Accepted", "liAccepted")}
              {renderSortableHeader("Count of Activities", "activityCount")}
              {renderSortableHeader("Employee Size", "employeeSize")}
              {renderSortableHeader("Area/Geo", "areaGeo")}
              {renderSortableHeader("Last Activity Date", "lastActivityDate")}
              {renderSortableHeader("Last Activity Type", "lastActivityType")}
              {renderSortableHeader("Created", "createdAt")}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const editing = editingId === c.id;
              const pipelineType = (c.pipelineType || "connector") as "connector" | "icp";
              const stageOptions = stageOptionsForPipeline(pipelineType);
              const activityCount = (activities || []).filter((a: any) => a.contactId === c.id).length;
              return (
                <tr key={c.id} className="border-b border-neutral-900 hover:bg-neutral-900/60">
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      className={checkboxClassName}
                      checked={selectedLeadIds.includes(c.id)}
                      onChange={(e) => toggleLeadSelection(c.id, e.target.checked)}
                      aria-label={`Select ${c.firstName} ${c.lastName}`}
                    />
                  </td>
                  <td className="px-3 py-2">{editing ? <div className="flex gap-2"><button className="crm-btn-ghost" title="Save" aria-label="Save" onClick={saveInlineEdit}><Save size={14} className="text-emerald-300" /></button><button className="crm-btn-ghost" title="Cancel" aria-label="Cancel" onClick={cancelInlineEdit}><X size={14} className="text-rose-300" /></button></div> : <button className="crm-btn-ghost" title="Open tray" aria-label="Open tray" onClick={() => openTray(c)}><SquareArrowOutUpRight size={14} /></button>}</td>
                  <td className="px-3 py-2" onClick={() => !editing && startInlineEdit(c)}>{editing ? <div className="grid grid-cols-2 gap-1"><input className="crm-input" value={inlineDraft.firstName || ""} onChange={(e)=>setInlineDraft({...inlineDraft, firstName:e.target.value})} /><input className="crm-input" value={inlineDraft.lastName || ""} onChange={(e)=>setInlineDraft({...inlineDraft, lastName:e.target.value})} /></div> : <button className="font-medium text-sky-300 hover:text-sky-200" onClick={(e)=>{e.stopPropagation(); openTray(c);}}>{`${c.firstName} ${c.lastName}`}</button>}</td>
                  <td className="px-3 py-2 text-slate-300" onClick={() => !editing && startInlineEdit(c)}>{editing ? <input className="crm-input" value={inlineDraft.company || ""} onChange={(e)=>setInlineDraft({...inlineDraft, company:e.target.value})} /> : (c.company || "—")}</td>
                  <td className="px-3 py-2 text-emerald-300" onClick={() => !editing && startInlineEdit(c)}>{editing ? <select className="crm-input" value={inlineDraft.status || defaultStatusForPipeline(pipelineType)} onChange={(e)=>setInlineDraft({...inlineDraft, status:e.target.value})}>{stageOptions.map((s)=> <option key={s} value={s}>{s}</option>)}</select> : (c.status || defaultStatusForPipeline(pipelineType))}</td>
                  <td className="px-3 py-2 text-slate-300" onClick={() => !editing && startInlineEdit(c)}>{editing ? <input className="crm-input" value={inlineDraft.email || ""} onChange={(e)=>setInlineDraft({...inlineDraft, email:e.target.value})} /> : (c.email ? <span className="inline-flex items-center gap-1.5"><a href={gmailComposeUrl(c.email)} target="_blank" rel="noopener noreferrer" className="text-sky-300 hover:text-sky-200" onClick={(e)=>e.stopPropagation()} title="Compose email"><Mail size={13} /></a>{c.email}</span> : "—")}</td>
                  <td className="px-3 py-2 text-slate-300" onClick={() => !editing && startInlineEdit(c)}>{editing ? <input className="crm-input" value={inlineDraft.linkedin || ""} onChange={(e)=>setInlineDraft({...inlineDraft, linkedin:e.target.value})} /> : (c.linkedin ? <a href={c.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center" onClick={(e)=>e.stopPropagation()}><img src="https://cdn-icons-png.flaticon.com/512/2496/2496097.png" alt="LinkedIn" className="h-4 w-4" /></a> : "—")}</td>
                  <td className="px-3 py-2 text-slate-300" onClick={() => !editing && startInlineEdit(c)}>{editing ? <input type="checkbox" className={checkboxClassName} checked={Boolean(inlineDraft.liAccepted)} onChange={(e)=>setInlineDraft({...inlineDraft, liAccepted:e.target.checked})} aria-label="LI Accepted" /> : <input type="checkbox" className={checkboxClassName} checked={Boolean(c.liAccepted)} readOnly aria-label="LI Accepted" />}</td>
                  <td className="px-3 py-2 text-slate-300">{activityCount}</td>
                  <td className="px-3 py-2 text-slate-300" onClick={() => !editing && startInlineEdit(c)}>{editing ? <input className="crm-input" value={inlineDraft.employeeSize || ""} onChange={(e)=>setInlineDraft({...inlineDraft, employeeSize:e.target.value})} /> : (c.employeeSize || "—")}</td>
                  <td className="px-3 py-2 text-slate-300" onClick={() => !editing && startInlineEdit(c)}>{editing ? <input className="crm-input" value={inlineDraft.areaGeo || ""} onChange={(e)=>setInlineDraft({...inlineDraft, areaGeo:e.target.value})} /> : (c.areaGeo || "—")}</td>
                  <td className="px-3 py-2 text-slate-300">{c.lastActivityDate ? new Date(c.lastActivityDate).toLocaleDateString() : "—"}</td>
                  <td className="px-3 py-2 text-slate-300">{c.lastActivityType ? prettyType(String(c.lastActivityType)) : "—"}</td>
                  <td className="px-3 py-2 text-slate-400">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-lg sm:text-2xl font-bold inline-flex items-center gap-2 text-sky-200 whitespace-nowrap" style={{ fontFamily: "var(--font-playfair-display), serif" }}><Target size={20} /> Leads ({icpItems.length})</h1>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full min-w-[220px] sm:w-[280px]">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search leads"
              aria-label="Search leads"
              className="crm-input h-10 w-full pr-9"
            />
            {searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                aria-label="Clear search"
                title="Clear search"
              >
                <X size={14} />
              </button>
            ) : null}
          </div>
          <button
            title={bulkDeleting && bulkDeleteProgress ? `Deleting ${Math.min(bulkDeleteProgress.completed + 1, bulkDeleteProgress.total)} of ${bulkDeleteProgress.total}` : `Delete selected leads${selectedLeadIds.length ? ` (${selectedLeadIds.length})` : ""}`}
            aria-label={bulkDeleting && bulkDeleteProgress ? `Deleting ${Math.min(bulkDeleteProgress.completed + 1, bulkDeleteProgress.total)} of ${bulkDeleteProgress.total}` : `Delete selected leads${selectedLeadIds.length ? ` (${selectedLeadIds.length})` : ""}`}
            className="inline-flex items-center justify-center rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 font-semibold text-red-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={selectedLeadIds.length === 0 || bulkDeleting}
            onClick={() => {
              const idsToDelete = selectedLeadIds.filter((id) => icpItems.some((c) => c.id === id));
              askConfirm(
                `Delete ${idsToDelete.length} selected lead${idsToDelete.length === 1 ? "" : "s"}? This will also remove related activities, tasks, and stamps.`,
                () => { void bulkDeleteSelectedLeads(idsToDelete); },
                bulkDeleting ? "Deleting…" : "Delete selected",
              );
            }}
          >
            <Trash2 size={14} />
          </button>
          <button title="New lead" aria-label="New lead" className="inline-flex items-center justify-center rounded-lg bg-sky-700 px-3 py-2 font-semibold text-white hover:bg-sky-600" onClick={() => openCreate("icp")}><Plus size={14} /></button>
          <button title="Export CSV" aria-label="Export CSV" className="crm-btn-ghost inline-flex items-center gap-1.5" onClick={() => exportContacts(icpItems)}><Download size={14} /></button>
          <button title="Import CSV" aria-label="Import CSV" className="crm-btn-ghost inline-flex items-center gap-1.5" onClick={() => { setImportOpen(true); setImportError(""); setImportResult(null); }}><Upload size={14} /></button>
          <div className="inline-flex rounded-lg border border-neutral-700 p-1">
            <button className={`px-2 py-1 rounded ${view === "bucket" ? "bg-neutral-800 text-white" : "text-slate-400"}`} onClick={() => setView("bucket")}><LayoutGrid size={16} /></button>
            <button className={`px-2 py-1 rounded ${view === "table" ? "bg-neutral-800 text-white" : "text-slate-400"}`} onClick={() => setView("table")}><List size={16} /></button>
          </div>
        </div>
      </div>
      {inlineError ? <p className="text-sm text-red-300">{inlineError}</p> : null}

      {view === "bucket" ? (
        <div className="space-y-6">
          {boardSections.map((section) => (
            <section key={section.key} className="space-y-3">
              <div className="overflow-x-auto overscroll-x-contain pb-2" data-no-pull-to-refresh>
                <div className="flex gap-4 min-w-max">
                  {section.stages.map((stage, i) => {
                    const laneKey = `${section.key}:${stage}`;
                    const laneContacts = section.items.filter((c) => (c.status || defaultStatusForPipeline(c.pipelineType)) === stage);
                    return (
                      <div key={laneKey} className={`crm-card p-3 w-[240px] shrink-0 transition-all duration-150 ${hoverLane === laneKey ? "ring-2 ring-emerald-500/80 border-emerald-500/70" : ""}`} onDragOver={(e) => e.preventDefault()} onDragEnter={() => setHoverLane(laneKey)} onDragLeave={() => setHoverLane((s) => s === laneKey ? null : s)} onDrop={async () => { if (!draggingContactId) return; await moveContactStage(draggingContactId, stage); setDraggingContactId(null); setHoverLane(null); setHoverDrop(null); }}>
                        <h3 className={`mb-3 inline-flex items-center gap-1.5 font-semibold ${stageColorClass(stage)}`} style={{ fontFamily: "var(--font-libre-franklin), sans-serif" }}>
                          {stageLabel(stage, i)}
                          <span className="border-b border-slate-300 text-base font-semibold leading-none text-slate-100" style={{ fontFamily: "var(--font-libre-franklin), sans-serif" }}>
                            {laneContacts.length}
                          </span>
                        </h3>
                        <div className={`min-h-10 ${BOARD_LANE_MAX_HEIGHT_CLASS}`}>
                          {laneContacts.map((c, idx) => {
                            const cardLaneKey = `${section.key}:${stage}`;
                            return (
                              <div key={c.id}>
                                <div className={`my-1 h-1 rounded-full transition-all ${hoverDrop?.laneKey === cardLaneKey && hoverDrop.index === idx ? "bg-emerald-400" : "bg-transparent"}`} onDragOver={(e) => e.preventDefault()} onDragEnter={() => setHoverDrop({ laneKey: cardLaneKey, index: idx })} onDrop={async () => { if (!draggingContactId) return; await moveContactStage(draggingContactId, stage, idx); setDraggingContactId(null); setHoverLane(null); setHoverDrop(null); }} />
                                <button draggable onDragStart={() => setDraggingContactId(c.id)} onDragEnd={() => { setDraggingContactId(null); setHoverLane(null); setHoverDrop(null); }} className={`crm-card w-full min-w-0 p-3 text-left cursor-grab transition-all duration-300 ${draggingContactId === c.id ? "scale-[1.02] opacity-70" : ""} ${removingFromOpenIds.includes(c.id) ? "opacity-0 scale-95" : "opacity-100"}`} onClick={() => openTray(c)}>
                                  <p className="truncate font-semibold">{c.firstName} {c.lastName}</p>
                                  <p className="truncate text-[11px] text-slate-500">{pipelineLabel(c.pipelineType)}</p>
                                  <p className="truncate text-xs text-slate-400 inline-flex items-center gap-1.5">{c.email && <a href={gmailComposeUrl(c.email)} target="_blank" rel="noopener noreferrer" className="text-sky-300 hover:text-sky-200" onClick={(e)=>e.stopPropagation()} title="Compose email"><Mail size={12} /></a>}{c.email || "No email"}</p>
                                  {c.linkedin && <p className="truncate text-xs text-slate-400">{c.linkedin}</p>}
                                  <p className="truncate text-xs text-slate-500">{c.company || "No company"}</p>
                                  <p className="truncate text-xs text-slate-500">Type: {c.type || "—"}</p>
                                  <p className="mt-1 truncate text-[11px] text-emerald-300">Activities: {(activities || []).filter((a:any) => a.contactId === c.id).length}</p>
                                  {c.strengthTest === "Yes" ? (
                                    <span className="mt-1 inline-flex rounded border border-cyan-500/50 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-cyan-200">
                                      Strength Test
                                    </span>
                                  ) : null}
                                  {(c.pipelineType || "connector") === "connector" && c.status === "Intro Delivered" ? (
                                    <button type="button" className="mt-2 inline-flex rounded border border-emerald-500/50 bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/20" onClick={(e) => { e.stopPropagation(); removeFromOpen(c); }}>
                                      Archive delivered intro
                                    </button>
                                  ) : null}
                                  {(c.pipelineType || "connector") === "icp" && c.status === "Warm intro booked" ? (
                                    <button type="button" className="mt-2 inline-flex rounded border border-emerald-500/50 bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/20" onClick={(e) => { e.stopPropagation(); removeFromOpen(c); }}>
                                      Convert to deals
                                    </button>
                                  ) : null}
                                  {["Nurture", "Closed Lost"].includes(c.status || "") ? (
                                    <button type="button" className="mt-2 inline-flex rounded border border-amber-500/50 bg-amber-500/10 px-2 py-1 text-[11px] font-semibold text-amber-300 hover:bg-amber-500/20" onClick={(e) => { e.stopPropagation(); removeFromOpen(c); }}>
                                      Remove from open
                                    </button>
                                  ) : null}
                                  <button type="button" className="mt-2 inline-flex md:hidden rounded border border-neutral-700 px-2 py-1 text-[11px] text-slate-300" onClick={(e) => { e.stopPropagation(); setMovePicker({ open: true, contactId: c.id }); }}>
                                    Move
                                  </button>
                                </button>
                              </div>
                            );
                          })}
                          <div className={`mt-1 h-1 rounded-full transition-all ${hoverDrop?.laneKey === laneKey && hoverDrop.index === laneContacts.length ? "bg-emerald-400" : "bg-transparent"}`} onDragOver={(e) => e.preventDefault()} onDragEnter={() => setHoverDrop({ laneKey, index: laneContacts.length })} onDrop={async () => { if (!draggingContactId) return; await moveContactStage(draggingContactId, stage, laneContacts.length); setDraggingContactId(null); setHoverLane(null); setHoverDrop(null); }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <button className="inline-flex items-center gap-2 text-left text-base sm:text-xl font-bold text-sky-200" style={{ fontFamily: "var(--font-playfair-display), serif" }} onClick={() => setShowOpenContacts((v) => !v)}>
            {showOpenContacts ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            Open leads ({icpOpenItems.length})
          </button>
          {showOpenContacts && renderContactsTable(sortedIcpItems.filter((c) => !["Warm intro booked", "Nurture", "Closed Lost"].includes(c.status || "New") || !c.openBoardHidden))}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <button className="inline-flex items-center gap-2 text-left text-base sm:text-xl font-bold text-emerald-300" style={{ fontFamily: "var(--font-playfair-display), serif" }} onClick={() => setShowConverted((v) => !v)}>
            {showConverted ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            Converted to deals ({convertedItems.length})
          </button>
          {showConverted && (
            convertedItems.length > 0 ? renderContactsTable(sortedIcpItems.filter((c) => (c.status || "New") === "Warm intro booked" && c.openBoardHidden)) : (
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-slate-500">No leads have converted to deals yet.</div>
            )
          )}
        </div>

        <div className="space-y-2">
          <button className="inline-flex items-center gap-2 text-left text-base sm:text-xl font-bold text-cyan-300" style={{ fontFamily: "var(--font-playfair-display), serif" }} onClick={() => setShowClients((v) => !v)}>
            {showClients ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            Clients ({clientItems.length})
          </button>
          {showClients && (
            clientItems.length > 0 ? renderContactsTable(sortedIcpItems.filter((c) => clientContactIds.has(c.id))) : (
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-slate-500">No client leads yet.</div>
            )
          )}
        </div>

        <div className="space-y-2">
          <button className="inline-flex items-center gap-2 text-left text-base sm:text-xl font-bold text-amber-300" style={{ fontFamily: "var(--font-playfair-display), serif" }} onClick={() => setShowDisqualified((v) => !v)}>
            {showDisqualified ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            Nurture / closed lost ({disqualifiedItems.length})
          </button>
          {showDisqualified && (
            disqualifiedItems.length > 0 ? renderContactsTable(sortedIcpItems.filter((c) => (["Nurture", "Closed Lost"].includes(c.status || defaultStatusForPipeline(c.pipelineType)) && c.openBoardHidden))) : (
              <div className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-slate-500">No archived nurture or lost contacts.</div>
            )
          )}
        </div>
      </div>

      {importOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/55" onClick={() => setImportOpen(false)} />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-neutral-700 bg-neutral-950 p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Import contacts from CSV</h2>
              <button className="crm-btn-ghost inline-flex items-center gap-1.5" onClick={() => setImportOpen(false)}><X size={14} /> Close</button>
            </div>
            <div className="mt-4">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-slate-200 hover:bg-neutral-800">
                <Upload size={14} /> Choose file
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setImportError("");
                    setImportResult(null);
                    const text = await file.text();
                    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
                    if (parsed.errors?.length) {
                      setImportError(parsed.errors[0].message || "CSV parse error");
                      return;
                    }
                    const rows = parsed.data as any[];
                    const res = await fetch('/api/crm/contacts/import', {
                      method: 'POST',
                      headers: { 'content-type': 'application/json' },
                      body: JSON.stringify({ rows }),
                    });
                    const j = await res.json().catch(() => ({}));
                    if (!res.ok) {
                      setImportError(j.error || 'Import failed');
                      return;
                    }
                    setImportResult(j);
                    await load();
                  }}
                />
              </label>
              <p className="mt-3 text-xs text-slate-500">CSV headers accepted: Contact ID, Company, Website, Industry, Employee Size, First Name, Last Name, Title, Phone, Area/Geo, Linkedin Connect Request, LinkedIn Profile, Email Address, Source, Notes 1: Trigger, and Notes 2: Why Now?.</p>
              <p className="mt-1 text-xs text-slate-500">All listed columns are stored on the contact record. Export includes Contact ID, and reimporting with Contact ID updates missing fields only. A single Contact column still auto-splits into first and last name, and if pipelineType is omitted, imports default to leads.</p>
            </div>

            {importError && <p className="mt-3 text-sm text-red-300">{importError}</p>}
            {importResult && (
              <div className="mt-3 rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-sm">
                <p className="text-emerald-300">Created: {importResult.created} · Updated: {importResult.updated ?? 0} · Skipped: {importResult.skipped}</p>
                {importResult.errors?.length > 0 && (
                  <div className="mt-2 max-h-56 overflow-auto text-xs text-slate-300">
                    {importResult.errors.map((er: any, i: number) => <p key={i}>Row {er.row}: {er.reason}</p>)}
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      )}

      {draft && (
        <div className="fixed inset-0 z-40"><div className="absolute inset-0 bg-black/55" onClick={closeTray} />
          <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-neutral-700 bg-neutral-950 p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold">{createMode ? `New ${pipelineLabel(draft.pipelineType)}` : `${selected?.firstName || ""} ${selected?.lastName || ""}`}</h2><button className="crm-btn-ghost inline-flex items-center gap-1.5" onClick={closeTray}><X size={14} /> Close</button></div>
            <div className="mt-4 flex flex-wrap gap-2">
              {!createMode && !editMode ? (
                <button className="crm-btn inline-flex items-center gap-1.5" title="Open" aria-label="Open" onClick={() => setEditMode(true)}>
                  <Pencil size={14} />
                </button>
              ) : (
                <>
                  <button className="crm-btn inline-flex items-center gap-1.5" title="Save" aria-label="Save" onClick={() => saveContact(false)}>
                    <Save size={14} className="text-emerald-300" />
                    {createMode ? <span>Save</span> : null}
                  </button>
                  {createMode ? (
                    <button
                      className="crm-btn-ghost inline-flex items-center gap-1.5"
                      title="Save and add another"
                      aria-label="Save and add another"
                      onClick={() => saveContact(true)}
                    >
                      <Plus size={14} />
                      <span>Save + Add Another</span>
                    </button>
                  ) : (
                    <button className="crm-btn-ghost inline-flex items-center gap-1.5" title="Cancel" aria-label="Cancel" onClick={() => { setDraft({ ...selected }); setEditMode(false); setTrayError(""); }}>
                      <X size={14} className="text-rose-300" />
                    </button>
                  )}
                </>
              )}
              {!createMode && selected?.pipelineType !== "connector" && selected?.status === "Warm intro booked" && (
                <button className="crm-btn-ghost inline-flex items-center gap-1.5 text-amber-200" onClick={() => askConfirm("Unconvert this Lead contact and return it to the open funnel?", () => { unconvertFromTray(); }, "Unconvert")}>
                  Unconvert
                </button>
              )}
              {!createMode && <button className="crm-btn-ghost text-red-300 inline-flex items-center gap-1.5" title="Delete" aria-label="Delete" onClick={() => askConfirm("Are you sure you want to delete this record?", () => { deleteFromTray(); })}><Trash2 size={14} /></button>}
            </div>
            <div className="mt-5 min-h-0 flex-1 space-y-3 overflow-auto pb-10">
              {!createMode && (
                <>
                  <button className="flex w-full items-center gap-2 pt-2 text-sm font-semibold uppercase tracking-wider text-slate-300" onClick={() => setShowActivitiesSection((v) => !v)}>
                    {showActivitiesSection ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    Activities
                  </button>
                  {showActivitiesSection && <div className="rounded-xl border border-neutral-800 p-3">
                  <h3 className="mb-2 text-sm font-semibold text-slate-200">Log activity</h3>
                  <div className="grid gap-2 md:grid-cols-2">
                    <select className="crm-input" value={activityDraft.type || "email"} onChange={(e) => setActivityDraft({ ...activityDraft, type: e.target.value, contactId: selected.id })}>
                      <option value="email">Email</option>
                      <option value="call">Call</option>
                      <option value="text">Text</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="in_person">In person</option>
                      <option value="meeting">Meeting</option>
                    </select>
                    <input type="datetime-local" className="crm-input" value={activityDraft.occurredAtLocal || ""} onClick={openPicker} onFocus={openPicker} onChange={(e) => setActivityDraft({ ...activityDraft, occurredAtLocal: e.target.value, contactId: selected.id })} />
                  </div>
                  <textarea className="crm-input mt-2" placeholder="Activity note" value={activityDraft.note || ""} onChange={(e) => setActivityDraft({ ...activityDraft, note: e.target.value, contactId: selected.id })} />
                  {activityError && <p className="mt-2 text-sm text-red-300">{activityError}</p>}
                  <button className="crm-btn mt-2" onClick={async () => {
                    setActivityError("");
                    const res = await fetch('/api/crm/activities', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...activityDraft, contactId: selected.id, occurredAt: activityDraft.occurredAtLocal ? new Date(activityDraft.occurredAtLocal).toISOString() : undefined }) });
                    if (!res.ok) { const j = await res.json().catch(() => ({})); setActivityError(j.error || 'Could not log activity'); return; }
                    setActivityDraft({ type: "email", contactId: selected.id, note: "", occurredAtLocal: "" });
                    setActivities(await (await fetch('/api/crm/activities', { cache: 'no-store' })).json());
                  }}>Save activity</button>

                  <div className="mt-3 space-y-2">
                    {selectedActivities.map((a: any) => {
                      const note = String(a.note || "");
                      const pdfPathMatch = note.match(/(\/api\/strength-test\/submissions\/[^\s]+\/pdf)/);
                      const pdfPath = pdfPathMatch ? pdfPathMatch[1] : "";
                      const cleanNote = pdfPath ? note.replace(`PDF: ${pdfPath}`, "").trim() : note;

                      return (
                        <div key={a.id} className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-emerald-300 inline-flex items-center gap-1.5">{(() => { const I = activityTypeIcon(a.type); return <I size={12} />; })()}{prettyType(String(a.type))}</span>
                            <span className="text-slate-400">{new Date(a.occurredAt || a.createdAt).toLocaleString()}</span>
                          </div>
                          <p className="mt-1 text-slate-300">{cleanNote || "—"}</p>
                          {pdfPath ? (
                            <a href={pdfPath} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 rounded border border-cyan-400/40 bg-cyan-500/10 px-2 py-1 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/20">
                              <Paperclip size={12} aria-hidden />
                              Strength Test PDF
                            </a>
                          ) : null}
                        </div>
                      );
                    })}
                    {selectedActivities.length === 0 && <p className="text-xs text-slate-500">No activities yet.</p>}
                  </div>
                </div>}
                </>
              )}

              <button className="flex w-full items-center gap-2 pt-2 text-sm font-semibold uppercase tracking-wider text-slate-300" onClick={() => setShowDetailSection((v) => !v)}>
                {showDetailSection ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                Contact details
              </button>
              {showDetailSection && (
                <div>
                  <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Pipeline</label>
                  {(editMode || createMode) ? (
                    <select className="crm-input" value={draft.pipelineType || "icp"} onChange={(e) => setDraft({ ...draft, pipelineType: e.target.value, status: defaultStatusForPipeline(e.target.value) })}>
                      <option value="connector">Connector</option>
                      <option value="icp">Lead</option>
                    </select>
                  ) : <p onDoubleClick={() => setEditMode(true)} className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm cursor-text">{pipelineLabel(draft.pipelineType)}</p>}
                </div>
              )}
              {showDetailSection && contactFields.map(([k, label, type]) => (
                <div key={k}>
                  <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">{label}</label>
                  {(editMode || createMode) ? (
                    k === "type" ? (
                      <select className="crm-input" value={draft[k] || ""} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })}>
                        <option value="">Select type</option>
                        {CONTACT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    ) : k === "primaryPain" ? (
                      <select className="crm-input" value={draft[k] || ""} onChange={(e) => setDraft({ ...draft, [k]: e.target.value || undefined })}>
                        <option value="">Select primary pain</option>
                        {PRIMARY_PAIN_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    ) : k === "strengthTest" ? (
                      <select className="crm-input" value={draft[k] || ""} onChange={(e) => setDraft({ ...draft, [k]: e.target.value || null })}>
                        <option value="">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                     ) : k === "liAccepted" ? (
                      <label className="inline-flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-slate-200">
                        <input type="checkbox" className={checkboxClassName} checked={Boolean(draft[k])} onChange={(e) => setDraft({ ...draft, [k]: e.target.checked })} />
                        <span>Accepted</span>
                      </label>
                     ) : k === "seederNotes" || type === "textarea" ? (
                      <textarea className="crm-input" value={draft[k] || ""} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} />
                    ) : (
                      <input type={type === "select" ? "text" : type} className="crm-input" value={draft[k] || ""} onChange={(e) => setDraft({ ...draft, [k]: type === "number" ? Number(e.target.value || 0) : e.target.value })} />
                    )
                  ) : <p onDoubleClick={() => setEditMode(true)} className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm cursor-text">{type === "checkbox" ? (draft[k] ? "Yes" : "No") : (draft[k] || "—")}</p>}
                </div>
              ))}
              {showDetailSection && (
                <>
                  <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">{draft.pipelineType === "connector" ? "Connector stage" : "Lead stage"}</label>{(editMode || createMode) ? <select className="crm-input" value={draft.status || defaultStatusForPipeline(draft.pipelineType)} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>{stageOptionsForPipeline(draft.pipelineType).map((s, i) => <option key={s} value={s}>{stageLabel(s, i)}</option>)}</select> : <p onDoubleClick={() => setEditMode(true)} className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm cursor-text">{draft.status || defaultStatusForPipeline(draft.pipelineType)}</p>}</div>
                  <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Disqualification reason{(editMode || createMode) && (["Nurture", "Closed Lost"].includes(draft.status || "")) ? " *" : ""}</label>{(editMode || createMode) ? <select className="crm-input" value={draft.disqualificationReason || ""} onChange={(e) => setDraft({ ...draft, disqualificationReason: e.target.value || undefined })}><option value="">Select reason</option>{DISQUALIFICATION_REASONS.map((s) => <option key={s} value={s}>{s}</option>)}</select> : <p onDoubleClick={() => setEditMode(true)} className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm cursor-text">{draft.disqualificationReason || "—"}</p>}</div>
                  <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">What now?{(editMode || createMode) && (["Nurture", "Closed Lost"].includes(draft.status || "")) ? " *" : ""}</label>{(editMode || createMode) ? <select className="crm-input" value={draft.whatNow || ""} onChange={(e) => setDraft({ ...draft, whatNow: e.target.value || undefined })}><option value="">Select next path</option>{WHAT_NOW_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</select> : <p onDoubleClick={() => setEditMode(true)} className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm cursor-text">{draft.whatNow || "—"}</p>}</div>
                  <div><label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Notes</label>{(editMode || createMode) ? <textarea className="crm-input min-h-28" value={draft.notes || ""} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /> : <p onDoubleClick={() => setEditMode(true)} className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm whitespace-pre-wrap cursor-text">{draft.notes || "—"}</p>}</div>
                </>
              )}

              {!createMode && (
                <>
                  <button className="mt-3 flex w-full items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-300" onClick={() => setShowDealsSection((v) => !v)}>
                    {showDealsSection ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    Associated deals
                  </button>
                  {showDealsSection && <div className="rounded-xl border border-neutral-800 p-3">
                    {deals.filter((d:any) => d.contactId === selected?.id).length > 0 ? (
                      <div className="space-y-2">
                        {deals.filter((d:any) => d.contactId === selected?.id).map((d:any) => (
                          <button key={d.id} className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-left text-sm hover:bg-neutral-800" onClick={() => window.location.href = '/crm/deals'}>
                            <span className="font-medium text-slate-100">{d.name || 'Untitled deal'}</span>
                            <span className="ml-2 text-slate-400">• {d.stage || '—'}</span>
                          </button>
                        ))}
                      </div>
                    ) : <p className="text-xs text-slate-500">No associated deals.</p>}
                  </div>}

                  <h3 className="pt-2 text-sm font-semibold uppercase tracking-wider text-slate-300">Completed tasks</h3>
                  <div className="rounded-xl border border-neutral-800 p-3">
                    {tasks.filter((t:any) => (t.relatedType === 'contact' && t.relatedId === selected?.id) && (t.status === 'Completed' || t.done)).length > 0 ? (
                      <div className="space-y-2">
                        {tasks.filter((t:any) => (t.relatedType === 'contact' && t.relatedId === selected?.id) && (t.status === 'Completed' || t.done)).map((t:any) => (
                          <div key={t.id} className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs">
                            <p className="font-medium text-slate-200">{t.title || 'Task'}</p>
                            <p className="text-slate-400">{t.type || 'task'}{t.dueDate ? ` • ${t.dueDate}` : ''}</p>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-xs text-slate-500">No completed tasks.</p>}
                  </div>
                </>
              )}

              {trayError && <p className="text-sm text-red-300">{trayError}</p>}
            </div>
          </aside>
        </div>
      )}

      {dqModal.open && (
        <div className="fixed inset-0 z-[75]">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDqModal({ open: false, disqualificationReason: "", whatNow: "", error: "", saving: false })} />
          <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-neutral-700 bg-neutral-900 p-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-100">Complete disqualification details</h3>
            <p className="mt-1 text-xs text-slate-400">To move this contact into nurture or closed lost, please complete both required fields.</p>
            <div className="mt-3 space-y-2">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Disqualification reason *</label>
                <select className="crm-input" value={dqModal.disqualificationReason} onChange={(e) => setDqModal((prev) => ({ ...prev, disqualificationReason: e.target.value, error: "" }))}>
                  <option value="">Select reason</option>
                  {DISQUALIFICATION_REASONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-wider text-slate-400">What now? *</label>
                <select className="crm-input" value={dqModal.whatNow} onChange={(e) => setDqModal((prev) => ({ ...prev, whatNow: e.target.value, error: "" }))}>
                  <option value="">Select next path</option>
                  {WHAT_NOW_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            {dqModal.error ? <p className="mt-2 text-sm text-red-300">{dqModal.error}</p> : null}
            <div className="mt-4 flex justify-end gap-2">
              <button className="crm-btn-ghost" onClick={() => setDqModal({ open: false, disqualificationReason: "", whatNow: "", error: "", saving: false })}>Cancel</button>
              <button className="crm-btn" disabled={dqModal.saving} onClick={saveDisqualificationModal}>{dqModal.saving ? "Saving..." : "Save and move"}</button>
            </div>
          </div>
        </div>
      )}

      {movePicker.open && (
        <div className="fixed inset-0 z-[70] md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMovePicker({ open: false })} />
          <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-neutral-700 bg-neutral-900 p-4 shadow-2xl">
            <h3 className="text-sm font-semibold text-slate-100">Move contact to stage</h3>
            <div className="mt-3 grid gap-2">
              {stageOptionsForPipeline(items.find((c) => c.id === movePicker.contactId)?.pipelineType).map((s) => (
                <button key={s} className="crm-btn-ghost text-left" onClick={async () => { if (!movePicker.contactId) return; await moveContactStage(movePicker.contactId, s); setMovePicker({ open: false }); }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmState.open}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel || "Delete"}
        onCancel={() => setConfirmState({ open: false, message: "", action: null, confirmLabel: "Delete" })}
        onConfirm={() => {
          const action = confirmState.action;
          setConfirmState({ open: false, message: "", action: null, confirmLabel: "Delete" });
          action?.();
        }}
      />
    </div>
  );
}
