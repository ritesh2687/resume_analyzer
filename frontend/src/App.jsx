import { useState, useRef } from "react";
import axios from "axios";
import SkillChart from "./components/SkillChart";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobDesc, setJobDesc] = useState("");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setError("");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && (dropped.name.endsWith(".pdf") || dropped.name.endsWith(".docx"))) {
      setFile(dropped);
      setError("");
    } else {
      setError("Only .pdf or .docx files are supported.");
    }
  };

  const handleAnalyze = async () => {
    if (!file) return setError("Please upload a resume file.");
    if (!jobDesc.trim()) return setError("Please enter a job description.");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_desc", jobDesc);

    try {
      setLoading(true);
      setError("");
      setResult(null);

      const res = await axios.post(`${API_URL}/analyze`, formData);
      setResult(res.data);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || "Something went wrong.";
      setError(`Analysis failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = result
    ? result.score >= 70
      ? "#22c55e"
      : result.score >= 40
      ? "#f59e0b"
      : "#ef4444"
    : "#a78bfa";

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerIcon}>🤖</div>
          <h1 style={styles.title}>Resume Analyzer</h1>
          <p style={styles.subtitle}>Match your resume against any job description using AI</p>
        </div>

        {/* Upload Zone */}
        <div
          style={{ ...styles.dropZone, ...(dragOver ? styles.dropZoneActive : {}) }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <div style={styles.dropIcon}>{file ? "📄" : "☁️"}</div>
          <p style={styles.dropText}>
            {file ? file.name : "Drop your resume here or click to browse"}
          </p>
          <p style={styles.dropHint}>.pdf or .docx · Max 10MB</p>
        </div>

        {/* Job Description */}
        <div style={styles.field}>
          <label style={styles.label}>Job Description</label>
          <textarea
            placeholder="Paste the job description here..."
            rows={5}
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            style={styles.textarea}
          />
        </div>

        {/* Error */}
        {error && <div style={styles.errorBox}>⚠️ {error}</div>}

        {/* Button */}
        <button
          onClick={handleAnalyze}
          disabled={loading}
          style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
        >
          {loading ? (
            <span style={styles.buttonContent}>
              <span style={styles.spinner} /> Analyzing...
            </span>
          ) : (
            "Analyze Resume →"
          )}
        </button>

        {/* Result */}
        {result && (
          <div style={styles.results}>
            <div style={styles.divider} />

            {/* Score */}
            <div style={styles.scoreCard}>
              <div style={{ ...styles.scoreBadge, color: scoreColor, borderColor: scoreColor }}>
                {result.score}%
              </div>
              <div>
                <h2 style={styles.scoreTitle}>Match Score</h2>
                <p style={styles.scoreDesc}>
                  {result.score >= 70
                    ? "Great fit! Your resume aligns well."
                    : result.score >= 40
                    ? "Moderate match. Some gaps to address."
                    : "Low match. Consider tailoring your resume."}
                </p>
              </div>
            </div>

            {/* Skills */}
            <Section title="🧠 All Skills" color="#a78bfa">
              <TagList items={result.skills} tagStyle={styles.tagDefault} />
            </Section>

            <Section title="✅ Matched Skills" color="#22c55e">
              <TagList items={result.matched_skills} tagStyle={styles.tagGreen} />
            </Section>

            <Section title="❌ Missing Skills" color="#ef4444">
              <TagList items={result.missing_skills} tagStyle={styles.tagRed} />
            </Section>

            {/* Suggestions */}
            {result.feedback?.length > 0 && (
              <Section title="💬 AI Suggestions" color="#60a5fa">
                <ul style={styles.feedbackList}>
                  {result.feedback.map((f, i) => (
                    <li key={i} style={styles.feedbackItem}>
                      <span style={styles.feedbackDot} />
                      {f}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Chart */}
            <SkillChart result={result} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function Section({ title, color, children }) {
  return (
    <div style={styles.section}>
      <h3 style={{ ...styles.sectionTitle, color }}>{title}</h3>
      {children}
    </div>
  );
}

function TagList({ items, tagStyle }) {
  if (!items?.length) return <p style={styles.empty}>None found.</p>;
  return (
    <div style={styles.tagList}>
      {items.map((s, i) => (
        <span key={i} style={{ ...styles.tag, ...tagStyle }}>{s}</span>
      ))}
    </div>
  );
}

/* ── Styles ── */

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: "40px 16px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: "600px",
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "20px",
    padding: "36px",
    color: "#f1f5f9",
    boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
  },

  /* Header */
  header: { textAlign: "center", marginBottom: "32px" },
  headerIcon: { fontSize: "48px", marginBottom: "8px" },
  title: { fontSize: "28px", fontWeight: "700", margin: "0 0 8px", letterSpacing: "-0.5px" },
  subtitle: { color: "#94a3b8", fontSize: "14px", margin: 0 },

  /* Drop Zone */
  dropZone: {
    border: "2px dashed rgba(167,139,250,0.4)",
    borderRadius: "12px",
    padding: "28px",
    textAlign: "center",
    cursor: "pointer",
    marginBottom: "20px",
    transition: "all 0.2s ease",
    background: "rgba(167,139,250,0.04)",
  },
  dropZoneActive: {
    borderColor: "#a78bfa",
    background: "rgba(167,139,250,0.1)",
  },
  dropIcon: { fontSize: "36px", marginBottom: "8px" },
  dropText: { margin: "0 0 4px", fontWeight: "500", fontSize: "15px" },
  dropHint: { margin: 0, color: "#64748b", fontSize: "12px" },

  /* Field */
  field: { marginBottom: "20px" },
  label: { display: "block", marginBottom: "8px", fontSize: "13px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" },
  textarea: {
    width: "100%",
    padding: "12px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "10px",
    color: "#f1f5f9",
    fontSize: "14px",
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
    lineHeight: "1.6",
  },

  /* Error */
  errorBox: {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "#fca5a5",
    fontSize: "13px",
    marginBottom: "16px",
  },

  /* Button */
  button: {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    letterSpacing: "0.02em",
    transition: "opacity 0.2s",
  },
  buttonDisabled: { opacity: 0.6, cursor: "not-allowed" },
  buttonContent: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
  spinner: {
    width: "14px", height: "14px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "white",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },

  /* Results */
  results: { marginTop: "8px" },
  divider: { borderTop: "1px solid rgba(255,255,255,0.08)", margin: "24px 0" },

  /* Score */
  scoreCard: { display: "flex", alignItems: "center", gap: "20px", marginBottom: "28px" },
  scoreBadge: {
    fontSize: "36px", fontWeight: "800",
    border: "3px solid",
    borderRadius: "16px",
    padding: "12px 18px",
    minWidth: "90px",
    textAlign: "center",
    flexShrink: 0,
  },
  scoreTitle: { margin: "0 0 4px", fontSize: "18px", fontWeight: "700" },
  scoreDesc: { margin: 0, color: "#94a3b8", fontSize: "13px" },

  /* Sections */
  section: { marginBottom: "22px" },
  sectionTitle: { fontSize: "15px", fontWeight: "700", margin: "0 0 10px" },

  /* Tags */
  tagList: { display: "flex", flexWrap: "wrap", gap: "8px" },
  tag: { padding: "5px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "500" },
  tagDefault: { background: "rgba(255,255,255,0.08)", color: "#e2e8f0" },
  tagGreen: { background: "rgba(34,197,94,0.12)", color: "#86efac", border: "1px solid rgba(34,197,94,0.2)" },
  tagRed: { background: "rgba(239,68,68,0.12)", color: "#fca5a5", border: "1px solid rgba(239,68,68,0.2)" },
  empty: { color: "#475569", fontSize: "13px", margin: 0 },

  /* Feedback */
  feedbackList: { listStyle: "none", margin: 0, padding: 0 },
  feedbackItem: {
    display: "flex", alignItems: "flex-start", gap: "10px",
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    fontSize: "14px", color: "#cbd5e1", lineHeight: "1.5",
  },
  feedbackDot: {
    width: "6px", height: "6px", borderRadius: "50%",
    background: "#60a5fa", flexShrink: 0, marginTop: "7px",
  },
};