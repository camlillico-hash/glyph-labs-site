export const metadata = {
  title: "Cam Lillico",
  description: "A colour-built philosophy index.",
};

const colours = [
  "#D90000", // Double Decker Red
  "#FF5700", // Waterloo Sunset
  "#E9D019", // Crown Jewels Gold
  "#E9F2DC", // St Paul's White
  "#4A9BB8", // Shard Glass
  "#000000", // Cab Black
];

const tiles = [
  { c: 0, rs: "span 2", cs: "span 3", label: "Truth" },
  { c: 4, rs: "span 1", cs: "span 2", label: "Method" },
  { c: 2, rs: "span 2", cs: "span 2", label: "Friction" },
  { c: 1, rs: "span 1", cs: "span 1", label: "Inquiry" },
  { c: 5, rs: "span 2", cs: "span 2", label: "Silence" },
  { c: 3, rs: "span 1", cs: "span 3", label: "Practice" },
  { c: 4, rs: "span 2", cs: "span 1", label: "Balance" },
  { c: 0, rs: "span 1", cs: "span 2", label: "Fire" },
  { c: 2, rs: "span 1", cs: "span 1", label: "Shadow" },
  { c: 1, rs: "span 2", cs: "span 2", label: "Attention" },
  { c: 3, rs: "span 1", cs: "span 2", label: "Discipline" },
  { c: 5, rs: "span 1", cs: "span 1", label: "Stillness" },
  { c: 0, rs: "span 1", cs: "span 1", label: "Will" },
  { c: 4, rs: "span 1", cs: "span 2", label: "Clarity" },
  { c: 2, rs: "span 2", cs: "span 3", label: "Creation" },
  { c: 3, rs: "span 1", cs: "span 1", label: "Integrity" },
];

const textFor = (hex: string) =>
  hex === "#E9F2DC" || hex === "#E9D019" || hex === "#FF5700" ? "#111111" : "#ffffff";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#000000", padding: "8px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
          gridAutoRows: "72px",
          gap: "8px",
          minHeight: "calc(100vh - 16px)",
        }}
      >
        {tiles.map((tile, i) => {
          const bg = colours[tile.c];
          const fg = textFor(bg);
          return (
            <section
              key={`${tile.label}-${i}`}
              style={{
                backgroundColor: bg,
                color: fg,
                gridRow: tile.rs,
                gridColumn: tile.cs,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontSize: "clamp(0.72rem, 1.4vw, 1.2rem)",
                fontWeight: 700,
                textAlign: "center",
                padding: "0.6rem",
              }}
            >
              {tile.label}
            </section>
          );
        })}
      </div>
    </main>
  );
}
