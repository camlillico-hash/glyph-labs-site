import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, Check, Compass, UsersRound, Workflow } from "lucide-react";
import styles from "./page.module.css";

const BOOKING_URL = "https://calendar.notion.so/meet/camlillico/bos360-intro";
const title = "BOS360 Business Coaching | Cam Lillico";
const description =
  "Cam Lillico helps founder-led companies use BOS360 to create clearer direction, stronger accountability and more consistent execution.";

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  openGraph: {
    title,
    description,
    type: "website",
    images: [
      {
        url: "https://bos360-site.vercel.app/cam-headshot-circle.png",
        width: 420,
        height: 420,
        alt: "Cam Lillico, Certified BOS360 Business Coach",
      },
    ],
  },
  twitter: { card: "summary", title, description },
  icons: { icon: "/bos360/icon.png", apple: "/bos360/icon.png" },
};

const symptoms = [
  "Priorities keep shifting",
  "Accountability still depends on the founder",
  "The same important issues keep returning",
];

const outcomes = [
  {
    title: "Vision",
    icon: Compass,
    text: "Everyone understands where the company is going and what matters most.",
  },
  {
    title: "Momentum",
    icon: Workflow,
    text: "Priorities, meetings and accountability create consistent execution.",
  },
  {
    title: "Health",
    icon: UsersRound,
    text: "The leadership team handles difficult issues openly and works as one team.",
  },
];

const fitCriteria = [
  "Founder-led company",
  "A functioning leadership team is in place",
  "Growth is creating complexity or execution friction",
  "The team is willing to have honest conversations and adopt a system",
];

function BookingLink({ compact = false }: { compact?: boolean }) {
  return (
    <a
      className={`${styles.bookingLink} ${compact ? styles.compactBooking : ""}`}
      href={BOOKING_URL}
      target="_blank"
      rel="noopener noreferrer"
    >
      Book an Intro Call
      {!compact && <ArrowUpRight size={20} strokeWidth={1.6} aria-hidden="true" />}
    </a>
  );
}

