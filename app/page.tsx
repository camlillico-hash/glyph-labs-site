export const metadata = {
  title: "Cam Lillico",
  description: "Cam values in color.",
};

const colors = ["#D90000", "#FF5700", "#E9D019", "#E9F2DC", "#4A9BB8", "#000000"];

// 6x6 grid -> 36 cells. Each color appears exactly 6 times for balanced distribution.
const colorMap = [
  0, 3, 5, 1, 4, 2,
  4, 1, 2, 5, 0, 3,
  2, 5, 0, 3, 1, 4,
  3, 0, 4, 2, 5, 1,
  1, 4, 3, 0, 2, 5,
  5, 2, 1, 4, 3, 0,
];

const words = [
  "truth",
  "clarity",
  "focus",
  "humility",
  "builder",
  "fair",
  "traction",
  "method",
  "candor",
  "balance",
  "calm",
  "own",
];

const textColor = (hex: string) => (hex === "#E9F2DC" || hex === "#E9D019" || hex === "#FF5700" ? "#111" : "#fff");

export default function Home() {
  return (
    <main style={{ width: "100vw", height: "100dvh", overflow: "hidden", background: "#000" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gridTemplateRows: "repeat(6, 1fr)",
        }}
      >
        {colorMap.map((ci, i) => {
          const bg = colors[ci];
          const showWord = i % 3 === 0; // less text density
          const word = words[(i / 3) % words.length | 0];
          const link = showWord && word === "builder" ? "/crm" : showWord && word === "traction" ? "/coaching" : null;
          const content = showWord ? word : "";

          return (
            <section
              key={i}
              style={{
                backgroundColor: bg,
                color: textColor(bg),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 800,
                fontSize: "clamp(9px, 1.1vw, 16px)",
                lineHeight: 1,
                textAlign: "center",
                padding: "4px",
              }}
            >
              {link ? (
                <a href={link} style={{ color: "inherit", textDecoration: "none", cursor: "default" }}>
                  {content}
                </a>
              ) : (
                content
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
