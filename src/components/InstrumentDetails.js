import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  WrenchScrewdriverIcon,
  EyeIcon,
  ClockIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import {
  getInstrumentById,
  incrementInstrumentViews,
} from "../services/instrumentService";
import Navbar from "./Navbar";
import "./InstrumentDetails.css";

const InstrumentDetails = () => {
  const { id } = useParams();
  const [instrument, setInstrument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInstrument();
    incrementViews();
  }, [id]);

  const loadInstrument = async () => {
    try {
      setLoading(true);
      const data = await getInstrumentById(id);
      setInstrument(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async () => {
    try {
      await incrementInstrumentViews(id);
    } catch (err) {
      console.error("Ошибка увеличения просмотров:", err);
    }
  };

  const getDifficultyLabel = (difficulty) => {
    const labels = {
      0: "Начинающий",
      1: "Средний",
      2: "Продвинутый",
    };
    return labels[difficulty] || "Неизвестно";
  };

  const getDifficultyDescription = (difficulty) => {
    const descriptions = {
      0: "Подходит для тех, кто только начинает свой путь в создании инструментов",
      1: "Требует базовых навыков работы с инструментами и материалами",
      2: "Для опытных мастеров, готовых к сложным задачам",
    };
    return descriptions[difficulty] || "";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="instrument-details">
        <Navbar />
        <div className="instrument-details__loading">Загрузка...</div>
      </div>
    );
  }

  if (error || !instrument) {
    return (
      <div className="instrument-details">
        <Navbar />
        <div className="instrument-details__error">
          {error || "Инструмент не найден"}
        </div>
      </div>
    );
  }

  return (
    <div className="instrument-details">
      <Navbar />
      <div className="instrument-details__container">
        <Link to="/catalog" className="instrument-details__back">
          <ArrowLeftIcon className="instrument-details__back-icon" />
          Назад к каталогу
        </Link>

        <div className="instrument-details__header">
          {instrument.mainImageUrl ? (
            <img
              src={instrument.mainImageUrl}
              alt={instrument.name}
              className="instrument-details__image"
            />
          ) : (
            <div className="instrument-details__icon">
              <WrenchScrewdriverIcon className="instrument-details__icon-svg" />
            </div>
          )}
          <div className="instrument-details__title-section">
            <h1>{instrument.name}</h1>
            <div className="instrument-details__badges">
              <span
                className={`badge badge--${instrument.difficulty === 0 ? "published" : "draft"}`}
              >
                {getDifficultyLabel(instrument.difficulty)}
              </span>
            </div>
          </div>
        </div>

        <div className="instrument-details__content">
          {instrument.shortDescription && (
            <p className="instrument-details__short-desc">
              {instrument.shortDescription}
            </p>
          )}

          {instrument.description && (
            <div className="instrument-details__section">
              <h2>Описание</h2>
              <p className="instrument-details__description">
                {instrument.description}
              </p>
            </div>
          )}

          {instrument.difficulty !== undefined && (
            <div className="instrument-details__section">
              <h2>Сложность</h2>
              <div className="instrument-details__difficulty">
                <div className="instrument-details__difficulty-header">
                  <span
                    className={`badge badge--${instrument.difficulty === 0 ? "published" : "draft"}`}
                  >
                    {getDifficultyLabel(instrument.difficulty)}
                  </span>
                </div>
                <p className="instrument-details__difficulty-desc">
                  {getDifficultyDescription(instrument.difficulty)}
                </p>
                <div className="instrument-details__difficulty-bar">
                  <div
                    className="instrument-details__difficulty-fill"
                    style={{
                      width: `${((instrument.difficulty + 1) / 3) * 100}%`,
                    }}
                  />
                </div>
                <div className="instrument-details__difficulty-labels">
                  <span>Начинающий</span>
                  <span>Средний</span>
                  <span>Продвинутый</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="instrument-details__stats">
          <div className="instrument-details__stat">
            <EyeIcon className="instrument-details__stat-icon" />
            <span className="instrument-details__stat-value">
              {instrument.viewsCount || 0}
            </span>
            <span className="instrument-details__stat-label">просмотров</span>
          </div>
          <div className="instrument-details__stat">
            <ClockIcon className="instrument-details__stat-icon" />
            <span className="instrument-details__stat-value">
              {instrument.estimatedHours || "-"}
            </span>
            <span className="instrument-details__stat-label">часов</span>
          </div>
          <div className="instrument-details__stat">
            <CalendarDaysIcon className="instrument-details__stat-icon" />
            <span className="instrument-details__stat-value">
              {formatDate(instrument.createdAt)}
            </span>
            <span className="instrument-details__stat-label">создан</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstrumentDetails;
