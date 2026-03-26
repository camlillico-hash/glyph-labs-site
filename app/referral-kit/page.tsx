import React from "react";
import CopyButton from "./CopyButton";

export const metadata = {
  title: "Referral Kit | Cam Lillico",
  robots: { index: false, follow: false },
};

const BOOKING_URL = "https://calendar.app.google/M4pokXD8CBpc1c4U6";

export default function ReferralKitPage() {
  return (
    <main className="coaching-theme min-h-screen bg-neutral-950 text-slate-100">
      {/* Background glow accents */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#ed7d31]/20 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-neutral-600/20 blur-3xl" />
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-3">
          <div className="inline-flex min-w-0 items-center gap-2" aria-label="Cam Lillico Coaching">
            <a href="/coaching" className="inline-flex items-center" aria-label="Cam Lillico Coaching home">
              <img
                src="/logos/glyphlabs-coaching-mark.png"
                alt="Coaching mark"
                className="h-7 w-7 object-contain sm:h-8 sm:w-8"
              />
            </a>
            <span className="hidden rounded-full border border-neutral-600 bg-neutral-800/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-orange-200 sm:inline-flex">
              Cam Lillico Business Coaching
            </span>
          </div>

          <div className="flex items-center gap-2 whitespace-nowrap">
            <a
              href="/strength-test"
              className="rounded-lg border border-cyan-400/50 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/10"
            >
              Start Strength Test
            </a>
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-gradient-to-r from-orange-300 via-[#ed7d31] to-orange-500 px-3 py-2 text-xs font-semibold text-slate-950"
            >
              Book an Intro Call
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 pt-2 sm:hidden">
        <span className="mobile-coaching-badge inline-flex rounded-full border border-neutral-600 bg-neutral-800/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-orange-200">
          Cam Lillico Business Coaching
        </span>
      </div>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-6 pb-8 pt-10 md:pb-10 md:pt-12">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-200">Referral Kit</p>
        <h1 className="mt-3 max-w-5xl text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          Know a founder or leadership team stuck in <span className="text-orange-200">scaling complexity</span>?
        </h1>
        <p className="mt-5 max-w-3xl text-lg text-slate-300">
          This is a practical toolkit to help you identify a strong-fit referral, spot the trigger moments, and make an intro that
          lands clean.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-300 via-[#ed7d31] to-orange-500 px-5 py-3 text-sm font-semibold text-slate-950"
          >
            Book an Intro Call
          </a>
          <a
            href="#copy-paste"
            className="inline-flex items-center justify-center rounded-xl border border-neutral-700 bg-neutral-900/40 px-5 py-3 text-sm font-semibold text-slate-100 hover:bg-neutral-900/70"
          >
            Jump to Copy/Paste Intros
          </a>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="space-y-6">
              <Card title="Identifying the right profile for high-impact coaching." subtitle="Use this to qualify quickly." >
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950/30 p-4">
                    <p className="text-sm font-semibold text-orange-200">The Ideal Fit</p>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
                      <li>Founder/leadership team is scaling and feeling the strain (complexity, people, priorities).</li>
                      <li>They want an operating cadence — not just advice.</li>
                      <li>They’re open to clarity, accountability, and consistent execution rhythms.</li>
                    </ul>
                  </div>
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950/30 p-4">
                    <p className="text-sm font-semibold text-orange-200">Not a Fit</p>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
                      <li>They want a magic bullet or a single tactic.</li>
                      <li>No appetite for leadership accountability or weekly discipline.</li>
                      <li>They’re looking for done-for-you consulting vs. installing a system the team runs.</li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card title="Listen for these “Trigger Moments”" subtitle="Signals they’re ready for structure." >
                <ul className="list-disc space-y-2 pl-5 text-sm text-slate-300">
                  <li>“We’re busy, but not making progress.”</li>
                  <li>“Everyone’s working hard, but priorities keep changing.”</li>
                  <li>“We keep having the same conversations.”</li>
                  <li>“Execution is inconsistent.”</li>
                  <li>“We need the leadership team aligned.”</li>
                </ul>
              </Card>

              <Card title="Installing the Business Operating System (BOS360)" subtitle="What we actually implement." >
                <ul className="list-disc space-y-2 pl-5 text-sm text-slate-300">
                  <li>Clarity on the critical few priorities.</li>
                  <li>Operating rhythms that translate strategy into weekly execution.</li>
                  <li>Scorecards and accountability that create momentum.</li>
                  <li>A leadership cadence the team can sustain.</li>
                </ul>
              </Card>

              <Card title="Why refer to Cam?" subtitle="What makes this different." >
                <ul className="list-disc space-y-2 pl-5 text-sm text-slate-300">
                  <li>Direct, structured, execution-first coaching (not theory-heavy).</li>
                  <li>Focused on leadership alignment + operating cadence.</li>
                  <li>Designed for founders/teams navigating scale.
                  </li>
                </ul>
              </Card>

              <Card title="Micro-Cases" subtitle="Quick examples you can reference." >
                <ul className="list-disc space-y-2 pl-5 text-sm text-slate-300">
                  <li>Unclear priorities → installed a weekly cadence + scorecard to stabilize execution.</li>
                  <li>Leadership misalignment → clarified roles, decisions, and quarterly priorities.</li>
                  <li>Growth chaos → built an operating system that reduced thrash and improved follow-through.</li>
                </ul>
              </Card>

              <Card title="How the process begins." subtitle="What happens after you refer." >
                <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-300">
                  <li>Warm intro (email/text is perfect).</li>
                  <li>Short intro call to confirm fit and context.</li>
                  <li>Next step is a structured discovery with the leadership team (if it’s a match).</li>
                </ol>
              </Card>

              <Card id="copy-paste" title="Copy / Paste Intros" subtitle="Use any of these and edit freely." >
                <div className="space-y-4">
                  <IntroBlock
                    label="Simple intro"
                    text={`Hey [Name] — I want to introduce you to Cam Lillico. He helps growth-stage founders and leadership teams install an operating cadence so priorities are clear and execution improves week by week.\n\nCam, [Name] is building [Company] and is currently navigating [context]. I think it’s worth a quick intro call to see if there’s a fit.`}
                  />
                  <IntroBlock
                    label="Trigger-moment intro"
                    text={`Hey [Name] — introducing you to Cam Lillico. He works with founders/leadership teams who are hitting that “scaling complexity” phase — lots of activity, but priorities and execution start to get noisy.\n\n[Name] — based on what you shared about [trigger moment], I think Cam would be a strong conversation.`}
                  />
                  <IntroBlock
                    label="Direct CTA intro"
                    text={`Hey [Name] — meet Cam Lillico. Cam helps leadership teams build a practical operating system (BOS360) so they execute with clarity, accountability, and momentum.\n\nIf you’re open, here’s his booking link for a quick intro call: ${BOOKING_URL}`}
                  />
                </div>
              </Card>

              <Card title="After the intro." subtitle="What you can expect." >
                <ul className="list-disc space-y-2 pl-5 text-sm text-slate-300">
                  <li>I’ll reply quickly, suggest a time, and run a short fit-focused intro call.</li>
                  <li>If there’s alignment, we’ll move into a deeper discovery step.</li>
                  <li>If it’s not a fit, I’ll say so fast (no dragging it out).</li>
                </ul>
              </Card>
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-2xl border border-neutral-700 bg-neutral-900/50 p-6 shadow-lg shadow-black/30">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-200">Ready to make a connection?</p>
                <h2 className="mt-2 text-2xl font-bold">Send the intro, then book the call.</h2>
                <p className="mt-3 text-sm text-slate-300">
                  Use the copy/paste templates, then grab a time on the calendar.
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  <a
                    href={BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-gradient-to-r from-orange-300 via-[#ed7d31] to-orange-500 px-5 text-center text-sm font-semibold text-slate-950"
                  >
                    Book Intro Call
                  </a>
                  <a
                    href="/coaching"
                    className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-neutral-700 bg-neutral-950/40 px-5 text-center text-sm font-semibold text-slate-100 hover:bg-neutral-900/70"
                  >
                    Back to Coaching
                  </a>
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/30 p-6">
                <p className="text-sm font-semibold text-orange-200">Notes</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
                  <li>This page is intentionally noindex/nofollow.</li>
                  <li>Feel free to forward this link to a prospective referral partner.</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <footer className="border-t border-neutral-800 bg-neutral-950/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-slate-400">
          <p>© {new Date().getFullYear()} Cam Lillico</p>
          <p className="text-xs">Referral Kit • BOS360 Coaching</p>
        </div>
      </footer>
    </main>
  );
}

function Card({ id, title, subtitle, children }: { id?: string; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section
      id={id}
      className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 shadow-lg shadow-black/20"
    >
      <h2 className="text-xl font-bold">{title}</h2>
      {subtitle ? <p className="mt-2 text-sm text-slate-300">{subtitle}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function IntroBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950/30 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-200">{label}</p>
        <CopyButton
          text={text}
          className="rounded-lg border border-neutral-700 bg-neutral-900/60 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-neutral-900"
        >
          Copy
        </CopyButton>
      </div>
      <pre className="mt-3 whitespace-pre-wrap break-words text-sm text-slate-300">{text}</pre>
    </div>
  );
}
