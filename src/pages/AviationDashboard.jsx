import { useEffect, useState } from "react";

const API_BASE = "https://sorpentor.com";

export default function AviationDashboard() {
  const token = localStorage.getItem("aguiar_token");

  const [stats, setStats] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // pagination + sorting
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [sortKey, setSortKey] = useState("EVENT_LCL_DATE");
  const [sortDir, setSortDir] = useState("desc");

  /* ===============================
     LOAD DASHBOARD DATA
  =============================== */
  useEffect(() => {
    if (!token) return;

    async function load() {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [statsRes, timelineRes, eventsRes] = await Promise.all([
          fetch(`${API_BASE}/aviation/stats`, { headers }),
          fetch(`${API_BASE}/aviation/stats/timeline`, { headers }),
          fetch(`${API_BASE}/aviation-events?limit=250`, { headers })
        ]);

        setStats(await statsRes.json());
        setTimeline(await timelineRes.json());
        setEvents(await eventsRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token]);

  /* ===============================
     SEARCH REMARKS
  =============================== */
  async function runSearch(e) {
    e.preventDefault();
    if (!search.trim()) return;

    const res = await fetch(`${API_BASE}/aviation/stats/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ q: search })
    });

    setPage(1);
    setEvents(await res.json());
  }

  /* ===============================
     SORT HANDLER
  =============================== */
  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  /* ===============================
     DERIVED DATA
  =============================== */
  const sortedEvents = [...events].sort((a, b) => {
    const aVal = a[sortKey] || "";
    const bVal = b[sortKey] || "";

    if (sortKey.includes("DATE")) {
      return sortDir === "asc"
        ? new Date(aVal) - new Date(bVal)
        : new Date(bVal) - new Date(aVal);
    }

    if (sortKey.includes("TIME")) {
      return sortDir === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    }

    return sortDir === "asc"
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const totalPages = Math.ceil(sortedEvents.length / pageSize);

  const pagedEvents = sortedEvents.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  /* ===============================
     GUARDS
  =============================== */
  if (!token) return <p>Please log in.</p>;
  if (loading) return <p>Loading aviation data…</p>;

  /* ===============================
     RENDER
  =============================== */
  return (
    <div className="page center">
      <div className="content" style={{ maxWidth: "1200px" }}>
        <h2>✈️ Aviation Safety Dashboard</h2>

        {/* KPI CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          <KPI title="Total Events" value={stats.total_events} />
          <KPI title="Fatal Events" value={stats.fatal_events} />
          <KPI title="Total Fatalities" value={stats.total_fatalities} />
        </div>

        {/* TIMELINE */}
        <section style={{ marginTop: 30 }}>
          <h3>Event Timeline</h3>
          <TimelineChart data={timeline} />
        </section>

        {/* SEARCH */}
        <section style={{ marginTop: 30 }}>
          <h3>Search Incident Remarks</h3>
          <form onSubmit={runSearch}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="engine failure, runway, bird strike..."
              style={{ padding: 8, width: "100%", maxWidth: 400 }}
            />
          </form>
        </section>

        {/* TABLE */}
        <section style={{ marginTop: 30 }}>
          <h3>Recent Events</h3>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <SortableTh onClick={() => handleSort("EVENT_LCL_DATE")}>Date</SortableTh>
                  <SortableTh onClick={() => handleSort("EVENT_LCL_TIME")}>Time</SortableTh>
                  <SortableTh onClick={() => handleSort("LOC_STATE_NAME")}>State</SortableTh>
                  <SortableTh onClick={() => handleSort("ACFT_MAKE_NAME")}>Aircraft</SortableTh>
                  <SortableTh onClick={() => handleSort("FLT_PHASE")}>Phase</SortableTh>
                  <SortableTh onClick={() => handleSort("FATAL_FLAG")}>Fatal</SortableTh>
                </tr>
              </thead>
              <tbody>
                {pagedEvents.map(e => (
                  <tr key={e.id}>
                    <Td>{e.EVENT_LCL_DATE}</Td>
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

          {/* PAGINATION */}
          <div style={{ marginTop: 16, display: "flex", gap: 12, alignItems: "center" }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              ◀ Prev
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next ▶
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ===============================
   SMALL COMPONENTS
=============================== */

function KPI({ title, value }) {
  return (
    <div style={{ padding: 16, background: "#f8f8f8", borderRadius: 8, textAlign: "center" }}>
      <h4>{title}</h4>
      <div style={{ fontSize: 28, fontWeight: "bold" }}>{value}</div>
    </div>
  );
}

function TimelineChart({ data }) {
  if (!data.length) return <p>No data</p>;

  const max = Math.max(...data.map(d => d.total));

  return (
    <svg width="100%" height="120">
      {data.map((d, i) => (
        <rect
          key={i}
          x={`${(i / data.length) * 100}%`}
          y={120 - (d.total / max) * 100}
          width={`${100 / data.length}%`}
          height={(d.total / max) * 100}
          fill="#2c7be5"
        />
      ))}
    </svg>
  );
}

const SortableTh = ({ children, onClick }) => (
  <th
    onClick={onClick}
    style={{
      textAlign: "left",
      padding: 8,
      borderBottom: "1px solid #ddd",
      cursor: "pointer",
      userSelect: "none"
    }}
  >
    {children} ↕
  </th>
);

const Td = ({ children }) => (
  <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>
    {children}
  </td>
);
