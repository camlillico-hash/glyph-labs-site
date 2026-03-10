import { notFound } from "next/navigation";
import { blogPosts, getPostBySlug } from "../../blogPosts";

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return { title: "Article not found | BOS360" };
  }

  return {
    title: `${post.title} | BOS360 Insights`,
    description: post.description,
    robots: { index: false, follow: false },
  };
}

export default function BlogPostPage({ params }) {
  const post = getPostBySlug(params.slug);

  if (!post) notFound();

  return (
    <main className="min-h-screen bg-neutral-950 text-slate-100">
      <section className="mx-auto max-w-3xl px-6 pb-16 pt-24 md:pt-28">
        <a
          href="/bos360"
          className="inline-flex items-center gap-2 text-sm font-medium text-orange-200 transition hover:text-orange-100"
        >
          <span aria-hidden>⬤</span>
          Back to BOS360
        </a>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-orange-200/90">
          {post.category} · {post.readTime} · {post.publishedAt}
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
      </section>
    </main>
  );
}
