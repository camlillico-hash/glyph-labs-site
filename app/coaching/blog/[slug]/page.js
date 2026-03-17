import { ArrowLeft, ArrowUp } from "lucide-react";
import { notFound } from "next/navigation";
import ThemeToggle from "@/app/components/ThemeToggle";
import { blogPosts, getPostBySlug } from "../../blogPosts";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const post = getPostBySlug(resolvedParams?.slug);

  if (!post) {
    return { title: "Cam Lillico | Coaching" };
  }

  return {
    title: "Cam Lillico | Coaching",
    description: post.description,
    robots: { index: false, follow: false },
  };
}

export default async function BlogPostPage({ params }) {
  const resolvedParams = await params;
  const post = getPostBySlug(resolvedParams?.slug);

  if (!post) notFound();

  const morePosts = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 6);

  return (
    <main id="top" className="coaching-theme min-h-screen bg-neutral-950 text-slate-100">
      <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-6 py-3">
          <div className="inline-flex min-w-0 items-center gap-2" aria-label="Cam Lillico Coaching">
            <a href="/coaching" className="inline-flex items-center" aria-label="Cam Lillico Coaching home">
              <img src="/logos/glyphlabs-coaching-mark.png" alt="Coaching mark" className="h-7 w-7 object-contain sm:h-8 sm:w-8" />
            </a>
            <span className="rounded-full border border-neutral-600 bg-neutral-800/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-orange-200">
              Cam Lillico Business Coaching
            </span>
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <ThemeToggle />
            <a
              href="https://calendar.app.google/M4pokXD8CBpc1c4U6"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-gradient-to-r from-orange-300 via-[#ed7d31] to-orange-500 px-3 py-2 text-xs font-semibold text-slate-950"
            >
              Book an Intro Call
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-6 pb-16 pt-10 md:pt-12">
        <a
          href="/coaching#leadership-insights"
          className="inline-flex items-center gap-2 rounded-lg border border-orange-300/40 bg-orange-500/10 px-3 py-1.5 text-sm font-semibold text-orange-100 transition hover:bg-orange-500/20"
        >
          <ArrowLeft size={16} aria-hidden />
          Back to Coaching
        </a>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-orange-200/90">
          {post.category} · {post.readTime}
        </p>
        <p className="mt-2 text-sm text-slate-300">
          Published {post.publishedAt} · By {post.publishedBy || "Cam Lillico"}
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">{post.title}</h1>
        <p className="mt-4 text-lg text-slate-300">{post.description}</p>

        <img
          src={post.thumbnail}
          alt={post.title}
          className="mt-8 h-64 w-full rounded-2xl border border-neutral-700 object-cover md:h-80"
        />

        <article className="mt-8 space-y-5 text-base leading-relaxed text-slate-200">
          {post.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </article>

        {morePosts.length > 0 ? (
          <section id="more-leadership-insights" className="mt-12 border-t border-neutral-700 pt-8">
            <h2 className="text-2xl font-bold">More Leadership Insights</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {morePosts.map((item) => (
                <a
                  key={item.slug}
                  href={`/coaching/blog/${item.slug}`}
                  className="blog-card group rounded-xl border border-neutral-700 bg-neutral-900/70 p-3 transition hover:border-neutral-500"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-orange-200/85">
                    {item.category} · {item.readTime}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold leading-tight text-slate-100 transition group-hover:text-orange-100">
                    {item.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400">{item.description}</p>
                </a>
              ))}
            </div>
          </section>
        ) : null}

        <div className="mt-10 flex justify-end">
          <a
            href="#top"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-600 bg-neutral-900/80 px-3 py-1.5 text-sm font-semibold text-slate-200 transition hover:border-neutral-400 hover:bg-neutral-800"
          >
            <ArrowUp size={15} aria-hidden />
            Back to top
          </a>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Cam Lillico Coaching. All rights reserved.
      </footer>
    </main>
  );
}
