import { useState } from "react";
import {
  MagnifyingGlassIcon,
  ClockIcon,
  StarIcon,
  ArrowRightIcon,
  MusicalNoteIcon,
  SpeakerWaveIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import "./CatalogSection.css";

// Heroicons для каждого инструмента (нет специфичных, используем тематические)
const InstrumentIcon = ({ category }) => {
  const cls = "instrument-card__svg";
  if (category === "Ударные") return <SpeakerWaveIcon className={cls} />;
  if (category === "Духовые") return <WrenchScrewdriverIcon className={cls} />;
  return <MusicalNoteIcon className={cls} />;
};

const instruments = [
  {
    id: 1,
    name: "Акустическая гитара",
    category: "Струнные",
    difficulty: "Средняя",
    price: "4 500 ₽",
    time: "3–4 нед.",
    rating: 4.8,
    reviews: 124,
  },
  {
    id: 2,
    name: "Скрипка",
    category: "Струнные",
    difficulty: "Сложная",
    price: "7 200 ₽",
    time: "6–8 нед.",
    rating: 4.9,
    reviews: 87,
  },
  {
    id: 3,
    name: "Укулеле",
    category: "Струнные",
    difficulty: "Лёгкая",
    price: "1 800 ₽",
    time: "1–2 нед.",
    rating: 4.7,
    reviews: 203,
  },
  {
    id: 4,
    name: "Джембе",
    category: "Ударные",
    difficulty: "Средняя",
    price: "3 100 ₽",
    time: "2–3 нед.",
    rating: 4.6,
    reviews: 95,
  },
  {
    id: 5,
    name: "Флейта",
    category: "Духовые",
    difficulty: "Средняя",
    price: "2 400 ₽",
    time: "2–3 нед.",
    rating: 4.5,
    reviews: 61,
  },
  {
    id: 6,
    name: "Бонго",
    category: "Ударные",
    difficulty: "Лёгкая",
    price: "1 200 ₽",
    time: "1 нед.",
    rating: 4.4,
    reviews: 78,
  },
];

const categories = ["Все", "Струнные", "Ударные", "Духовые"];
const difficultyColor = {
  Лёгкая: "#4caf50",
  Средняя: "#ff9800",
  Сложная: "#f44336",
};

const CatalogSection = () => {
  const [active, setActive] = useState("Все");
  const [search, setSearch] = useState("");

  const filtered = instruments.filter(
    (i) =>
      (active === "Все" || i.category === active) &&
      i.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <section className="catalog" id="catalog">
      <div className="catalog__container">
        <div className="catalog__header">
          <div className="section-label">Каталог</div>
          <h2 className="section-title">Выбери свой инструмент</h2>
          <p className="section-sub">
            Более 120 инструментов с подробными инструкциями и списком
            материалов
          </p>
        </div>

        <div className="catalog__controls">
          <div className="catalog__filters">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`catalog__filter ${active === cat ? "catalog__filter--active" : ""}`}
                onClick={() => setActive(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="catalog__search">
            <MagnifyingGlassIcon className="catalog__search-icon" />
            <input
              type="text"
              placeholder="Поиск инструмента..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="catalog__grid">
          {filtered.map((item) => (
            <div className="instrument-card" key={item.id}>
              <div className="instrument-card__icon-wrap">
                <InstrumentIcon category={item.category} />
              </div>
              <div className="instrument-card__body">
                <div className="instrument-card__category">{item.category}</div>
                <h3 className="instrument-card__name">{item.name}</h3>
                <div className="instrument-card__meta">
                  <span
                    className="instrument-card__difficulty"
                    style={{ color: difficultyColor[item.difficulty] }}
                  >
                    ● {item.difficulty}
                  </span>
                  <span className="instrument-card__time">
                    <ClockIcon className="instrument-card__meta-icon" />{" "}
                    {item.time}
                  </span>
                </div>
                <div className="instrument-card__footer">
                  <div className="instrument-card__price">{item.price}</div>
                  <div className="instrument-card__rating">
                    <StarIcon className="instrument-card__star" /> {item.rating}
                    <span>({item.reviews})</span>
                  </div>
                </div>
              </div>
              <button className="instrument-card__btn">
                Подробнее{" "}
                <ArrowRightIcon className="instrument-card__btn-icon" />
              </button>
            </div>
          ))}
        </div>

        <div className="catalog__more">
          <button className="btn btn--outline btn--lg">
            Смотреть все инструменты
          </button>
        </div>
      </div>
    </section>
  );
};

export default CatalogSection;
