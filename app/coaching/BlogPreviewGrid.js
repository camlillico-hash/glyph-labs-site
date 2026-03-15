"use client";

import { useMemo, useState } from "react";

export default function BlogPreviewGrid({ posts }) {
  const [showAll, setShowAll] = useState(false);
  const previewCount = 6;

  const visiblePosts = useMemo(
    () => (showAll ? posts : posts.slice(0, previewCount)),
    [posts, showAll]
  );

  return (
    <>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {visiblePosts.map((post) => (
          <a
            key={post.slug}
            href={`/coaching/blog/${post.slug}`}
            className="group flex flex-col gap-3 rounded-xl border border-neutral-700/90 bg-neutral-900/70 p-3 transition hover:border-neutral-500 md:flex-row md:items-center"
          >
            <img
              src={post.thumbnail}
              alt={post.title}
              className="h-24 w-full rounded-lg border border-neutral-700 object-cover md:h-20 md:w-36"
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-orange-200/85">
                {post.category} · {post.readTime}
              </p>
              <h3 className="mt-1 text-xl font-semibold leading-tight text-slate-100 transition group-hover:text-orange-100">
                {post.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
                {post.description}
              </p>
            </div>
          </a>
        ))}
      </div>

      {posts.length > previewCount && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="rounded-lg border border-neutral-600 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-neutral-400 hover:bg-neutral-800"
          >
            {showAll ? "Show fewer articles" : `Show ${posts.length - previewCount} more articles`}
          </button>
        </div>
      )}
    </>
  );
}
