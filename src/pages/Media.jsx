import { useEffect, useState } from "react";

const API_BASE = "https://sorpentor.com";
const WEBSITE = "jorgeaguiar.com";
const PAGE_SIZE = 10;

export default function Media() {
  const token = localStorage.getItem("aguiar_token");

  const [media, setMedia] = useState([]);
  const [activeUrl, setActiveUrl] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("desc"); // desc | asc

  /* =====================================================
     LOAD WEBSITE-SCOPED MEDIA (METADATA ONLY)
  ===================================================== */
  useEffect(() => {
    if (!token) return;

    async function loadMedia() {
      try {
        const types = ["video", "audio", "photo"];

        const results = await Promise.all(
          types.map(type =>
            fetch(
              `${API_BASE}/media/website/${WEBSITE}/${type}`,
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            ).then(r => r.json())
          )
        );

        setMedia(
          results
            .flat()
            .sort(
              (a, b) =>
                new Date(b.created_at) - new Date(a.created_at)
            )
        );
      } catch (err) {
        console.error("Media load error:", err);
      }
    }

    loadMedia();
  }, [token]);

  /* =====================================================
     RESET PAGE ON SEARCH OR SORT
  ===================================================== */
  useEffect(() => {
    setPage(1);
  }, [search, sortOrder]);

  /* =====================================================
     FILTER + SORT + PAGINATE
  ===================================================== */
  const filteredMedia = media.filter(item => {
    const q = search.toLowerCase();
    return (
      (item.title || "").toLowerCase().includes(q) ||
      (item.description || "").toLowerCase().includes(q) ||
      item.type.toLowerCase().includes(q)
    );
  });

  const sortedMedia = [...filteredMedia].sort((a, b) => {
    const da = new Date(a.created_at);
    const db = new Date(b.created_at);
    return sortOrder === "asc" ? da - db : db - da;
  });

  const totalPages = Math.ceil(sortedMedia.length / PAGE_SIZE);

  const paginatedMedia = sortedMedia.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  /* =====================================================
     SIGN URL ON DEMAND
  ===================================================== */
  async function playMedia(item) {
    if (!token) return;

    setLoadingId(item.id);

    try {
      const res = await fetch(
        `${API_BASE}/website/jorgeaguiar/media/${item.type}/sign/${item.id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!res.ok) throw new Error("Failed to sign URL");

      const { url } = await res.json();

      setActiveUrl(prev => ({
        ...prev,
        [item.id]: url
      }));
    } catch (err) {
      console.error("Play media error:", err);
      alert("Unable to play media");
    } finally {
      setLoadingId(null);
    }
  }

  /* =====================================================
     RENDER
  ===================================================== */
  return (
    <div className="page center">
      <div className="content">
        <h2>Media</h2>

        <p style={{ opacity: 0.7 }}>
          Showing media for <strong>{WEBSITE}</strong>
        </p>

        {/* 🔍 SEARCH + SORT */}
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
              width: "100%",
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
        </div>

        {filteredMedia.length === 0 && <p>No media available.</p>}

        {/* 📦 MEDIA GRID */}
        <div style={{ maxWidth: "900px", display: "grid", gap: "20px" }}>
          {paginatedMedia.map(item => (
            <div
              key={`${item.type}-${item.id}`}
              style={{
                padding: "16px",
                background: "#f8f8f8",
                borderRadius: "8px"
              }}
            >
              <h3>{item.title || "Untitled"}</h3>

              {item.description && <p>{item.description}</p>}

              {/* ▶ PLAY BUTTON */}
              {!activeUrl[item.id] && (
                <button
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

              {/* 🎥 VIDEO */}
              {activeUrl[item.id] && item.type === "video" && (
                <video
                  src={activeUrl[item.id]}
                  controls
                  autoPlay
                  loop
                  preload="none"
                  controlsList="nodownload noremoteplayback"
                  disablePictureInPicture
                  style={{ width: "100%", marginTop: "10px" }}
                  onContextMenu={e => e.preventDefault()}
                />
              )}

              {/* 🎧 AUDIO */}
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

              {/* 🖼 PHOTO */}
              {activeUrl[item.id] && item.type === "photo" && (
                <img
                  src={activeUrl[item.id]}
                  alt={item.title || "Photo"}
                  style={{
                    width: "100%",
                    maxHeight: "400px",
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

        {/* 📄 PAGINATION */}
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

            <span style={{ lineHeight: "32px" }}>
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
