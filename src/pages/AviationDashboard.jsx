import { useEffect, useState, useMemo } from "react";
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
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===== SEARCH ===== */
  const [searchColumn, setSearchColumn] = useState("LOC_STATE_NAME");
  const [searchQuery, setSearchQuery] = useState("");

  /* ===== PAGINATION ===== */
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  /* ===== SORT ===== */
  const [sortColumn, setSortColumn] = useState("EVENT_LCL_DATE");
  const [sortDirection, setSortDirection] = useState("desc");

  /* ===== CHARTS ===== */
  const [chartMode, setChartMode] = useState("none"); // none | bar | line | pie
  const [chartColumn, setChartColumn] = useState("LOC_STATE_NAME");

  function openEventReport(id) {
    navigate(`/aviation/event/${id}`);
  }

  function handleSort(column) {
    if (sortColumn === column) {
      setSortDirection(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  }

  /* ===============================
     INITIAL LOAD
  =============================== */
  useEffect(() => {
    if (!token) return;

    async function load() {
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, eventsRes] = await Promise.all([
        fetch(`${API_BASE}/aviation/stats`, { headers }),
        fetch(`${API_BASE}/aviation-events?limit=500`, { headers })
      ]);

      setStats(await statsRes.json());
      setEvents(await eventsRes.json());
      setLoading(false);
    }

    load();
  }, [token]);

  /* ===============================
     SEARCH
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
      body: JSON.stringify({ column: searchColumn, query: searchQuery })
    });

    setEvents(await res.json());
    setPage(1);
  }

  async function clearSearch() {
    setSearchQuery("");
    setSearchColumn("LOC_STATE_NAME");
    setPage(1);
    setChartMode("none");

    const res = await fetch(`${API_BASE}/aviation-events?limit=500`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setEvents(await res.json());
  }

  /* ===============================
     SORTED EVENTS
  =============================== */
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      let av = a[sortColumn] ?? "";
      let bv = b[sortColumn] ?? "";

      if (sortColumn.includes("DATE")) {
        av = new Date(av);
        bv = new Date(bv);
      }

      if (!isNaN(av) && !isNaN(bv)) {
        return sortDirection === "asc" ? av - bv : bv - av;
      }

      return sortDirection === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [events, sortColumn, sortDirection]);

  /* ===============================
     PAGINATION
  =============================== */
  const totalPages = Math.ceil(sortedEvents.length / limit);

  const pagedEvents = useMemo(() => {
    const start = (page - 1) * limit;
    return sortedEvents.slice(start, start + limit);
  }, [sortedEvents, page, limit]);

  if (!token) return <p>Please log in.</p>;
  if (loading) return <p>Loading aviation data…</p>;

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

        {/* SEARCH + CHART TOGGLES */}
        <section style={{ marginTop: 30 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3>Search & Visualize</h3>
            <div style={{ display: "flex", gap: 12 }}>
              <ChartIcon icon="📊" active={chartMode === "bar"} onClick={() => setChartMode("bar")} />
              <ChartIcon icon="📈" active={chartMode === "line"} onClick={() => setChartMode("line")} />
              <ChartIcon icon="🥧" active={chartMode === "pie"} onClick={() => setChartMode("pie")} />
            </div>
          </div>

          <form onSubmit={runSearch} style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <select value={searchColumn} onChange={e => setSearchColumn(e.target.value)}>
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
            <button type="button" onClick={clearSearch}>Clear</button>
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

          {/* PAGE CONTROLS */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              Rows per page:&nbsp;
              <select value={limit} onChange={e => { setLimit(+e.target.value); setPage(1); }}>
                {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            <div>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>◀</button>
              <span style={{ margin: "0 10px" }}>
                Page {page} of {totalPages}
              </span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>▶</button>
            </div>
          </div>

          <table className="analytics-table">
            <thead>
              <tr>
                <SortableTh label="Date" column="EVENT_LCL_DATE" {...{ sortColumn, sortDirection, onSort: handleSort }} />
                <SortableTh label="Time" column="EVENT_LCL_TIME" {...{ sortColumn, sortDirection, onSort: handleSort }} />
                <SortableTh label="State" column="LOC_STATE_NAME" {...{ sortColumn, sortDirection, onSort: handleSort }} />
                <SortableTh label="City" column="LOC_CITY_NAME" {...{ sortColumn, sortDirection, onSort: handleSort }} />
                <SortableTh label="Aircraft" column="ACFT_MAKE_NAME" {...{ sortColumn, sortDirection, onSort: handleSort }} />
                <SortableTh label="Fatal" column="FATAL_FLAG" {...{ sortColumn, sortDirection, onSort: handleSort }} />
                <Th>Remarks</Th>
              </tr>
            </thead>
            <tbody>
              {pagedEvents.map(e => (
                <tr key={e.id} onClick={() => openEventReport(e.id)} style={{ cursor: "pointer" }}>
                  <Td>{formatDate(e.EVENT_LCL_DATE)}</Td>
                  <Td>{e.EVENT_LCL_TIME || "—"}</Td>
                  <Td>{e.LOC_STATE_NAME}</Td>
                  <Td>{e.LOC_CITY_NAME}</Td>
                  <Td>{e.ACFT_MAKE_NAME} {e.ACFT_MODEL_NAME}</Td>
                  <Td style={{ color: e.FATAL_FLAG === "Yes" ? "red" : "#555" }}>{e.FATAL_FLAG}</Td>
                  <Td>{e.RMK_TEXT}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

/* ===============================
   UI HELPERS
=============================== */

function SortableTh({ label, column, sortColumn, sortDirection, onSort }) {
  const active = sortColumn === column;
  return (
    <th onClick={() => onSort(column)} style={{ padding: 8, cursor: "pointer" }}>
      {label} {active && (sortDirection === "asc" ? "▲" : "▼")}
    </th>
  );
}

const Th = ({ children }) => <th style={{ padding: 8 }}>{children}</th>;
const Td = ({ children }) => <td style={{ padding: 8 }}>{children}</td>;

function KPI({ title, value }) {
  return (
    <div style={{ background: "#f8f8f8", padding: 16, borderRadius: 8, textAlign: "center" }}>
      <h4>{title}</h4>
      <div style={{ fontSize: 26, fontWeight: "bold" }}>{value}</div>
    </div>
  );
}

function ChartIcon({ icon, active, onClick }) {
  return (
    <span onClick={onClick} style={{ fontSize: 22, cursor: "pointer", opacity: active ? 1 : 0.4 }}>
      {icon}
    </span>
  );
}

function formatDate(d) {
  return d ? d.split("T")[0] : "—";
}

/* ===============================
   CHART UTILITIES + CHARTS
=============================== */

function groupCounts(events, column) {
  const map = {};
  events.forEach(e => {
    const key = e[column] || "Unknown";
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10);
}

/* ---- BAR, LINE, PIE CHARTS ---- */
/* (Identical to your original, unchanged for safety) */

function ChartLegend({ data }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
      gap: 8,
      marginTop: 12
    }}>
      {data.map(([label, value], i) => (
        <div key={label} style={{ display: "flex", gap: 8, fontSize: 12 }}>
          <span style={{
            width: 12,
            height: 12,
            background: `hsl(${i * 40},70%,60%)`,
            display: "inline-block"
          }} />
          <span>{label} ({value})</span>
        </div>
      ))}
    </div>
  );
}

/* ===============================
   BAR CHART
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
        <line x1={PADDING_LEFT} y1={PADDING_TOP}
              x2={PADDING_LEFT} y2={CHART_HEIGHT - PADDING_BOTTOM} stroke="#333" />

        <line x1={PADDING_LEFT} y1={CHART_HEIGHT - PADDING_BOTTOM}
              x2={CHART_WIDTH} y2={CHART_HEIGHT - PADDING_BOTTOM} stroke="#333" />

        {data.map(([label, val], i) => {
          const x = PADDING_LEFT + i * (barWidth + gap) + gap;
          const h = (val / max) * chartHeight;
          const y = CHART_HEIGHT - PADDING_BOTTOM - h;

          return (
            <g key={label}>
              <rect x={x} y={y} width={barWidth} height={h}
                    fill={`hsl(${i * 40},70%,60%)`} />
              <text x={x + barWidth / 2} y={y - 5}
                    textAnchor="middle" fontSize="11">{val}</text>
            </g>
          );
        })}
      </svg>
      <ChartLegend data={data} />
    </>
  );
}

/* ===============================
   LINE CHART
=============================== */
function LineChart({ events, column }) {
  const data = groupCounts(events, column);
  const max = Math.max(...data.map(d => d[1]), 1);
  const chartHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const stepX = (CHART_WIDTH - PADDING_LEFT - 40) / Math.max(data.length - 1, 1);

  return (
    <>
      <svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
        <line x1={PADDING_LEFT} y1={PADDING_TOP}
              x2={PADDING_LEFT} y2={CHART_HEIGHT - PADDING_BOTTOM} stroke="#333" />

        <line x1={PADDING_LEFT} y1={CHART_HEIGHT - PADDING_BOTTOM}
              x2={CHART_WIDTH} y2={CHART_HEIGHT - PADDING_BOTTOM} stroke="#333" />

        <polyline
          fill="none"
          stroke="#2c7be5"
          strokeWidth="2"
          points={data.map(([_, val], i) => {
            const x = PADDING_LEFT + i * stepX;
            const y = PADDING_TOP + chartHeight * (1 - val / max);
            return `${x},${y}`;
          }).join(" ")}
        />

        {data.map(([label, val], i) => {
          const x = PADDING_LEFT + i * stepX;
          const y = PADDING_TOP + chartHeight * (1 - val / max);
          return <circle key={label} cx={x} cy={y} r="4" fill="#2c7be5" />;
        })}
      </svg>
      <ChartLegend data={data} />
    </>
  );
}

/* ===============================
   PIE CHART
=============================== */
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
          start = end;

          return (
            <path key={label}
              d={path}
              fill={`hsl(${i * 40},70%,60%)`} />
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

