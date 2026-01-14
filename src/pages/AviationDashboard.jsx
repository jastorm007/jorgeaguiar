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
  const [timeline, setTimeline] = useState([]);
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
  const [chartMode, setChartMode] = useState("none");
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

      const [statsRes, timelineRes, eventsRes] = await Promise.all([
        fetch(`${API_BASE}/aviation/stats`, { headers }),
        fetch(`${API_BASE}/aviation/stats/timeline`, { headers }),
        fetch(`${API_BASE}/aviation-events?limit=500`, { headers })
      ]);

      setStats(await statsRes.json());
      setTimeline(await timelineRes.json());
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
      body: JSON.stringify({
        column: searchColumn,
        query: searchQuery
      })
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
     PAGINATED EVENTS
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

        {/* SEARCH */}
        <section style={{ marginTop: 30 }}>
          <form onSubmit={runSearch} style={{ display: "flex", gap: 10 }}>
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

        {/* TABLE */}
        <section style={{ marginTop: 30 }}>
          <h3>Results</h3>

          {/* PAGE CONTROLS */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              Rows per page:&nbsp;
              <select
                value={limit}
                onChange={e => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[10, 25, 50, 100].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                ◀ Prev
              </button>
              <span style={{ margin: "0 10px" }}>
                Page {page} of {totalPages}
              </span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                Next ▶
              </button>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
                    <Td style={{ color: e.FATAL_FLAG === "Yes" ? "red" : "#555" }}>
                      {e.FATAL_FLAG}
                    </Td>
                    <Td>{e.RMK_TEXT}</Td>
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
   UI HELPERS
=============================== */

function SortableTh({ label, column, sortColumn, sortDirection, onSort }) {
  const active = sortColumn === column;
  return (
    <th
      onClick={() => onSort(column)}
      style={{ padding: 8, borderBottom: "1px solid #ddd", cursor: "pointer" }}
    >
      {label} {active && (sortDirection === "asc" ? "▲" : "▼")}
    </th>
  );
}

const Th = ({ children }) => (
  <th style={{ padding: 8, borderBottom: "1px solid #ddd" }}>{children}</th>
);

const Td = ({ children }) => (
  <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{children}</td>
);

function KPI({ title, value }) {
  return (
    <div style={{ background: "#f8f8f8", padding: 16, borderRadius: 8, textAlign: "center" }}>
      <h4>{title}</h4>
      <div style={{ fontSize: 26, fontWeight: "bold" }}>{value}</div>
    </div>
  );
}

function formatDate(d) {
  return d ? d.split("T")[0] : "—";
}
