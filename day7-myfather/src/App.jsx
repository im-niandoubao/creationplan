import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import areaData from "china-area-data/data.json";
import { ERA_LIBRARY, FEATURED_CITIES, REGION_BY_PROVINCE } from "./data";
import { deriveBirthData, generateBirthStory } from "./story";

const provinceEntries = Object.entries(areaData["86"]);
const directCities = new Set(["北京市", "天津市", "上海市", "重庆市"]);

const initialForm = {
  birthDate: "1990-01-01",
  birthTime: "12:06",
  provinceCode: "110000",
  province: "北京市",
  cityCode: "110000",
  city: "北京市",
  gender: "male",
  fatherBirthYear: "1960",
};

function citiesFor(provinceCode, provinceName) {
  if (directCities.has(provinceName)) {
    return [[provinceCode, provinceName]];
  }
  return Object.entries(areaData[provinceCode] || {});
}

function FilmMark() {
  return (
    <div className="film-mark" aria-label="那一天">
      <span>那</span>
      <i />
      <span>一</span>
      <span>天</span>
    </div>
  );
}

function Field({ label, optional, children, wide }) {
  return (
    <label className={`field ${wide ? "field--wide" : ""}`}>
      <span className="field__label">
        {label} {optional && <em>选填</em>}
      </span>
      {children}
    </label>
  );
}

