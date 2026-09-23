"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Download } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { questions, sectionDescriptions } from "./questions";
import { scoreLabel, sectionPercent, strengthSections, type StrengthSection } from "@/lib/strength-test-score";
import styles from "./page.module.css";

const BOOKING_URL = "https://calendar.notion.so/meet/camlillico/bos360-intro";
const sampleScores: Record<StrengthSection, number> = {
  Business: 85,
  Brand: 65,
  Team: 70,
  Strategy: 55,
  Execution: 75,
  Culture: 80,
};

type LeadForm = {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  website: string;
};

function Header({ inTest = false }: { inTest?: boolean }) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link className={styles.brand} href="/" aria-label="BOS360 — Cam Lillico, home">
          <Image src="/bos360-logo-white-bg.png" alt="BOS360" width={128} height={32} priority />
          <span>Cam Lillico</span>
        </Link>
        <Link className={styles.headerLink} href="/">
          {inTest ? "Exit assessment" : "Back to coaching"}
        </Link>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <span>Cam Lillico</span>
      <span>© {new Date().getFullYear()} Cam Lillico Coaching</span>
    </footer>
  );
}

function RatingBar({ percent }: { percent: number }) {
  return (
    <div className={styles.barTrack} aria-hidden="true">
      <span className={styles.barFill} style={{ width: String(percent) + "%" }} />
    </div>
  );
}

