import { useEffect, useRef, useState } from "react";
import "./Broadcast.css";

const DEVICE_TOKEN = import.meta.env.VITE_BROADCAST_DEVICE_TOKEN;
const API_BROADCAST =
  "https://sorpentor.com/website/jorgeaguiar/broadcast";

export default function Broadcast() {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [video, setVideo] = useState(null);
  const [mode, setMode] = useState("tv-muted");
  const [hover, setHover] = useState(false);

  async function loadNext() {
    const res = await fetch(API_BROADCAST, {
      headers: {
        Authorization: `Bearer ${DEVICE_TOKEN}`,
      },
    });

    if (!res.ok) return;
    const data = await res.json();
    setVideo(data);
  }

  useEffect(() => {
    loadNext();
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;

    const v = videoRef.current;
    v.load();
    v.play().catch(() => {});

    if (mode === "tv-muted") {
      v.muted = true;
      document.fullscreenElement && document.exitFullscreen();
    }

    if (mode === "fullscreen-sound") {
      v.muted = false;
      containerRef.current?.requestFullscreen?.();
    }

    if (mode === "tv-sound") {
      v.muted = false;
      document.fullscreenElement && document.exitFullscreen();
    }
  }, [video, mode]);

  function toggleSoundMode() {
    setMode((prev) => {
      if (prev === "tv-muted") return "fullscreen-sound";
      if (prev === "fullscreen-sound") return "tv-sound";
      return "tv-muted";
    });
  }

  return (
    <div
      className="broadcast-container"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {video && (
        <div
          ref={containerRef}
          className={`broadcast-tv ${
            mode === "fullscreen-sound" ? "fullscreen" : ""
          }`}
        >
          <video
            ref={videoRef}
            className="broadcast-video"
            src={video.url}
            autoPlay
            playsInline
            controls={false}
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture                  
            onEnded={loadNext}
          />

          <button
            className={`sound-toggle ${hover ? "show" : ""}`}
            onClick={toggleSoundMode}
          >
            {mode === "tv-muted" && "🔇"}
            {mode === "fullscreen-sound" && "🔊"}
            {mode === "tv-sound" && "🔈"}
          </button>
        </div>
      )}
    </div>
  );
}
