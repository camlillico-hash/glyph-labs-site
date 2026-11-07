import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, X } from "lucide-react";
import styles from "./page.module.css";

const url = "https://www.camlillico.com/how-bos360-works";
const title = "What BOS360 Is, What It Isn’t, and What You’re Actually Getting";
const description =
  "BOS360 is a management system for founder-led companies. See how it connects direction, decisions and week-to-week execution.";

export const metadata: Metadata = {
  title: "What Is BOS360? How the Business Operating System Works | Cam Lillico",
  description,
  alternates: { canonical: url },
  openGraph: {
    title,
    description,
    url,
    type: "article",
    images: [{
      url: "https://www.camlillico.com/cam-headshot-circle.png",
      width: 420,
      height: 420,
      alt: "Cam Lillico, Certified BOS360 Business Coach",
    }],
  },
  twitter: { card: "summary", title, description },
};

const BOOKING_URL = "https://calendar.notion.so/meet/camlillico/bos360-intro";

export default function HowBos360WorksPage() {
  return (
    <div className={styles.page}>
      <a className={styles.skip} href="#article">Skip to content</a>
      <header className={`${styles.siteHeader} ${styles.wrap}`}>
        <Link className={styles.brand} href="/" aria-label="BOS360 — Cam Lillico, home">
          <Image
            src="/bos360-logo-white-bg.png"
            alt="BOS360"
            width={501}
            height={125}
            sizes="(max-width: 565px) 102px, 142px"
            loading="eager"
          />
          <span>Cam Lillico</span>
        </Link>
        <Link className={styles.underlined} href="/">Back to coaching</Link>
      </header>
      <main id="article" tabIndex={-1}>
        <article>
          <header aria-label="Article opening">
            <div className={`${styles.wrap} ${styles.mastheadGrid}`}>
              <div className={styles.heroText}>
                <p className={styles.eyebrow}>The BOS360 approach</p>
                <h1>{title}</h1>
                <p className={styles.lead}>BOS360 is a management system for founder-led companies.</p>
              </div>
              <figure className={styles.model} aria-label="The BOS360 Core Model">
                <Image
                  src="/bos360-core-model.png"
                  alt="Business, Brand and Team overlap through Strategy, Execution and Culture, with BOS360 at the centre."
                  width={690}
                  height={652}
                  sizes="(max-width: 565px) 186px, 245px"
                  loading="eager"
                />
                <figcaption>The BOS360 Core Model</figcaption>
              </figure>
              <nav className={styles.index} aria-label="On this page">
                <div className={styles.indexLabel}>On this page</div>
                <div className={styles.indexLinks}>
                  <a href="#rhythm"><span aria-hidden="true">01</span> What that actually looks like</a>
                  <a href="#role"><span aria-hidden="true">02</span> Where I fit</a>
                  <a href="#boundaries"><span aria-hidden="true">03</span> What BOS360 is not</a>
                  <a href="#outcomes"><span aria-hidden="true">04</span> What changes when it works</a>
                </div>
              </nav>
            </div>
          </header>
          <div className={styles.opening}>
            <div className={`${styles.wrap} ${styles.openingGrid}`}>
              <div className={styles.reading}>
                <p>
                  It gives a leadership team a practical way to decide where the company is going,
                  determine what matters most right now, deal with the issues getting in the way, and
                  make sure decisions actually turn into action.
                </p>
                <p>
                  It is not another strategy exercise. It is not a set of meetings. And it is not me
                  coming into your company and running it for you.
                </p>
              </div>
              <div className={styles.assertion}>
                <p><strong>It is a way of running the business.</strong></p>
              </div>
            </div>
          </div>
          <section className={`${styles.chapter} ${styles.wrap}`} id="rhythm" aria-labelledby="rhythm-title">
            <div className={styles.chapterHead}>
              <span className={styles.chapterNumber} aria-hidden="true">01</span>
              <h2 id="rhythm-title">What that actually looks like</h2>
              <div className={`${styles.reading} ${styles.chapterIntro}`}>
                <p>Most growing companies do not have a shortage of ideas.</p>
                <p>The problem is connecting long-term direction to what the leadership team does every week.</p>
                <p>BOS360 creates that connection through a simple operating rhythm.</p>
              </div>
            </div>
            <div className={styles.steps}>
              <section className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">01</span>
                <h3 className={styles.stepTitle}>Establish the foundation</h3>
                <div className={styles.reading}>
                  <p>We start by getting the leadership team clear on the business itself:</p>
                  <ul>
                    <li>Where are we going?</li>
                    <li>What matters most?</li>
                    <li>How will we measure whether we are making progress?</li>
                    <li>Who owns what?</li>
                    <li>What issues are preventing the company from moving forward?</li>
                  </ul>
                  <p>The goal is not to produce a strategy document. It is to create enough <strong>shared clarity</strong> that the team can make better decisions without constantly returning to the founder for direction.</p>
                </div>
              </section>
              <section className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">02</span>
                <h3 className={styles.stepTitle}>Decide what matters now</h3>
                <div className={styles.reading}>
                  <p>
                    The leadership team periodically steps out of the day-to-day business to look at the
                    company as a whole.
                  </p>
                  <p>We assess where things actually stand, resolve the most important issues, and agree on the <strong>small number of priorities</strong> that matter most for the next period.</p>
                  <p><strong>That forces choices.</strong></p>
                  <p>Every growing company has more things it <em>could</em> do than it has the capacity to execute. The job of the leadership team is to decide what deserves attention now — and what does not.</p>
                </div>
              </section>
              <section className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">03</span>
                <h3 className={styles.stepTitle}>Run the business week to week</h3>
                <div className={styles.reading}>
                  <p>The system then moves into the normal rhythm of the company.</p>
                  <p>
                    Leadership meetings are used to track important numbers, review commitments, surface
                    issues, make decisions and maintain accountability.
                  </p>
                  <p>Instead of strategy living in one conversation and execution happening somewhere else, <strong>the two stay connected.</strong></p>
                  <p>At its simplest, the team keeps returning to three questions:</p>
                  <ol>
                    <li>Where are we going?</li>
                    <li>What matters right now?</li>
                    <li>What is getting in the way?</li>
                  </ol>
                  <p><strong>That rhythm is the core of BOS360.</strong></p>
                </div>
              </section>
            </div>
          </section>
          <section className={`${styles.chapter} ${styles.role}`} id="role" aria-labelledby="role-title">
            <div className={styles.wrap}>
              <div className={styles.chapterHead}>
                <span className={styles.chapterNumber} aria-hidden="true">02</span>
                <h2 id="role-title">Where I fit</h2>
              </div>
              <div className={styles.roleGrid}>
                <div className={`${styles.reading} ${styles.roleCopy}`}>
                  <p>My role sits somewhere between <strong>facilitator, operating advisor and coach</strong>.</p>
                  <p>I work with the leadership team to install the system and help them use it well.</p>
                  <p>
                    That means asking questions the team may not stop to ask itself, challenging
                    assumptions, separating symptoms from underlying issues and pushing vague
                    conversations toward decisions.
                  </p>
                  <p>I also create space for conversations that can be difficult for a CEO to lead alone.</p>
                  <p>
                    A CEO is often expected to participate in a decision, challenge the team&apos;s
                    thinking, manage the conversation and remain neutral at the same time.
                  </p>
                  <p>
                    An outside facilitator changes that dynamic. I have no department to protect and no
                    internal answer that needs to win. My job is to help the team get to the best
                    decision it can.
                  </p>
                </div>
                <div className={styles.roleAside}>
                  <div className={`${styles.reading} ${styles.roleQuestions}`}>
                    <Image src="/cam-headshot-circle.png" alt="Cam Lillico" width={420} height={420} sizes="54px" />
                    <ul>
                      <li>What matters?</li>
                      <li>Who owns it?</li>
                      <li>What are we actually deciding?</li>
                      <li>How will we know whether it worked?</li>
                      <li>What happens next?</li>
                    </ul>
                  </div>
                  <div className={`${styles.reading} ${styles.roleBoundary}`}>
                    <p>But I do not become the <strong>CEO or a fractional COO</strong>.</p>
                    <p>I do not <strong>take over departments.</strong></p>
                    <p>And I do not disappear, study the company and <strong>return with a presentation</strong> telling everyone what they should do.</p>
                    <div className={styles.roleTakeaway}>
                      <p>The leadership team continues to run the business.</p>
                      <p>My job is to help them become better at doing it.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className={`${styles.chapter} ${styles.wrap}`} id="boundaries" aria-labelledby="boundaries-title">
            <div className={styles.chapterHead}>
              <span className={styles.chapterNumber} aria-hidden="true">03</span>
              <h2 id="boundaries-title">What BOS360 is not</h2>
            </div>
            <div className={styles.contrasts}>
              <section className={styles.contrast}>
                <div className={styles.contrastTitle}>
                  <span className={styles.contrastMark} aria-hidden="true"><X size={14} strokeWidth={1.65} /></span>
                  <h3>It is not traditional consulting</h3>
                </div>
                <div className={styles.reading}>
                  <p>You are not hiring me to diagnose the business and hand you a report.</p>
                  <p>
                    We work directly with the people running the company on the real decisions and
                    issues they are facing.
                  </p>
                </div>
              </section>
              <section className={styles.contrast}>
                <div className={styles.contrastTitle}>
                  <span className={styles.contrastMark} aria-hidden="true"><X size={14} strokeWidth={1.65} /></span>
                  <h3>It is not outsourced management</h3>
                </div>
                <div className={styles.reading}>
                  <p>Your leaders continue to own their functions, priorities and results.</p>
                  <p>
                    The system should create stronger leadership inside the company, not dependence on
                    someone outside it.
                  </p>
                </div>
              </section>
              <section className={styles.contrast}>
                <div className={styles.contrastTitle}>
                  <span className={styles.contrastMark} aria-hidden="true"><X size={14} strokeWidth={1.65} /></span>
                  <h3>It is not executive coaching</h3>
                </div>
                <div className={styles.reading}>
                  <p>
                    There is coaching involved, particularly with founders and leadership teams, but the
                    work is centred on how the company operates.
                  </p>
                  <p>The unit of improvement is the business, not simply the individual executive.</p>
                </div>
              </section>
              <section className={styles.contrast}>
                <div className={styles.contrastTitle}>
                  <span className={styles.contrastMark} aria-hidden="true"><X size={14} strokeWidth={1.65} /></span>
                  <h3>It is not a planning workshop</h3>
                </div>
                <div className={styles.reading}>
                  <p>
                    Planning is part of the system, but a good quarterly plan is not particularly
                    valuable if it disappears into everyone&apos;s day jobs three weeks later.
                  </p>
                  <p>The operating rhythm between planning sessions is what turns decisions into execution.</p>
                </div>
              </section>
            </div>
          </section>
          <section className={`${styles.chapter} ${styles.outcomes}`} id="outcomes" aria-labelledby="outcomes-title">
            <div className={styles.wrap}>
              <div className={styles.chapterHead}>
                <span className={styles.chapterNumber} aria-hidden="true">04</span>
                <h2 id="outcomes-title">What changes when it works</h2>
                <div className={`${styles.reading} ${styles.chapterIntro}`}>
                  <p>BOS360 does not remove the complexity of running a growing company.</p>
                  <p>It gives the leadership team a better way to deal with it.</p>
                </div>
              </div>
              <div className={`${styles.reading} ${styles.results}`}>
                <ul>
                  <li>Priorities become clearer.</li>
                  <li>Fewer initiatives compete for the same people and capacity.</li>
                  <li>Leadership meetings become places where issues are resolved and decisions are made instead of simply exchanging updates.</li>
                  <li>Commitments become visible.</li>
                  <li>Problems surface earlier.</li>
                  <li>Important decisions stop depending entirely on the founder.</li>
                  <li>More of the leadership team begins thinking about the company as a whole instead of only its own function.</li>
                </ul>
              </div>
              <div className={`${styles.reading} ${styles.outcomeNote}`}>
                <p>
                  And over time, the business becomes less dependent on informal knowledge, heroic
                  effort and the founder holding everything together.
                </p>
                <p>That is the real objective.</p>
              </div>
              <div className={styles.closing}>
                <p>
                  The goal of BOS360 is not to create a company that is good at BOS360.
                  <span className={styles.closingLine}>It is to create a company that is good at running itself.</span>
                </p>
              </div>
            </div>
          </section>
          <footer>
            <div className={`${styles.wrap} ${styles.callInner}`}>
              <p>If that sounds like the problem your leadership team is trying to solve, we should talk.</p>
              <div className={styles.actions}>
                <a className={styles.book} href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
                  Book an Intro Call <ArrowUpRight size={20} strokeWidth={1.6} aria-hidden="true" />
                </a>
                <p>
                  Not ready to talk?{" "}
                  <Link className={styles.underlined} href="/strength-test">Take the BOS360 Strength Test.</Link>
                </p>
              </div>
            </div>
          </footer>
        </article>
      </main>
      <footer className={`${styles.siteFooter} ${styles.wrap}`}>
        <p>Cam Lillico</p>
        <p>© {new Date().getFullYear()} Cam Lillico Coaching. All rights reserved.</p>
      </footer>
    </div>
  );
}