function FormView({ form, setForm, onSubmit, isLoading }) {
  const cityEntries = useMemo(
    () => citiesFor(form.provinceCode, form.province),
    [form.provinceCode, form.province],
  );

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function changeProvince(event) {
    const provinceCode = event.target.value;
    const province = areaData["86"][provinceCode];
    const nextCities = citiesFor(provinceCode, province);
    const [cityCode, city] = nextCities[0];
    setForm((current) => ({
      ...current,
      provinceCode,
      province,
      cityCode,
      city,
    }));
  }

  return (
    <main className="landing">
      <div className="landing__glow" />
      <header className="topbar">
        <FilmMark />
        <div className="topbar__note">一段关于时间与成为父亲的故事</div>
      </header>

      <section className="hero">
        <div className="hero__index">NO. 001 / MEMORY ARCHIVE</div>
        <h1>
          <span className="text-nowrap">回到你出生的</span>
          <br />
          <span className="text-nowrap">那一天</span>
        </h1>
        <p className="hero__lead">
          输入你的出生日期和城市，
          <br />
          回到爸爸第一次见你的那一天。
        </p>
        <div className="hero__line">
          <span />
          <small>向下填写 · 开启一段时间旅行</small>
        </div>
      </section>

      <section className="form-section" id="birth-form">
        <div className="form-intro">
          <span>01</span>
          <div>
            <p>请告诉我们</p>
            <h2>
              故事
              <br />
              从哪里开始
            </h2>
          </div>
        </div>

        <form
          className="birth-form"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <Field label="出生日期" wide>
            <input
              type="date"
              required
              min="1950-01-01"
              max={new Date().toISOString().slice(0, 10)}
              value={form.birthDate}
              onChange={(event) => update("birthDate", event.target.value)}
            />
          </Field>

          <Field label="出生时间" optional>
            <input
              type="time"
              value={form.birthTime}
              onChange={(event) => update("birthTime", event.target.value)}
            />
          </Field>

          <Field label="性别">
            <div className="segmented">
              <button
                type="button"
                className={form.gender === "male" ? "is-active" : ""}
                onClick={() => update("gender", "male")}
              >
                男孩
              </button>
              <button
                type="button"
                className={form.gender === "female" ? "is-active" : ""}
                onClick={() => update("gender", "female")}
              >
                女孩
              </button>
            </div>
          </Field>

          <Field label="出生省份">
            <select value={form.provinceCode} onChange={changeProvince}>
              {provinceEntries.map(([code, name]) => (
                <option value={code} key={code}>
                  {name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="出生城市">
            <select
              value={form.cityCode}
              onChange={(event) => {
                const cityCode = event.target.value;
                update("cityCode", cityCode);
                update("city", Object.fromEntries(cityEntries)[cityCode]);
              }}
            >
              {cityEntries.map(([code, name]) => (
                <option value={code} key={code}>
                  {name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="父亲的出生年份" optional wide>
            <div className="age-input">
              <input
                type="number"
                min="1900"
                max={form.birthDate?.slice(0, 4) || new Date().getFullYear()}
                placeholder="例如 1960"
                value={form.fatherBirthYear}
                onChange={(event) => update("fatherBirthYear", event.target.value)}
              />
              <span>年</span>
            </div>
          </Field>

          <div className="privacy-note">
            <span>私人档案</span>
            你填写的信息只用于生成这段故事，不会在浏览器中长期保存。
          </div>

          <button className="submit-button" type="submit" disabled={isLoading}>
            <span>{isLoading ? "正在倒转时间…" : "回到那一天"}</span>
            <b>↗</b>
          </button>
        </form>
      </section>

      <footer className="landing-footer">
        <span>MY FATHER · A SMALL STORY ABOUT TIME</span>
        <span>© {new Date().getFullYear()}</span>
      </footer>
    </main>
  );
}

function SceneBackdrop({ slide, derived }) {
  if (slide.type === "era") {
    return (
      <div className="scene scene--era" aria-hidden="true">
        <span>{derived.era}</span>
        <i>{derived.communication}</i>
        <i>{derived.transport}</i>
      </div>
    );
  }

  if (slide.type === "city") {
    return (
      <div className="scene scene--city" aria-hidden="true">
        <span className="scene__sun" />
        <span className="scene__horizon" />
        <i>{derived.region}</i>
      </div>
    );
  }

  if (slide.type === "hospital" || slide.type === "birth") {
    return (
      <div className={`scene scene--door ${slide.type === "birth" ? "is-open" : ""}`} aria-hidden="true">
        <span />
        <i />
      </div>
    );
  }

  if (slide.type === "waiting") {
    return (
      <div className="scene scene--clock" aria-hidden="true">
        <span />
        <i>{derived.timeLabel}</i>
      </div>
    );
  }

  if (slide.type === "father") {
    return (
      <div className="scene scene--father" aria-hidden="true">
        <span />
        <i>{derived.fatherBirthYear || "未知年份"}</i>
      </div>
    );
  }

  if (slide.type === "time") {
    return (
      <div className="scene scene--days" aria-hidden="true">
        <span>{derived.daysSinceBirth.toLocaleString("zh-CN")}</span>
        <i>DAYS</i>
      </div>
    );
  }

  return <div className={`scene scene--${slide.type}`} aria-hidden="true" />;
}

function StorySlide({ slide, index, total, location, derived }) {
  return (
    <section
      className={`story-slide story-slide--${slide.type}`}
      data-region={derived.region}
      data-season={derived.season}
      data-time={derived.timeLabel}
    >
      <div className="story-slide__grain" />
      <SceneBackdrop slide={slide} derived={derived} />
      <div className="story-slide__number">
        {String(index + 1).padStart(2, "0")}
        <span>/</span>
        {String(total).padStart(2, "0")}
      </div>
      <div className="story-slide__content">
        <p className="story-slide__eyebrow">{slide.eyebrow || `第${index + 1}幕`}</p>
        <h2>{slide.title}</h2>
        <div className="story-slide__rule" />
        <p className="story-slide__text">{slide.text}</p>
      </div>
      <div className="story-slide__meta">
        <span>{location}</span>
        <span>SCROLL TO REMEMBER ↓</span>
      </div>
    </section>
  );
}

function FinalCard({ story, form, derived, cardRef }) {
  return (
    <div className="share-card" ref={cardRef}>
      <div className="share-card__frame">
        <div className="share-card__film">MEMORY · {derived.year}</div>
        <div className="share-card__date">
          {String(derived.month).padStart(2, "0")}
          <i />
          {String(derived.day).padStart(2, "0")}
        </div>
        <div className="share-card__body">
          <p>{form.province.replace(/省|市|自治区|特别行政区/g, "")} · {form.city.replace(/市/g, "")}</p>
          <h3>{story.finalCard.title}</h3>
          <blockquote>“{story.finalCard.quote}”</blockquote>
        </div>
        <div className="share-card__days">
          <strong>{derived.daysSinceBirth.toLocaleString("zh-CN")}</strong>
          <span>DAYS SINCE THAT DAY</span>
        </div>
        <div className="share-card__footer">
          <div className="share-card__cta">
            <img className="share-card__qr" src="./qr.png" alt="扫码回到那一天" />
            <span className="share-card__cta-text">扫码，回到那一天</span>
          </div>
          <FilmMark />
        </div>
      </div>
    </div>
  );
}

function StoryView({ story, form, derived, source, onReset, onRegenerate, isLoading }) {
  const cardRef = useRef(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  async function saveCard() {
    if (!cardRef.current) return;
    setSaving(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#17140f",
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `爸爸第一次见我的那一天-${form.birthDate}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="story">
      <header className="story-nav">
        <FilmMark />
        <button onClick={onReset}>重新填写</button>
      </header>

      {story.slides.map((slide, index) => (
        <StorySlide
          slide={slide}
          index={index}
          total={story.slides.length}
          location={`${form.province.replace(/省|市|自治区|特别行政区/g, "")} · ${form.city.replace(/市/g, "")}`}
          derived={derived}
          key={`${slide.type}-${index}`}
        />
      ))}

      <section className="final-section">
        <div className="final-section__intro">
          <span>留住这一刻</span>
          <h2><span className="text-nowrap">把那一天，</span>带回今天</h2>
          <p>
            {source === "deepseek"
              ? "故事由 DeepSeek 根据你的时间与城市生成。"
              : "当前展示本地素材生成的故事；配置 API Key 后会自动启用 DeepSeek。"}
          </p>
        </div>

        <FinalCard story={story} form={form} derived={derived} cardRef={cardRef} />

        <div className="story-actions">
          <button className="save-button" onClick={saveCard} disabled={saving}>
            {saving ? "正在保存…" : "保存分享卡"}
            <span>↓</span>
          </button>
          <button className="regenerate-button" onClick={onRegenerate} disabled={isLoading}>
            {isLoading ? "正在重写…" : "换一种讲法"}
          </button>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const [form, setForm] = useState(initialForm);
  const [story, setStory] = useState(null);
  const [derived, setDerived] = useState(null);
  const [source, setSource] = useState("local");
  const [isLoading, setIsLoading] = useState(false);

  async function createStory() {
    if (!form.birthDate || !form.province || !form.city) return;
    setIsLoading(true);
    const nextDerived = deriveBirthData(form);
    const eraData = ERA_LIBRARY[Math.min(2020, Math.max(1950, Math.floor(nextDerived.year / 10) * 10))];
    const cityKey = form.city.replace(/市|地区|自治州|盟|特别行政区/g, "");
    const cityData = FEATURED_CITIES[cityKey] || REGION_BY_PROVINCE[form.province];
    const result = await generateBirthStory(form, nextDerived, eraData, cityData);
    setDerived(nextDerived);
    setStory(result.story);
    setSource(result.source);
    setIsLoading(false);
  }

  if (story && derived) {
    return (
      <StoryView
        story={story}
        form={form}
        derived={derived}
        source={source}
        onReset={() => setStory(null)}
        onRegenerate={createStory}
        isLoading={isLoading}
      />
    );
  }

  return (
    <FormView
      form={form}
      setForm={setForm}
      onSubmit={createStory}
      isLoading={isLoading}
    />
  );
}
