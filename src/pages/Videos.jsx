import { useEffect, useState } from "react";

const API_BASE = "https://sorpentor.com";

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const token = localStorage.getItem("aguiar_token");

  useEffect(() => {
    async function loadVideos() {
      try {
        const res = await fetch(`${API_BASE}/media/videos`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error("Failed to load videos");

        const data = await res.json();
        setVideos(data);
      } catch (err) {
        console.error("Video list error:", err);
      }
    }

    loadVideos();
  }, [token]);

  function openVideo(videoId) {
    const url = `${API_BASE}/media/videos/stream/${videoId}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer,width=960,height=540"
    );
  }

  return (
    <div style={{ padding: "30px" }}>
      <h2>Videos</h2>

      {videos.length === 0 && <p>No videos available.</p>}

      <div style={{ display: "grid", gap: "15px", maxWidth: "800px" }}>
        {videos.map(v => (
          <div
            key={v.id}
            style={{
              padding: "15px",
              borderRadius: "8px",
              background: "#f8f8f8"
            }}
          >
            <h3>{v.title}</h3>
            <p>{v.description}</p>

            <button onClick={() => openVideo(v.id)}>
              ▶ Play
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
