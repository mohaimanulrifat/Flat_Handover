import { Icon } from "../components/Icon.tsx";
import { ThemeToggle } from "../components/TopBar.tsx";
import { APP_TITLE } from "../config.ts";
import { useLang } from "../landowner/form.ts";
import { t } from "../landowner/i18n.ts";

/** The first screen: choose the handover checklist or the landowner calculator. */
export function HomeScreen() {
  const [lang] = useLang();
  return (
    <main className="page" lang={lang}>
      <div className="brand">
        <span className="brand__mark">
          <Icon name="home" size={26} />
        </span>
        <span className="brand__name">{APP_TITLE}</span>
        <LangToggle />
        <ThemeToggle />
      </div>

      <h1>{t(lang, "homeTitle")}</h1>
      <div className="service-list">
        <a className="service" href="#/checklist">
          <span className="icon-tile">
            <Icon name="papers" size={26} />
          </span>
          <span className="service__body">
            <span className="service__title">{t(lang, "homeChecklist")}</span>
            <span className="service__text">
              {t(lang, "homeChecklistText")}
            </span>
          </span>
          <Icon name="next" className="room-link__arrow" />
        </a>
        <a className="service" href="#/land">
          <span className="icon-tile">
            <Icon name="calculator" size={26} />
          </span>
          <span className="service__body">
            <span className="service__title">{t(lang, "homeLand")}</span>
            <span className="service__text">{t(lang, "homeLandText")}</span>
          </span>
          <Icon name="next" className="room-link__arrow" />
        </a>
      </div>
    </main>
  );
}

/** Switches the calculator text between Bangla and English. */
export function LangToggle() {
  const [lang, toggle] = useLang();
  return (
    <button
      type="button"
      className="icon-btn lang-btn"
      onClick={toggle}
      aria-label={t(lang, "switchLangLabel")}
      lang={lang === "bn" ? "en" : "bn"}
    >
      {t(lang, "switchLang")}
    </button>
  );
}
