"use client";

import { useState } from "react";
import { Download, Upload } from "lucide-react";
import Papa from "papaparse";

type PipelineType = "connector" | "icp";

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

function csvEscape(value: unknown) {
  const stringValue = String(value ?? "");
  if (!/[",\n]/.test(stringValue)) return stringValue;
  return `"${stringValue.replace(/"/g, '""')}"`;
}

function normalizeContactsPayload(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.contacts)) return payload.contacts;
  return [];
}

function getPipelineFromRow(row: any) {
  const value = String(
    row?.pipelineType ||
      row?.["Pipeline type"] ||
      row?.pipeline ||
      row?.Pipeline ||
      ""
  )
    .trim()
    .toLowerCase();
  return value === "connector" ? "connector" : value === "icp" ? "icp" : "";
}

function applyDefaultPipeline(rows: any[], pipelineType: PipelineType) {
  return rows.map((row) => {
    if (getPipelineFromRow(row)) return row;
    return { ...row, pipelineType };
  });
}

export default function CrmDataTools() {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  async function fetchContacts() {
    const res = await fetch("/api/crm/contacts", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Could not load contacts");
    return normalizeContactsPayload(data);
  }

  async function exportContacts(pipelineType: PipelineType) {
    setError("");
    setResult(null);
    setStatus("Exporting...");
    try {
      const contacts = await fetchContacts();
      const rows = contacts.filter((c) => (c.pipelineType || "icp") === pipelineType);
      const csv = [
        EXPORT_HEADERS.join(","),
        ...rows.map((contact: any) =>
          EXPORT_HEADERS.map((header) => {
            if (header === "contactId") return csvEscape(contact.id || "");
            return csvEscape(contact[header] ?? "");
          }).join(",")
        ),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${pipelineType === "connector" ? "crm-connectors" : "crm-leads"}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setStatus(`Exported ${rows.length} ${pipelineType === "connector" ? "connectors" : "leads"}.`);
    } catch (e: any) {
      setStatus("");
      setError(e?.message || "Export failed");
    }
  }

  async function importCsv(file: File, pipelineType: PipelineType) {
    setError("");
    setResult(null);
    setStatus("Importing...");
    try {
      const text = await file.text();
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      if (parsed.errors?.length) {
        throw new Error(parsed.errors[0].message || "CSV parse error");
      }
      const rows = applyDefaultPipeline((parsed.data as any[]) || [], pipelineType);
      const res = await fetch("/api/crm/contacts/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Import failed");
      setResult(data);
      setStatus(`Import complete for ${pipelineType === "connector" ? "connectors" : "leads"}.`);
    } catch (e: any) {
      setStatus("");
      setError(e?.message || "Import failed");
    }
  }

  return (
    <section className="crm-card p-4">
      <h2 className="font-semibold">CRM data tools</h2>
      <p className="mt-2 text-sm text-slate-400">Import and export leads/connectors from here.</p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded border border-neutral-800 p-3">
          <p className="text-sm font-semibold text-slate-200">Connectors</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="crm-btn-ghost inline-flex items-center gap-1.5" onClick={() => exportContacts("connector")} type="button">
              <Download size={14} /> Export CSV
            </button>
            <label className="crm-btn-ghost inline-flex cursor-pointer items-center gap-1.5">
              <Upload size={14} /> Import CSV
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  await importCsv(file, "connector");
                  e.currentTarget.value = "";
                }}
              />
            </label>
          </div>
        </div>

        <div className="rounded border border-neutral-800 p-3">
          <p className="text-sm font-semibold text-slate-200">Leads</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="crm-btn-ghost inline-flex items-center gap-1.5" onClick={() => exportContacts("icp")} type="button">
              <Download size={14} /> Export CSV
            </button>
            <label className="crm-btn-ghost inline-flex cursor-pointer items-center gap-1.5">
              <Upload size={14} /> Import CSV
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  await importCsv(file, "icp");
                  e.currentTarget.value = "";
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {status ? <p className="mt-3 text-sm text-emerald-300">{status}</p> : null}
      {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
      {result ? (
        <div className="mt-3 rounded border border-neutral-800 bg-neutral-900 p-3 text-xs text-slate-300">
          Created: {result.created || 0} · Updated: {result.updated || 0} · Skipped: {result.skipped || 0}
        </div>
      ) : null}
    </section>
  );
}
