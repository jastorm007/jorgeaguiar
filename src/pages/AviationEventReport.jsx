import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";


const API_BASE = "https://sorpentor.com";

export default function AviationEventReport() {
  const { id } = useParams();
  const token = localStorage.getItem("aguiar_token");

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  //format date
  function formatDate(dateStr) {
    if (!dateStr) return "—";
    return dateStr.split("T")[0];
  }

  useEffect(() => {
    if (!token) return;

    async function load() {
      const res = await fetch(`${API_BASE}/aviation-events/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setEvent(await res.json());
      setLoading(false);
    }

    load();
  }, [id, token]);

  if (!token) return <p>Please log in.</p>;
  if (loading) return <p>Loading report…</p>;
  if (!event) return <p>Report not found.</p>;

  return (
    <div style={{ padding: 30, maxWidth: 900, margin: "auto" }}>
      <h2>✈️ Aviation Incident Report</h2>

      <Section title="Event Details">
        <Row label="Date">{formatDate(event.EVENT_LCL_DATE)}</Row>
        <Row label="Time">{event.EVENT_LCL_TIME}</Row>
        <Row label="Location">
          {event.LOC_CITY_NAME}, {event.LOC_STATE_NAME}, {event.LOC_CNTRY_NAME}
        </Row>
        <Row label="Event Type">{event.EVENT_TYPE_DESC}</Row>
        <Row label="FSDO">{event.FSDO_DESC}</Row>
      </Section>

      <Section title="Aircraft">
        <Row label="Operator">{event.ACFT_OPRTR}</Row>
        <Row label="Make / Model">
          {event.ACFT_MAKE_NAME} {event.ACFT_MODEL_NAME}
        </Row>
        <Row label="Registration">{event.REGIST_NBR}</Row>
        <Row label="Damage">{event.ACFT_DMG_DESC}</Row>
        <Row label="Missing">{event.ACFT_MISSING_FLAG}</Row>
      </Section>

      <Section title="Flight">
        <Row label="Phase">{event.FLT_PHASE}</Row>
        <Row label="Activity">{event.FLT_ACTIVITY}</Row>
        <Row label="FAR Part">{event.FAR_PART}</Row>
        <Row label="Fatal">{event.FATAL_FLAG}</Row>
      </Section>

      <Section title="Injuries">
        <Row label="Crew Fatal">{event.FLT_CRW_INJ_FATAL}</Row>
        <Row label="Passenger Fatal">{event.PAX_INJ_FATAL}</Row>
        <Row label="Ground Fatal">{event.GRND_INJ_FATAL}</Row>
      </Section>

      <Section title="Narrative">
        <p style={{ whiteSpace: "pre-wrap" }}>{event.RMK_TEXT}</p>
      </Section>
    </div>
  );
}

/* ===============================
   SMALL COMPONENTS
=============================== */

function Section({ title, children }) {
  return (
    <section style={{ marginTop: 30 }}>
      <h3>{title}</h3>
      <div style={{ background: "#f8f8f8", padding: 16, borderRadius: 8 }}>
        {children}
      </div>
    </section>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <strong>{label}:</strong> {children}
    </div>
  );
}