export default function StrengthTestPage() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [index, setIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadError, setLeadError] = useState("");
  const [resultSaving, setResultSaving] = useState(false);
  const [resultError, setResultError] = useState("");
  const [resultPdfUrl, setResultPdfUrl] = useState("");
  const [leadForm, setLeadForm] = useState<LeadForm>({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phone: "",
    website: "",
  });
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLHeadingElement>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
  }, []);

  useEffect(() => {
    if (showLeadModal) firstFieldRef.current?.focus();
  }, [showLeadModal]);

  useEffect(() => {
    if (started && !submitted) questionRef.current?.focus();
  }, [index, started, submitted]);

  useEffect(() => {
    if (!showLeadModal) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !leadSubmitting) {
        setShowLeadModal(false);
        startButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [showLeadModal, leadSubmitting]);

  const subtotals = useMemo(() => {
    const totals = Object.fromEntries(strengthSections.map((section) => [section, 0])) as Record<StrengthSection, number>;
    for (const question of questions) totals[question.section] += answers[question.id] ?? 0;
    return totals;
  }, [answers]);

  const total = strengthSections.reduce((sum, section) => sum + subtotals[section], 0);
  const completed = Object.keys(answers).length;
  const current = questions[index];
  const selected = answers[current.id];
  const ranked = [...strengthSections].sort((a, b) => sectionPercent(subtotals[b], b) - sectionPercent(subtotals[a], a));
  const strongest = ranked[0];
  const opportunity = ranked[ranked.length - 1];
  const strongestTied = sectionPercent(subtotals[ranked[0]], ranked[0]) === sectionPercent(subtotals[ranked[1]], ranked[1]);
  const opportunityTied = sectionPercent(subtotals[ranked[ranked.length - 1]], ranked[ranked.length - 1]) === sectionPercent(subtotals[ranked[ranked.length - 2]], ranked[ranked.length - 2]);

  function keepFocusInModal(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab" || !modalRef.current) return;
    const focusable = [...modalRef.current.querySelectorAll<HTMLElement>('input:not([tabindex="-1"]), button:not(:disabled)')];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function updateLead(field: keyof LeadForm, value: string) {
    setLeadForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  function selectScore(score: number) {
    setAnswers((prior) => ({ ...prior, [current.id]: score }));
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    if (index < questions.length - 1) {
      advanceTimerRef.current = setTimeout(() => {
        setIndex((questionIndex) => Math.min(questions.length - 1, questionIndex + 1));
        advanceTimerRef.current = null;
      }, 180);
    }
  }

  function goToQuestion(questionIndex: number) {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = null;
    setIndex(questionIndex);
  }

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLeadError("");
    setLeadSubmitting(true);
    try {
      const response = await fetch("/api/strength-test/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(leadForm),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(response.status >= 500 ? "The assessment could not start right now. Please try again shortly." : data?.error || "Please check your details and try again.");
      }
      setShowLeadModal(false);
      setStarted(true);
    } catch (error) {
      setLeadError(error instanceof Error ? error.message : "The assessment could not start right now.");
    } finally {
      setLeadSubmitting(false);
    }
  }

  async function submitResults() {
    setResultError("");
    setResultSaving(true);
    try {
      const response = await fetch("/api/strength-test/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...leadForm,
          overallScore: total,
          sectionScores: subtotals,
          answers: questions.map((question) => ({
            questionId: question.id,
            section: question.section,
            questionText: question.text,
            score: answers[question.id] ?? 0,
          })),
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(response.status >= 500 ? "Your results could not be saved right now. Your answers are still here; please try again." : data?.error || "Please try again.");
      }
      const data = await response.json();
      setResultPdfUrl(String(data.pdfUrl || ""));
      setSubmitted(true);
    } catch (error) {
      setResultError(error instanceof Error ? error.message : "Your results could not be saved right now.");
    } finally {
      setResultSaving(false);
    }
  }

  if (!started) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.landing}>
          <div className={styles.landingCopy}>
            <p className={styles.eyebrow}>BOS360 Strength Test</p>
            <h1>See where your business is strong—and where execution needs work.</h1>
            <p className={styles.lead}>Answer 20 questions across the six parts of the BOS360 Core Model. See what’s working and where your leadership team needs focus.</p>
            <button ref={startButtonRef} className={styles.primaryButton} type="button" onClick={() => setShowLeadModal(true)}>
              Take the assessment <ArrowRight size={18} aria-hidden="true" />
            </button>
            <p className={styles.smallNote}>About 5 minutes · Results and a PDF report at the end</p>
            <p className={styles.contactNote}>I’ll ask for your name, company and email, then personally review your results and follow up with context.</p>
          </div>
          <div className={styles.preview} aria-label="Illustrative results preview">
            <p className={styles.previewEyebrow}>A clearer picture</p>
            <h2>Six dimensions. One place to focus.</h2>
            <p>Illustrative results preview</p>
            <ul className={styles.previewList}>
              {strengthSections.map((section) => (
                <li key={section}>
                  <div className={styles.previewRow}><span>{section}</span><strong>{sampleScores[section]}%</strong></div>
                  <RatingBar percent={sampleScores[section]} />
                </li>
              ))}
            </ul>
          </div>
        </main>
        <Footer />

        {showLeadModal && (
          <div className={styles.modalBackdrop} onMouseDown={(event) => {
            if (event.target === event.currentTarget && !leadSubmitting) {
              setShowLeadModal(false);
              startButtonRef.current?.focus();
            }
          }}>
            <div ref={modalRef} className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="lead-title" aria-describedby="lead-description" onKeyDown={keepFocusInModal}>
              <p className={styles.eyebrow}>Before you begin</p>
              <h2 id="lead-title">A few details, then you’re in.</h2>
              <p id="lead-description">I’ll personally review your results and follow up by email with context. Your phone number is optional.</p>
              <form onSubmit={submitLead}>
                <div className={styles.fieldPair}>
                  <label>First name <span aria-hidden="true">*</span><input ref={firstFieldRef} value={leadForm.firstName} onChange={(event) => updateLead("firstName", event.target.value)} autoComplete="given-name" required /></label>
                  <label>Last name <span aria-hidden="true">*</span><input value={leadForm.lastName} onChange={(event) => updateLead("lastName", event.target.value)} autoComplete="family-name" required /></label>
                </div>
                <label>Company <span aria-hidden="true">*</span><input value={leadForm.company} onChange={(event) => updateLead("company", event.target.value)} autoComplete="organization" required /></label>
                <label>Email <span aria-hidden="true">*</span><input type="email" value={leadForm.email} onChange={(event) => updateLead("email", event.target.value)} autoComplete="email" required /></label>
                <label>Phone <span className={styles.optional}>(optional)</span><input type="tel" inputMode="tel" pattern="^\+?[0-9()\-\s]{7,20}$" value={leadForm.phone} onChange={(event) => updateLead("phone", event.target.value)} autoComplete="tel" /></label>
                <input className={styles.honeypot} tabIndex={-1} autoComplete="off" aria-hidden="true" value={leadForm.website} onChange={(event) => updateLead("website", event.target.value)} />
                {leadError && <p className={styles.error} role="alert">{leadError}</p>}
                <div className={styles.modalActions}>
                  <button className={styles.quietButton} type="button" onClick={() => { setShowLeadModal(false); startButtonRef.current?.focus(); }} disabled={leadSubmitting}>Cancel</button>
                  <button className={styles.primaryButton} type="submit" disabled={leadSubmitting}>{leadSubmitting ? "Starting…" : "Start the assessment"} <ArrowRight size={16} aria-hidden="true" /></button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (submitted) {
    return (
      <div className={styles.page}>
        <Header />
        <main className={styles.results}>
          <p className={styles.eyebrow}>Your BOS360 Strength Test</p>
          <div className={styles.resultsLead}>
            <div>
              <h1>Your results, at a glance.</h1>
              <p className={styles.resultsIntro}>This is a starting point for a sharper conversation about how your company runs—not a verdict on your team.</p>
            </div>
            {resultPdfUrl && <a className={styles.reportButton} href={resultPdfUrl} target="_blank" rel="noopener noreferrer"><Download size={21} aria-hidden="true" /><span><strong>Download my report</strong><small>Full results and every answer</small></span></a>}
          </div>
          <section className={styles.summary} aria-label="Overall result">
            <div>
              <p className={styles.statLabel}>Overall score</p>
              <p className={styles.overallNumber}>{total}<span>%</span></p>
              <p className={styles.rating}>{scoreLabel(total)}</p>
            </div>
            <div className={styles.summaryText}>
              <p><strong>{strongest}</strong> is {strongestTied ? "among your highest-scoring areas" : "your highest-scoring area"} today.</p>
              {strongest !== opportunity && <p><strong>{opportunity}</strong> is {opportunityTied ? "among your lowest-scoring areas and worth attention next" : "your lowest-scoring area and a place to focus next"}.</p>}
              <p className={styles.smallNote}>Based on your self-assessment across six BOS360 dimensions.</p>
            </div>
          </section>
          <section className={styles.breakdown} aria-labelledby="breakdown-title">
            <div className={styles.sectionHeading}>
              <div><p className={styles.eyebrow}>The breakdown</p><h2 id="breakdown-title">Where you stand</h2></div>
              <p>Each score is shown as a percentage of the available points in that dimension.</p>
            </div>
            <ul className={styles.scoreList}>
              {strengthSections.map((section) => {
                const percent = sectionPercent(subtotals[section], section);
                return (
                  <li key={section}>
                    <div className={styles.scoreLine}>
                      <strong>{section}</strong>
                      <span>{scoreLabel(percent)}</span>
                      <b>{percent}%</b>
                    </div>
                    <RatingBar percent={percent} />
                  </li>
                );
              })}
            </ul>
            <details className={styles.details}>
              <summary>What the six dimensions cover</summary>
              <dl>
                {strengthSections.map((section) => <div key={section}><dt>{section}</dt><dd>{sectionDescriptions[section]}</dd></div>)}
              </dl>
            </details>
          </section>
          <section className={styles.nextStep}>
            <div>
              <p className={styles.eyebrow}>Your next step</p>
              <h2>Talk through what the scores mean for your company.</h2>
              <p>I’ll review your responses. In an intro call, we can discuss where execution is breaking down and whether BOS360 can help.</p>
              <a className={styles.primaryButton} href={BOOKING_URL} target="_blank" rel="noopener noreferrer">Book an Intro Call <ArrowUpRight size={18} aria-hidden="true" /></a>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header inTest />
      <main className={styles.questionPage}>
        <div className={styles.questionShell}>
          <div className={styles.questionMeta}><span className={styles.eyebrow}>{current.section}</span><span>Question {index + 1} of {questions.length}</span></div>
          <div className={styles.progressTrack} role="progressbar" aria-label="Assessment progress" aria-valuenow={completed} aria-valuemin={0} aria-valuemax={questions.length}>
            <span style={{ width: String((completed / questions.length) * 100) + "%" }} />
          </div>
          <h1 ref={questionRef} tabIndex={-1} className={styles.questionTitle}>{current.text}</h1>
          <fieldset className={styles.scale}>
            <legend>How true is this for your company today?</legend>
            <div className={styles.scaleOptions}>
              {[0, 1, 2, 3, 4, 5].map((score) => (
                <label key={score} className={selected === score ? styles.selectedScore : undefined}>
                  <input type="radio" name={"question-" + current.id} value={score} checked={selected === score} onChange={() => selectScore(score)} />
                  <span>{score}</span>
                </label>
              ))}
            </div>
            <p className={styles.scaleEnds}><span>0 · Not in place</span><span>5 · Consistently true</span></p>
          </fieldset>
          <div className={styles.questionActions}>
            <button className={styles.quietButton} type="button" onClick={() => goToQuestion(Math.max(0, index - 1))} disabled={index === 0}>Back</button>
            {index < questions.length - 1 ? (
              selected !== undefined && <button className={styles.continueButton} type="button" onClick={() => goToQuestion(index + 1)}>Keep this answer <ArrowRight size={17} aria-hidden="true" /></button>
            ) : (
              <button className={styles.primaryButton} type="button" onClick={submitResults} disabled={completed !== questions.length || resultSaving}>{resultSaving ? "Saving…" : "See my results"} <ArrowRight size={17} aria-hidden="true" /></button>
            )}
          </div>
          {resultError && <p className={styles.error} role="alert">{resultError}</p>}
        </div>
      </main>
      <Footer />
    </div>
  );
}
