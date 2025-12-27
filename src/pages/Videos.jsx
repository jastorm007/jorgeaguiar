import { useEffect, useState } from "react";

const API_BASE = "https://sorpentor.com";

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const token = localStorage.getItem("aguiar_token");

  useEffect(() => {
    if (!token) return;

    async function loadVideos() {
      try {
        // 1️⃣ Get video metadata
        const res = await fetch(`${API_BASE}/media/videos`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!res.ok) throw new Error("Failed to load videos");
        const data = await res.json();

        // 2️⃣ Get signed URLs
        const withSignedUrls = await Promise.all(
          data.map(async (v) => {
            const r = await fetch(
              `${API_BASE}/media/videos/authorize/${v.id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );

            if (!r.ok) throw new Error("Failed to authorize video");
            const { url } = await r.json();

            return { ...v, streamUrl: url };
          })
        );

        setVideos(withSignedUrls);
      } catch (err) {
        console.error("Video load error:", err);
      }
    }

    loadVideos();
  }, [token]);

  function react(id, liked) {
    fetch(`${API_BASE}/media/videos/${id}/react`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ liked })
    }).catch(console.error);
  }

  return (
    <div className="page">
      <div className="content">
        <h2>Videos</h2>

        {videos.length === 0 && <p>No videos available.</p>}

        <div className="video-grid">
          {videos.map(v => (
            <div className="video-card" key={v.id}>
              <video
                controls
                preload="metadata"
                src={v.streamUrl}
              />

              <h3>{v.title}</h3>
              <p>{v.description}</p>

              <div className="video-actions">
                <button onClick={() => react(v.id, true)}>
                  👍 {v.likes}
                </button>
                <button onClick={() => react(v.id, false)}>
                  👎 {v.dislikes}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
