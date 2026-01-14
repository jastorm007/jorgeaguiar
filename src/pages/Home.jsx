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
          demonstrate real application systems rather than static demos. The
          pages here reflect how modern web applications are structured, how
          data flows between services, and how frontends consume secure APIs.
        </p>

        <p style={{ marginTop: "16px", lineHeight: 1.6 }}>
          The frontend is built using a component based architecture with modern
          JavaScript frameworks, client side routing, and state driven rendering.
          Pages are designed to react to live data returned from backend
          services, providing interactive tables, charts, and media playback
          without full page reloads.
        </p>

        <p style={{ marginTop: "16px", lineHeight: 1.6 }}>
          Behind the scenes, the backend consists of API driven services that
          handle authentication, data retrieval, analytics, and media metadata.
          These services expose controlled endpoints that the frontend consumes
          using secure tokens, allowing different pages to share common
          infrastructure while remaining logically separated.
        </p>

        <p style={{ marginTop: "16px", lineHeight: 1.6 }}>
        <strong>Visitors Page:</strong> The visitors page demonstrates a secure
        analytics pipeline built around authenticated API services and a responsive
        frontend. Page activity is collected and stored centrally, then queried through
        protected endpoints that apply server-side filtering, sorting, and pagination
        to ensure accuracy and performance. The frontend consumes this data using
        state-driven components, presenting key metrics, searchable tables, and
        interactive visualizations that update in real time as filters change. This
        approach highlights how operational analytics can be delivered efficiently
        while maintaining data integrity, scalability, and clear separation between
        backend services and client-side presentation.
      </p>

        <p style={{ marginTop: "22px", lineHeight: 1.6 }}>
          <strong>Media Page:</strong> The media section demonstrates a structured
          media delivery system. Metadata is retrieved from an API and rendered
          dynamically, while actual media access is controlled by the backend.
          This approach allows streaming, engagement tracking, and permission
          handling without exposing raw storage paths or internal systems.
        </p>

        <p style={{ marginTop: "16px", lineHeight: 1.6 }}>
          <strong>Broadcast Page:</strong> The broadcast area focuses on real time
          or near real time content delivery. It highlights how frontend
          components can respond to backend signals, status updates, or timed
          events, simulating live systems such as monitoring dashboards,
          streaming controls, or operational displays.
        </p>

        <p style={{ marginTop: "16px", lineHeight: 1.6 }}>
          <strong>Aviation Dashboard:</strong> The aviation dashboard showcases
          data intensive workflows. Large datasets are queried, filtered, and
          paginated server side, then visualized client side using charts, tables,
          and interactive controls. This page emphasizes performance, clarity,
          and the ability to explore complex datasets without overwhelming the
          user or the browser.
        </p>

        <p style={{ marginTop: "16px", lineHeight: 1.6 }}>
          Many areas of this site are intentionally practical rather than styled
          as marketing pages. The goal is to demonstrate how systems are built,
          how they scale, and how they can be adapted for production use in
          different industries.
        </p>

        <p style={{ marginTop: "28px", fontWeight: 500 }}>
          I appreciate your time and curiosity — enjoy exploring what’s being
          built.
        </p>
      </div>
    </div>
  );
}
