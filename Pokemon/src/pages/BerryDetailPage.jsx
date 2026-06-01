import { useLoaderData, Link } from "react-router";
import { useI18n } from "../hooks/useI18n.jsx";
import { capitalize } from "../utils/formatters";
import { BERRY_FLAVOR_COLORS } from "../utils/constants";

export default function BerryDetailPage() {
  const { berry, item } = useLoaderData();
  const { t } = useI18n();

  if (!berry) {
    return (
      <div className="detail-error">
        <h2>{t("error.notFound")}</h2>
        <Link to="/berries">{t("detail.back")}</Link>
      </div>
    );
  }

  const flavors = (berry.flavors || [])
    .filter((f) => f.potency > 0)
    .sort((a, b) => b.potency - a.potency);

  const dominantFlavor = flavors[0];

  const effectEntry = item?.effect_entries?.find(
    (e) => e.language?.name === "en"
  );
  const effectText = effectEntry?.effect || null;

  const berrySprite = item?.sprites?.default || null;

  return (
    <div className="detail-page berry-detail">
      <Link to="/berries" className="detail-back">{t("detail.back")}</Link>

      <div className="detail-header">
        <div
          className="detail-image-wrapper berry-image-wrapper"
          style={{
            backgroundColor: (dominantFlavor ? BERRY_FLAVOR_COLORS[dominantFlavor.flavor?.name] : "#999") + "22",
          }}
        >
          {berrySprite ? (
            <img src={berrySprite} alt={berry.name} className="detail-image" />
          ) : (
            <span className="berry-detail-emoji">🫐</span>
          )}
        </div>

        <div className="detail-info">
          <h1 className="detail-name">{capitalize(berry.name.replace("-", " "))}</h1>

          <div className="detail-measurements">
            <div className="measurement">
              <span className="measurement-label">{t("berry.size")}</span>
              <span className="measurement-value">{berry.size || "—"} mm</span>
            </div>
            <div className="measurement">
              <span className="measurement-label">{t("berry.smoothness")}</span>
              <span className="measurement-value">{berry.smoothness || "—"}</span>
            </div>
            <div className="measurement">
              <span className="measurement-label">{t("berry.firmness")}</span>
              <span className="measurement-value">
                {berry.firmness?.name ? capitalize(berry.firmness.name) : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {effectText && (
        <section className="detail-section">
          <h2 className="section-title">Effect</h2>
          <p className="detail-flavor">{effectText}</p>
        </section>
      )}

      <section className="detail-section">
        <h2 className="section-title">{t("berry.flavors")}</h2>
        {flavors.length === 0 ? (
          <p className="evolution-empty">—</p>
        ) : (
          <div className="berry-flavors">
            {flavors.map((f) => (
              <div key={f.flavor?.name} className="berry-flavor-bar">
                <span
                  className="berry-flavor-label"
                  style={{ color: BERRY_FLAVOR_COLORS[f.flavor?.name] || "#999" }}
                >
                  {capitalize(f.flavor?.name || "")}
                </span>
                <div className="stat-bar-track">
                  <div
                    className="stat-bar-fill"
                    style={{
                      width: `${Math.min((f.potency / 30) * 100, 100)}%`,
                      backgroundColor: BERRY_FLAVOR_COLORS[f.flavor?.name] || "#999",
                    }}
                  />
                </div>
                <span className="stat-value">{f.potency}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="detail-section">
        <h2 className="section-title">Details</h2>
        <div className="berry-details-grid">
          <div className="berry-detail-item">
            <span className="measurement-label">{t("berry.growthTime")}</span>
            <span>{berry.growth_time || "—"} hrs</span>
          </div>
          <div className="berry-detail-item">
            <span className="measurement-label">{t("berry.maxHarvest")}</span>
            <span>{berry.max_harvest || "—"}</span>
          </div>
          <div className="berry-detail-item">
            <span className="measurement-label">{t("berry.soakDryness")}</span>
            <span>{berry.soak_dryness || "—"}</span>
          </div>
          <div className="berry-detail-item">
            <span className="measurement-label">{t("berry.naturalGiftPower")}</span>
            <span>{berry.natural_gift_power || "—"}</span>
          </div>
          <div className="berry-detail-item">
            <span className="measurement-label">{t("berry.naturalGiftType")}</span>
            <span>
              {berry.natural_gift_type?.name
                ? capitalize(berry.natural_gift_type.name)
                : "—"}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
