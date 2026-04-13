import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

/* ── Helpers ── */

/** Read a CSS variable from :root, with a fallback for SSR/tests */
function cssVar(name, fallback = "") {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function getScoreColor(score) {
  if (score >= 70) return { main: "#22c55e", dim: "rgba(34,197,94,0.15)" };
  if (score >= 40) return { main: "#f59e0b", dim: "rgba(245,158,11,0.15)" };
  return { main: "#ef4444", dim: "rgba(239,68,68,0.15)" };
}

/* ── Shared chart defaults ── */
const FONT_FAMILY = "'DM Sans', system-ui, sans-serif";

/* ── Component ── */

export default function SkillChart({ result }) {
  if (!result) return null;

  const matchedCount = result.matched_skills?.length || 0;
  const missingCount = result.missing_skills?.length || 0;
  const total = matchedCount + missingCount;

  // Don't render charts if there's nothing to show
  if (total === 0 && !result.score) return null;

  const score = result.score ?? 0;
  const scoreColors = getScoreColor(score);

  /* ── Doughnut ── */
  const doughnutData = {
    labels: ["Matched", "Missing"],
    datasets: [
      {
        data: [matchedCount, missingCount],
        backgroundColor: ["rgba(34,197,94,0.85)", "rgba(239,68,68,0.85)"],
        borderColor: ["#16a34a", "#dc2626"],
        borderWidth: 1.5,
        hoverBackgroundColor: ["#22c55e", "#ef4444"],
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    cutout: "65%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: { family: FONT_FAMILY, size: 12, weight: "500" },
          color: cssVar("--text", "#6b6375"),
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: cssVar("--surface", "#fff"),
        titleColor: cssVar("--text-h", "#08060d"),
        bodyColor: cssVar("--text", "#6b6375"),
        borderColor: cssVar("--border", "#e5e4e7"),
        borderWidth: 1,
        padding: 10,
        bodyFont: { family: FONT_FAMILY, size: 13 },
        titleFont: { family: FONT_FAMILY, size: 12, weight: "600" },
        callbacks: {
          label: (ctx) => {
            const pct = total ? Math.round((ctx.raw / total) * 100) : 0;
            return `  ${ctx.raw} skills (${pct}%)`;
          },
        },
      },
    },
  };

  /* ── Bar ── */
  const barData = {
    labels: ["Score"],
    datasets: [
      {
        label: "Match %",
        data: [score],
        backgroundColor: scoreColors.dim,
        borderColor: scoreColors.main,
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
        hoverBackgroundColor: scoreColors.main,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    indexAxis: "y",
    scales: {
      x: {
        min: 0,
        max: 100,
        grid: {
          color: cssVar("--border-subtle", "rgba(229,228,231,0.6)"),
          drawTicks: false,
        },
        border: { dash: [4, 4], display: false },
        ticks: {
          font: { family: FONT_FAMILY, size: 11 },
          color: cssVar("--text-muted", "#9ca3af"),
          callback: (v) => `${v}%`,
          stepSize: 25,
        },
      },
      y: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          font: { family: FONT_FAMILY, size: 12, weight: "500" },
          color: cssVar("--text", "#6b6375"),
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: cssVar("--surface", "#fff"),
        titleColor: cssVar("--text-h", "#08060d"),
        bodyColor: cssVar("--text", "#6b6375"),
        borderColor: cssVar("--border", "#e5e4e7"),
        borderWidth: 1,
        padding: 10,
        bodyFont: { family: FONT_FAMILY, size: 13 },
        titleFont: { family: FONT_FAMILY, size: 12, weight: "600" },
        callbacks: {
          label: (ctx) => `  ${ctx.raw}% match`,
        },
      },
    },
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.divider} />
      <h3 style={styles.heading}>📊 Skill Analysis</h3>

      <div style={styles.grid}>
        {/* Doughnut */}
        {total > 0 && (
          <div style={styles.chartCard}>
            <p style={styles.chartLabel}>Skill Breakdown</p>
            <div style={styles.centerText}>
              <span style={styles.centerNumber}>{total}</span>
              <span style={styles.centerSub}>total</span>
            </div>
            <div style={styles.doughnutWrap}>
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
          </div>
        )}

        {/* Bar */}
        <div style={styles.chartCard}>
          <p style={styles.chartLabel}>Match Score</p>
          <div style={{ ...styles.scorePill, color: scoreColors.main, borderColor: scoreColors.main }}>
            {score}%
          </div>
          <div style={styles.barWrap}>
            <Bar data={barData} options={barOptions} />
          </div>
          <p style={styles.scoreHint}>
            {score >= 70
              ? "Strong match — well aligned with this role."
              : score >= 40
              ? "Moderate match — a few gaps to address."
              : "Low match — consider tailoring your resume."}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Styles ── */
const styles = {
  wrapper: {
    marginTop: "8px",
  },
  divider: {
    borderTop: "1px solid var(--border-subtle, rgba(229,228,231,0.6))",
    margin: "24px 0",
  },
  heading: {
    fontFamily: "'DM Sans', system-ui, sans-serif",
    fontSize: "13px",
    fontWeight: "600",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--text-muted, #9ca3af)",
    margin: "0 0 20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  chartCard: {
    background: "var(--surface, #fff)",
    border: "1px solid var(--border, #e5e4e7)",
    borderRadius: "12px",
    padding: "20px",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  chartLabel: {
    margin: 0,
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "var(--text-muted, #9ca3af)",
    alignSelf: "flex-start",
  },
  doughnutWrap: {
    width: "100%",
    maxWidth: "220px",
  },
  barWrap: {
    width: "100%",
    minHeight: "60px",
  },
  centerText: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -10%)",
    textAlign: "center",
    pointerEvents: "none",
  },
  centerNumber: {
    display: "block",
    fontSize: "22px",
    fontWeight: "700",
    color: "var(--text-h, #08060d)",
    lineHeight: 1,
  },
  centerSub: {
    display: "block",
    fontSize: "11px",
    color: "var(--text-muted, #9ca3af)",
    marginTop: "2px",
  },
  scorePill: {
    fontSize: "28px",
    fontWeight: "700",
    fontFamily: "'DM Mono', monospace",
    border: "2px solid",
    borderRadius: "10px",
    padding: "8px 16px",
    lineHeight: 1,
  },
  scoreHint: {
    margin: 0,
    fontSize: "12px",
    color: "var(--text-muted, #9ca3af)",
    textAlign: "center",
    lineHeight: 1.5,
  },
};