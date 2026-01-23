import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiFetch, apiGetJson } from "../api/apiFetch";

const API_BASE = "https://sorpentor.com";
const WEBSITE = "jorgeaguiar.com";
const PAGE_LIMIT_OPTIONS = [6, 9, 10, 12, 24, 48];

export default function Media() {
  const auth = useAuth();

  const [media, setMedia] = useState([]);
  const [activeUrl, setActiveUrl] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  /* =====================================================
     LOAD WEBSITE MEDIA (METADATA ONLY)
  ===================================================== */
  useEffect(() => {
    if (!auth.token) return;

    async function loadMedia() {
      try {
        const types = ["video", "audio", "photo"];

        const results = await Promise.all(
          types.map(type =>
            apiGetJson(
              `${API_BASE}/media/website/${WEBSITE}/${type}`,
              {},
              auth
            )
          )
        );

        setMedia(
          results
            .flat()
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        );
      } catch (err) {
        console.error("Media load error:", err);
      }
    }

    loadMedia();
  }, [auth.token]);

  /* =====================================================
     RESET PAGE WHEN FILTERS CHANGE
  ===================================================== */
  useEffect(() => {
    setPage(1);
  }, [search, sortOrder, pageSize]);

  /* =====================================================
     FILTER + SORT + PAGINATE
  ===================================================== */
  const filteredMedia = media.filter(item => {
    const q = search.toLowerCase();
    return (
      (item.title || "").toLowerCase().includes(q) ||
      (item.description || "").toLowerCase().includes(q) ||
      (item.type || "").toLowerCase().includes(q)
    );
  });

  const sortedMedia = [...filteredMedia].sort((a, b) => {
    const da = new Date(a.created_at);
    const db = new Date(b.created_at);
    return sortOrder === "asc" ? da - db : db - da;
  });

  const totalPages = Math.max(1, Math.ceil(sortedMedia.length / pageSize));

  const paginatedMedia = sortedMedia.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  /* =====================================================
     SIGN MEDIA URL (AUTO REFRESH SAFE)
  ===================================================== */
  async function playMedia(item) {
    setLoadingId(item.id);

    try {
      const res = await apiFetch(
        `${API_BASE}/media/website/${WEBSITE}/${item.type}/sign/${item.id}`,
        { method: "POST" },
        auth
      );

      if (!res.ok) throw new Error("Failed to sign media URL");

      const { url } = await res.json();

      setActiveUrl(prev => ({ ...prev, [item.id]: url }));
    } catch (err) {
      console.error("Play error:", err);
      alert("Unable to play media");
    } finally {
      setLoadingId(null);
    }
  }

  /* =====================================================
     RENDER
  ===================================================== */
  return (
    <div className="page">
      <div className="content">
        <h2>Media</h2>

        <p style={{ opacity: 0.7 }}>
          Showing media for <strong>{WEBSITE}</strong>
        </p>

        {/* CONTROLS */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "center",
            margin: "20px 0"
          }}
        >
          <input
            type="text"
            placeholder="Search media..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              maxWidth: "300px",
              padding: "8px 10px",
              borderRadius: "6px",
              border: "1px solid #ccc"
            }}
          />

          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
            style={{
              padding: "8px 10px",
              borderRadius: "6px",
              border: "1px solid #ccc"
            }}
          >
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>

          <select
            value={pageSize}
            onChange={e => setPageSize(Number(e.target.value))}
            style={{
              padding: "8px 10px",
              borderRadius: "6px",
              border: "1px solid #ccc"
            }}
          >
            {PAGE_LIMIT_OPTIONS.map(n => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        </div>

        {filteredMedia.length === 0 && <p>No media available.</p>}

        {/* MEDIA GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "20px"
          }}
        >
          {paginatedMedia.map(item => (
            <div
              key={`${item.type}-${item.id}`}
              style={{
                background: "#f8f8f8",
                borderRadius: "10px",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <div>
                <h3 style={{ marginBottom: "6px" }}>
                  {item.title || "Untitled"}
                </h3>

                <small style={{ opacity: 0.65 }}>
                  {(item.type || "").toUpperCase()}
                </small>

                {item.description && (
                  <p style={{ fontSize: "0.9rem", marginTop: "6px" }}>
                    {item.description}
                  </p>
                )}
              </div>

              {!activeUrl[item.id] && (
                <button
                  style={{ marginTop: "12px" }}
                  onClick={() => playMedia(item)}
                  disabled={loadingId === item.id}
                >
                  {loadingId === item.id
                    ? "Loading..."
                    : item.type === "video"
                    ? "▶ Play Video"
                    : item.type === "audio"
                    ? "▶ Play Audio"
                    : "👁 View Photo"}
                </button>
              )}

              {activeUrl[item.id] && item.type === "video" && (
                <video
                  src={activeUrl[item.id]}
                  controls
                  autoPlay
                  preload="none"
                  controlsList="nodownload noremoteplayback"
                  disablePictureInPicture
                  style={{ width: "100%", marginTop: "10px" }}
                  onContextMenu={e => e.preventDefault()}
                />
              )}

              {activeUrl[item.id] && item.type === "audio" && (
                <audio
                  src={activeUrl[item.id]}
                  controls
                  autoPlay
                  preload="none"
                  controlsList="nodownload"
                  style={{ width: "100%", marginTop: "10px" }}
                  onContextMenu={e => e.preventDefault()}
                />
              )}

              {activeUrl[item.id] && item.type === "photo" && (
                <img
                  src={activeUrl[item.id]}
                  alt={item.title || "Photo"}
                  style={{
                    width: "100%",
                    maxHeight: "220px",
                    objectFit: "contain",
                    marginTop: "10px",
                    borderRadius: "6px"
                  }}
                  onContextMenu={e => e.preventDefault()}
                />
              )}
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "12px",
              marginTop: "30px"
            }}
          >
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
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
        )}
      </div>
    </div>
  );
}
