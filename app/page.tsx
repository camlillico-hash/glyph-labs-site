export const metadata = {
  title: "Cam Lillico",
  description: "A colour-built philosophy index.",
};

const palette = {
  doubleDeckerRed: "#D90000",
  waterlooSunset: "#FF5700",
  crownJewelsGold: "#E9D019",
  stPaulsWhite: "#E9F2DC",
  shardGlass: "#4A9BB8",
  cabBlack: "#000000",
};

const blocks = [
  { label: "Double Decker Red", hex: palette.doubleDeckerRed, text: "#ffffff" },
  { label: "Waterloo Sunset", hex: palette.waterlooSunset, text: "#111111" },
  { label: "Crown Jewels Gold", hex: palette.crownJewelsGold, text: "#111111" },
  { label: "St Paul's White", hex: palette.stPaulsWhite, text: "#111111" },
  { label: "Shard Glass", hex: palette.shardGlass, text: "#ffffff" },
  { label: "Cab Black", hex: palette.cabBlack, text: "#ffffff" },
];

export default function Home() {
  return (
    <main style={{ backgroundColor: palette.cabBlack, color: "#fff", minHeight: "100vh" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
          minHeight: "100vh",
        }}
      >
        {blocks.map((block) => (
          <section
            key={block.label}
            style={{
              backgroundColor: block.hex,
              color: block.text,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "1.25rem 1rem",
              borderRight: "1px solid rgba(0,0,0,0.15)",
            }}
          >
            <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              camlillico.com
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  lineHeight: 1,
                  fontSize: "clamp(1rem, 1.5vw, 1.4rem)",
                  textTransform: "uppercase",
                }}
              >
                {block.label}
              </h1>
            </div>

            <div style={{ fontSize: "0.75rem", opacity: 0.9 }}>{block.hex}</div>
          </section>
        ))}
      </div>
    </main>
  );
}
