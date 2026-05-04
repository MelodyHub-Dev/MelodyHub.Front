import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  WrenchScrewdriverIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { createProject, getInstruments } from "../services/profileService";
import { useAuth } from "../context/AuthContext";
import "./CreateProjectPage.css";

const initProject = (userId) => ({
  userId,
  instrumentId: "",
  name: "",
  description: "",
  status: 1,
  progress: 0,
  startDate: new Date().toISOString().split("T")[0],
  finishDate: "",
  actualCost: "",
  notes: "",
});

const CreateProjectPage = () => {
  const [project, setProject] = useState(initProject(null));
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [instrumentLoading, setInstrumentLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser?.userId) return;
    setProject((p) => ({ ...p, userId: currentUser.userId }));
    loadInstruments();
  }, [currentUser?.userId]);

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
    if (!project.name.trim()) {
      setError("Введите название");
      return;
    }
    if (!project.instrumentId) {
      setError("Выберите инструмент");
      return;
    }
    if (!project.userId) {
      setError("Ошибка: пользователь не определён");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const { finishDate, actualCost, notes, ...payload } = project;
      await createProject({
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
      <div className="create-project">
        <div className="empty-state">
          <WrenchScrewdriverIcon className="empty-state__icon" />
          <p>Войдите в аккаунт, чтобы создавать проекты</p>
        </div>
      </div>
    );
  }

  return (
    <div className="create-project">
      <div className="create-project__container">
        <div className="create-project__header">
          <h1>Новый проект</h1>
          <p>Создайте проект для отслеживания вашего мастерства</p>
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
            <PlusIcon style={{ width: 16, height: 16 }} /> Проект создан!
          </p>
        )}

        <form
          className="create-project__form"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="create-project__field">
            <label className="create-project__label">Название *</label>
            <input
              className="create-project__input"
              value={project.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Моя акустическая гитара"
            />
          </div>

          <div className="create-project__field">
            <label className="create-project__label">Инструмент *</label>
            {instrumentLoading ? (
              <div className="create-project__select">Загрузка...</div>
            ) : (
              <select
                className="create-project__select"
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

          <div className="create-project__field">
            <label className="create-project__label">Описание</label>
            <textarea
              className="create-project__textarea"
              value={project.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Кратко о проекте..."
            />
          </div>

          <div className="create-project__field">
            <label className="create-project__label">
              Прогресс: {project.progress}%
            </label>
            <div className="create-project__range-wrap">
              <input
                className="create-project__range"
                type="range"
                min="0"
                max="100"
                value={project.progress}
                onChange={(e) => set("progress", e.target.value)}
              />
              <span className="create-project__range-val">
                {project.progress}%
              </span>
            </div>
          </div>

          <div className="create-project__field">
            <label className="create-project__label">Дата начала</label>
            <input
              className="create-project__input"
              type="date"
              value={project.startDate}
              onChange={(e) => set("startDate", e.target.value)}
            />
          </div>

          <div className="create-project__actions">
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
              {loading ? "Создание..." : "Создать проект"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectPage;
