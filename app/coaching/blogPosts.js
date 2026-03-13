export const blogPosts = [
  {
    slug: "from-chaotic-weekly-meetings-to-clean-decisions",
    title: "From Chaotic Weekly Meetings to Clean Decisions",
    description:
      "A practical reset for leadership meetings so your team leaves with clear owners, deadlines, and fewer loose ends.",
    thumbnail:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    readTime: "6 min read",
    category: "Execution",
    publishedAt: "March 10, 2026",
    publishedBy: "Cam Lillico",
    body: [
      "Most leadership meetings fail for the same reason: too many updates, not enough decisions.",
      "If your weekly cadence feels heavy but progress is still inconsistent, tighten the agenda around three things: metrics, priorities, and blockers. Keep updates short and use most of the room for issue-solving.",
      "Every issue should end with one owner, one clear next action, and a due date. If any of those are missing, it is not a decision yet.",
      "This one change creates compounding momentum. Teams stop relitigating the same conversations and start shipping outcomes week after week.",
    ],
  },
  {
    slug: "how-to-pressure-test-strategy-before-you-scale",
    title: "How to Pressure-Test Strategy Before You Scale",
    description:
      "Before adding headcount or spend, run this strategy stress test to expose assumptions and focus your bets.",
    thumbnail:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80",
    readTime: "8 min read",
    category: "Strategy",
    publishedAt: "March 11, 2026",
    publishedBy: "Cam Lillico",
    body: [
      "Growth amplifies whatever is already true in your business — strengths and weaknesses alike.",
      "A strong strategic plan does not just define ambition; it identifies where you are vulnerable. Where are margins thin? Which channels are fragile? Which customer segments are high effort and low return?",
      "Pressure-testing means naming assumptions and assigning proof. If the assumption fails, what changes? If your team cannot answer that quickly, the strategy is not ready.",
      "Scale works best when your choices are explicit. Clarity beats optimism every time.",
    ],
  },
  {
    slug: "the-founder-shift-from-doer-to-system-builder",
    title: "The Founder Shift: From Doer to System Builder",
    description:
      "A leadership transition guide for founders who need to move from heroic execution to scalable operating rhythm.",
    thumbnail:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
    readTime: "7 min read",
    category: "Leadership",
    publishedAt: "March 12, 2026",
    publishedBy: "Cam Lillico",
    body: [
      "At early stages, founder heroics can carry the company. Later, they become the bottleneck.",
      "The shift is not about doing less. It is about designing systems that keep quality high without your constant intervention.",
      "Start with decision rights, meeting rhythm, and role clarity. If your team still needs you to break ties on routine decisions, your structure is under-specified.",
      "Great founders eventually become architects of momentum. They build teams that execute with confidence when they are not in the room.",
    ],
  },
];

export function getPostBySlug(slug) {
  return blogPosts.find((post) => post.slug === slug);
}
