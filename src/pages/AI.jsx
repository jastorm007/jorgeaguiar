import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiGetJson } from "../api/apiFetch";

const API_BASE = "https://sorpentor.com";

export default function AI() {
  const auth = useAuth();

  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("tinyllama");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function askAI(e) {
    e.preventDefault();

    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    if (!auth.token) {
      setError("You must be logged in to use AI");
      return;
    }

    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const data = await apiGetJson(
        `${API_BASE}/ai/ask`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model, prompt })
        },
        auth
      );

      setAnswer(data?.answer || "No response returned");
    } catch (err) {
      console.error("AI ERROR:", err);

      if (err.message === "Session expired") {
        setError("Session expired. Please log in again.");
      } else {
        setError(err.message || "AI request failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>Ask Ollama AI</h1>

      <form onSubmit={askAI} style={styles.form}>
        <label style={styles.label}>Model</label>
        <select
          value={model}
          onChange={e => setModel(e.target.value)}
          style={styles.select}
        >
          <option value="llama3">llama3</option>
          <option value="mistral">mistral</option>
          <option value="codellama">codellama</option>
          <option value="tinyllama">tinyllama</option>
        </select>

        <label style={styles.label}>Prompt</label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Explain what Docker networks are in simple terms."
          rows={5}
          style={styles.textarea}
        />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Thinking..." : "Submit"}
        </button>
      </form>

      {error && <div style={styles.error}>{error}</div>}

      {answer && (
        <div style={styles.answerBox}>
          <h3>Response</h3>
          <pre style={styles.answer}>{answer}</pre>
        </div>
      )}
    </div>
  );
}

/* ===============================
   SIMPLE STYLES (INLINE)
=============================== */
const styles = {
  page: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "24px"
  },
  title: {
    marginBottom: "16px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  label: {
    fontWeight: 600
  },
  select: {
    padding: "8px",
    fontSize: "16px"
  },
  textarea: {
    padding: "10px",
    fontSize: "16px",
    resize: "vertical"
  },
  button: {
    marginTop: "8px",
    padding: "10px",
    fontSize: "16px",
    cursor: "pointer"
  },
  error: {
    marginTop: "12px",
    color: "red"
  },
  answerBox: {
    marginTop: "24px",
    padding: "16px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    background: "#fafafa"
  },
  answer: {
    whiteSpace: "pre-wrap",
    lineHeight: 1.5
  }
};
