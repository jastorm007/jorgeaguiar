import { useEffect, useState } from "react";

const API_BASE = "https://sorpentor.com";
const WEBSITE = "jorgeaguiar.com";

/* ===============================
   CHART CONSTANTS (MATCH AVIATION)
=============================== */
const CHART_HEIGHT = 260;
const CHART_WIDTH = 900;
const PADDING_LEFT = 60;
const PADDING_BOTTOM = 40;
const PADDING_TOP = 20;

export default function Visitors() {
  const token = localStorage.getItem("aguiar_token");

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  /* ===== PAGINATION ===== */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  /* ===== FILTERS ===== */
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  /* ===== CHARTS ===== */
  const [chartMode, setChartMode] = useState("bar"); // bar | line | pie
  const [chartColumn, setChartColumn] = useState("page");

  useEffect(() => {
    loadVisits();
  }, [page, pageSize, search, startDate, endDate]);

  async function loadVisits() {
    if (!token) return;

    const res = await fetch(`${API_BASE}/analytics/visits/table`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        website: WEBSITE,
        page,
        pageSize,
        search,
        startDate,
        endDate
      })
    });

    const data = await res.json();
    setRows(data.rows || []);
    setTotal(data.total || 0);
  }

  /* ===============================
     KPI CALCULATIONS
  =============================== */
  const uniquePages = new Set(rows.map(r => r.page)).size;
  const uniqueCountries = new Set(rows.map(r => r.country)).size;

  const pageCounts = {};
  rows.forEach(r => {
    pageCounts[r.page] = (pageCounts[r.page] || 0) + 1;
  });

  const topPage =
    Object.entries(pageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  return (
    <div className="page">
      <div className="content visitors fade-in">
        <h1>Website Visitors</h1>

        {/* ================= KPI ================= */}
        <div className="kpi-grid">
          <KPI label="Total Visits" value={total} />
          <KPI label="Unique Pages" value={uniquePages} />
          <KPI label="Countries" value={uniqueCountries} />
          <KPI label="Top Page" value={topPage} />
        </div>

        {/* ================= FILTERS ================= */}
        <div className="visitor-filters">
          <input
            placeholder="Search"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <input type="date" onChange={e => setStartDate(e.target.value)} />
          <input type="date" onChange={e => setEndDate(e.target.value)} />
          <select value={pageSize} onChange={e => setPageSize(+e.target.value)}>
            {[10, 25, 50, 100].map(n => <option key={n}>{n}</option>)}
          </select>
        </div>

        {/* ================= CHART CONTROLS ================= */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 30 }}>
          <h3>Visualizations</h3>
          <div style={{ display: "flex", gap: 14 }}>
            <ChartIcon icon="📊" active={chartMode === "bar"} onClick={() => setChartMode("bar")} />
            <ChartIcon icon="📈" active={chartMode === "line"} onClick={() => setChartMode("line")} />
            <ChartIcon icon="🥧" active={chartMode === "pie"} onClick={() => setChartMode("pie")} />
          </div>
        </div>

        {chartMode !== "line" && (
          <select
            value={chartColumn}
            onChange={e => setChartColumn(e.target.value)}
            style={{ marginTop: 10 }}
          >
            <option value="page">Page</option>
            <option value="country">Country</option>
          </select>
        )}

        <div style={{ marginTop: 20 }}>
          {chartMode === "bar" && <BarChart rows={rows} column={chartColumn} />}
          {chartMode === "line" && <LineChart rows={rows} />}
          {chartMode === "pie" && <PieChart rows={rows} column={chartColumn} />}
        </div>

        {/* ================= TABLE ================= */}
        <div className="table-wrapper" style={{ marginTop: 30 }}>
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Visited At</th>
                <th>Page</th>
                <th>Country</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td>{new Date(r.visited_at).toLocaleString()}</td>
                  <td>{r.page}</td>
                  <td>{r.country}</td>
                  <td>{r.ip_address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= PAGINATION ================= */}
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
          <span>Page {page} of {Math.max(1, Math.ceil(total / pageSize))}</span>
          <button disabled={page * pageSize >= total} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
}

/* ===============================
   CHART UTILITIES
=============================== */

function groupCounts(rows, column) {
  const map = {};
  rows.forEach(r => {
    const key = r[column] || "Unknown";
    map[key] = (map[key] || 0) + 1;
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10);
}

function ChartLegend({ data }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
      gap: 8,
      marginTop: 12,
      fontSize: 12
    }}>
      {data.map(([label, value], i) => (
        <div key={label} style={{ display: "flex", gap: 6 }}>
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
function BarChart({ rows, column }) {
  const data = groupCounts(rows, column);
  const max = Math.max(...data.map(d => d[1]), 1);
  const chartHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const barWidth = 40;
  const gap = 30;

  return (
    <>
      <svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
        <line x1={PADDING_LEFT} y1={PADDING_TOP}
              x2={PADDING_LEFT} y2={CHART_HEIGHT - PADDING_BOTTOM} stroke="#333" />
        <line x1={PADDING_LEFT} y1={CHART_HEIGHT - PADDING_BOTTOM}
              x2={CHART_WIDTH} y2={CHART_HEIGHT - PADDING_BOTTOM} stroke="#333" />

        {data.map(([label, val], i) => {
          const x = PADDING_LEFT + gap + i * (barWidth + gap);
          const h = (val / max) * chartHeight;
          const y = CHART_HEIGHT - PADDING_BOTTOM - h;

          return (
            <g key={label}>
              <rect x={x} y={y} width={barWidth} height={h}
                fill={`hsl(${i * 40},70%,60%)`} />
              <text x={x + barWidth / 2} y={y - 6}
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
function LineChart({ rows }) {
  const map = {};
  rows.forEach(r => {
    const day = r.visited_at.split("T")[0];
    map[day] = (map[day] || 0) + 1;
  });

  const data = Object.entries(map).slice(-10);
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
function PieChart({ rows, column }) {
  const data = groupCounts(rows, column);
  const total = data.reduce((a, b) => a + b[1], 0) || 1;
  let start = 0;

  return (
    <>
      <svg width="220" height="220" viewBox="0 0 220 220">
        {data.map(([label, val], i) => {
          const angle = (val / total) * 360;
          const end = start + angle;
          const path = describeArc(110, 110, 90, start, end);
          const percent = ((val / total) * 100).toFixed(1);
          start = end;

          return (
            <path key={label}
              d={path}
              fill={`hsl(${i * 40},70%,60%)`}>
              <title>{label}: {percent}%</title>
            </path>
          );
        })}
      </svg>

      <ChartLegend
        data={data.map(([label, val]) => [
          label,
          `${((val / total) * 100).toFixed(1)}%`
        ])}
      />
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

/* ===============================
   UI HELPERS
=============================== */

function KPI({ label, value }) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
    </div>
  );
}

function ChartIcon({ icon, active, onClick }) {
  return (
    <span
      onClick={onClick}
      style={{ fontSize: 22, cursor: "pointer", opacity: active ? 1 : 0.4 }}
    >
      {icon}
    </span>
  );
}
