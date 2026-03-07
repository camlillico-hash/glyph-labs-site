"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

const ROUTES = [
  {
    id: "sunrise-glide",
    name: "Sunrise Glide (South Bay Loop)",
    difficulty: "easy",
    distanceKm: 5.4,
    estTime: "45–70 min",
    color: "#22c55e",
    notes: "Sheltered shoreline route with gentle turns. Great warm-up lap.",
    coords: [
      [44.6688, -78.1605], [44.6706, -78.1541], [44.6719, -78.1492], [44.6702, -78.1438],
      [44.6675, -78.1455], [44.6664, -78.1528], [44.6688, -78.1605],
    ],
  },
  {
    id: "mid-lake-cruise",
    name: "Mid-Lake Cruise",
    difficulty: "moderate",
    distanceKm: 8.9,
    estTime: "1h 20m–2h",
    color: "#f59e0b",
    notes: "Longer open sections. Fantastic views, more wind exposure.",
    coords: [
      [44.6678, -78.1658], [44.6712, -78.1582], [44.6768, -78.1517], [44.6821, -78.1441],
      [44.6862, -78.1368], [44.681, -78.1322], [44.6745, -78.1376], [44.6692, -78.1462], [44.6678, -78.1658],
    ],
  },
  {
    id: "nordic-beast",
    name: "Nordic Beast Figure-8",
    difficulty: "hard",
    distanceKm: 13.7,
    estTime: "2h–3h 15m",
    color: "#ef4444",
    notes: "Speed segments + crosswind returns. Fitness day route.",
    coords: [
      [44.6645, -78.1685], [44.6695, -78.1621], [44.6761, -78.1566], [44.6817, -78.149],
      [44.6863, -78.1395], [44.6838, -78.1308], [44.6778, -78.1278], [44.6724, -78.1339],
      [44.6701, -78.1428], [44.6735, -78.1503], [44.6798, -78.1551], [44.6841, -78.1622],
      [44.6799, -78.1687], [44.6712, -78.1713], [44.6645, -78.1685],
    ],
  },
  {
    id: "island-punch",
    name: "Island Punch Intervals",
    difficulty: "moderate",
    distanceKm: 6.8,
    estTime: "55–95 min",
    color: "#06b6d4",
    notes: "Short interval loops around island pinch points. Great for training sets.",
    coords: [
      [44.6754, -78.16], [44.6773, -78.1542], [44.6792, -78.1497], [44.676, -78.146],
      [44.6726, -78.148], [44.6719, -78.1545], [44.6746, -78.1588], [44.6754, -78.16],
    ],
  },
];

function DifficultyBadge({ difficulty }) {
  const color = difficulty === "easy" ? "#22c55e" : difficulty === "hard" ? "#ef4444" : "#f59e0b";
  return <span style={{ border: "1px solid #314f84", borderRadius: 999, padding: "2px 8px", color, fontSize: 12, fontWeight: 700 }}>{difficulty.toUpperCase()}</span>;
}

