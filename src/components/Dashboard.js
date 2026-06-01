import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserIcon,
  WrenchScrewdriverIcon,
  HeartIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import {
  getUser,
  updateUser,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getFavorites,
  removeFavorite,
  getInstruments,
  uploadAvatar,
} from "../services/profileService";
import { getUserQuizResults } from "../services/quizService";
import {
  getBlogArticlesByAuthor,
  deleteBlogArticle,
} from "../services/blogService";
import { getArticleComments } from "../services/articleCommentService";
import { useAuth } from "../context/AuthContext";
import AvatarUploader from "./AvatarUploader";
import "./Dashboard.css";

// ── helpers ──────────────────────────────────────────────────────────────────

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

// ── ConfirmModal ──────────────────────────────────────────────────────────────

const ConfirmModal = ({ title, message, onConfirm, onClose }) => (
  <div
    className="modal-overlay"
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div className="modal" style={{ maxWidth: 400 }}>
      <div className="modal__header">
        <h2 className="modal__title">{title}</h2>
        <button className="modal__close" onClick={onClose} aria-label="Закрыть">
          <XMarkIcon className="modal__close-icon" />
        </button>
      </div>
      <p style={{ color: "var(--gray-light)", marginBottom: 20 }}>{message}</p>
      <div className="modal-form__actions">
        <button type="button" className="btn btn--outline" onClick={onClose}>
          Отмена
        </button>
        <button
          type="button"
          className="btn btn--danger"
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          Удалить
        </button>
      </div>
    </div>
  </div>
);

const initProject = (userId) => ({
  userId,
  instrumentId: "",
  name: "",
  description: "",
  status: 0,
  progress: 0,
  startDate: "",
  finishDate: "",
  actualCost: "",
  notes: "",
});

// ── ProjectModal ──────────────────────────────────────────────────────────────

