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

  /* 🔥 LOAD FIRST VIDEO */
  useEffect(() => {
    loadNext();
  }, []);

  /* 🔊 Handle mode changes ONLY */
  useEffect(() => {
    if (!videoRef.current) return;

    const v = videoRef.current;
    const isFullscreen =
      mode === "fullscreen-sound" || mode === "fullscreen-muted";

    /* Sound rules */
    v.muted = mode === "tv-muted" || mode === "fullscreen-muted";

    /* Fullscreen rules */
    if (isFullscreen) {
      if (!document.fullscreenElement) {
        containerRef.current?.requestFullscreen?.().catch(() => {});
      }
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, [mode]);

  function toggleSoundMode() {
    setMode((prev) => {
      if (prev === "tv-muted") return "fullscreen-sound";
      if (prev === "fullscreen-sound") return "fullscreen-muted";
      if (prev === "fullscreen-muted") return "tv-sound";
      if (prev === "tv-sound") return "tv-muted";
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
            mode.startsWith("fullscreen") ? "fullscreen" : ""
          }`}
        >
          <video
            ref={videoRef}
            className="broadcast-video"
            src={video.url}
            autoPlay
            muted
            playsInline
            preload="auto"
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
            {mode === "fullscreen-muted" && "🔇"}
            {mode === "tv-sound" && "🔈"}
          </button>
        </div>
      )}
    </div>
  );
}
