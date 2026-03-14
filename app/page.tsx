export const metadata = {
  title: "Cam Lillico",
  description: "Cam values in color.",
};

const colors = ["#D90000", "#FF5700", "#E9D019", "#E9F2DC", "#4A9BB8", "#000000"];

const blocks = [
  { word: "truth", c: 5, x: 0, y: 0, w: 34, h: 32 },
  { word: "method", c: 1, x: 34, y: 0, w: 16, h: 18 },
  { word: "humility", c: 4, x: 50, y: 0, w: 22, h: 20 },
  { word: "clarity", c: 2, x: 72, y: 0, w: 28, h: 16 },

  { word: "courage", c: 0, x: 34, y: 18, w: 16, h: 14 },
  { word: "kind", c: 3, x: 50, y: 20, w: 14, h: 12 },
  { word: "focus", c: 1, x: 64, y: 16, w: 16, h: 16 },
  { word: "fair", c: 4, x: 80, y: 16, w: 20, h: 16 },

  { word: "builder", c: 5, x: 0, y: 32, w: 24, h: 20 },
  { word: "balance", c: 3, x: 24, y: 32, w: 20, h: 14 },
  { word: "candor", c: 0, x: 44, y: 32, w: 18, h: 20 },
  { word: "traction", c: 2, x: 62, y: 32, w: 20, h: 16 },
  { word: "own", c: 1, x: 82, y: 32, w: 18, h: 20 },

  { word: "aware", c: 5, x: 0, y: 52, w: 30, h: 24 },
  { word: "calm", c: 4, x: 30, y: 46, w: 16, h: 14 },
  { word: "precise", c: 0, x: 46, y: 52, w: 18, h: 16 },
  { word: "comrade", c: 3, x: 64, y: 48, w: 18, h: 16 },
  { word: "no ego", c: 2, x: 82, y: 52, w: 18, h: 14 },

  { word: "integrity", c: 5, x: 30, y: 60, w: 28, h: 24 },
  { word: "curious", c: 1, x: 58, y: 64, w: 18, h: 16 },
  { word: "paced", c: 4, x: 76, y: 66, w: 24, h: 14 },

  { word: "craft", c: 0, x: 0, y: 76, w: 20, h: 24 },
  { word: "listen", c: 2, x: 20, y: 76, w: 18, h: 24 },
  { word: "ship", c: 3, x: 38, y: 84, w: 20, h: 16 },
  { word: "steady", c: 1, x: 58, y: 80, w: 18, h: 20 },
  { word: "honest", c: 0, x: 76, y: 80, w: 24, h: 20 },
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
