import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://sorpentor.com";

/* ===============================
   MATCH BACKEND ALLOWED COLUMNS
=============================== */
const SEARCH_COLUMNS = [
  "EVENT_LCL_DATE",
  "EVENT_LCL_TIME",
  "LOC_CITY_NAME",
  "LOC_STATE_NAME",
  "LOC_CNTRY_NAME",
  "EVENT_TYPE_DESC",
  "FSDO_DESC",
  "REGIST_NBR",
  "FLT_NBR",
  "ACFT_OPRTR",
  "ACFT_MAKE_NAME",
  "ACFT_MODEL_NAME",
  "FLT_ACTIVITY",
  "FLT_PHASE",
  "FAR_PART",
  "MAX_INJ_LVL",
  "FATAL_FLAG",
  "RMK_TEXT"
];

const CHART_HEIGHT = 260;
const CHART_WIDTH = 900;
const PADDING_LEFT = 50;
const PADDING_BOTTOM = 40;
const PADDING_TOP = 20;

export default function AviationDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("aguiar_token");

  const [stats, setStats] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===== SEARCH ===== */
  const [searchColumn, setSearchColumn] = useState("LOC_STATE_NAME");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 25;

  /* ===== CHARTS ===== */
  const [chartMode, setChartMode] = useState("none"); // none | bar | line | pie
  const [chartColumn, setChartColumn] = useState("LOC_STATE_NAME");

  // Opens Record Selected
  function openEventReport(id) {
    navigate(`/aviation/event/${id}`);
  }

  async function clearSearch() {
    setSearchQuery("");
    setSearchColumn("LOC_STATE_NAME");
    setPage(1);
    setChartMode("none");
  
    const res = await fetch(`${API_BASE}/aviation-events?limit=250`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  
    setEvents(await res.json());
  }  

  /* ===============================
     INITIAL LOAD
  =============================== */
  useEffect(() => {
    if (!token) return;

    async function load() {
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, timelineRes, eventsRes] = await Promise.all([
        fetch(`${API_BASE}/aviation/stats`, { headers }),
        fetch(`${API_BASE}/aviation/stats/timeline`, { headers }),
        fetch(`${API_BASE}/aviation-events?limit=250`, { headers })
      ]);

      setStats(await statsRes.json());
      setTimeline(await timelineRes.json());
      setEvents(await eventsRes.json());
      setLoading(false);
    }

    load();
  }, [token]);

  /* ===============================
     POST SEARCH (NEW ROUTE)
  =============================== */
  async function runSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const res = await fetch(`${API_BASE}/aviation/events/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        column: searchColumn,
        query: searchQuery,
        page,
        limit
      })
    });

    setEvents(await res.json());
  }

  if (!token) return <p>Please log in.</p>;
  if (loading) return <p>Loading aviation data…</p>;

  /* ===============================
     RENDER
  =============================== */
  return (
    <div className="page center">
      <div className="content" style={{ maxWidth: 1200 }}>
        <h2>✈️ Aviation Safety Dashboard</h2>

        {/* KPI */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
          <KPI title="Total Events" value={stats.total_events} />
          <KPI title="Fatal Events" value={stats.fatal_events} />
          <KPI title="Total Fatalities" value={stats.total_fatalities} />
        </div>

        {/* SEARCH + CHART ICONS */}
        <section style={{ marginTop: 30 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3>Search & Visualize</h3>

            <div style={{ display: "flex", gap: 12 }}>
              <ChartIcon icon="📊" active={chartMode === "bar"} onClick={() => setChartMode("bar")} />
              <ChartIcon icon="📈" active={chartMode === "line"} onClick={() => setChartMode("line")} />
              <ChartIcon icon="🥧" active={chartMode === "pie"} onClick={() => setChartMode("pie")} />
            </div>
          </div>

          <form onSubmit={runSearch} style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <select
              value={searchColumn}
              onChange={e => setSearchColumn(e.target.value)}
            >
              {SEARCH_COLUMNS.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>

            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Enter search value…"
              style={{ flex: 1, padding: 8 }}
            />

            <button type="submit">Search</button>

            {/* ✅ CLEAR BUTTON */}
            <button
              type="button"
              onClick={clearSearch}
              style={{
                background: "#eee",
                border: "1px solid #ccc",
                padding: "6px 12px",
                cursor: "pointer"
              }}
            >
              Clear
            </button>
          </form>

        </section>

        {/* CHARTS */}
        {chartMode !== "none" && (
          <section style={{ marginTop: 30 }}>
            <h3>Visualization by {chartColumn}</h3>

            <select value={chartColumn} onChange={e => setChartColumn(e.target.value)}>
              {SEARCH_COLUMNS.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>

            {chartMode === "bar" && <BarChart events={events} column={chartColumn} />}
            {chartMode === "line" && <LineChart events={events} column={chartColumn} />}
            {chartMode === "pie" && <PieChart events={events} column={chartColumn} />}
          </section>
        )}

        {/* TABLE */}
        <section style={{ marginTop: 30 }}>
          <h3>Results</h3>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Time</Th>
                  <Th>State</Th>
                  <Th>Aircraft</Th>
                  <Th>Phase</Th>
                  <Th>Fatal</Th>
                </tr>
              </thead>
              <tbody>
                {events.map(e => (
                  <tr key={e.id} onClick={() => openEventReport(e.id)} style={{ cursor: "pointer" }}>
                    <Td>{formatDate(e.EVENT_LCL_DATE)}</Td>
                    <Td>{e.EVENT_LCL_TIME || "—"}</Td>
                    <Td>{e.LOC_STATE_NAME}</Td>
                    <Td>{e.ACFT_MAKE_NAME} {e.ACFT_MODEL_NAME}</Td>
                    <Td>{e.FLT_PHASE}</Td>
                    <Td style={{ color: e.FATAL_FLAG === "Yes" ? "red" : "#555" }}>
                      {e.FATAL_FLAG}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ===============================
   HELPERS & UI
=============================== */

function formatDate(d) {
  return d ? d.split("T")[0] : "—";
}

function KPI({ title, value }) {
  return (
    <div style={{ background: "#f8f8f8", padding: 16, borderRadius: 8, textAlign: "center" }}>
      <h4>{title}</h4>
      <div style={{ fontSize: 26, fontWeight: "bold" }}>{value}</div>
    </div>
  );
}

const Th = ({ children }) => (
  <th style={{ padding: 8, borderBottom: "1px solid #ddd", textAlign: "left" }}>
    {children}
  </th>
);

const Td = ({ children }) => (
  <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>
    {children}
  </td>
);

function ChartIcon({ icon, active, onClick }) {
  return (
    <span
      onClick={onClick}
      style={{
        fontSize: 22,
        cursor: "pointer",
        opacity: active ? 1 : 0.4
      }}
    >
      {icon}
    </span>
  );
}

/* ===============================
   CHART UTILITIES
=============================== */

function groupCounts(events, column) {
  const map = {};
  events.forEach(e => {
    const key = e[column] || "Unknown";
    map[key] = (map[key] || 0) + 1;
  });

  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
}

function ChartLegend({ data }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 8,
        marginTop: 12
      }}
    >
      {data.map(([label, value], i) => (
        <div key={label} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12 }}>
          <span
            style={{
              width: 12,
              height: 12,
              background: `hsl(${i * 40},70%,60%)`,
              display: "inline-block"
            }}
          />
          <span>{label} ({value})</span>
        </div>
      ))}
    </div>
  );
}

/* ===============================
   CHARTS
=============================== */

function BarChart({ events, column }) {
  const data = groupCounts(events, column);
  const max = Math.max(...data.map(d => d[1]), 1);

  const barWidth = 40;
  const gap = 30;
  const chartHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  return (
    <>
      <svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
        {/* Y AXIS */}
        <line
          x1={PADDING_LEFT}
          y1={PADDING_TOP}
          x2={PADDING_LEFT}
          y2={CHART_HEIGHT - PADDING_BOTTOM}
          stroke="#333"
        />

        {/* Y AXIS TICKS */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const y = PADDING_TOP + chartHeight * (1 - t);
          return (
            <g key={i}>
              <line
                x1={PADDING_LEFT - 5}
                y1={y}
                x2={PADDING_LEFT}
                y2={y}
                stroke="#333"
              />
              <text
                x={PADDING_LEFT - 8}
                y={y + 4}
                fontSize="10"
                textAnchor="end"
              >
                {Math.round(max * t)}
              </text>
            </g>
          );
        })}

        {/* X AXIS */}
        <line
          x1={PADDING_LEFT}
          y1={CHART_HEIGHT - PADDING_BOTTOM}
          x2={CHART_WIDTH}
          y2={CHART_HEIGHT - PADDING_BOTTOM}
          stroke="#333"
        />

        {/* BARS */}
        {data.map(([label, val], i) => {
          const x = PADDING_LEFT + i * (barWidth + gap) + gap;
          const height = (val / max) * chartHeight;
          const y = CHART_HEIGHT - PADDING_BOTTOM - height;

          return (
            <g key={label}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={height}
                fill={`hsl(${i * 40},70%,60%)`}
              />

              {/* VALUE LABEL */}
              <text
                x={x + barWidth / 2}
                y={y - 4}
                textAnchor="middle"
                fontSize="11"
              >
                {val}
              </text>

              {/* X LABEL */}
              <text
                x={x + barWidth / 2}
                y={CHART_HEIGHT - PADDING_BOTTOM + 14}
                textAnchor="middle"
                fontSize="10"
                transform={`rotate(-30 ${x + barWidth / 2},${CHART_HEIGHT - PADDING_BOTTOM + 14})`}
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>

      <ChartLegend data={data} />
    </>
  );
}


function LineChart({ events, column }) {
  const data = groupCounts(events, column);
  const max = Math.max(...data.map(d => d[1]), 1);

  const chartHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const chartWidth = CHART_WIDTH - PADDING_LEFT - 40;
  const stepX = chartWidth / Math.max(data.length - 1, 1);

  return (
    <>
      <svg
        width="100%"
        height={CHART_HEIGHT}
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      >
        {/* Y AXIS */}
        <line
          x1={PADDING_LEFT}
          y1={PADDING_TOP}
          x2={PADDING_LEFT}
          y2={CHART_HEIGHT - PADDING_BOTTOM}
          stroke="#333"
        />

        {/* Y AXIS TICKS + VALUES */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const y = PADDING_TOP + chartHeight * (1 - t);
          return (
            <g key={i}>
              <line
                x1={PADDING_LEFT - 6}
                y1={y}
                x2={PADDING_LEFT}
                y2={y}
                stroke="#333"
              />
              <text
                x={PADDING_LEFT - 10}
                y={y + 4}
                fontSize="10"
                textAnchor="end"
              >
                {Math.round(max * t)}
              </text>
            </g>
          );
        })}

        {/* X AXIS */}
        <line
          x1={PADDING_LEFT}
          y1={CHART_HEIGHT - PADDING_BOTTOM}
          x2={CHART_WIDTH}
          y2={CHART_HEIGHT - PADDING_BOTTOM}
          stroke="#333"
        />

        {/* LINE */}
        <polyline
          fill="none"
          stroke="#2c7be5"
          strokeWidth="2"
          points={data
            .map(([_, val], i) => {
              const x = PADDING_LEFT + i * stepX;
              const y = PADDING_TOP + chartHeight * (1 - val / max);
              return `${x},${y}`;
            })
            .join(" ")}
        />

        {/* POINTS + VALUE LABELS + X LABELS */}
        {data.map(([label, val], i) => {
          const x = PADDING_LEFT + i * stepX;
          const y = PADDING_TOP + chartHeight * (1 - val / max);

          return (
            <g key={label}>
              {/* POINT */}
              <circle cx={x} cy={y} r="4" fill="#2c7be5" />

              {/* VALUE */}
              <text
                x={x}
                y={y - 6}
                fontSize="11"
                textAnchor="middle"
              >
                {val}
              </text>

              {/* X LABEL */}
              <text
                x={x}
                y={CHART_HEIGHT - PADDING_BOTTOM + 16}
                fontSize="10"
                textAnchor="middle"
                transform={`rotate(-30 ${x},${CHART_HEIGHT - PADDING_BOTTOM + 16})`}
              >
                {label}
              </text>
            </g>
          );
        })}
      </svg>

      <ChartLegend data={data} />
    </>
  );
}

function PieChart({ events, column }) {
  const data = groupCounts(events, column);
  const total = data.reduce((a, b) => a + b[1], 0) || 1;

  let start = 0;

  return (
    <>
      <svg width="220" height="220" viewBox="0 0 220 220">
        {data.map(([label, val], i) => {
          const angle = (val / total) * 360;
          const end = start + angle;
          const path = describeArc(110, 110, 90, start, end);

          // label position (middle of slice)
          const midAngle = start + angle / 2;
          const rad = ((midAngle - 90) * Math.PI) / 180;
          const lx = 110 + 55 * Math.cos(rad);
          const ly = 110 + 55 * Math.sin(rad);

          const percent = Math.round((val / total) * 100);

          start = end;

          return (
            <g key={label}>
              <path
                d={path}
                fill={`hsl(${i * 40},70%,60%)`}
              />

              {/* Percentage label (hide if too small) */}
              {percent >= 5 && (
                <text
                  x={lx}
                  y={ly}
                  fontSize="11"
                  fill="#fff"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ pointerEvents: "none", fontWeight: "bold" }}
                >
                  {percent}%
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <ChartLegend data={data} />
    </>
  );
}

function describeArc(x, y, r, start, end) {
  const rad = a => ((a - 90) * Math.PI) / 180;
  const sx = x + r * Math.cos(rad(end));
  const sy = y + r * Math.sin(rad(end));
  const ex = x + r * Math.cos(rad(start));
  const ey = y + r * Math.sin(rad(start));
  const large = end - start > 180 ? 1 : 0;

  return `M ${x} ${y} L ${ex} ${ey} A ${r} ${r} 0 ${large} 1 ${sx} ${sy} Z`;
}