export default function CatchacomaLakeXCPage() {
  const [difficulty, setDifficulty] = useState("all");
  const [activeRouteId, setActiveRouteId] = useState(null);
  const [isRoutesOpen, setIsRoutesOpen] = useState(false);
  const mapRef = useRef(null);
  const leafletRef = useRef(null);
  const linesRef = useRef(new Map());

  const filteredRoutes = useMemo(() => (difficulty === "all" ? ROUTES : ROUTES.filter((r) => r.difficulty === difficulty)), [difficulty]);

  useEffect(() => {
    let mounted = true;

    async function initMap() {
      if (mapRef.current) return;
      const L = await import("leaflet");
      leafletRef.current = L;

      const map = L.map("catchacomaMap", { zoomControl: true }).setView([44.6735, -78.1475], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      mapRef.current = map;
      if (mounted) {
        setTimeout(() => map.invalidateSize(), 100);
      }
    }

    initMap();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !leafletRef.current) return;
    const map = mapRef.current;
    const L = leafletRef.current;

    linesRef.current.forEach((line) => map.removeLayer(line));
    linesRef.current.clear();

    filteredRoutes.forEach((route) => {
      const line = L.polyline(route.coords, { color: route.color, weight: 5, opacity: 0.92 }).addTo(map);
      line.bindPopup(`<div style="min-width:220px"><strong>${route.name}</strong><br>${route.distanceKm.toFixed(1)} km · ${route.estTime}<br><em>${route.notes}</em></div>`);
      linesRef.current.set(route.id, line);
    });

    if (linesRef.current.size > 0) {
      const group = L.featureGroup([...linesRef.current.values()]);
      map.fitBounds(group.getBounds().pad(0.16));
    }

    if (activeRouteId && linesRef.current.get(activeRouteId)) {
      const active = linesRef.current.get(activeRouteId);
      map.fitBounds(active.getBounds().pad(0.25));
      active.openPopup();
      linesRef.current.forEach((line, id) => {
        line.setStyle({ opacity: id === activeRouteId ? 1 : 0.35, weight: id === activeRouteId ? 6 : 4 });
      });
    }

    setTimeout(() => map.invalidateSize(), 100);
  }, [filteredRoutes, activeRouteId]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <main style={{ background: "radial-gradient(1200px 700px at 20% -10%, #1b2a48, #0b1220)", color: "#e7eefc", minHeight: "100vh", padding: "1rem" }}>
      <style>{`
        .layout { display:grid; gap:16px; grid-template-columns: 360px 1fr; max-width:1400px; margin:0 auto; }
        .mapWrap { width:100%; min-height: calc(100vh - 2rem); border-radius:16px; border:1px solid #213252; overflow:hidden; }
        .mobileRouteBtn { display:none; }
        .routeBackdrop { display:none; }

        @media (max-width: 980px){
          .layout { grid-template-columns: 1fr; }
          .mapWrap { min-height: calc(100vh - 2rem); }
          .mobileRouteBtn {
            display:block; position:fixed; bottom:20px; right:20px; z-index:1200;
            border:1px solid #2b436f; border-radius:999px; background:#101a30; color:#e7eefc;
            padding:10px 14px; font-weight:700; box-shadow:0 8px 24px rgba(0,0,0,.35);
          }
          .routePanel {
            position:fixed; z-index:1201; inset:10px 10px auto 10px; max-height:76vh; overflow:auto;
            transform:translateY(-120%); transition:transform .2s ease;
            box-shadow:0 22px 40px rgba(0,0,0,.45);
          }
          .routePanel.open { transform:translateY(0); }
          .routeBackdrop {
            display:block; position:fixed; inset:0; background:rgba(0,0,0,.45); z-index:1200;
          }
        }
      `}</style>

      {isRoutesOpen && <button aria-label="Close routes panel" className="routeBackdrop" onClick={() => setIsRoutesOpen(false)} />}
      <button className="mobileRouteBtn" onClick={() => setIsRoutesOpen(true)}>Routes</button>

      <div className="layout">
        <aside className={`routePanel ${isRoutesOpen ? "open" : ""}`} style={{ background: "#111b2f", border: "1px solid #213252", borderRadius: 16, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <div style={{ color: "#67e8f9", border: "1px solid #2b436f", display: "inline-block", padding: "4px 10px", borderRadius: 999, fontSize: 12 }}>Catchacoma Lake · XC</div>
            <button onClick={() => setIsRoutesOpen(false)} style={{ border: "1px solid #2b436f", borderRadius: 8, background: "#101a30", color: "#e7eefc", padding: "4px 8px", cursor: "pointer" }}>Close</button>
          </div>

          <h1 style={{ margin: "10px 0", fontSize: 28, lineHeight: 1.15 }}>Catchacoma Cross-Country Ski Hub</h1>
          <p style={{ color: "#9fb2d9", lineHeight: 1.45, marginTop: 0 }}>Pick your route, filter by difficulty, and click cards to focus the map.</p>

          <label htmlFor="difficulty" style={{ color: "#9fb2d9", display: "block", marginBottom: 8 }}>Filter by difficulty</label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => { setDifficulty(e.target.value); setActiveRouteId(null); }}
            style={{ width: "100%", borderRadius: 10, border: "1px solid #2b436f", background: "#101a30", color: "#e7eefc", padding: "9px 11px" }}
          >
            <option value="all">All routes</option>
            <option value="easy">Easy</option>
            <option value="moderate">Moderate</option>
            <option value="hard">Hard</option>
          </select>

          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            {filteredRoutes.map((route) => (
              <article
                key={route.id}
                onClick={() => {
                  setActiveRouteId(route.id);
                  setIsRoutesOpen(false);
                }}
                style={{ border: "1px solid #28416c", borderRadius: 12, padding: 12, cursor: "pointer", background: route.id === activeRouteId ? "#12213d" : "#0f172a" }}
              >
                <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>{route.name}</h3>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", color: "#9fb2d9", fontSize: 14 }}>
                  <span>{route.distanceKm.toFixed(1)} km</span><span>•</span><span>{route.estTime}</span><DifficultyBadge difficulty={route.difficulty} />
                </div>
                <p style={{ margin: "8px 0 0", fontSize: 14, color: "#9fb2d9" }}>{route.notes}</p>
              </article>
            ))}
          </div>

          <p style={{ marginTop: 14, fontSize: 12, color: "#9db0d4", lineHeight: 1.4 }}>⚠️ Suggested routes only. Verify ice thickness, local advisories, weather, and shoreline access before skiing.</p>
        </aside>

        <section id="catchacomaMap" className="mapWrap" />
      </div>
    </main>
  );
}
