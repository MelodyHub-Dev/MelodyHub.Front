import {
  MusicalNoteIcon,
  ArrowRightIcon,
  SparklesIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import "./Hero.css";

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero__bg">
        <div className="hero__bg-circle hero__bg-circle--1"></div>
        <div className="hero__bg-circle hero__bg-circle--2"></div>
        <div className="hero__bg-grid"></div>
      </div>

      <div className="hero__container">
        <div className="hero__content">
          <div className="hero__badge">
            <MusicalNoteIcon className="hero__badge-icon" />
            Сообщество мастеров
          </div>
          <h1 className="hero__title">
            Создавай музыкальные
            <br />
            инструменты{" "}
            <span className="hero__title-accent">своими руками</span>
          </h1>
          <p className="hero__subtitle">
            Пошаговые инструкции, чертежи и видеогайды для создания гитар,
            скрипок, флейт и других инструментов. От новичка до мастера.
          </p>
          <div className="hero__actions">
            <button className="hero__btn hero__btn--primary">
              Начать проект
              <ArrowRightIcon className="hero__btn-arrow-icon" />
            </button>
            <button className="hero__btn hero__btn--secondary">
              Смотреть каталог
            </button>
          </div>
          <div className="hero__stats">
            <div className="hero__stat">
              <span className="hero__stat-value">120+</span>
              <span className="hero__stat-label">Инструментов</span>
            </div>
            <div className="hero__stat-divider"></div>
            <div className="hero__stat">
              <span className="hero__stat-value">3 400</span>
              <span className="hero__stat-label">Мастеров</span>
            </div>
            <div className="hero__stat-divider"></div>
            <div className="hero__stat">
              <span className="hero__stat-value">850</span>
              <span className="hero__stat-label">Проектов</span>
            </div>
          </div>
        </div>

        <div className="hero__visual">
          <div className="hero__card hero__card--main">
            <div className="hero__card-icon">
              <WrenchScrewdriverIcon className="hero__card-svg" />
            </div>
            <div className="hero__card-info">
              <span className="hero__card-title">Акустическая гитара</span>
              <span className="hero__card-meta">Сложность: Средняя</span>
            </div>
            <div className="hero__card-badge">Популярное</div>
          </div>
          <div className="hero__card hero__card--sm hero__card--top">
            <div className="hero__card-icon">
              <MusicalNoteIcon className="hero__card-svg hero__card-svg--sm" />
            </div>
            <span>Скрипка</span>
          </div>
          <div className="hero__card hero__card--sm hero__card--bottom">
            <div className="hero__card-icon">
              <UserGroupIcon className="hero__card-svg hero__card-svg--sm" />
            </div>
            <span>Укулеле</span>
          </div>
          <div className="hero__floating hero__floating--1">
            <SparklesIcon className="hero__float-icon" />
          </div>
          <div className="hero__floating hero__floating--2">
            <MusicalNoteIcon className="hero__float-icon hero__float-icon--sm" />
          </div>
          <div className="hero__floating hero__floating--3">
            <MusicalNoteIcon className="hero__float-icon" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
