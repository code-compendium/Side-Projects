import { useI18n } from "../hooks/useI18n.jsx";
import { TYPE_COLORS, GENERATIONS } from "../utils/constants";

export default function FilterBar({
  selectedTypes,
  selectedGen,
  onTypeChange,
  onGenChange,
  onClear,
}) {
  const { t } = useI18n();
  const types = Object.keys(TYPE_COLORS);

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <span className="filter-label">{t("filter.type")}</span>
        <div className="filter-options">
          <button
            className={`filter-chip ${(!selectedTypes || selectedTypes.length === 0) ? "active" : ""}`}
            onClick={() => onTypeChange("__clear")}
            type="button"
          >
            {t("filter.all")}
          </button>
          {types.map((type) => {
            const isActive = selectedTypes && selectedTypes.includes(type);
            return (
              <button
                key={type}
                className={`filter-chip ${isActive ? "active" : ""}`}
                style={
                  isActive
                    ? { backgroundColor: TYPE_COLORS[type].bg, color: TYPE_COLORS[type].text, borderColor: TYPE_COLORS[type].bg }
                    : { borderColor: TYPE_COLORS[type].bg, color: TYPE_COLORS[type].bg }
                }
                onClick={() => onTypeChange(type)}
                type="button"
              >
                {t(`type.${type}`)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-label">{t("filter.generation")}</span>
        <div className="filter-options">
          <button
            className={`filter-chip ${!selectedGen ? "active" : ""}`}
            onClick={() => onGenChange("")}
            type="button"
          >
            {t("filter.all")}
          </button>
          {GENERATIONS.map((gen) => (
            <button
              key={gen.id}
              className={`filter-chip ${selectedGen === String(gen.id) ? "active" : ""}`}
              onClick={() => onGenChange(String(gen.id))}
              type="button"
            >
              {t(`generation.${gen.id}`)}
            </button>
          ))}
        </div>
      </div>

      {((selectedTypes && selectedTypes.length > 0) || selectedGen) && (
        <button className="filter-clear" onClick={onClear} type="button">
          {t("filter.clear")}
        </button>
      )}
    </div>
  );
}
