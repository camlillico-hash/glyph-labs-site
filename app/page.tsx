export const metadata = {
  title: "Cam Lillico",
  description: "Cam values in color.",
};

const colors = ["#D90000", "#FF5700", "#E9D019", "#E9F2DC", "#4A9BB8", "#000000"];

const blocks = [
  { word: "truth", c: 0, x: 0, y: 0, w: 26, h: 22 },
  { word: "method", c: 5, x: 26, y: 0, w: 18, h: 16 },
  { word: "humility", c: 4, x: 66, y: 0, w: 34, h: 24 },

  { word: "clarity", c: 1, x: 0, y: 22, w: 20, h: 20 },
  { word: "courage", c: 0, x: 64, y: 24, w: 18, h: 18 },
  { word: "curious", c: 3, x: 82, y: 24, w: 18, h: 16 },

  { word: "focus", c: 2, x: 0, y: 62, w: 18, h: 16 },
  { word: "kind", c: 3, x: 18, y: 62, w: 22, h: 16 },
  { word: "builder", c: 1, x: 56, y: 62, w: 18, h: 16 },
  { word: "balance", c: 0, x: 74, y: 62, w: 26, h: 16 },

  { word: "own", c: 1, x: 28, y: 76, w: 20, h: 24 },
  { word: "fair", c: 2, x: 48, y: 76, w: 18, h: 24 },
  { word: "candor", c: 4, x: 66, y: 82, w: 16, h: 18 },
  { word: "traction", c: 3, x: 82, y: 78, w: 18, h: 22 },
];

const textColor = (hex: string) => (hex === "#E9F2DC" || hex === "#E9D019" || hex === "#FF5700" ? "#111" : "#fff");

export default function Home() {
  return (
    <main style={{ width: "100vw", height: "100dvh", overflow: "hidden", background: "#000" }}>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        {blocks.map((b, i) => {
          const bg = colors[b.c];
          return (
            <section
              key={`${b.word}-${i}`}
              style={{
                position: "absolute",
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: `${b.w}%`,
                height: `${b.h}%`,
                backgroundColor: bg,
                color: textColor(bg),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 800,
                fontSize: "clamp(10px, 1.2vw, 20px)",
                lineHeight: 1,
                textAlign: "center",
                padding: "4px",
              }}
            >
              {b.word}
            </section>
          );
        })}
      </div>
    </main>
  );
}
