import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PhotoIcon } from "@heroicons/react/24/outline";
import "./InstrumentDetails.css";
import {
  getInstrumentDetails,
  getCategories,
  getDifficultyText,
  formatPrice,
  calculateInstrumentCost,
  getInstrumentMaterials,
} from "../services/catalogService";
import { getBlueprints, formatTime } from "../services/instructionService";
import { useAuth } from "../context/AuthContext";
import {
  addFavorite,
  removeFavorite,
  getFavorites,
  getProjects,
} from "../services/profileService";

const BASE_URL = "https://localhost:7111";

const InstrumentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [instrument, setInstrument] = useState(null);
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [blueprints, setBlueprints] = useState([]);
  const [projects, setProjects] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeStep, setActiveStep] = useState(0);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        instrumentData,
        categoriesData,
        materialsData,
        blueprintsData,
        projectsData,
      ] = await Promise.all([
        getInstrumentDetails(id),
        getCategories(),
        getInstrumentMaterials(),
        getBlueprints(id),
        getProjects(currentUser?.userId, id),
      ]);

      setInstrument(instrumentData);
      setCategories(categoriesData.instrumentCategories || []);
      setMaterials(materialsData.items || []);
      setBlueprints(blueprintsData.blueprints || []);
      setProjects(projectsData.userProjects || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id, currentUser?.userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadFavorites = useCallback(async () => {
    if (!currentUser?.userId) return;
    try {
      const data = await getFavorites(currentUser.userId);
      const favoriteIds = new Set(data.items?.map((f) => f.instrumentId) || []);
      setFavorites(favoriteIds);
    } catch (err) {
      console.error("Ошибка загрузки избранного:", err);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadFavorites();
    }
  }, [currentUser, loadFavorites]);

  const toggleFavorite = async () => {
    if (!currentUser) {
      setError("Для добавления в избранное нужно авторизоваться");
      return;
    }

    const userId = currentUser.userId;
    const isFavorite = favorites.has(id);

    try {
      if (isFavorite) {
        await removeFavorite(userId, id);
        setFavorites((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      } else {
        await addFavorite(userId, id);
        setFavorites((prev) => new Set(prev).add(id));
      }
    } catch (err) {
      // Если уже в избранном - просто обновляем состояние
      if (err.message.includes("already in favorites")) {
        setFavorites((prev) => new Set(prev).add(id));
        setError("");
      } else {
        setError(err.message);
      }
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "Без категории";
  };

  const cost =
    instrument && materials.length > 0
      ? calculateInstrumentCost(instrument.id, materials)
      : 0;

  console.log("Instrument:", instrument);
  console.log("Blueprints:", blueprints);
  console.log("Active step:", activeStep);
  console.log("Current step:", blueprints[activeStep]);

  if (loading) {
    return (
      <div className="instrument-details-container">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="instrument-details-container">
        <div className="error">Ошибка: {error}</div>
      </div>
    );
  }

  if (!instrument) {
    return (
      <div className="instrument-details-container">
        <div className="error">Инструмент не найден</div>
      </div>
    );
  }

  return (
    <div className="instrument-details-container">
      {/* Навигация */}
      <div className="details-nav">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Назад
        </button>
      </div>

      {/* Информация об инструменте */}
      <div className="instrument-info">
        {instrument.mainImageUrl && (
          <div className="instrument-image">
            <img
              src={`${BASE_URL}${instrument.mainImageUrl}`}
              alt={instrument.name}
              className="instrument-main-image"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}
        {!instrument.mainImageUrl && (
          <div className="instrument-placeholder">
            <PhotoIcon className="placeholder-icon" />
          </div>
        )}
        <div className="info-header">
          <h1 className="instrument-title">{instrument.name}</h1>
          <span className="category-badge">
            {getCategoryName(instrument.categoryId)}
          </span>
        </div>

        <div className="info-meta">
          <div className="meta-item">
            <span className="meta-label">Сложность:</span>
            <span
              className={`difficulty-badge difficulty-${instrument.difficulty}`}
            >
              {getDifficultyText(instrument.difficulty)}
            </span>
          </div>

          {instrument.estimatedHours && (
            <div className="meta-item">
              <span className="meta-label">Время сборки:</span>
              <span className="meta-value">{instrument.estimatedHours} ч</span>
            </div>
          )}

          <div className="meta-item">
            <span className="meta-label">Стоимость материалов:</span>
            <span className="cost-value">
              {cost > 0 ? formatPrice(cost) : "Не указана"}
            </span>
          </div>

          <div className="meta-item">
            <span className="meta-label">Просмотры:</span>
            <span className="meta-value">{instrument.viewsCount}</span>
          </div>
        </div>

        <p className="instrument-description">{instrument.description}</p>

        <div className="info-actions">
          <button
            className={`btn-favorite ${favorites.has(id) ? "active" : ""}`}
            onClick={toggleFavorite}
          >
            {favorites.has(id) ? "★ В избранном" : "♡ В избранное"}
          </button>
        </div>
      </div>

      {/* Пошаговые инструкции */}
      {blueprints.length > 0 && (
        <div className="instructions-section">
          <h2 className="section-title">Пошаговая инструкция</h2>

          <div className="steps-container">
            <div className="steps-list">
              {blueprints.map((step, index) => (
                <button
                  key={step.id}
                  className={`step-item ${activeStep === index ? "active" : ""}`}
                  onClick={() => setActiveStep(index)}
                >
                  <span className="step-number">{step.stepNumber}</span>
                  <span className="step-title">{step.title}</span>
                  {step.estimatedTimeMinutes && (
                    <span className="step-time">
                      {formatTime(step.estimatedTimeMinutes)}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="step-content">
              <h3 className="step-content-title">
                Шаг {blueprints[activeStep]?.stepNumber}:{" "}
                {blueprints[activeStep]?.title}
              </h3>

              <div className="step-media">
                {blueprints[activeStep]?.imageUrl && (
                  <div className="media-image">
                    <img
                      src={`${BASE_URL}${blueprints[activeStep].imageUrl}`}
                      alt={`Шаг ${blueprints[activeStep].stepNumber}`}
                      className="step-image"
                    />
                  </div>
                )}
                {blueprints[activeStep]?.videoUrl && (
                  <div className="media-video">
                    <iframe
                      src={blueprints[activeStep].videoUrl}
                      title={`Шаг ${blueprints[activeStep].stepNumber}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
                {blueprints[activeStep]?.drawingUrl && (
                  <div className="media-drawing">
                    <img
                      src={`${BASE_URL}${blueprints[activeStep].drawingUrl}`}
                      alt={`Чертеж ${blueprints[activeStep].title}`}
                      className="drawing-image"
                    />
                  </div>
                )}
                {!blueprints[activeStep]?.imageUrl &&
                  !blueprints[activeStep]?.drawingUrl && (
                    <div className="media-placeholder">
                      <PhotoIcon className="placeholder-icon" />
                    </div>
                  )}
              </div>

              <div className="step-content-text">
                {blueprints[activeStep]?.content}
              </div>

              {blueprints[activeStep]?.estimatedTimeMinutes && (
                <div className="step-time-estimate">
                  ⏱ Ориентировочное время:{" "}
                  {formatTime(blueprints[activeStep].estimatedTimeMinutes)}
                </div>
              )}

              <div className="step-nav">
                <button
                  className="btn-step-prev"
                  onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                  disabled={activeStep === 0}
                >
                  ← Назад
                </button>
                <button
                  className="btn-step-next"
                  onClick={() =>
                    setActiveStep((prev) =>
                      Math.min(blueprints.length - 1, prev + 1),
                    )
                  }
                  disabled={activeStep === blueprints.length - 1}
                >
                  Далее →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Материалы */}
      {materials.length > 0 && (
        <div className="materials-section">
          <h2 className="section-title">Необходимые материалы</h2>
          <div className="materials-list">
            {materials
              .filter((m) => m.instrumentId === id)
              .map((material, index) => (
                <div key={index} className="material-item">
                  <span className="material-name">{material.materialName}</span>
                  <span className="material-qty">
                    {material.quantity} {material.materialUnit}
                  </span>
                  <span className="material-cost">
                    {formatPrice(material.totalCost)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Проекты пользователей */}
      {projects.length > 0 && (
        <div className="projects-section">
          <h2 className="section-title">Проекты пользователей</h2>
          <div className="projects-list">
            {projects.map((project) => (
              <div key={project.id} className="project-item">
                <div className="project-header">
                  <h3 className="project-name">{project.name}</h3>
                  <span className={`project-status status-${project.status}`}>
                    {project.status === 0
                      ? "Запланирован"
                      : project.status === 1
                        ? "В процессе"
                        : project.status === 2
                          ? "На паузе"
                          : project.status === 3
                            ? "Завершён"
                            : "Заброшен"}
                  </span>
                </div>
                <div className="project-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <span className="progress-text">{project.progress}%</span>
                </div>
                {project.description && (
                  <p className="project-description">{project.description}</p>
                )}
                <div className="project-meta">
                  {project.startDate && (
                    <span className="meta-item">
                      Начало: {project.startDate}
                    </span>
                  )}
                  {project.finishDate && (
                    <span className="meta-item">
                      Завершение: {project.finishDate}
                    </span>
                  )}
                  {project.actualCost && (
                    <span className="meta-item">
                      Стоимость: {formatPrice(project.actualCost)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstrumentDetails;
