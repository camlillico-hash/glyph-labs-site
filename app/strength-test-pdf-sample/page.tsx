export default function StrengthTestPdfSamplePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-slate-100 px-6 py-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold">Strength Test PDF Preview (Sample)</h1>
        <p className="mt-2 text-sm text-slate-300">
          Use this page to review PDF branding/layout without completing the full test.
        </p>
        <div className="mt-4 flex gap-3">
          <a
            href="/api/strength-test/sample-pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-cyan-400/50 px-3 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-500/10"
          >
            Open PDF in new tab
          </a>
          <a
            href="/strength-test-pdf-sample"
            className="rounded border border-neutral-600 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-neutral-800"
          >
            Refresh preview
          </a>
        </div>

        <div className="mt-5 rounded-xl border border-neutral-700 bg-neutral-900 p-2">
          <iframe
            title="Strength Test PDF Preview"
            src="/api/strength-test/sample-pdf"
            className="h-[80vh] w-full rounded border border-neutral-800 bg-white"
          />
        </div>
      </div>
    </main>
  );
}
