import type { StrengthSection } from "@/lib/strength-test-score";

export type Question = { id: number; section: StrengthSection; text: string };

export const questions: Question[] = [
  { id: 1, section: "Business", text: "We are profitable and growing and managing cash flow with predictability." },
  { id: 2, section: "Business", text: "Our Scoreboard for tracking weekly metrics is in place." },
  { id: 3, section: "Business", text: "Our Flywheel is clearly defined and everyone understands it." },
  { id: 4, section: "Business", text: "We have a clear Budget and are monitoring it monthly, quarterly and annually." },
  { id: 5, section: "Brand", text: "Our Core Purpose and Brand Promise are well understood both internally and externally." },
  { id: 6, section: "Brand", text: "Our Target Customers are clearly defined, and all of our efforts are focused on them." },
  { id: 7, section: "Brand", text: "Our Core Competence and Differentiators are clear, and we stay focussed on them." },
  { id: 8, section: "Team", text: "All of the people in our organization fit our culture and they are in the right seats." },
  { id: 9, section: "Team", text: "We have an Accountability Chart with everyone’s roles & responsibilities — it is shared and up to date." },
  { id: 10, section: "Team", text: "Everyone in the organization is high-performing and has what they need to do their job well." },
  { id: 11, section: "Strategy", text: "Our Ten Year Mission is in writing and has been shared with everyone in the company." },
  { id: 12, section: "Strategy", text: "We have a Clear 3 Year Vision with revenue and profit targets established." },
  { id: 13, section: "Strategy", text: "We have an Annual Plan with clear goals in writing that is understood by all." },
  { id: 14, section: "Execution", text: "Everyone has 1–5 priorities per quarter and they stay focused on them." },
  { id: 15, section: "Execution", text: "Everyone is engaged in regular weekly meetings with a set agenda — they start and end on time." },
  { id: 16, section: "Execution", text: "All teams clearly identify and prioritize key topics and tackle them effectively." },
  { id: 17, section: "Execution", text: "Our core processes are documented and followed to consistently produce the results we want." },
  { id: 18, section: "Culture", text: "Our core values are clear, and we are hiring, reviewing, rewarding, and firing around them." },
  { id: 19, section: "Culture", text: "The organization cultivates a growth mindset and everyone has a success plan for the year ahead." },
  { id: 20, section: "Culture", text: "Our leadership team is open and honest and demonstrates a high level of trust." },
];

export const sectionDescriptions: Record<StrengthSection, string> = {
  Business:
    "Strengthening this component means shaping the organization to be predictable and profitable, with a proven flywheel that creates value and consistently generates cash to fuel growth.",
  Brand:
    "Strengthening the brand means ensuring your company is understood and appreciated both internally and externally, with a clear identity brought to life across touchpoints.",
  Team:
    "Beyond having the right people in the right seats, a strong team is happy and high-performing. They work well together and improve individually and collectively over time.",
  Strategy:
    "Strengthening this component means getting everyone 100% aligned with where you are going and how you plan to get there. It provides direction and decision clarity.",
  Execution:
    "This is instilling simplicity, focus, discipline, and accountability throughout the company so everyone executes on vision day after day and momentum compounds.",
  Culture:
    "This is your unique vibe that sets you apart and defines who you are. It is essential for a healthy, high-performing team and sustaining authentic momentum.",
};
