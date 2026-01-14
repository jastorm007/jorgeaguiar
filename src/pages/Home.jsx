export default function Home() {
  return (
    <div className="page">
      <div className="content" style={{ maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ marginBottom: "12px" }}>
          Welcome — I’m Jorge Aguiar
        </h1>

        <p style={{ fontSize: "1.1rem", opacity: 0.85 }}>
          Thank you for stopping by.
        </p>

        <p style={{ marginTop: "20px", lineHeight: 1.6 }}>
          This website serves as a working space where I design, test, and
          demonstrate various portals, tools, and application concepts. You’ll
          find examples of media systems, dashboards, APIs, and interactive
          components that reflect real-world use cases.
        </p>

        <p style={{ marginTop: "16px", lineHeight: 1.6 }}>
          Many of the pages here are intentionally functional rather than
          polished marketing pages — the focus is on how things work, how they
          scale, and how they can be adapted to different needs.
        </p>

        <p style={{ marginTop: "16px", lineHeight: 1.6 }}>
          Feel free to explore, click around, and see what’s being built. This
          site is constantly evolving as new ideas, demos, and systems are added.
        </p>

        <p style={{ marginTop: "28px", fontWeight: 500 }}>
          I appreciate your time and curiosity — enjoy your visit.
        </p>
      </div>
    </div>
  );
}
