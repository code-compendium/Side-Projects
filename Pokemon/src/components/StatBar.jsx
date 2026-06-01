import { useI18n } from "../hooks/useI18n.jsx";
import { formatStatName } from "../utils/formatters";

function getStatColor(value) {
  if (value >= 120) return "#4CAF50";
  if (value >= 90) return "#8BC34A";
  if (value >= 60) return "#FFC107";
  if (value >= 30) return "#FF9800";
  return "#F44336";
}

export default function StatBar({ name, value }) {
  const { lang } = useI18n();
  const percentage = Math.min((value / 255) * 100, 100);
  const color = getStatColor(value);

  return (
    <div className="stat-bar">
      <span className="stat-label">{formatStatName(name, lang)}</span>
      <div className="stat-bar-track">
        <div
          className="stat-bar-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <span className="stat-value">{value}</span>
    </div>
  );
}
