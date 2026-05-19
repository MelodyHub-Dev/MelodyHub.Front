import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  WrenchScrewdriverIcon,
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { getPublicUserProjectById } from "../services/userProjectService";
import {
  getProjectNotes,
  createProjectNote,
  deleteProjectNote,
} from "../services/projectNoteService";
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
  const [error, setError] = useState("");
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const isOwner = currentUser?.userId === project?.userId;

  useEffect(() => {
    if (!id) return;
    loadProject();
    if (currentUser?.userId) {
      loadNotes();
    }
  }, [currentUser?.userId, id]);

  const loadProject = async () => {
    setProjectLoading(true);
    try {
      const res = await getPublicUserProjectById(id);
      setProject(res);
    } catch {
      setError("Проект не найден");
    } finally {
      setProjectLoading(false);
    }
  };

  const loadNotes = async () => {
    setNoteLoading(true);
    try {
      const res = await getProjectNotes(id);
      setNotes(res?.notes ?? []);
    } catch {
      setNotes([]);
    } finally {
      setNoteLoading(false);
    }
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
            <span className="project-details__info-label">Прогресс</span>
            <div className="project-details__progress">
              <div className="progress-bar">
                <div
                  className={`progress-bar__fill${project.status === 3 ? " progress-bar__fill--done" : ""}`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
              <span>{project.progress}%</span>
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
