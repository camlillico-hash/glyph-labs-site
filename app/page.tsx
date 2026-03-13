export const metadata = {
  title: "Cam Lillico",
  description: "Solid-colour philosophy index.",
};

const palette = [
  { name: "Double Decker Red", hex: "#D90000", text: "#ffffff" },
  { name: "Waterloo Sunset", hex: "#FF5700", text: "#111111" },
  { name: "Crown Jewels Gold", hex: "#E9D019", text: "#111111" },
  { name: "St Paul's White", hex: "#E9F2DC", text: "#111111" },
  { name: "Shard Glass", hex: "#4A9BB8", text: "#ffffff" },
  { name: "Cab Black", hex: "#000000", text: "#ffffff" },
];

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#000000", padding: "8px" }}>
      <div style={{ display: "flex", minHeight: "calc(100vh - 16px)", gap: "8px" }}>
        {palette.map((c, i) => (
          <section
            key={c.name}
            style={{
              flex: 1,
              backgroundColor: c.hex,
              color: c.text,
              display: "flex",
              flexDirection: "column",
              justifyContent: i % 2 === 0 ? "space-between" : "center",
              alignItems: "center",
              padding: "1rem 0.5rem",
              textAlign: "center",
            }}
          >
            {i % 2 === 0 ? <div style={{ fontSize: "0.7rem", letterSpacing: "0.08em" }}>PHILOSOPHY</div> : null}
            <h1 style={{ margin: 0, fontSize: "clamp(0.9rem, 1.6vw, 1.3rem)", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              {c.name}
            </h1>
            {i % 2 === 0 ? <div style={{ fontSize: "0.75rem" }}>{c.hex}</div> : null}
          </section>
        ))}
      </div>
    </main>
  );
}
