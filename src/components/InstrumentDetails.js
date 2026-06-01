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
import {
  getBlueprints,
  getBlueprintDetails,
} from "../services/instructionService";
import {
  getInstrumentMaterials,
  getMaterialUnitText,
  formatPrice,
} from "../services/catalogService";
import Navbar from "./Navbar";
import "./InstrumentDetails.css";

const InstrumentDetails = () => {
  const { id } = useParams();
  const [instrument, setInstrument] = useState(null);
  const [instructions, setInstructions] = useState([]);
  const [selectedInstructionStep, setSelectedInstructionStep] = useState(null);
  const [instructionsLoading, setInstructionsLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadInstructionDetails = async (stepId) => {
    try {
      setDetailsLoading(true);
      const details = await getBlueprintDetails(stepId);
      setSelectedInstructionStep(details);
    } catch (err) {
      console.error("Ошибка загрузки деталей шага:", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
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

    const loadInstructions = async () => {
      try {
        setInstructionsLoading(true);
        const data = await getBlueprints(id);
        const list = data?.blueprints || data || [];
        setInstructions(list);
        if (list.length > 0) {
          await loadInstructionDetails(list[0].id);
        }
      } catch (err) {
        console.error("Ошибка загрузки инструкций:", err);
      } finally {
        setInstructionsLoading(false);
      }
    };

    const loadMaterials = async () => {
      try {
        setMaterialsLoading(true);
        const data = await getInstrumentMaterials();
        const allMaterials = data.items || data || [];
        setMaterials(
          allMaterials.filter(
            (item) => String(item.instrumentId) === String(id),
          ),
        );
      } catch (err) {
        console.error("Ошибка загрузки материалов:", err);
      } finally {
        setMaterialsLoading(false);
      }
    };

    const incrementViews = async () => {
      try {
        await incrementInstrumentViews(id);
      } catch (err) {
        console.error("Ошибка увеличения просмотров:", err);
      }
    };

    loadData();
    loadInstructions();
    loadMaterials();
    incrementViews();
  }, [id]);

  const handleSelectStep = async (stepId) => {
    await loadInstructionDetails(stepId);
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

  const materialsTotalCost = materials.reduce(
    (total, material) =>
      total +
      Number(material.quantity || 0) * Number(material.materialUnitPrice || 0),
    0,
  );

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

          <div className="instrument-details__section">
            <h2>Материалы</h2>
            {materialsLoading ? (
              <p className="instrument-details__materials-loading">
                Загрузка материалов...
              </p>
            ) : materials.length === 0 ? (
              <p className="instrument-details__materials-empty">
                Для этого инструмента материалы не заданы.
              </p>
            ) : (
              <>
                <div className="instrument-details__materials-summary">
                  <span>Всего материалов: {materials.length}</span>
                  <span>
                    Общая стоимость: {formatPrice(materialsTotalCost)}
                  </span>
                </div>
                <div className="instrument-details__materials-table-wrap">
                  <table className="instrument-details__materials-table">
                    <thead>
                      <tr>
                        <th>Материал</th>
                        <th>Количество</th>
                        <th>Цена за ед.</th>
                        <th>Стоимость</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materials.map((material) => (
                        <tr
                          key={`${material.instrumentId}-${material.materialId}`}
                        >
                          <td>{material.materialName}</td>
                          <td>
                            {material.quantity}{" "}
                            {getMaterialUnitText(material.materialUnit)}
                          </td>
                          <td>{formatPrice(material.materialUnitPrice)}</td>
                          <td>
                            {formatPrice(
                              Number(material.quantity || 0) *
                                Number(material.materialUnitPrice || 0),
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

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

          <div className="instrument-details__section">
            <h2>Инструкции</h2>
            {instructionsLoading ? (
              <p className="instrument-details__instructions-loading">
                Загрузка инструкций...
              </p>
            ) : instructions.length === 0 ? (
              <p className="instrument-details__instructions-empty">
                Инструкций пока нет.
              </p>
            ) : (
              <>
                <div className="instrument-details__instructions-list">
                  {instructions
                    .slice()
                    .sort((a, b) => a.stepNumber - b.stepNumber)
                    .map((step) => {
                      const isActive = selectedInstructionStep?.id === step.id;
                      return (
                        <div
                          key={step.id}
                          className={`instrument-details__instruction-card ${isActive ? "selected" : ""}`}
                        >
                          <button
                            type="button"
                            className="instrument-details__instruction-summary"
                            onClick={() => handleSelectStep(step.id)}
                          >
                            <div className="instrument-details__instruction-header">
                              <span className="instrument-details__instruction-step">
                                Шаг {step.stepNumber}
                              </span>
                              <span className="instrument-details__instruction-title">
                                {step.title}
                              </span>
                            </div>
                            <div className="instrument-details__instruction-meta">
                              <span>
                                {step.estimatedTimeMinutes
                                  ? `${step.estimatedTimeMinutes} мин`
                                  : "Время не указано"}
                              </span>
                              {step.imageUrl && <span>Фото</span>}
                              {step.drawingUrl && <span>Чертёж</span>}
                            </div>
                          </button>
                          {isActive && (
                            <div className="instrument-details__instruction-expanded">
                              {detailsLoading ? (
                                <p className="instrument-details__instructions-loading">
                                  Загрузка шага...
                                </p>
                              ) : (
                                <>
                                  <div className="instrument-details__instruction-detail-row">
                                    <span className="instrument-details__instruction-detail-label">
                                      Шаг:
                                    </span>
                                    <span>
                                      #{selectedInstructionStep.stepNumber}
                                    </span>
                                  </div>
                                  <div className="instrument-details__instruction-detail-row">
                                    <span className="instrument-details__instruction-detail-label">
                                      Название:
                                    </span>
                                    <span>{selectedInstructionStep.title}</span>
                                  </div>
                                  <div className="instrument-details__instruction-detail-row">
                                    <span className="instrument-details__instruction-detail-label">
                                      Время:
                                    </span>
                                    <span>
                                      {selectedInstructionStep.estimatedTimeMinutes
                                        ? `${selectedInstructionStep.estimatedTimeMinutes} мин`
                                        : "Не указано"}
                                    </span>
                                  </div>
                                  <div className="instrument-details__instruction-detail-row">
                                    <span className="instrument-details__instruction-detail-label">
                                      Описание:
                                    </span>
                                    <p>
                                      {selectedInstructionStep.content ||
                                        "Описание отсутствует"}
                                    </p>
                                  </div>
                                  {selectedInstructionStep.imageUrl && (
                                    <div className="instrument-details__instruction-media">
                                      <h4>Фото шага</h4>
                                      <img
                                        src={selectedInstructionStep.imageUrl}
                                        alt={`Фото шага ${selectedInstructionStep.stepNumber}`}
                                        className="instrument-details__instruction-image"
                                      />
                                    </div>
                                  )}
                                  {selectedInstructionStep.videoUrl && (
                                    <div className="instrument-details__instruction-media">
                                      <h4>Видео шага</h4>
                                      <video
                                        src={selectedInstructionStep.videoUrl}
                                        controls
                                        className="instrument-details__instruction-video"
                                      />
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </>
            )}
          </div>
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