const ProjectModal = ({ project, instruments, onSave, onClose }) => {
  const [form, setForm] = useState(project);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Введите название");
      return;
    }
    if (!form.instrumentId) {
      setError("Выберите инструмент");
      return;
    }
    setLoading(true);
    try {
      await onSave({
        ...form,
        progress: Number(form.progress),
        actualCost: form.actualCost ? Number(form.actualCost) : null,
        startDate: form.startDate || null,
        finishDate: form.finishDate || null,
        status: Number(form.status),
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modal__header">
          <h2 className="modal__title">
            {form.id ? "Редактировать проект" : "Новый проект"}
          </h2>
          <button
            className="modal__close"
            onClick={onClose}
            aria-label="Закрыть"
          >
            <XMarkIcon className="modal__close-icon" />
          </button>
        </div>

        {error && <p className="server-error">{error}</p>}

        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          <div className="modal-form__field">
            <label className="modal-form__label">Название *</label>
            <input
              className="modal-form__input"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Моя акустическая гитара"
            />
          </div>

          <div className="modal-form__field">
            <label className="modal-form__label">Инструмент *</label>
            <select
              className="modal-form__select"
              value={form.instrumentId}
              onChange={(e) => set("instrumentId", e.target.value)}
            >
              <option value="">— выберите —</option>
              {instruments.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-form__field">
            <label className="modal-form__label">Описание</label>
            <textarea
              className="modal-form__textarea"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Кратко о проекте..."
            />
          </div>

          <div className="modal-form__row">
            <div className="modal-form__field">
              <label className="modal-form__label">Статус</label>
              <select
                className="modal-form__select"
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                {Object.entries(STATUS_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-form__field">
              <label className="modal-form__label">Стоимость (₽)</label>
              <input
                className="modal-form__input"
                type="number"
                min="0"
                value={form.actualCost}
                onChange={(e) => set("actualCost", e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="modal-form__field">
            <label className="modal-form__label">
              Прогресс: {form.progress}%
            </label>
            <div className="modal-form__range-wrap">
              <input
                className="modal-form__range"
                type="range"
                min="0"
                max="100"
                value={form.progress}
                onChange={(e) => set("progress", e.target.value)}
              />
              <span className="modal-form__range-val">{form.progress}%</span>
            </div>
          </div>

          <div className="modal-form__row">
            <div className="modal-form__field">
              <label className="modal-form__label">Дата начала</label>
              <input
                className="modal-form__input"
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
              />
            </div>
            <div className="modal-form__field">
              <label className="modal-form__label">Дата завершения</label>
              <input
                className="modal-form__input"
                type="date"
                value={form.finishDate}
                onChange={(e) => set("finishDate", e.target.value)}
              />
            </div>
          </div>

          <div className="modal-form__field">
            <label className="modal-form__label">Заметки</label>
            <textarea
              className="modal-form__textarea"
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Личные заметки..."
            />
          </div>

          <div className="modal-form__actions">
            <button
              type="button"
              className="btn btn--outline"
              onClick={onClose}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={loading}
            >
              {loading ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── ProfileTab ────────────────────────────────────────────────────────────────

const ProfileTab = ({ user, onUpdated }) => {
  const [form, setForm] = useState({
    username: user.username,
    email: user.email,
    password: "",
    newPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = "Обязательное поле";
    else if (form.username.length < 3) e.username = "Минимум 3 символа";
    if (!form.email.trim()) e.email = "Обязательное поле";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Некорректный email";
    if (!form.password) e.password = "Введите текущий пароль для сохранения";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    setServerError("");
    setSuccess(false);
    try {
      await updateUser({
        id: user.id,
        username: form.username,
        email: form.email,
        password: form.password,
        role: user.role,
      });
      // Загружаем аватарку если выбрана новая
      let avatarUrl = user.avatarUrl;
      if (avatarFile) {
        setAvatarLoading(true);
        try {
          const res = await uploadAvatar(user.id, avatarFile);
          avatarUrl = res.avatarUrl;
        } finally {
          setAvatarLoading(false);
        }
      }
      onUpdated({ username: form.username, email: form.email, avatarUrl });
      setSuccess(true);
      setForm((p) => ({ ...p, password: "", newPassword: "" }));
      setAvatarFile(null);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
    setServerError("");
    setSuccess(false);
  };

  return (
    <div className="dashboard__card">
      {serverError && <p className="server-error">{serverError}</p>}
      {success && (
        <p
          style={{
            color: "#4ade80",
            fontSize: 13,
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <CheckIcon style={{ width: 16, height: 16 }} /> Профиль обновлён
        </p>
      )}

      <div
        style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}
      >
        <AvatarUploader
          preview={user.avatarUrl || null}
          initials={user.username.slice(0, 2).toUpperCase()}
          onChange={(file) => setAvatarFile(file)}
          size="lg"
        />
      </div>
      {avatarLoading && (
        <p
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "var(--gray-light)",
            marginBottom: 12,
          }}
        >
          Загрузка аватарки...
        </p>
      )}

      <form className="profile-form" onSubmit={handleSubmit} noValidate>
        <div className="profile-form__field">
          <label className="profile-form__label">Имя пользователя</label>
          <input
            className={`profile-form__input${errors.username ? " profile-form__input--error" : ""}`}
            value={form.username}
            onChange={(e) => set("username", e.target.value)}
          />
          {errors.username && (
            <span className="profile-form__error">{errors.username}</span>
          )}
        </div>

        <div className="profile-form__field">
          <label className="profile-form__label">Email</label>
          <input
            className={`profile-form__input${errors.email ? " profile-form__input--error" : ""}`}
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
          {errors.email && (
            <span className="profile-form__error">{errors.email}</span>
          )}
        </div>

        <div className="profile-form__field">
          <label className="profile-form__label">Текущий пароль *</label>
          <input
            className={`profile-form__input${errors.password ? " profile-form__input--error" : ""}`}
            type="password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder="Для подтверждения изменений"
          />
          {errors.password && (
            <span className="profile-form__error">{errors.password}</span>
          )}
        </div>

        <div className="profile-form__field">
          <label className="profile-form__label">Дата регистрации</label>
          <input
            className="profile-form__input"
            disabled
            value={
              user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("ru-RU")
                : "—"
            }
          />
        </div>

        <p className="profile-form__hint">
          * Текущий пароль обязателен для сохранения любых изменений
        </p>

        <div className="profile-form__actions">
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? "Сохранение..." : "Сохранить изменения"}
          </button>
        </div>
      </form>
    </div>
  );
};

// ── ProjectsTab ───────────────────────────────────────────────────────────────

const ProjectsTab = ({ userId }) => {
  const [projects, setProjects] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [proj, instr] = await Promise.all([
        getProjects(userId),
        getInstruments(),
      ]);
      setProjects(proj?.userProjects ?? []);
      setInstruments(instr?.instruments ?? instr ?? []);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (form) => {
    if (form.id) {
      await updateProject(form);
    } else {
      await createProject(form);
    }
    await load();
  };

  const handleDelete = async (id) => {
    await deleteProject(id);
    setProjects((p) => p.filter((x) => x.id !== id));
  };

  return (
    <>
      <div className="projects__toolbar">
        <span className="projects__title">Мои проекты ({projects.length})</span>
        <button
          className="btn btn--primary"
          style={{ display: "flex", alignItems: "center", gap: 6 }}
          onClick={() => navigate("/create-project")}
        >
          <PlusIcon style={{ width: 16, height: 16 }} /> Новый проект
        </button>
      </div>

      {loading && <p className="empty-state">Загрузка...</p>}

      {!loading && projects.length === 0 && (
        <div className="empty-state">
          <WrenchScrewdriverIcon className="empty-state__icon" />
          <p>Проектов пока нет. Создай первый!</p>
        </div>
      )}

      {projects.map((p) => (
        <div key={p.id} className="project-card">
          <div className="project-card__header">
            <div className="project-card__info">
              <p className="project-card__name">{p.name}</p>
              <div className="project-card__meta">
                <span
                  className={`project-card__status ${STATUS_CLASS[p.status]}`}
                >
                  {STATUS_LABELS[p.status]}
                </span>
                {p.startDate && <span>📅 {p.startDate}</span>}
                {p.actualCost != null && <span>💰 {p.actualCost} ₽</span>}
              </div>
            </div>
            <div className="project-card__actions">
              <button
                className="btn-icon"
                onClick={() => navigate(`/project/${p.id}`)}
                aria-label="Открыть"
                title="Открыть"
              >
                <WrenchScrewdriverIcon />
              </button>
              <button
                className="btn-icon"
                onClick={() => navigate(`/edit-project/${p.id}`)}
                aria-label="Редактировать"
                title="Редактировать"
              >
                <PencilIcon />
              </button>
              <button
                className="btn-icon btn-icon--danger"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteModal(p);
                }}
                aria-label="Удалить"
              >
                <TrashIcon />
              </button>
            </div>
          </div>
          <div className="progress-bar">
            <div
              className={`progress-bar__fill${p.status === 3 ? " progress-bar__fill--done" : ""}`}
              style={{ width: `${p.progress}%` }}
            />
          </div>
          <p style={{ fontSize: 12, color: "var(--gray-light)", marginTop: 6 }}>
            {p.progress}%
          </p>
        </div>
      ))}

      {modal && (
        <ProjectModal
          project={modal}
          instruments={instruments}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {deleteModal && (
        <ConfirmModal
          title="Удалить проект?"
          message={`Проект "${deleteModal.name}" будет удалён без возможности восстановления.`}
          onConfirm={() => handleDelete(deleteModal.id)}
          onClose={() => setDeleteModal(null)}
        />
      )}
    </>
  );
};

// ── FavoritesTab ──────────────────────────────────────────────────────────────

const FavoritesTab = ({ userId }) => {
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getFavorites(userId), getInstruments()])
      .then(([favs, instr]) => {
        setFavoriteIds(favs?.userFavorites ?? []);
        setInstruments(instr?.instruments ?? instr ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const favInstruments = instruments.filter((i) => favoriteIds.includes(i.id));

  const handleRemove = async (instrumentId) => {
    await removeFavorite(userId, instrumentId);
    setFavoriteIds((ids) => ids.filter((id) => id !== instrumentId));
  };

  const handleNavigate = (instrumentId) => {
    navigate(`/instrument/${instrumentId}`);
  };

  if (loading) return <p className="empty-state">Загрузка...</p>;

  if (favInstruments.length === 0) {
    return (
      <div className="favorites__empty">
        <HeartIcon className="favorites__empty-icon" />
        <p>Список избранного пуст</p>
        <p style={{ fontSize: 13, marginTop: 4 }}>
          Добавляй инструкции из каталога
        </p>
      </div>
    );
  }

  return (
    <div className="favorites__grid">
      {favInstruments.map((i) => (
        <div
          key={i.id}
          className="fav-card"
          onClick={() => handleNavigate(i.id)}
        >
          <div className="fav-card__header">
            <h3 className="fav-card__name">{i.name}</h3>
            <span className="fav-card__difficulty difficulty-{i.difficulty}">
              {i.difficulty === 0
                ? "Начинающий"
                : i.difficulty === 1
                  ? "Средний"
                  : "Эксперт"}
            </span>
          </div>
          {i.shortDescription && (
            <p className="fav-card__description">{i.shortDescription}</p>
          )}
          <div className="fav-card__footer">
            <button
              className="fav-card__remove"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(i.id);
              }}
            >
              <TrashIcon className="fav-card__remove-icon" /> Удалить
            </button>
            <span className="fav-card__views">{i.viewsCount} просмотров</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const QuizResultsTab = ({ userId }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadResults = async () => {
      setLoading(true);
      try {
        const data = await getUserQuizResults(userId);
        setResults(data.quizResults || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [userId]);

  const total = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const averagePercent = total
    ? results.reduce((sum, r) => sum + (Number(r.percentage) || 0), 0) / total
    : 0;
  const bestResult = results.reduce((best, r) => {
    if (!best || (Number(r.percentage) || 0) > (Number(best.percentage) || 0)) {
      return r;
    }
    return best;
  }, null);
  const lastResult = [...results].sort(
    (a, b) => new Date(b.completedAt) - new Date(a.completedAt),
  )[0];

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) return <p className="empty-state">Загрузка...</p>;
  if (error) return <p className="server-error">{error}</p>;

  if (total === 0) {
    return (
      <div className="empty-state">
        <ChartBarIcon className="empty-state__icon" />
        <p>Пока нет пройденных викторин.</p>
        <p style={{ fontSize: 13, marginTop: 4 }}>
          Пройди викторину, чтобы увидеть статистику.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="projects__toolbar">
        <span className="projects__title">Результаты викторин ({total})</span>
        <button
          className="btn btn--primary"
          style={{ display: "flex", alignItems: "center", gap: 6 }}
          onClick={() => navigate("/quizzes")}
        >
          <PlusIcon style={{ width: 16, height: 16 }} /> К викторинам
        </button>
      </div>

      <div className="quiz-results__summary">
        <div className="quiz-results__summary-card">
          <div className="quiz-results__summary-label">Пройдено викторин</div>
          <div className="quiz-results__summary-value">{total}</div>
        </div>
        <div className="quiz-results__summary-card">
          <div className="quiz-results__summary-label">Средний процент</div>
          <div className="quiz-results__summary-value">
            {averagePercent.toFixed(1)}%
          </div>
        </div>
        <div className="quiz-results__summary-card">
          <div className="quiz-results__summary-label">Прошли</div>
          <div className="quiz-results__summary-value">{passedCount}</div>
        </div>
        <div className="quiz-results__summary-card">
          <div className="quiz-results__summary-label">Не прошли</div>
          <div className="quiz-results__summary-value">
            {total - passedCount}
          </div>
        </div>
      </div>

      <div className="quiz-results__card quiz-results__card--wide">
        <div className="quiz-results__card-row">
          <div>
            <div className="quiz-results__card-label">Лучший результат</div>
            <div className="quiz-results__card-value">
              {bestResult
                ? `${bestResult.score} / ${bestResult.maxScore}`
                : "-"}
            </div>
          </div>
          <div>
            <div className="quiz-results__card-label">Последняя викторина</div>
            <div className="quiz-results__card-value">
              {lastResult
                ? `${formatDate(lastResult.completedAt)} (${lastResult.percentage.toFixed(1)}%)`
                : "-"}
            </div>
          </div>
        </div>
      </div>

      <div className="quiz-results__table-wrap">
        <table className="quiz-results__table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Баллы</th>
              <th>Макс.</th>
              <th>Процент</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {results
              .slice()
              .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
              .map((result) => (
                <tr key={result.id}>
                  <td>{formatDate(result.completedAt)}</td>
                  <td>{result.score}</td>
                  <td>{result.maxScore}</td>
                  <td>{Number(result.percentage).toFixed(1)}%</td>
                  <td
                    className={
                      result.passed
                        ? "quiz-results__passed"
                        : "quiz-results__failed"
                    }
                  >
                    {result.passed ? "Прошёл" : "Не прошёл"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

// ── ArticlesTab ───────────────────────────────────────────────────────────────

const ArticlesTab = ({ userId }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingArticleId, setDeletingArticleId] = useState(null);
  const [articleComments, setArticleComments] = useState({});
  const [expandedArticleId, setExpandedArticleId] = useState(null);
  const [loadingComments, setLoadingComments] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    loadArticles();
  }, [userId]);

  const loadArticles = async () => {
    try {
      const data = await getBlogArticlesByAuthor(userId);
      const articlesData = data.blogArticles || [];
      setArticles(articlesData);

      // Загружаем комментарии для всех статей
      const commentsPromises = articlesData.map(async (article) => {
        try {
          const commentsData = await getArticleComments(article.id);
          return {
            articleId: article.id,
            comments: commentsData.comments || [],
          };
        } catch {
          return { articleId: article.id, comments: [] };
        }
      });

      const commentsResults = await Promise.all(commentsPromises);
      const commentsMap = {};
      commentsResults.forEach(({ articleId, comments }) => {
        commentsMap[articleId] = comments;
      });
      setArticleComments(commentsMap);
    } catch {
      setArticles([]);
      setArticleComments({});
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleDeleteClick = (articleId) => {
    setDeletingArticleId(articleId);
    setShowDeleteModal(true);
  };

  const loadComments = async (articleId) => {
    if (articleComments[articleId]) {
      setExpandedArticleId(expandedArticleId === articleId ? null : articleId);
      return;
    }

    setLoadingComments((prev) => ({ ...prev, [articleId]: true }));
    try {
      const data = await getArticleComments(articleId);
      setArticleComments((prev) => ({
        ...prev,
        [articleId]: data.comments || [],
      }));
      setExpandedArticleId(articleId);
    } catch (err) {
      console.error("Ошибка загрузки комментариев:", err);
    } finally {
      setLoadingComments((prev) => ({ ...prev, [articleId]: false }));
    }
  };

  const toggleComments = (articleId) => {
    if (expandedArticleId === articleId) {
      setExpandedArticleId(null);
    } else {
      loadComments(articleId);
    }
  };

  const confirmDelete = async () => {
    if (!deletingArticleId) return;

    try {
      await deleteBlogArticle(deletingArticleId);
      setArticles(articles.filter((a) => a.id !== deletingArticleId));
    } catch (err) {
      alert(err.message);
    } finally {
      setShowDeleteModal(false);
      setDeletingArticleId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeletingArticleId(null);
  };

  if (loading) return <p className="empty-state">Загрузка...</p>;

  return (
    <>
      <div className="projects__toolbar">
        <span className="projects__title">Мои статьи ({articles.length})</span>
        <button
          className="btn btn--primary"
          style={{ display: "flex", alignItems: "center", gap: 6 }}
          onClick={() => navigate("/create-article")}
        >
          <PlusIcon style={{ width: 16, height: 16 }} /> Новая статья
        </button>
      </div>

      {articles.length === 0 ? (
        <div className="empty-state">
          <DocumentTextIcon className="empty-state__icon" />
          <p>Статей пока нет</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>
            Напиши свою первую статью в блог
          </p>
        </div>
      ) : (
        <div className="articles-list">
          {articles.map((article) => (
            <div
              key={article.id}
              className="article-card"
              onClick={() => navigate(`/blog/${article.id}`)}
            >
              <div className="article-card__header">
                <h3 className="article-card__title">{article.title}</h3>
                <div className="article-card__actions">
                  <button
                    className="article-card__edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/edit-article/${article.id}`);
                    }}
                    title="Редактировать статью"
                  >
                    <PencilIcon className="article-card__icon" />
                  </button>
                  <button
                    className="article-card__delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(article.id);
                    }}
                    title="Удалить статью"
                  >
                    <TrashIcon className="article-card__icon" />
                  </button>
                </div>
              </div>
              <p className="article-card__preview">
                {article.content.substring(0, 150)}
                {article.content.length > 150 ? "..." : ""}
              </p>
              <div className="article-card__meta">
                <span className="article-card__date">
                  {formatDate(article.publishedAt || article.createdAt)}
                </span>
                <span className="article-card__stat">
                  <EyeIcon className="article-card__icon" />
                  {article.viewsCount}
                </span>
                <button
                  className="article-card__stat article-card__stat--clickable"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleComments(article.id);
                  }}
                  title="Показать комментарии"
                >
                  <ChatBubbleLeftIcon className="article-card__icon" />
                  {loadingComments[article.id]
                    ? "..."
                    : articleComments[article.id]?.length ||
                      article.commentCount ||
                      0}
                </button>
              </div>

              {expandedArticleId === article.id && (
                <div className="article-card__comments">
                  {articleComments[article.id]?.length > 0 ? (
                    articleComments[article.id].map((comment) => (
                      <div key={comment.id} className="article-card__comment">
                        <div className="article-card__comment-header">
                          <span className="article-card__comment-author">
                            {comment.username || "Пользователь"}
                          </span>
                          <span className="article-card__comment-date">
                            {new Date(comment.createdAt).toLocaleDateString(
                              "ru-RU",
                              {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        </div>
                        <p className="article-card__comment-content">
                          {comment.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="article-card__no-comments">
                      Комментариев пока нет
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showDeleteModal && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal__title">Удаление статьи</h3>
            <p className="modal__text">
              Вы уверены, что хотите удалить эту статью? Это действие нельзя
              отменить.
            </p>
            <div className="modal-form__actions">
              <button
                type="button"
                className="btn btn--outline"
                onClick={cancelDelete}
              >
                Отмена
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={confirmDelete}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ── Dashboard (root) ──────────────────────────────────────────────────────────

const TABS = [
  { id: "profile", label: "Профиль", Icon: UserIcon },
  { id: "projects", label: "Проекты", Icon: WrenchScrewdriverIcon },
  { id: "favorites", label: "Избранное", Icon: HeartIcon },
  { id: "articles", label: "Статьи", Icon: DocumentTextIcon },
  { id: "quizResults", label: "Викторины", Icon: ChartBarIcon },
];

const Dashboard = () => {
  const [tab, setTab] = useState("profile");
  const [user, setUser] = useState(null);
  const [loadError, setLoadError] = useState("");
  const { currentUser, updateUser: updateAuthUser } = useAuth();

  useEffect(() => {
    if (!currentUser?.userId) return;
    getUser(currentUser.userId)
      .then(setUser)
      .catch((e) => setLoadError(e.message));
  }, [currentUser?.userId]);

  const handleUpdated = (patch) => {
    setUser((u) => ({ ...u, ...patch }));
    updateAuthUser(patch);
  };

  if (loadError)
    return (
      <div className="dashboard">
        <p className="server-error">{loadError}</p>
      </div>
    );
  if (!user)
    return (
      <div className="dashboard">
        <p className="empty-state">Загрузка профиля...</p>
      </div>
    );

  return (
    <div className="dashboard">
      <div className="dashboard__container">
        <div className="dashboard__header">
          <div className="dashboard__header-info">
            <h1>{user.username}</h1>
            <p>{user.email}</p>
          </div>
          <span className="dashboard__badge">
            {user.isVerifiedEmail
              ? "✓ Email подтверждён"
              : "Email не подтверждён"}
          </span>
        </div>

        <div className="dashboard__tabs">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`dashboard__tab${tab === id ? " dashboard__tab--active" : ""}`}
              onClick={() => setTab(id)}
            >
              <Icon className="dashboard__tab-icon" />
              {label}
            </button>
          ))}
        </div>

        {tab === "profile" && (
          <ProfileTab user={user} onUpdated={handleUpdated} />
        )}
        {tab === "projects" && <ProjectsTab userId={user.id} />}
        {tab === "favorites" && <FavoritesTab userId={user.id} />}
        {tab === "articles" && <ArticlesTab userId={user.id} />}
        {tab === "quizResults" && <QuizResultsTab userId={user.id} />}
      </div>
    </div>
  );
};

export default Dashboard;