export default function Bos360V3Page() {
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#main-content">Skip to content</a>

      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <a className={styles.brand} href="#main-content" aria-label="BOS360 — Cam Lillico">
            <Image
              src="/bos360-logo-white-bg.png"
              alt="BOS360"
              width={501}
              height={125}
              className={styles.logo}
              sizes="128px"
            />
            <span>Cam Lillico</span>
          </a>
          <BookingLink compact />
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <section className={`${styles.container} ${styles.hero}`} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>BOS360 Business Coach</p>
            <h1 id="hero-title" className={styles.heroTitle}>
              Turn Vision Into<br className={styles.desktopBreak} /> Consistent Execution
            </h1>
            <p className={styles.heroDescription}>
              I help founder-led companies build the clarity, accountability and
              operating rhythm needed to scale without everything depending on
              the founder.
            </p>
            <div className={styles.heroActions}>
              <BookingLink />
              <a className={styles.textLink} href="/strength-test">Take the Strength Test</a>
            </div>
            <p className={styles.heroCredibility}>
              Certified BOS360 Coach <span aria-hidden="true">·</span> Growth-stage operator{" "}
              <span aria-hidden="true">·</span> Based in Ontario
            </p>
          </div>
          <figure className={styles.portrait}>
            <Image
              src="/cam-headshot-circle.png"
              alt="Cam Lillico, BOS360 business coach"
              width={420}
              height={420}
              priority
              sizes="(max-width: 599px) 180px, (max-width: 899px) 230px, 320px"
              className={styles.headshot}
            />
            <figcaption className={styles.portraitCaption}>
              <div><strong>Cam Lillico</strong><span>Your BOS360 coach</span></div>
            </figcaption>
          </figure>
        </section>

        <section className={`${styles.container} ${styles.section} ${styles.problem}`} aria-labelledby="problem-title">
          <h2 id="problem-title" className={styles.sectionTitle}>
            Growth Exposes the Gaps in How a Company Operates
          </h2>
          <p className={styles.intro}>The business may be growing, but the leadership system has not kept pace.</p>
          <ul className={styles.symptoms}>
            {symptoms.map((symptom, index) => (
              <li key={symptom}>
                <span className={styles.number} aria-hidden="true">0{index + 1}</span>
                <p>{symptom}</p>
              </li>
            ))}
          </ul>
          <p className={styles.transition}>
            These are rarely isolated people problems. They are usually signs
            that the company needs a stronger operating system.
          </p>
        </section>

        <section className={`${styles.container} ${styles.section} ${styles.system}`} aria-labelledby="system-title">
          <div>
            <h2 id="system-title" className={styles.sectionTitle}>A Practical System for Running the Business Better</h2>
            <p className={styles.intro}>
              BOS360 gives leadership teams a shared framework for setting
              direction, executing consistently and building a healthier organization.
            </p>
            <dl className={styles.outcomes}>
              {outcomes.map((outcome) => (
                <div key={outcome.title}>
                  <dt><outcome.icon className={styles.outcomeIcon} strokeWidth={1.6} aria-hidden="true" />{outcome.title}</dt>
                  <dd>{outcome.text}</dd>
                </div>
              ))}
            </dl>
          </div>
          <figure className={styles.model}>
            <Image
              src="/bos360-core-model.png"
              alt="BOS360 Core Model: Business, Brand and Team overlap through Strategy, Execution and Culture, with BOS360 at the centre."
              width={690}
              height={652}
              sizes="(max-width: 599px) 90vw, (max-width: 899px) 360px, 400px"
              className={styles.modelImage}
            />
            <figcaption>The BOS360 Core Model</figcaption>
          </figure>
        </section>

        <section className={styles.proof} aria-labelledby="proof-title">
          <div className={styles.container}>
            <h2 id="proof-title" className={styles.proofLabel}>A founder’s perspective</h2>
            <figure className={styles.testimonial}>
              <blockquote>
                <p>“Working with Cam through the BOS360 framework has been
                transformative for our leadership team. Cam has helped us align
                on the highest priorities, improve communication, and build
                stronger accountability across the team.”</p>
              </blockquote>
              <figcaption><strong>Brennan Smith</strong><span>CEO, CTC Communications</span></figcaption>
            </figure>
          </div>
          <div className={styles.trustDetails}>
            <div className={styles.container}>
              <ul className={styles.credentials} aria-label="Credentials and experience">
                <li>
                  <Image src="/badge-bos360.png" alt="BOS360 Certified Business Coach badge" width={890} height={817} sizes="88px" />
                  <div><strong>Certified BOS360 Coach</strong></div>
                </li>
                <li>
                  <Image src="/bos360-v3/innovation-cluster-expert-in-residence.png" alt="Innovation Cluster Expert in Residence badge" width={1254} height={1254} sizes="88px" />
                  <div><strong>Expert in Residence</strong><span>Innovation Cluster</span></div>
                </li>
                <li>
                  <Image src="/badge-eos.jpg" alt="EOS Entrepreneurial Operating System logo" width={307} height={307} sizes="88px" />
                  <div><strong>EOS Implementor</strong><span>2020–2025</span></div>
                </li>
              </ul>
              <div className={styles.experience}>
                <p>Growth-stage operating experience<br />with teams at</p>
                <ul className={styles.companyLogos} aria-label="Company experience">
                  <li><Image src="/credential-touchbistro-from-url.png" alt="TouchBistro" width={4716} height={822} sizes="145px" /></li>
                  <li><Image src="/credential-autohost.png" alt="Autohost" width={600} height={83} sizes="145px" /></li>
                  <li><Image src="/bos360-v3/ctc-medical-communications.png" alt="CTC Medical Communications" width={10000} height={2089} sizes="(max-width: 599px) 45vw, 192px" className={styles.ctcLogo} /></li>
                  <li><Image src="/bos360-v3/merchant-logo.svg" alt="Merchant" width={240} height={24} /></li>
                  <li><Image src="/credential-kira-talent.png" alt="Kira Talent" width={345} height={94} sizes="145px" /></li>
                  <li><Image src="/credential-ten-thousand-coffees.png" alt="Ten Thousand Coffees (10KC)" width={270} height={148} sizes="90px" className={styles.coffeesLogo} /></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.container} ${styles.section} ${styles.fit}`} aria-labelledby="fit-title">
          <div className={styles.fitIntro}>
            <h2 id="fit-title" className={styles.sectionTitle}>Built for Leadership Teams Ready to Operate Differently</h2>
            <ul className={styles.fitCriteria}>
              {fitCriteria.map((criterion) => (
                <li key={criterion}><Check className={styles.fitIcon} strokeWidth={1.8} aria-hidden="true" />{criterion}</li>
              ))}
            </ul>
          </div>
          <div className={styles.finalCta}>
            <h3>Let’s Determine Whether BOS360 Fits Your Company</h3>
            <p>We’ll discuss your current stage, where execution is breaking down and whether BOS360 is the right next step.</p>
            <BookingLink />
            <p className={styles.quietAlternative}>Not ready to talk? <a className={styles.textLink} href="/strength-test">Take the Strength Test.</a></p>
          </div>
        </section>
      </main>

      <footer className={`${styles.container} ${styles.footer}`}>
        <p>Cam Lillico</p>
        <p>© {new Date().getFullYear()} Cam Lillico Coaching. All rights reserved.</p>
      </footer>
    </div>
  );
}
