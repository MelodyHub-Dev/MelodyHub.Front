import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  WrenchScrewdriverIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  getProject,
  updateProject,
  getInstruments,
} from "../services/profileService";
import { useAuth } from "../context/AuthContext";
import "./EditProjectPage.css";

const STATUS_LABELS = {
  0: "Запланирован",
  1: "В процессе",
  2: "На паузе",
  3: "Завершён",
  4: "Заброшен",
};

const EditProjectPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [projectLoading, setProjectLoading] = useState(true);
  const [instrumentLoading, setInstrumentLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser?.userId) return;
    loadProject();
    loadInstruments();
  }, [currentUser?.userId, id]);

  const loadProject = async () => {
    setProjectLoading(true);
    try {
      const res = await getProject(id);
      setProject({
        ...res,
        startDate: res.startDate ?? "",
        finishDate: res.finishDate ?? "",
        actualCost: res.actualCost ?? "",
        notes: res.notes ?? "",
        description: res.description ?? "",
      });
    } catch {
      setError("Проект не найден");
    } finally {
      setProjectLoading(false);
    }
  };

  const loadInstruments = async () => {
    setInstrumentLoading(true);
    try {
      const res = await getInstruments();
      setInstruments(res?.instruments ?? res ?? []);
    } catch {
      setInstruments([]);
    } finally {
      setInstrumentLoading(false);
    }
  };

  const set = (k, v) => setProject((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!project || !project.name?.trim()) {
      setError("Введите название");
      return;
    }
    if (!project.instrumentId) {
      setError("Выберите инструмент");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const { finishDate, actualCost, notes, ...payload } = project;
      await updateProject({
        ...payload,
        progress: Number(payload.progress),
        startDate: payload.startDate || new Date().toISOString().split("T")[0],
      });
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser?.userId) {
    return (
      <div className="edit-project">
        <div className="empty-state">
          <WrenchScrewdriverIcon className="empty-state__icon" />
          <p>Войдите в аккаунт, чтобы редактировать проекты</p>
        </div>
      </div>
    );
  }

  if (projectLoading) {
    return (
      <div className="edit-project">
        <p className="empty-state">Загрузка...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="edit-project">
        <p className="server-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="edit-project">
      <div className="edit-project__container">
        <div className="edit-project__header">
          <h1>Редактировать проект</h1>
          <p>Измените данные вашего проекта</p>
        </div>

        {error && <p className="server-error">{error}</p>}
        {success && (
          <p
            style={{
              color: "#4ade80",
              fontSize: 14,
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <PlusIcon style={{ width: 16, height: 16 }} /> Проект обновлён!
          </p>
        )}

        <form className="edit-project__form" onSubmit={handleSubmit} noValidate>
          <div className="edit-project__field">
            <label className="edit-project__label">Название *</label>
            <input
              className="edit-project__input"
              value={project.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Моя акустическая гитара"
            />
          </div>

          <div className="edit-project__field">
            <label className="edit-project__label">Инструмент *</label>
            {instrumentLoading ? (
              <div className="edit-project__select">Загрузка...</div>
            ) : (
              <select
                className="edit-project__select"
                value={project.instrumentId}
                onChange={(e) => set("instrumentId", e.target.value)}
              >
                <option value="">— выберите —</option>
                {instruments.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="edit-project__field">
            <label className="edit-project__label">Описание</label>
            <textarea
              className="edit-project__textarea"
              value={project.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Кратко о проекте..."
            />
          </div>

          <div className="edit-project__field">
            <label className="edit-project__label">
              Прогресс: {project.progress}%
            </label>
            <div className="edit-project__range-wrap">
              <input
                className="edit-project__range"
                type="range"
                min="0"
                max="100"
                value={project.progress}
                onChange={(e) => set("progress", e.target.value)}
              />
              <span className="edit-project__range-val">
                {project.progress}%
              </span>
            </div>
          </div>

          <div className="edit-project__field">
            <label className="edit-project__label">Дата начала</label>
            <input
              className="edit-project__input"
              type="date"
              value={project.startDate}
              disabled
              style={{ opacity: 0.6, cursor: "not-allowed" }}
            />
          </div>

          <div className="edit-project__actions">
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => navigate("/dashboard")}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={loading}
            >
              {loading ? "Сохранение..." : "Сохранить изменения"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectPage;
