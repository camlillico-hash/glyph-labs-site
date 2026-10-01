import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import styles from "./page.module.css";

const url = "https://www.camlillico.com/how-bos360-works";
const title = "What BOS360 Is, What It Isn’t, and What You’re Actually Getting";
const description =
  "BOS360 helps founder-led leadership teams create greater clarity, accountability and execution. Learn what BOS360 is, what it isn’t, and how the approach works.";

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
      <a className={styles.skipLink} href="#article">Skip to content</a>
      <header className={styles.header}>
        <div className={styles.container}>
          <Link className={styles.brand} href="/" aria-label="BOS360 — Cam Lillico, home">
            <Image src="/bos360-logo-white-bg.png" alt="BOS360" width={501} height={125} sizes="128px" />
            <span>Cam Lillico</span>
          </Link>
          <Link className={styles.back} href="/">Back to coaching</Link>
        </div>
      </header>

      <main id="article" tabIndex={-1} className={styles.container}>
        <article className={styles.article}>
          <header className={styles.articleHeader}>
            <p className={styles.eyebrow}>The BOS360 approach</p>
            <h1>{title}</h1>
            <p className={styles.lead}>
              A growing company can have good people and a sound strategy, yet still
              struggle to turn decisions into consistent action. Often the way it is
              run has not kept pace with the business.
            </p>
          </header>

          <div className={styles.prose}>
            <p>
              There is a stage in a growing company when working harder stops
              producing the same return. The founder is still capable. The leadership
              team is full of good people. The opportunities are real. Yet decisions
              take longer, priorities drift, and issues everyone thought were settled
              keep coming back.
            </p>
            <p>Usually the company has changed faster than the way it is run.</p>
            <p>
              When there were fewer people and fewer moving parts, the founder could
              keep the whole picture in their head. A quick conversation could settle
              a decision. Everyone knew what mattered because they worked close to
              one another. Growth adds people, customers, decisions and competing
              demands. That informal approach starts to strain. The founder becomes
              the point of connection between functions, and the team spends more time
              reacting than moving the business forward.
            </p>
            <p>That is the problem BOS360 is designed to address.</p>

            <h2>A system for running the business</h2>
            <p>
              BOS360 is a management system for founder-led companies. It gives a
              leadership team a practical way to set direction, focus its effort,
              measure progress, resolve issues and work together. It is more than a
              planning session, a better meeting agenda or a set of goals. Those
              things matter, but they need to connect.
            </p>
            <p>At its simplest, the team needs to answer three questions repeatedly:</p>
            <ol>
              <li>Where are we going?</li>
              <li>What matters right now?</li>
              <li>What is getting in the way?</li>
            </ol>
            <p>
              The first question gives people a shared direction. The second forces
              choices: a company cannot treat every good idea as a priority. The third
              makes it possible to address reality while there is still time to act.
              Together, those conversations create a rhythm between strategy and
              daily work. Decisions turn into clear ownership; progress becomes
              visible; problems have somewhere to go.
            </p>
            <p>
              The BOS360 Core Model looks at Business, Brand and Team through the
              lenses of Strategy, Execution and Culture. It is a reminder that the
              parts of a company affect one another. A sales issue may be a positioning
              issue. A profitability issue may start in operations. A people issue may
              be a lack of role clarity or a decision nobody has made. Labelling the
              symptom correctly matters less than finding the issue underneath it and
              doing something about it.
            </p>
            <p>
              The model helps a team see the whole company without turning every
              conversation into a framework exercise.
            </p>

            <h2>Where I fit</h2>
            <p>
              My role sits somewhere between facilitator, operating advisor and
              coach. Each describes part of the job; none quite covers it.
            </p>
            <p>
              I ask questions a leadership team may not stop to ask itself. I
              challenge assumptions, help separate symptoms from causes, and
              facilitate conversations that are easy to postpone when everyone is
              busy running a function. I push vague ideas toward a decision: what
              matters, who owns it, how we will know it is working, and when we will
              look again.
            </p>
            <p>
              I do not become the CEO or a fractional COO. I do not take over
              departments or disappear for a month and return with a deck of answers.
              The leadership team makes the decisions and does the work. My job is to
              help them build a better way to do both.
            </p>
            <p>
              This is also why an outside person can help. In a difficult leadership
              conversation, the CEO is often expected to contribute, guide the
              discussion, challenge weak thinking and remain neutral at the same
              time. That is a hard set of roles to hold. I have no department to
              defend and no preferred answer that needs to win. I can concentrate on
              the quality of the conversation and the decision that comes out of it.
            </p>

            <h2>What it is not</h2>
            <p>
              BOS360 is not traditional management consulting. You are not hiring me
              to study the business and hand back a report full of recommendations
              that someone else must somehow implement. We work with the people who
              run the company, on the decisions they actually face.
            </p>
            <p>
              It is not outsourced execution. I will help make priorities and
              accountability clear, but your leaders remain responsible for their
              functions and results. If the system only works while I am in the room,
              it is not doing its job.
            </p>
            <p>
              It is not leadership therapy. Trust, candour and team dynamics matter
              because they affect decisions and performance. We address them in
              service of a healthier, more effective organization.
            </p>
            <p>
              And it is not rigid framework implementation. BOS360 is a scaffold,
              not a cage. A company should keep tools that already work. If your team
              uses OKRs well, we do not need to rename them for the sake of adopting
              a system. The point is to make direction, execution and accountability
              work together, with enough consistency to be useful and enough
              judgment to fit the business.
            </p>

            <h2>What changes</h2>
            <p>
              There is no single meeting or planning day that fixes a company.
              Improvement tends to compound. The team becomes clearer about what
              matters. Fewer priorities compete for the same capacity. Owners know
              what they have committed to, and progress can be discussed without
              guesswork. Issues surface earlier and get resolved closer to where
              they arise. Leadership meetings become a place to make decisions
              rather than exchange updates.
            </p>
            <p>
              Over time, more initiatives finish. The team spends more time working
              on the business, not only inside it. The founder can participate as a
              leader without being the backstop for every important decision.
            </p>
            <p>
              That does not mean every week becomes tidy or every disagreement
              disappears. Growing companies are complicated. A good operating system
              gives the team a way to deal with that complexity together, repeatedly,
              instead of starting from scratch each time it shows up.
            </p>
            <p className={styles.closingThought}>
              The goal of BOS360 isn’t to create a company that is good at BOS360.
              It’s to create a company that is good at running itself.
            </p>
          </div>

          <footer className={styles.articleCta}>
            <p>If this sounds like the problem your leadership team is trying to solve, we can talk about what it looks like in your company.</p>
            <a className={styles.bookingLink} href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
              Book an Intro Call <ArrowUpRight size={20} strokeWidth={1.6} aria-hidden="true" />
            </a>
            <p className={styles.alternative}>Not ready to talk? <Link href="/strength-test">Take the BOS360 Strength Test.</Link></p>
          </footer>
        </article>
      </main>
      <footer className={`${styles.container} ${styles.siteFooter}`}>
        <p>Cam Lillico</p><p>© {new Date().getFullYear()} Cam Lillico Coaching. All rights reserved.</p>
      </footer>
    </div>
  );
}
