import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const API = "https://sorpentor.com";

export default function Dashboard() {
  const { token } = useAuth();

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("visited_at");
  const [sortDir, setSortDir] = useState("desc");

  const pageSize = 25;

  const fetchTable = async () => {
    const res = await fetch(`${API}/analytics/visits/table`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        page,
        pageSize,
        sortBy,
        sortDir,
        search
      })
    });

    const json = await res.json();
    setRows(json.rows);
    setTotal(json.total);
  };

  useEffect(() => {
    fetchTable();
  }, [page, sortBy, sortDir]);

  const toggleSort = (col) => {
    if (sortBy === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  return (
    <div className="container mt-4">
      <h2>🔍 Page Visits</h2>

      <input
        className="form-control mb-3"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && fetchTable()}
      />

      <table className="table table-hover table-sm">
        <thead>
          <tr>
            <th onClick={() => toggleSort("visited_at")}>Date</th>
            <th onClick={() => toggleSort("website")}>Website</th>
            <th onClick={() => toggleSort("page")}>Page</th>
            <th onClick={() => toggleSort("country")}>Country</th>
            <th>IP</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{new Date(r.visited_at).toLocaleString()}</td>
              <td>{r.website}</td>
              <td>{r.page}</td>
              <td>{r.country}</td>
              <td>{r.ip_address}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 📄 Pagination */}
      <div className="d-flex justify-content-between">
        <button
          className="btn btn-outline-secondary"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </button>

        <span>
          Page {page} of {Math.ceil(total / pageSize)}
        </span>

        <button
          className="btn btn-outline-secondary"
          disabled={page * pageSize >= total}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
