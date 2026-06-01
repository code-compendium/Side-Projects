import { useI18n } from "../hooks/useI18n.jsx";
import { TYPE_COLORS } from "../utils/constants";

export default function TypeBadge({ type }) {
  const { t } = useI18n();
  const colors = TYPE_COLORS[type] || { bg: "#999", text: "#000" };

  return (
    <span
      className="type-badge"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
      }}
    >
      {t(`type.${type}`)}
    </span>
  );
}
