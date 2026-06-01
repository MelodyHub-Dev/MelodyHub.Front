import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TrashIcon } from "@heroicons/react/24/outline";
import {
  getPublicUserProjectById,
  updateUserProject,
} from "../services/userProjectService";
import {
  getProjectNotes,
  createProjectNote,
  deleteProjectNote,
} from "../services/projectNoteService";
import {
  getBlueprints,
  getBlueprintDetails,
} from "../services/instructionService";
import {
  getInstrumentMaterials,
  getMaterialUnitText,
  formatPrice,
} from "../services/catalogService";
import { useAuth } from "../context/AuthContext";
import "./ProjectDetailsPage.css";

const STATUS_LABELS = {
  0: "Запланирован",
  1: "В процессе",
  2: "На паузе",
  3: "Завершён",
  4: "Заброшен",
};

const STATUS_CLASS = {
  0: "status--planned",
  1: "status--inprogress",
  2: "status--onhold",
  3: "status--completed",
  4: "status--abandoned",
};

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [noteLoading, setNoteLoading] = useState(false);
  const [projectLoading, setProjectLoading] = useState(true);
  const [instructions, setInstructions] = useState([]);
  const [selectedInstructionStep, setSelectedInstructionStep] = useState(null);
  const [instructionsLoading, setInstructionsLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [materialsError, setMaterialsError] = useState("");
  const [completedSteps, setCompletedSteps] = useState([]);
  const [error, setError] = useState("");
  const [instructionsError, setInstructionsError] = useState("");
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const isOwner = currentUser?.userId === project?.userId;
  const totalSteps = instructions.length;
  const completedCount = completedSteps.filter((stepId) =>
    instructions.some((step) => step.id === stepId),
  ).length;
  const displayProgress =
    totalSteps > 0
      ? Math.round((completedCount / totalSteps) * 100)
      : project?.progress;

  const loadProject = useCallback(async () => {
    setProjectLoading(true);
    try {
      const res = await getPublicUserProjectById(id);
      setProject(res);
    } catch {
      setError("Проект не найден");
    } finally {
      setProjectLoading(false);
    }
  }, [id]);

  const loadNotes = useCallback(async () => {
    setNoteLoading(true);
    try {
      const res = await getProjectNotes(id);
      setNotes(res?.notes ?? []);
    } catch {
      setNotes([]);
    } finally {
      setNoteLoading(false);
    }
  }, [id]);

  const loadMaterials = useCallback(async () => {
    if (!project?.instrumentId) return;
    setMaterialsLoading(true);
    setMaterialsError("");
    try {
      const res = await getInstrumentMaterials();
      const items = res?.items || [];
      setMaterials(
        items.filter((item) => item.instrumentId === project.instrumentId),
      );
    } catch (err) {
      setMaterialsError(err?.message || "Ошибка загрузки материалов");
      setMaterials([]);
    } finally {
      setMaterialsLoading(false);
    }
  }, [project?.instrumentId]);

  const loadInstructionDetails = useCallback(async (stepId) => {
    setDetailsLoading(true);
    try {
      const details = await getBlueprintDetails(stepId);
      setSelectedInstructionStep(details);
    } catch (err) {
      setInstructionsError(err?.message || "Ошибка загрузки шага инструкции");
      setSelectedInstructionStep(null);
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  const loadInstructions = useCallback(async () => {
    if (!project?.instrumentId) return;
    setInstructionsLoading(true);
    setInstructionsError("");
    try {
      const data = await getBlueprints(project.instrumentId);
      const list = data?.blueprints || data?.Blueprints || data || [];
      setInstructions(list);
      if (list.length > 0) {
        await loadInstructionDetails(list[0].id);
      } else {
        setSelectedInstructionStep(null);
      }
    } catch (err) {
      setInstructionsError(err?.message || "Ошибка загрузки инструкций");
      setInstructions([]);
      setSelectedInstructionStep(null);
    } finally {
      setInstructionsLoading(false);
    }
  }, [project?.instrumentId, loadInstructionDetails]);

  const loadSavedCompletedSteps = useCallback(() => {
    if (!project?.id) return;
    setCompletedSteps(getSavedStepIds(project.id));
  }, [project?.id]);

  useEffect(() => {
    if (!id) return;
    loadProject();
    if (currentUser?.userId) {
      loadNotes();
    }
  }, [currentUser?.userId, id, loadNotes, loadProject]);

  useEffect(() => {
    if (!project?.instrumentId) return;
    loadInstructions();
    loadSavedCompletedSteps();
    loadMaterials();
  }, [
    project?.instrumentId,
    project?.id,
    loadInstructions,
    loadMaterials,
    loadSavedCompletedSteps,
  ]);

  const getSavedStepIds = (projectId) => {
    try {
      const raw = localStorage.getItem(`project-${projectId}-completed-steps`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const saveStepIds = (projectId, ids) => {
    localStorage.setItem(
      `project-${projectId}-completed-steps`,
      JSON.stringify(ids),
    );
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setLoading(true);
    try {
      await createProjectNote({
        userProjectId: id,
        content: newNote.trim(),
      });
      setNewNote("");
      await loadNotes();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm("Удалить заметку?")) return;
    try {
      await deleteProjectNote(noteId);
      setNotes((n) => n.filter((x) => x.id !== noteId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleStep = async (stepId) => {
    if (!project) return;
    const nextSteps = completedSteps.includes(stepId)
      ? completedSteps.filter((id) => id !== stepId)
      : [...completedSteps, stepId];

    setCompletedSteps(nextSteps);
    saveStepIds(project.id, nextSteps);

    const totalSteps = instructions.length;
    if (totalSteps === 0) return;

    const progress = Math.round((nextSteps.length / totalSteps) * 100);
    let status = project.status;
    if (progress === 100) {
      status = 3;
    } else if (status === 0 && progress > 0) {
      status = 1;
    }

    try {
      await updateUserProject({
        id: project.id,
        name: project.name,
        description: project.description,
        status,
        progress,
        startDate: project.startDate,
        finishDate: project.finishDate,
        actualCost: project.actualCost,
        notes: project.notes,
      });
      setProject((prev) => (prev ? { ...prev, progress, status } : prev));
    } catch (err) {
      setError(err?.message || "Ошибка обновления прогресса");
    }
  };

  const materialsTotalCost = materials.reduce(
    (total, material) =>
      total +
      Number(material.quantity || 0) * Number(material.materialUnitPrice || 0),
    0,
  );

  const formattedMaterialsTotalCost = formatPrice(materialsTotalCost);

  if (projectLoading) {
    return (
      <div className="project-details">
        <p className="empty-state">Загрузка...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-details">
        <p className="server-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="project-details">
      <div className="project-details__container">
        <button
          className="btn btn--outline"
          onClick={() => navigate(-1)}
          style={{ marginBottom: 20 }}
        >
          ← Назад
        </button>

        <div className="project-details__header">
          <h1>{project.name}</h1>
          <span
            className={`project-details__status ${STATUS_CLASS[project.status]}`}
          >
            {STATUS_LABELS[project.status]}
          </span>
        </div>

        {project.description && (
          <p className="project-details__description">{project.description}</p>
        )}

        <div className="project-details__info">
          <div className="project-details__info-item">
            <span className="project-details__info-label">Автор</span>
            <span>{project.authorName}</span>
          </div>
          <div className="project-details__info-item">
            <span className="project-details__info-label">Инструмент</span>
            <span>{project.instrumentName}</span>
          </div>
          <div className="project-details__info-item">
            <span className="project-details__info-label">
              Оценочная стоимость
            </span>
            <span>{formattedMaterialsTotalCost}</span>
          </div>
          <div className="project-details__info-item">
            <span className="project-details__info-label">Прогресс</span>
            <div className="project-details__progress">
              <div className="progress-bar">
                <div
                  className={`progress-bar__fill${project.status === 3 ? " progress-bar__fill--done" : ""}`}
                  style={{ width: `${displayProgress}%` }}
                />
              </div>
              <span>{displayProgress}%</span>
            </div>
          </div>
          {project.startDate && (
            <div className="project-details__info-item">
              <span className="project-details__info-label">Дата начала</span>
              <span>{project.startDate}</span>
            </div>
          )}
          {project.finishDate && (
            <div className="project-details__info-item">
              <span className="project-details__info-label">
                Дата окончания
              </span>
              <span>{project.finishDate}</span>
            </div>
          )}
        </div>

        <div className="project-details__materials-section">
          <div className="project-details__instructions-header">
            <div>
              <h2 className="project-details__notes-title">Материалы</h2>
              <p className="project-details__instructions-subtitle">
                Список материалов для {project.instrumentName}.
              </p>
            </div>
          </div>

          {materialsError && <p className="server-error">{materialsError}</p>}

          {materialsLoading ? (
            <p className="empty-state">Загрузка материалов...</p>
          ) : materials.length === 0 ? (
            <p className="project-details__notes-empty">
              Для этого инструмента материалы не заданы.
            </p>
          ) : (
            <div className="project-details__materials-table-wrap">
              <table className="project-details__materials-table">
                <thead>
                  <tr>
                    <th>Материал</th>
                    <th>Количество</th>
                    <th>Цена за единицу</th>
                    <th>Стоимость</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((material) => (
                    <tr key={`${material.instrumentId}-${material.materialId}`}>
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
          )}
        </div>

        <div className="project-details__instructions-section">
          <div className="project-details__instructions-header">
            <div>
              <h2 className="project-details__notes-title">Инструкции</h2>
              <p className="project-details__instructions-subtitle">
                Шаги для инструмента {project.instrumentName}.
              </p>
            </div>
            <span className="project-details__instructions-note">
              {isOwner
                ? "Отмечайте выполненные шаги — прогресс будет обновляться автоматически."
                : "Только владелец проекта может отмечать шаги."}
            </span>
          </div>

          {instructionsError && (
            <p className="server-error">{instructionsError}</p>
          )}

          {instructionsLoading ? (
            <p className="empty-state">Загрузка инструкций...</p>
          ) : instructions.length === 0 ? (
            <p className="project-details__notes-empty">
              Нет инструкций для этого инструмента.
            </p>
          ) : (
            <div className="project-details__instructions-grid">
              <div className="project-details__instruction-list">
                {instructions
                  .slice()
                  .sort((a, b) => a.stepNumber - b.stepNumber)
                  .map((step) => {
                    const isDone = completedSteps.includes(step.id);
                    const isSelected = selectedInstructionStep?.id === step.id;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        className={`project-details__instruction-card${isSelected ? " selected" : ""}`}
                        onClick={() => loadInstructionDetails(step.id)}
                      >
                        <div className="project-details__instruction-main">
                          <label className="project-details__instruction-checkbox-label">
                            <input
                              type="checkbox"
                              className="project-details__instruction-checkbox"
                              checked={isDone}
                              disabled={!isOwner}
                              onChange={() => handleToggleStep(step.id)}
                            />
                            <span>{isDone ? "Выполнено" : "Открыть шаг"}</span>
                          </label>
                          <div className="project-details__instruction-info">
                            <span className="project-details__instruction-step">
                              Шаг {step.stepNumber}
                            </span>
                            <span className="project-details__instruction-title">
                              {step.title}
                            </span>
                            <span className="project-details__instruction-meta">
                              {step.estimatedTimeMinutes
                                ? `${step.estimatedTimeMinutes} мин`
                                : "Время не указано"}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>

              <div className="project-details__instruction-detail-panel">
                {detailsLoading ? (
                  <p className="empty-state">Загрузка шага...</p>
                ) : selectedInstructionStep ? (
                  <div className="project-details__instruction-detail">
                    <h3>{selectedInstructionStep.title}</h3>
                    <p className="project-details__instruction-step-number">
                      Шаг {selectedInstructionStep.stepNumber}
                    </p>
                    <p>
                      {selectedInstructionStep.content ||
                        "Описание отсутствует"}
                    </p>
                    {selectedInstructionStep.imageUrl && (
                      <img
                        src={selectedInstructionStep.imageUrl}
                        alt={`Фото шага ${selectedInstructionStep.stepNumber}`}
                        className="project-details__instruction-image"
                      />
                    )}
                    {selectedInstructionStep.videoUrl && (
                      <video
                        src={selectedInstructionStep.videoUrl}
                        controls
                        className="project-details__instruction-video"
                      />
                    )}
                  </div>
                ) : (
                  <p className="empty-state">
                    Выберите шаг, чтобы увидеть детали.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {isOwner ? (
          <div className="project-details__notes-section">
            <h2 className="project-details__notes-title">Заметки</h2>

            <form
              className="project-details__note-form"
              onSubmit={handleAddNote}
            >
              <textarea
                className="project-details__note-input"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Напишите заметку..."
                rows={3}
              />
              <button
                type="submit"
                className="btn btn--primary"
                disabled={loading || !newNote.trim()}
              >
                {loading ? "Добавление..." : "Добавить заметку"}
              </button>
            </form>

            {noteLoading && <p className="empty-state">Загрузка заметок...</p>}

            {!noteLoading && notes.length === 0 && (
              <p className="project-details__notes-empty">Заметок пока нет</p>
            )}

            <div className="project-details__notes-list">
              {notes.map((note) => (
                <div key={note.id} className="project-details__note">
                  <div className="project-details__note-content">
                    {note.content}
                  </div>
                  <div className="project-details__note-footer">
                    <span className="project-details__note-date">
                      {new Date(note.createdAt).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <button
                      className="project-details__note-delete"
                      onClick={() => handleDeleteNote(note.id)}
                      aria-label="Удалить"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="project-details__notes-section">
            <h2 className="project-details__notes-title">Заметки</h2>
            {noteLoading ? (
              <p className="empty-state">Загрузка...</p>
            ) : notes.length > 0 ? (
              <div className="project-details__notes-list">
                {notes.map((note) => (
                  <div key={note.id} className="project-details__note">
                    <div className="project-details__note-content">
                      {note.content}
                    </div>
                    <div className="project-details__note-footer">
                      <span className="project-details__note-date">
                        {new Date(note.createdAt).toLocaleDateString("ru-RU", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="project-details__notes-empty">Заметок пока нет</p>
            )}
          </div>
        )}

        {error && <p className="server-error">{error}</p>}
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
