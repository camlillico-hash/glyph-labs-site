import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock3 } from "lucide-react";
import { blogPosts } from "../blogPosts";
import Bos360SiteHeader from "@/app/components/Bos360SiteHeader";

export const metadata = {
  title: "Cam Lillico | Leadership Insights",
};

export default function CoachingBlogIndexPage() {
  return (
    <main className="coaching-theme min-h-screen bg-[#f5f1ea] text-slate-950">
      <Bos360SiteHeader current="blog" />
      <section className="mx-auto max-w-6xl px-6 py-14 md:py-20">
        <Link
          href="/bos360"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Coaching
        </Link>

        <div className="mt-8 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#b8612b]">
            Leadership Insights
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-6xl">
            Practical thinking on leadership teams, execution, and founder-led growth.
          </h1>
          <p className="mt-5 text-base leading-7 text-slate-600 md:text-lg">
            A dedicated reading experience for ideas related to operating systems,
            leadership alignment, communication, accountability, and execution rhythm.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/coaching/blog/${post.slug}`}
              className="group rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-44px_rgba(15,23,42,0.38)] transition hover:-translate-y-0.5 hover:border-slate-300"
            >
              <Image
                src={post.thumbnail}
                alt={post.title}
                width={720}
                height={384}
                unoptimized
                className="h-48 w-full rounded-[1.25rem] border border-slate-200 object-cover"
              />
              <div className="mt-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#b8612b]">
                <span>{post.category}</span>
                <span className="text-slate-300">•</span>
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <Clock3 size={12} />
                  {post.readTime}
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-semibold leading-tight text-slate-900 transition group-hover:text-[#8a4c26]">
                {post.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {post.description}
              </p>
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-800">
                Read article
                <BookOpen size={16} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
