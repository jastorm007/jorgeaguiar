import { useEffect, useState } from "react";

const API_BASE = "https://sorpentor.com";

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const token = localStorage.getItem("aguiar_token");

  useEffect(() => {
    if (!token) return;

    // 1️⃣ Load video metadata
    fetch(`${API_BASE}/media/videos`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to load videos");
        return res.json();
      })
      .then(async (data) => {
        // 2️⃣ For each video, request an authorized stream URL
        const withUrls = await Promise.all(
          data.map(async (v) => {
            const r = await fetch(
              `${API_BASE}/media/videos/authorize/${v.id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );
            const j = await r.json();
            return { ...v, streamUrl: j.url };
          })
        );

        setVideos(withUrls);
      })
      .catch(err => console.error("Video load error:", err));
  }, [token]);

  function react(id, liked) {
    fetch(`${API_BASE}/media/videos/${id}/react`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ liked })
    }).catch(err => console.error("Reaction error:", err));
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
