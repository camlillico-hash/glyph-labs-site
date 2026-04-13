import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUp } from "lucide-react";
import { notFound } from "next/navigation";

import { blogPosts, getPostBySlug } from "../../blogPosts";
import Bos360SiteHeader from "@/app/components/Bos360SiteHeader";

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
    title: `${post.title} | Cam Lillico`,
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
      <Bos360SiteHeader current="blog" />

      <section className="mx-auto max-w-3xl px-6 pb-16 pt-10 md:pt-12">
        <Link
          href="/coaching/blog"
          className="inline-flex items-center gap-2 rounded-lg border border-orange-300/40 bg-orange-500/10 px-3 py-1.5 text-sm font-semibold text-orange-100 transition hover:bg-orange-500/20"
        >
          <ArrowLeft size={16} aria-hidden />
          Back to Leadership Insights
        </Link>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-orange-200/90">
          {post.category} · {post.readTime}
        </p>
        <p className="mt-2 text-sm text-slate-300">
          Published {post.publishedAt} · By {post.publishedBy || "Cam Lillico"}
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight md:text-5xl">{post.title}</h1>
        <p className="mt-4 text-lg text-slate-300">{post.description}</p>

        <Image
          src={post.thumbnail}
          alt={post.title}
          width={1200}
          height={640}
          unoptimized
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
                <Link
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
                </Link>
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
