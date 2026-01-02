import { useEffect, useState } from "react";

const API_BASE = "https://sorpentor.com";

export default function Media() {
  const token = localStorage.getItem("aguiar_token");
  const [media, setMedia] = useState([]);
  const [activeUrl, setActiveUrl] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  /* =====================================================
     LOAD MEDIA METADATA ONLY
  ===================================================== */
  useEffect(() => {
    if (!token) return;

    async function loadMedia() {
      try {
        const types = ["video", "audio", "photo"];

        const results = await Promise.all(
          types.map(type =>
            fetch(`${API_BASE}/media/${type}`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }).then(r => r.json())
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
     SIGN URL ON DEMAND
  ===================================================== */
  async function playMedia(item) {
    if (!token) return;

    setLoadingId(item.id);

    try {
      const res = await fetch(
        `${API_BASE}/media/${item.type}/sign/${item.id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
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

      {media.length === 0 && <p>No media available.</p>}

      <div style={{ maxWidth: "900px", display: "grid", gap: "20px" }}>
        {media.map(item => (
          <div
            key={`${item.type}-${item.id}`}
            style={{
              padding: "16px",
              background: "#f8f8f8",
              borderRadius: "8px"
            }}
          >
            <h3>{item.title || "Untitled"}</h3>
            <p>{item.description}</p>

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
                preload="none"
                controlsList="nodownload nofullscreen noremoteplayback"
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
                alt={item.title}
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
    </div>
    </div>
  );
}
