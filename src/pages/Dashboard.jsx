import { useEffect, useState } from "react";

export default function Analytics() {
  const [range, setRange] = useState("last7");
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const token = localStorage.getItem("token");

  const fetchData = () => {
    fetch("/analytics/visits/range", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        range,
        startDate,
        endDate
      })
    })
      .then(res => res.json())
      .then(setData);
  };

  useEffect(() => {
    fetchData();
  }, [range]);

  return (
    <div className="container mt-4">
      <h1>📊 Analytics Dashboard</h1>

      {/* 🔽 RANGE SELECTOR */}
      <div className="row mt-3 align-items-end">
        <div className="col-md-3">
          <label className="form-label">Date Range</label>
          <select
            className="form-select"
            value={range}
            onChange={e => setRange(e.target.value)}
          >
            <option value="yesterday">Yesterday</option>
            <option value="last7">Last 7 Days</option>
            <option value="last30">Last 30 Days</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {range === "custom" && (
          <>
            <div className="col-md-3">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                onChange={e => setStartDate(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                onChange={e => setEndDate(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <button
                className="btn btn-primary w-100"
                onClick={fetchData}
              >
                Apply
              </button>
            </div>
          </>
        )}
      </div>

      {/* 📋 RESULTS */}
      <table className="table table-striped mt-4">
        <thead>
          <tr>
            <th>Date</th>
            <th>Visits</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td>{row.day}</td>
              <td>{row.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
