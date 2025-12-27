import { useEffect, useState } from "react";

export default function Videos() {
  const [videos, setVideos] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("/media/videos", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(setVideos);
  }, []);

  function react(id, liked) {
    fetch(`/media/videos/${id}/react`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ liked })
    });
  }

  return (
    <div className="page">
      <div className="content">
        <div className="video-grid">
          {videos.map(v => (
            <div className="video-card" key={v.id}>
              <video
                controls
                preload="metadata"
                src={`/media/videos/stream/${v.id}`}
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
