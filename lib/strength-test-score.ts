export const strengthSections = ["Business", "Brand", "Team", "Strategy", "Execution", "Culture"] as const;
export type StrengthSection = (typeof strengthSections)[number];

export const sectionMax: Record<StrengthSection, number> = {
  Business: 20,
  Brand: 15,
  Team: 15,
  Strategy: 15,
  Execution: 20,
  Culture: 15,
};

export function scoreLabel(percent: number) {
  if (percent <= 50) return "Needs attention";
  if (percent <= 84) return "Developing";
  return "Strong";
}

export function sectionPercent(score: number, section: StrengthSection) {
  return Math.round((score / sectionMax[section]) * 100);
}
